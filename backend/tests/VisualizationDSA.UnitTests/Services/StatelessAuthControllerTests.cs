using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using VisualizationDSA.Domain.Engine;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Strategies;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.UnitTests.Common;
using VisualizationDSA.WebApi.Controllers;
using Xunit;

namespace VisualizationDSA.UnitTests.Services
{
    /// <summary>
    /// Test StatelessAuthController (/api/v1/concepts/auth/* — hệ frontend THỰC SỰ gọi):
    /// AU-002/AU-003 register/login, AU-004 refresh rotation, AU-013 message generic,
    /// AU-022 change-password revoke toàn bộ phiên, AU-027 logout revoke server-side,
    /// AU-037 normalize email. Dùng InMemory DbContext (TestDbContextFactory.CreateSimple).
    /// </summary>
    [Collection("StatelessAuthTests")]
    public class StatelessAuthControllerTests
    {
        private static (StatelessAuthController Controller, ApplicationDbContext Db, StatelessAuthStrategy Strategy) Create()
        {
            var ctx = TestDbContextFactory.CreateSimple($"auth-{Guid.NewGuid():N}");
            var strategy = new StatelessAuthStrategy();
            var env = new Mock<IWebHostEnvironment>();
            env.Setup(e => e.EnvironmentName).Returns("Development");
            var controller = new StatelessAuthController(strategy, ctx, env.Object);
            return (controller, ctx, strategy);
        }

        private static void SetAuthHeader(StatelessAuthController controller, string accessToken)
        {
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = $"Bearer {accessToken}";
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
        }

        private static StatelessAuthResponse ReadOk(IActionResult? result)
        {
            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            return ok.Value.Should().BeOfType<StatelessAuthResponse>().Subject;
        }

        private static string SerializeValue(object? value)
            => JsonSerializer.Serialize(value);

        private static async Task<StatelessAuthResponse> RegisterUserAsync(
            StatelessAuthController controller,
            string email = "user@test.com",
            string username = "user",
            string password = "Password123")
        {
            var result = await controller.Register(new StatelessRegisterRequest
            {
                Email = email,
                Username = username,
                Password = password
            });
            return ReadOk(result.Result);
        }

        [Fact]
        public async Task Register_Success_ReturnsTokensAndPersistsUser()
        {
            var (controller, ctx, _) = Create();

            var response = await RegisterUserAsync(controller);

            response.AccessToken.Should().NotBeNullOrEmpty();
            response.RefreshToken.Should().NotBeNullOrEmpty();
            response.User.Role.Should().Be("Student");
            ctx.Users.Count().Should().Be(1);
        }

        [Fact]
        public async Task Register_DuplicateEmail_Returns400GenericMessage()
        {
            // AU-003 + AU-013: trùng email → 400 message generic (không lộ chi tiết enumeration).
            var (controller, _, _) = Create();
            await RegisterUserAsync(controller, email: "dup@test.com");

            var result = await controller.Register(new StatelessRegisterRequest
            {
                Email = "dup@test.com",
                Username = "anotheruser",
                Password = "Password123"
            });

            var bad = result.Result.Should().BeOfType<BadRequestObjectResult>().Subject;
            using var doc = JsonDocument.Parse(SerializeValue(bad.Value));
            doc.RootElement.GetProperty("error").GetString().Should().Be("REGISTRATION_FAILED");
            doc.RootElement.GetProperty("message").GetString().Should().Contain("Đăng ký không thành công");
            // Không được lộ message chi tiết "Email này đã được sử dụng...".
            doc.RootElement.GetProperty("message").GetString().Should().NotContain("đã được sử dụng");
        }

        [Fact]
        public async Task Register_ShortPassword_Returns400()
        {
            // AU-003: password policy — dưới 8 ký tự → 400.
            var (controller, _, _) = Create();

            var result = await controller.Register(new StatelessRegisterRequest
            {
                Email = "short@test.com",
                Username = "shortuser",
                Password = "short"
            });

            result.Result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task Login_Success_ReturnsTokens()
        {
            var (controller, _, _) = Create();
            await RegisterUserAsync(controller);

            var result = await controller.Login(new StatelessLoginRequest
            {
                Email = "user@test.com",
                Password = "Password123"
            });

            var response = ReadOk(result.Result);
            response.User.Email.Should().Be("user@test.com");
        }

        [Fact]
        public async Task Login_WrongPassword_Returns401()
        {
            var (controller, _, _) = Create();
            await RegisterUserAsync(controller);

            var result = await controller.Login(new StatelessLoginRequest
            {
                Email = "user@test.com",
                Password = "WrongPass123"
            });

            result.Result.Should().BeOfType<UnauthorizedObjectResult>();
        }

        [Fact]
        public async Task Login_BannedUser_Returns401()
        {
            var (controller, ctx, _) = Create();
            await RegisterUserAsync(controller);

            var dbUser = ctx.Users.Single(u => u.Email == "user@test.com");
            dbUser.SetActiveStatus(false);
            await ctx.SaveChangesAsync();

            var result = await controller.Login(new StatelessLoginRequest
            {
                Email = "user@test.com",
                Password = "Password123"
            });

            var unauthorized = result.Result.Should().BeOfType<UnauthorizedObjectResult>().Subject;
            SerializeValue(unauthorized.Value).Should().Contain("LOGIN_FAILED");
        }

        [Fact]
        public async Task Refresh_RotatesToken_OldTokenInvalid_NewTokenWorks()
        {
            // AU-004: rotation — token cũ chết sau 1 lần dùng.
            var (controller, _, _) = Create();
            var register = await RegisterUserAsync(controller);

            var firstRefresh = await controller.Refresh(new StatelessRefreshRequest { RefreshToken = register.RefreshToken });
            var rotated = ReadOk(firstRefresh.Result);

            // Reuse token cũ → 401.
            var reuse = await controller.Refresh(new StatelessRefreshRequest { RefreshToken = register.RefreshToken });
            reuse.Result.Should().BeOfType<UnauthorizedObjectResult>();

            // Token mới dùng tiếp được.
            var secondRefresh = await controller.Refresh(new StatelessRefreshRequest { RefreshToken = rotated.RefreshToken });
            secondRefresh.Result.Should().BeOfType<OkObjectResult>();
        }

        [Fact]
        public async Task Refresh_BannedUser_Returns401()
        {
            var (controller, ctx, _) = Create();
            var register = await RegisterUserAsync(controller);

            var dbUser = ctx.Users.Single(u => u.Email == "user@test.com");
            dbUser.SetActiveStatus(false);
            await ctx.SaveChangesAsync();

            var result = await controller.Refresh(new StatelessRefreshRequest { RefreshToken = register.RefreshToken });

            var unauthorized = result.Result.Should().BeOfType<UnauthorizedObjectResult>().Subject;
            SerializeValue(unauthorized.Value).Should().Contain("REFRESH_FAILED");
        }

        [Fact]
        public async Task Refresh_UnknownToken_Returns401()
        {
            var (controller, _, _) = Create();

            var result = await controller.Refresh(new StatelessRefreshRequest { RefreshToken = "no-such-token" });

            result.Result.Should().BeOfType<UnauthorizedObjectResult>();
        }

        [Fact]
        public async Task Logout_RevokesTokenServerSide()
        {
            // AU-027: logout → refresh token không dùng lại được.
            var (controller, _, _) = Create();
            var register = await RegisterUserAsync(controller);

            var logout = controller.Logout(new StatelessRefreshRequest { RefreshToken = register.RefreshToken });
            logout.Should().BeOfType<NoContentResult>();

            var result = await controller.Refresh(new StatelessRefreshRequest { RefreshToken = register.RefreshToken });
            result.Result.Should().BeOfType<UnauthorizedObjectResult>();
        }

        [Fact]
        public async Task ChangePassword_WrongCurrentPassword_Returns400()
        {
            var (controller, _, _) = Create();
            var register = await RegisterUserAsync(controller);
            SetAuthHeader(controller, register.AccessToken);

            var result = await controller.ChangePassword(new StatelessChangePasswordRequest
            {
                CurrentPassword = "WrongPass123",
                NewPassword = "NewPass456"
            });

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task ChangePassword_Success_RevokesAllOtherSessions()
        {
            // AU-022: đổi mật khẩu → toàn bộ refresh token cũ của user bị thu hồi
            // (thiết bị khác giữ phiên bằng mật khẩu cũ phải đăng nhập lại).
            var (controller, _, _) = Create();
            var register = await RegisterUserAsync(controller);
            // Phiên thứ 2 cùng user (login lại).
            var secondLogin = await controller.Login(new StatelessLoginRequest
            {
                Email = "user@test.com",
                Password = "Password123"
            });
            var secondSession = ReadOk(secondLogin.Result);
            SetAuthHeader(controller, secondSession.AccessToken);

            var result = await controller.ChangePassword(new StatelessChangePasswordRequest
            {
                CurrentPassword = "Password123",
                NewPassword = "NewPass456"
            });

            result.Should().BeOfType<OkObjectResult>();

            // Cả 2 refresh token cũ đều chết.
            var refresh1 = await controller.Refresh(new StatelessRefreshRequest { RefreshToken = register.RefreshToken });
            refresh1.Result.Should().BeOfType<UnauthorizedObjectResult>();
            var refresh2 = await controller.Refresh(new StatelessRefreshRequest { RefreshToken = secondSession.RefreshToken });
            refresh2.Result.Should().BeOfType<UnauthorizedObjectResult>();

            // Đăng nhập bằng mật khẩu MỚI thành công, bằng mật khẩu cũ thất bại.
            var loginNew = await controller.Login(new StatelessLoginRequest
            {
                Email = "user@test.com",
                Password = "NewPass456"
            });
            loginNew.Result.Should().BeOfType<OkObjectResult>();

            var loginOld = await controller.Login(new StatelessLoginRequest
            {
                Email = "user@test.com",
                Password = "Password123"
            });
            loginOld.Result.Should().BeOfType<UnauthorizedObjectResult>();
        }

        [Fact]
        public async Task Register_NormalizesEmail_BothFlows()
        {
            // AU-037: register "User@Test.COM" → login "user@test.com" thành công.
            var (controller, _, _) = Create();

            var register = await RegisterUserAsync(controller, email: "  User@Test.COM ");

            register.User.Email.Should().Be("user@test.com");

            var login = await controller.Login(new StatelessLoginRequest
            {
                Email = "user@test.com",
                Password = "Password123"
            });
            login.Result.Should().BeOfType<OkObjectResult>();
        }

        // ── PR-001: UpdateProfile persist DB ──────────────────────────────────

        [Fact]
        public async Task UpdateProfile_PersistsToDatabase()
        {
            // PR-001: trước đây chỉ sửa in-memory — restart/EvictIdleUsers mất sạch.
            // Giờ phải ghi DB (giống change-password) + phản ánh vào response.
            var (controller, ctx, _) = Create();
            var register = await RegisterUserAsync(controller, username: "olduser");
            SetAuthHeader(controller, register.AccessToken);

            var result = await controller.UpdateProfile(new StatelessUpdateProfileRequest
            {
                Username = "  newuser  ",
                Nickname = "Nick",
                Bio = "Sinh viên CNTT",
                University = "ĐHBK",
                AvatarUrl = "/uploads/avatar.png"
            });

            var ok = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var user = ok.Value.Should().BeOfType<StatelessUserDto>().Subject;
            user.Username.Should().Be("newuser");
            user.Nickname.Should().Be("Nick");
            user.Bio.Should().Be("Sinh viên CNTT");
            user.University.Should().Be("ĐHBK");
            user.AvatarUrl.Should().Be("/uploads/avatar.png");

            // Đọc thẳng từ DB — phải thấy giá trị mới (persist thật, không phải cache).
            var dbUser = ctx.Users.Single(u => u.Email == "user@test.com");
            dbUser.Username.Should().Be("newuser");
            dbUser.Nickname.Should().Be("Nick");
            dbUser.Bio.Should().Be("Sinh viên CNTT");
            dbUser.University.Should().Be("ĐHBK");
            dbUser.AvatarUrl.Should().Be("/uploads/avatar.png");
            dbUser.LastActivityDate.Should().NotBeNull();
        }

        [Fact]
        public async Task UpdateProfile_UsernameChanged_LoginStillWorksWithNewUsername()
        {
            // PR-001: đổi username → profile mới phải dùng cho session hiện tại.
            var (controller, ctx, _) = Create();
            var register = await RegisterUserAsync(controller, username: "before");
            SetAuthHeader(controller, register.AccessToken);

            var result = await controller.UpdateProfile(new StatelessUpdateProfileRequest
            {
                Username = "after",
                Nickname = "Nick"
            });

            var ok = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var user = ok.Value.Should().BeOfType<StatelessUserDto>().Subject;
            user.Username.Should().Be("after");
            ctx.Users.Single(u => u.Email == "user@test.com").Username.Should().Be("after");
        }

        // ── PR-015: trùng username qua DB + validate độ dài/whitespace ────────

        [Fact]
        public async Task UpdateProfile_WhitespaceOnlyUsername_Returns400()
        {
            // PR-015: username rỗng-whitespace → 400 rõ ràng (không lặng lẽ bỏ qua).
            var (controller, _, _) = Create();
            var register = await RegisterUserAsync(controller);
            SetAuthHeader(controller, register.AccessToken);

            var result = await controller.UpdateProfile(new StatelessUpdateProfileRequest { Username = "   " });

            var bad = result.Result.Should().BeOfType<BadRequestObjectResult>().Subject;
            using var doc = JsonDocument.Parse(SerializeValue(bad.Value));
            doc.RootElement.GetProperty("error").GetString().Should().Be("UPDATE_FAILED");
        }

        [Fact]
        public async Task UpdateProfile_UsernameTooShort_Returns400()
        {
            var (controller, _, _) = Create();
            var register = await RegisterUserAsync(controller);
            SetAuthHeader(controller, register.AccessToken);

            var result = await controller.UpdateProfile(new StatelessUpdateProfileRequest { Username = "ab" });

            result.Result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task UpdateProfile_UsernameTooLong_Returns400()
        {
            var (controller, _, _) = Create();
            var register = await RegisterUserAsync(controller);
            SetAuthHeader(controller, register.AccessToken);

            var result = await controller.UpdateProfile(new StatelessUpdateProfileRequest { Username = new string('a', 101) });

            result.Result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task UpdateProfile_DuplicateUsernameInDb_Returns400()
        {
            // PR-015: user khác TỒN TẠI TRONG DB nhưng CHƯA vào in-memory (restart/evict) —
            // check in-memory cũ không bắt được; check DB phải chặn.
            var (controller, ctx, _) = Create();
            var register = await RegisterUserAsync(controller);
            ctx.Users.Add(new User("taken@test.dev", "taken-name", "hash"));
            await ctx.SaveChangesAsync();
            SetAuthHeader(controller, register.AccessToken);

            var result = await controller.UpdateProfile(new StatelessUpdateProfileRequest { Username = "taken-name" });

            var bad = result.Result.Should().BeOfType<BadRequestObjectResult>().Subject;
            using var doc = JsonDocument.Parse(SerializeValue(bad.Value));
            doc.RootElement.GetProperty("error").GetString().Should().Be("UPDATE_FAILED");
            // Không được đổi sang username trùng.
            ctx.Users.Single(u => u.Email == "user@test.com").Username.Should().Be("user");
        }

        // ── PR-009: GetProgress trả lastActiveDate THẬT từ DB ──────────────────

        [Fact]
        public async Task GetProgress_ReturnsLastActiveDateFromDb()
        {
            var (controller, ctx, _) = Create();
            var register = await RegisterUserAsync(controller);
            var dbUser = ctx.Users.Single(u => u.Email == "user@test.com");
            dbUser.RecordActivity(new DateTime(2026, 8, 4, 8, 0, 0, DateTimeKind.Utc));
            await ctx.SaveChangesAsync();
            SetAuthHeader(controller, register.AccessToken);

            var result = await controller.GetProgress();

            var ok = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var progress = ok.Value.Should().BeOfType<StatelessUserProgressDto>().Subject;
            progress.LastActiveDate.Should().Be(new DateTime(2026, 8, 4, 8, 0, 0, DateTimeKind.Utc));
            progress.CurrentStreak.Should().Be(1);
        }
    }
}
