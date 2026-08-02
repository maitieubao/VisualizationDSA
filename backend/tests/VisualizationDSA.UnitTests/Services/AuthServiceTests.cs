using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;
using System.IdentityModel.Tokens.Jwt;
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

            
            _mockConfig.Setup(c => c["Jwt:Key"]).Returns("SuperSecretKey12345678901234567890");
            _mockConfig.Setup(c => c["Jwt:Issuer"]).Returns("issuer");
            _mockConfig.Setup(c => c["Jwt:Audience"]).Returns("audience");

            _service = new AuthService(_mockUow.Object, _mockConfig.Object);
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

            
            _mockUserRepo.Setup(r => r.FindAsync(It.IsAny<Expression<Func<User, bool>>>()))
                .ReturnsAsync(new List<User>());

            
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
        public async Task LoginAsync_ShouldVerifyPasswordAndReturnTokens()
        {
            
            var request = new LoginRequest
            {
                Email = "existing@user.com",
                Password = "Password123"
            };

            
            var passHash = BCrypt.Net.BCrypt.HashPassword("Password123", workFactor: 12);
            var user = new User("existing@user.com", "existinguser", passHash);

            _mockUserRepo.Setup(r => r.FindAsync(It.IsAny<Expression<Func<User, bool>>>()))
                .ReturnsAsync(new List<User> { user });

            
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

            var passHash = BCrypt.Net.BCrypt.HashPassword("Password123", workFactor: 12);
            var user = new User("existing@user.com", "existinguser", passHash);

            _mockUserRepo.Setup(r => r.FindAsync(It.IsAny<Expression<Func<User, bool>>>()))
                .ReturnsAsync(new List<User> { user });

            
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _service.LoginAsync(request));
        }

        [Fact]
        public async Task LoginAsync_ShouldReturnTokenWithCorrectRoleClaim()
        {
            // Arrange
            var request = new LoginRequest
            {
                Email = "teacher@user.com",
                Password = "Password123"
            };

            var passHash = BCrypt.Net.BCrypt.HashPassword("Password123", workFactor: 12);
            var user = new User("teacher@user.com", "teacheruser", passHash);
            user.SetRole("Teacher"); // Assume SetRole exists or using Reflection if private setter

            _mockUserRepo.Setup(r => r.FindAsync(It.IsAny<Expression<Func<User, bool>>>()))
                .ReturnsAsync(new List<User> { user });

            // Act
            var response = await _service.LoginAsync(request);

            // Assert
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(response.AccessToken);

            jwtToken.Claims.Should().Contain(c => c.Type == "role" && c.Value == "Teacher");
        }
    }
}
