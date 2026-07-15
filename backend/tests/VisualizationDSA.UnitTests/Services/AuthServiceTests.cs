using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Interfaces;
using VisualizationDSA.Infrastructure.Services;
using Xunit;

namespace VisualizationDSA.UnitTests.Services
{
    public class AuthServiceTests
    {
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

            // Mock JWT configuration
            _mockConfig.Setup(c => c["Jwt:Key"]).Returns("SuperSecretKey12345678901234567890");
            _mockConfig.Setup(c => c["Jwt:Issuer"]).Returns("issuer");
            _mockConfig.Setup(c => c["Jwt:Audience"]).Returns("audience");

            _service = new AuthService(_mockUow.Object, _mockConfig.Object);
        }

        [Fact]
        public async Task RegisterAsync_ShouldCreateUserAndTokenPair()
        {
            // Arrange
            var request = new RegisterRequest
            {
                Email = "new@user.com",
                Username = "newusername",
                Password = "Password123"
            };

            // Setup FindAsync to return empty list (no existing user)
            _mockUserRepo.Setup(r => r.FindAsync(It.IsAny<Expression<Func<User, bool>>>()))
                .ReturnsAsync(new List<User>());

            // Act
            var response = await _service.RegisterAsync(request);

            // Assert
            response.Should().NotBeNull();
            response.AccessToken.Should().NotBeNullOrEmpty();
            response.RefreshToken.Should().NotBeNullOrEmpty();
            response.User.Email.Should().Be("new@user.com");
            response.User.Username.Should().Be("newusername");

            _mockUserRepo.Verify(r => r.AddAsync(It.Is<User>(u => u.Email == "new@user.com")), Times.Once);
            _mockTokenRepo.Verify(t => t.AddAsync(It.IsAny<RefreshToken>()), Times.Once);
            _mockUow.Verify(u => u.CommitAsync(), Times.Exactly(2)); // user add + token add
        }

        [Fact]
        public async Task LoginAsync_ShouldVerifyPasswordAndReturnTokens()
        {
            // Arrange
            var request = new LoginRequest
            {
                Email = "existing@user.com",
                Password = "Password123"
            };

            // BCrypt hash of "Password123"
            var passHash = BCrypt.Net.BCrypt.HashPassword("Password123", workFactor: 12);
            var user = new User("existing@user.com", "existinguser", passHash);

            _mockUserRepo.Setup(r => r.FindAsync(It.IsAny<Expression<Func<User, bool>>>()))
                .ReturnsAsync(new List<User> { user });

            // Act
            var response = await _service.LoginAsync(request);

            // Assert
            response.Should().NotBeNull();
            response.AccessToken.Should().NotBeNullOrEmpty();
            response.RefreshToken.Should().NotBeNullOrEmpty();
            response.User.Email.Should().Be("existing@user.com");

            _mockTokenRepo.Verify(t => t.AddAsync(It.IsAny<RefreshToken>()), Times.Once);
            _mockUow.Verify(u => u.CommitAsync(), Times.Exactly(2)); // login record + token add
        }

        [Fact]
        public async Task LoginAsync_WithIncorrectPassword_ShouldThrowUnauthorizedAccessException()
        {
            // Arrange
            var request = new LoginRequest
            {
                Email = "existing@user.com",
                Password = "WrongPassword"
            };

            var passHash = BCrypt.Net.BCrypt.HashPassword("Password123", workFactor: 12);
            var user = new User("existing@user.com", "existinguser", passHash);

            _mockUserRepo.Setup(r => r.FindAsync(It.IsAny<Expression<Func<User, bool>>>()))
                .ReturnsAsync(new List<User> { user });

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _service.LoginAsync(request));
        }
    }
}
