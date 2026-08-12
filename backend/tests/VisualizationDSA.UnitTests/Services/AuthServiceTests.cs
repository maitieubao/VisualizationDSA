using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Interfaces;
using VisualizationDSA.Infrastructure.Services;
using Xunit;

namespace VisualizationDSA.UnitTests.Services
{
    /// <summary>
    /// Test AuthService (flow chuẩn DB): AU-012 TOCTOU register, AU-026 predicate phân biệt
    /// email/username + ban login + email không tồn tại + refresh expired/revoked, AU-030 user
    /// xóa → 401, AU-027 logout revoke server-side.
    /// </summary>
    public class AuthServiceTests
    {
        private readonly List<User> _users = new();
        private readonly List<RefreshToken> _tokens = new();
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly Mock<IUserRepository> _mockUserRepo;
        private readonly Mock<IRepository<RefreshToken>> _mockTokenRepo;
        private readonly Mock<IConfiguration> _mockConfig;
        private readonly AuthService _service;

        public AuthServiceTests()
        {
            _mockUow = new Mock<IUnitOfWork>();
            _mockUserRepo = new Mock<IUserRepository>();
            _mockTokenRepo = new Mock<IRepository<RefreshToken>>();
            _mockConfig = new Mock<IConfiguration>();

            _mockUow.Setup(u => u.Users).Returns(_mockUserRepo.Object);
            _mockUow.Setup(u => u.RefreshTokens).Returns(_mockTokenRepo.Object);
            _mockUow.Setup(u => u.CommitAsync()).ReturnsAsync(1);
            _mockUow.Setup(u => u.BeginTransactionAsync()).Returns(Task.CompletedTask);
            _mockUow.Setup(u => u.CommitTransactionAsync()).Returns(Task.CompletedTask);
            _mockUow.Setup(u => u.RollbackTransactionAsync()).Returns(Task.CompletedTask);

            // AU-026: mock store thật — predicate được COMPILE và đánh giá trên danh sách,
            // phân biệt đúng trùng email (u.Email) vs trùng username (u.Username).
            _mockUserRepo.Setup(r => r.FindAsync(It.IsAny<Expression<Func<User, bool>>>()))
                .ReturnsAsync((Expression<Func<User, bool>> predicate) =>
                    _users.Where(predicate.Compile()).ToList());
            _mockUserRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
                .ReturnsAsync((Guid id) => _users.FirstOrDefault(u => u.Id == id));
            _mockUserRepo.Setup(r => r.AddAsync(It.IsAny<User>()))
                .ReturnsAsync((User u) => { _users.Add(u); return u; });

            _mockTokenRepo.Setup(t => t.FindAsync(It.IsAny<Expression<Func<RefreshToken, bool>>>()))
                .ReturnsAsync((Expression<Func<RefreshToken, bool>> predicate) =>
                    _tokens.Where(predicate.Compile()).ToList());
            _mockTokenRepo.Setup(t => t.AddAsync(It.IsAny<RefreshToken>()))
                .ReturnsAsync((RefreshToken t) => { _tokens.Add(t); return t; });

            _mockConfig.Setup(c => c["Jwt:Key"]).Returns("SuperSecretKey12345678901234567890");
            _mockConfig.Setup(c => c["Jwt:Issuer"]).Returns("issuer");
            _mockConfig.Setup(c => c["Jwt:Audience"]).Returns("audience");

            _service = new AuthService(_mockUow.Object, _mockConfig.Object);
        }

        private static User SeedUser(List<User> store, string email, string password, bool isActive = true)
        {
            var hash = BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
            var user = new User(email, email.Split('@')[0], hash);
            if (!isActive) user.SetActiveStatus(false);
            store.Add(user);
            return user;
        }

        private static RefreshToken SeedToken(List<RefreshToken> store, Guid userId, string tokenValue, DateTime expiresAt)
        {
            var token = new RefreshToken(userId, tokenValue, expiresAt);
            store.Add(token);
            return token;
        }

        [Fact]
        public async Task RegisterAsync_ShouldCreateUserAndTokenPair()
        {
            var request = new RegisterRequest
            {
                Email = "new@user.com",
                Username = "newusername",
                Password = "Password123"
            };

            var response = await _service.RegisterAsync(request);

            response.Should().NotBeNull();
            response.AccessToken.Should().NotBeNullOrEmpty();
            response.RefreshToken.Should().NotBeNullOrEmpty();
            response.User.Email.Should().Be("new@user.com");
            response.User.Username.Should().Be("newusername");

            _mockUserRepo.Verify(r => r.AddAsync(It.Is<User>(u => u.Email == "new@user.com")), Times.Once);
            _mockTokenRepo.Verify(t => t.AddAsync(It.IsAny<RefreshToken>()), Times.Once);
            _mockUow.Verify(u => u.CommitAsync(), Times.Exactly(2)); 
        }

        [Fact]
        public async Task RegisterAsync_WithMixedCaseAndSpaces_NormalizesEmail()
        {
            // AU-037: email được Trim + ToLowerInvariant trước khi lưu.
            var request = new RegisterRequest
            {
                Email = "  New@User.COM ",
                Username = "newusername",
                Password = "Password123"
            };

            var response = await _service.RegisterAsync(request);

            response.User.Email.Should().Be("new@user.com");
            _mockUserRepo.Verify(r => r.AddAsync(It.Is<User>(u => u.Email == "new@user.com")), Times.Once);
        }

        [Fact]
        public async Task RegisterAsync_DuplicateEmail_ShouldThrowGenericArgumentException()
        {
            // AU-026/AU-012: trùng email → check-then-insert chặn với message generic.
            SeedUser(_users, "dup@user.com", "Password123");

            var request = new RegisterRequest
            {
                Email = "dup@user.com",
                Username = "anotheruser",
                Password = "Password123"
            };

            var ex = await Assert.ThrowsAsync<ArgumentException>(() => _service.RegisterAsync(request));
            ex.Message.Should().Contain("Đăng ký không thành công");
        }

        [Fact]
        public async Task RegisterAsync_DuplicateUsername_ShouldThrowGenericArgumentException()
        {
            // AU-026: predicate phân biệt username — không trùng email nhưng trùng username.
            SeedUser(_users, "first@user.com", "Password123");

            var request = new RegisterRequest
            {
                Email = "second@user.com",
                Username = "first", // username của user đầu (email.Split('@')[0])
                Password = "Password123"
            };

            var ex = await Assert.ThrowsAsync<ArgumentException>(() => _service.RegisterAsync(request));
            ex.Message.Should().Contain("Đăng ký không thành công");
        }

        [Fact]
        public async Task RegisterAsync_WhenDbUniqueViolation_ShouldThrowGenericArgumentException()
        {
            // AU-012 TOCTOU: race unique constraint → DbUpdateException → 400 generic, không 500.
            _mockUow.SetupSequence(u => u.CommitAsync())
                .ThrowsAsync(new DbUpdateException("UNIQUE constraint failed"))
                .ReturnsAsync(1);

            var request = new RegisterRequest
            {
                Email = "race@user.com",
                Username = "raceuser",
                Password = "Password123"
            };

            var ex = await Assert.ThrowsAsync<ArgumentException>(() => _service.RegisterAsync(request));
            ex.Message.Should().Contain("Đăng ký không thành công");
            // Không được sinh refresh token khi register thất bại.
            _mockTokenRepo.Verify(t => t.AddAsync(It.IsAny<RefreshToken>()), Times.Never);
        }

        [Fact]
        public async Task LoginAsync_ShouldVerifyPasswordAndReturnTokens()
        {
            var request = new LoginRequest
            {
                Email = "existing@user.com",
                Password = "Password123"
            };

            SeedUser(_users, "existing@user.com", "Password123");

            var response = await _service.LoginAsync(request);

            response.Should().NotBeNull();
            response.AccessToken.Should().NotBeNullOrEmpty();
            response.RefreshToken.Should().NotBeNullOrEmpty();
            response.User.Email.Should().Be("existing@user.com");

            _mockTokenRepo.Verify(t => t.AddAsync(It.IsAny<RefreshToken>()), Times.Once);
            _mockUow.Verify(u => u.CommitAsync(), Times.Exactly(2)); 
        }

        [Fact]
        public async Task LoginAsync_WithIncorrectPassword_ShouldThrowUnauthorizedAccessException()
        {
            var request = new LoginRequest
            {
                Email = "existing@user.com",
                Password = "WrongPassword"
            };

            SeedUser(_users, "existing@user.com", "Password123");

            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _service.LoginAsync(request));
        }

        [Fact]
        public async Task LoginAsync_EmailNotFound_ShouldThrowUnauthorizedAccessException()
        {
            // AU-026: email không tồn tại → 401 (kèm dummy-verify AU-014 bên trong).
            var request = new LoginRequest
            {
                Email = "ghost@user.com",
                Password = "Password123"
            };

            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _service.LoginAsync(request));
        }

        [Fact]
        public async Task LoginAsync_BannedUser_ShouldThrowUnauthorizedAccessException()
        {
            // AU-026: user bị ban (IsActive=false) không được đăng nhập.
            var request = new LoginRequest
            {
                Email = "banned@user.com",
                Password = "Password123"
            };

            SeedUser(_users, "banned@user.com", "Password123", isActive: false);

            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _service.LoginAsync(request));
        }

        [Fact]
        public async Task RefreshTokenAsync_ValidToken_RotatesAndRevokesOld()
        {
            var user = SeedUser(_users, "refresh@user.com", "Password123");
            var oldToken = SeedToken(_tokens, user.Id, "old-refresh-token", DateTime.UtcNow.AddDays(30));

            var response = await _service.RefreshTokenAsync("old-refresh-token");

            response.RefreshToken.Should().NotBe("old-refresh-token");
            response.AccessToken.Should().NotBeNullOrEmpty();
            // AU-004: token cũ phải bị revoke ngay trong cùng transaction.
            oldToken.IsRevoked.Should().BeTrue();
            _tokens.Should().Contain(t => t.Token == response.RefreshToken && !t.IsRevoked);
        }

        [Fact]
        public async Task RefreshTokenAsync_RevokedToken_ShouldThrowUnauthorizedAccessException()
        {
            // AU-026: token đã revoke → 401.
            var user = SeedUser(_users, "revoked@user.com", "Password123");
            var token = SeedToken(_tokens, user.Id, "revoked-token", DateTime.UtcNow.AddDays(30));
            token.Revoke();

            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _service.RefreshTokenAsync("revoked-token"));
        }

        [Fact]
        public async Task RefreshTokenAsync_ExpiredToken_ShouldThrowUnauthorizedAccessException()
        {
            // AU-026: token hết hạn → 401.
            var user = SeedUser(_users, "expired@user.com", "Password123");
            SeedToken(_tokens, user.Id, "expired-token", DateTime.UtcNow.AddDays(-1));

            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _service.RefreshTokenAsync("expired-token"));
        }

        [Fact]
        public async Task RefreshTokenAsync_UnknownToken_ShouldThrowUnauthorizedAccessException()
        {
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _service.RefreshTokenAsync("unknown-token"));
        }

        [Fact]
        public async Task RefreshTokenAsync_DeletedUser_ShouldThrowUnauthorizedAccessException()
        {
            // AU-030: refresh token của user ĐÃ XÓA → 401 (không phải 404 KeyNotFoundException).
            SeedToken(_tokens, Guid.NewGuid(), "orphan-token", DateTime.UtcNow.AddDays(30));

            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _service.RefreshTokenAsync("orphan-token"));
        }

        [Fact]
        public async Task RefreshTokenAsync_BannedUser_ShouldThrowUnauthorizedAccessException()
        {
            // AU-011: user bị ban không refresh được vô hạn.
            var user = SeedUser(_users, "banned-refresh@user.com", "Password123", isActive: false);
            SeedToken(_tokens, user.Id, "banned-session-token", DateTime.UtcNow.AddDays(30));

            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _service.RefreshTokenAsync("banned-session-token"));
        }

        [Fact]
        public async Task LogoutAsync_RevokesToken_ThenRefreshFails()
        {
            // AU-027: logout revoke server-side — token không dùng lại được.
            var user = SeedUser(_users, "logout@user.com", "Password123");
            var token = SeedToken(_tokens, user.Id, "logout-token", DateTime.UtcNow.AddDays(30));

            await _service.LogoutAsync("logout-token");

            token.IsRevoked.Should().BeTrue();
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _service.RefreshTokenAsync("logout-token"));
        }
    }
}
