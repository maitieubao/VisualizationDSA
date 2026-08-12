using FluentAssertions;
using System;
using VisualizationDSA.Domain.Engine;
using VisualizationDSA.Domain.Strategies;
using Xunit;

namespace VisualizationDSA.UnitTests.Services
{
    /// <summary>
    /// Test StatelessAuthStrategy (hệ auth frontend THỰC SỰ gọi): AU-002/AU-003 register/login,
    /// AU-004 refresh rotation remove-if-match, AU-016 TTL eviction + EnsureUserInMemory update,
    /// AU-017 clamp TTL, AU-022 revoke toàn bộ token khi đổi mật khẩu, AU-027 logout revoke,
    /// AU-030 user xóa → 401.
    /// </summary>
    [Collection("StatelessAuthTests")]
    public class StatelessAuthStrategyTests
    {
        private static StatelessRegisterRequest NewRegister(string email = "user@test.com", string username = "user", string password = "Password123")
            => new() { Email = email, Username = username, Password = password };

        private static StatelessLoginRequest NewLogin(string email = "user@test.com", string password = "Password123")
            => new() { Email = email, Password = password };

        [Fact]
        public void Register_Success_ReturnsTokensAndCreatesProfile()
        {
            var strategy = new StatelessAuthStrategy();

            var response = strategy.Register(NewRegister());

            response.AccessToken.Should().NotBeNullOrEmpty();
            response.RefreshToken.Should().NotBeNullOrEmpty();
            response.User.Role.Should().Be("Student");
            response.User.TotalXP.Should().Be(0);

            var profile = strategy.GetProfile(response.User.Id);
            profile.Email.Should().Be("user@test.com");
        }

        [Fact]
        public void Register_DuplicateEmail_ShouldThrowArgumentException()
        {
            var strategy = new StatelessAuthStrategy();
            strategy.Register(NewRegister());

            Action act = () => strategy.Register(NewRegister(username: "otheruser"));

            act.Should().Throw<ArgumentException>();
        }

        [Fact]
        public void Register_ShortPassword_ShouldThrowArgumentException()
        {
            var strategy = new StatelessAuthStrategy();

            Action act = () => strategy.Register(NewRegister(password: "short"));

            act.Should().Throw<ArgumentException>();
        }

        [Fact]
        public void Register_MixedCaseEmail_IsNormalized()
        {
            // AU-037: "User@Test.com" ≡ "user@test.com".
            var strategy = new StatelessAuthStrategy();
            var response = strategy.Register(NewRegister(email: "User@Test.COM"));

            response.User.Email.Should().Be("user@test.com");
            var login = strategy.Login(NewLogin());
            login.User.Id.Should().Be(response.User.Id);
        }

        [Fact]
        public void Login_Success_ReturnsTokens()
        {
            var strategy = new StatelessAuthStrategy();
            strategy.Register(NewRegister());

            var response = strategy.Login(NewLogin());

            response.AccessToken.Should().NotBeNullOrEmpty();
            response.RefreshToken.Should().NotBeNullOrEmpty();
            response.User.Email.Should().Be("user@test.com");
        }

        [Fact]
        public void Login_WrongPassword_ShouldThrowUnauthorizedAccessException()
        {
            var strategy = new StatelessAuthStrategy();
            strategy.Register(NewRegister());

            Action act = () => strategy.Login(NewLogin(password: "WrongPass123"));

            act.Should().Throw<UnauthorizedAccessException>();
        }

        [Fact]
        public void Login_UnknownEmail_ShouldThrowUnauthorizedAccessException()
        {
            var strategy = new StatelessAuthStrategy();

            Action act = () => strategy.Login(NewLogin(email: "ghost@test.com"));

            act.Should().Throw<UnauthorizedAccessException>();
        }

        [Fact]
        public void RefreshToken_Rotates_OldTokenCannotBeReused()
        {
            // AU-004: rotation — token cũ phải chết, token mới dùng được.
            var strategy = new StatelessAuthStrategy();
            var register = strategy.Register(NewRegister());
            var oldToken = register.RefreshToken;

            var rotated = strategy.RefreshToken(oldToken);

            rotated.RefreshToken.Should().NotBe(oldToken);

            Action reuse = () => strategy.RefreshToken(oldToken);
            reuse.Should().Throw<UnauthorizedAccessException>();

            var again = strategy.RefreshToken(rotated.RefreshToken);
            again.RefreshToken.Should().NotBe(rotated.RefreshToken);
        }

        [Fact]
        public void RefreshToken_ExpiredToken_ShouldThrowUnauthorizedAndRemoveToken()
        {
            var strategy = new StatelessAuthStrategy();
            var register = strategy.Register(NewRegister());

            strategy.ForceAddRefreshToken("expired-token", register.User.Id, TimeSpan.FromMilliseconds(10));
            System.Threading.Thread.Sleep(40);

            Action act = () => strategy.RefreshToken("expired-token");

            act.Should().Throw<UnauthorizedAccessException>();
            strategy.GetRefreshTokenExpiry("expired-token").Should().BeNull();
        }

        [Fact]
        public void RefreshToken_DeletedUser_ShouldThrowUnauthorizedAccessException()
        {
            // AU-030: user đã xóa → 401 (UnauthorizedAccessException), không phải KeyNotFoundException.
            var strategy = new StatelessAuthStrategy();
            strategy.ForceAddRefreshToken("orphan-token", "user-dont-exist", TimeSpan.FromMinutes(5));

            Action act = () => strategy.RefreshToken("orphan-token");

            act.Should().Throw<UnauthorizedAccessException>();
        }

        [Fact]
        public void RefreshToken_PreservesRemainingTtl()
        {
            // AU-017: token còn 5 phút → token mới cũng ~5 phút, không phải 30 ngày.
            var strategy = new StatelessAuthStrategy();
            var register = strategy.Register(NewRegister());
            var userId = register.User.Id;

            strategy.ForceAddRefreshToken("short-lived", userId, TimeSpan.FromMinutes(5));
            var rotated = strategy.RefreshToken("short-lived");

            var expiry = strategy.GetRefreshTokenExpiry(rotated.RefreshToken);
            expiry.Should().NotBeNull();
            var ttl = expiry!.Value - DateTime.UtcNow;
            ttl.Should().BeGreaterThan(TimeSpan.FromMinutes(4.5));
            ttl.Should().BeLessThan(TimeSpan.FromMinutes(5.5));
        }

        [Fact]
        public void RefreshToken_WhenRemainingBelowOneSecond_ClampsToOneSecondInsteadOfFullLifetime()
        {
            // AU-017 (bug): token còn < 1s từng bị ternary gia hạn FULL 30 ngày;
            // giờ Math.Clamp(remaining, 1s, 30d) → token mới chết trong ~1-2s.
            var strategy = new StatelessAuthStrategy();
            var register = strategy.Register(NewRegister());
            var userId = register.User.Id;

            strategy.ForceAddRefreshToken("almost-dead", userId, TimeSpan.FromMilliseconds(1500));
            System.Threading.Thread.Sleep(700); // còn ~0.8s < 1s

            var rotated = strategy.RefreshToken("almost-dead");

            var expiry = strategy.GetRefreshTokenExpiry(rotated.RefreshToken);
            expiry.Should().NotBeNull();
            var ttl = expiry!.Value - DateTime.UtcNow;
            ttl.Should().BeGreaterThan(TimeSpan.Zero);
            ttl.Should().BeLessThan(TimeSpan.FromSeconds(2.5)); // 30 ngày là FAIL
        }

        [Fact]
        public void Logout_RevokesToken_ThenRefreshFails()
        {
            // AU-027: logout revoke server-side (in-memory).
            var strategy = new StatelessAuthStrategy();
            var register = strategy.Register(NewRegister());

            strategy.Logout(register.RefreshToken);

            Action act = () => strategy.RefreshToken(register.RefreshToken);
            act.Should().Throw<UnauthorizedAccessException>();
        }

        [Fact]
        public void RevokeAllRefreshTokens_InvalidatesAllSessions()
        {
            // AU-022: đổi mật khẩu / ban → mọi phiên đều chết.
            var strategy = new StatelessAuthStrategy();
            var register = strategy.Register(NewRegister());
            var secondLogin = strategy.Login(NewLogin());

            strategy.RevokeAllRefreshTokens(register.User.Id);

            Action a1 = () => strategy.RefreshToken(register.RefreshToken);
            Action a2 = () => strategy.RefreshToken(secondLogin.RefreshToken);
            a1.Should().Throw<UnauthorizedAccessException>();
            a2.Should().Throw<UnauthorizedAccessException>();
        }

        [Fact]
        public void UpdateUserPassword_NewPasswordWorks_OldPasswordFails()
        {
            var strategy = new StatelessAuthStrategy();
            var register = strategy.Register(NewRegister());
            var newHash = BCrypt.Net.BCrypt.HashPassword("NewPass456", workFactor: 12);

            strategy.UpdateUserPassword(register.User.Id, newHash);

            var loginNew = strategy.Login(NewLogin(password: "NewPass456"));
            loginNew.User.Id.Should().Be(register.User.Id);

            Action oldLogin = () => strategy.Login(NewLogin());
            oldLogin.Should().Throw<UnauthorizedAccessException>();
        }

        [Fact]
        public void EnsureUserInMemory_ExistingUser_UpdatesStaleData()
        {
            // AU-016: user đã tồn tại → cập nhật dữ liệu mới (XP/level/premium/role),
            // không insert-then-return-cũ.
            var strategy = new StatelessAuthStrategy();
            strategy.AddUser("u-1", "a@test.com", "auser", "old-hash", "Student", false);

            strategy.EnsureUserInMemory("u-1", "a@test.com", "auser", "new-hash", true, "Teacher", 500, 3, 7);

            var profile = strategy.GetProfile("u-1");
            profile.TotalXP.Should().Be(500);
            profile.CurrentLevel.Should().Be(3);
            profile.IsPremium.Should().BeTrue();
            profile.Role.Should().Be("Teacher");
        }

        [Fact]
        public void EnsureUserInMemory_EmailChanged_RemapsEmailKey()
        {
            var strategy = new StatelessAuthStrategy();
            var hash = BCrypt.Net.BCrypt.HashPassword("Password123", workFactor: 12);
            strategy.AddUser("u-2", "old@test.com", "buser", hash, "Student", false);

            strategy.EnsureUserInMemory("u-2", "new@test.com", "buser", hash, false, "Student", 0, 1, 0);

            // Login bằng email MỚI phải tìm thấy user (key cũ đã được gỡ).
            var login = strategy.Login(NewLogin(email: "new@test.com", password: "Password123"));
            login.User.Id.Should().Be("u-2");
        }

        [Fact]
        public void EvictIdleUsers_RemovesUserPastIdleLifetime()
        {
            // AU-016: TTL eviction — user idle quá hạn bị xóa khỏi bộ nhớ (chống memory leak).
            var original = StatelessAuthStrategy.UserIdleLifetime;
            try
            {
                // UserIdleLifetime âm → mọi user đều "idle" so với mốc hiện tại.
                StatelessAuthStrategy.UserIdleLifetime = TimeSpan.FromDays(-1);

                var strategy = new StatelessAuthStrategy();
                var register = strategy.Register(NewRegister());

                Action act = () => strategy.GetProfile(register.User.Id);
                act.Should().Throw<System.Collections.Generic.KeyNotFoundException>();
            }
            finally
            {
                StatelessAuthStrategy.UserIdleLifetime = original;
            }
        }
    }
}
