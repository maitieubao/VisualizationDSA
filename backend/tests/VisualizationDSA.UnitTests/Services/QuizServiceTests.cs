using FluentAssertions;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Interfaces;
using VisualizationDSA.Infrastructure.Services;
using Xunit;

namespace VisualizationDSA.UnitTests.Services
{
    public class QuizServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly Mock<IQuizRepository> _mockQuizRepo;
        private readonly Mock<IGamificationService> _mockGamification;
        private readonly QuizService _service;

        public QuizServiceTests()
        {
            _mockUow = new Mock<IUnitOfWork>();
            _mockQuizRepo = new Mock<IQuizRepository>();
            _mockGamification = new Mock<IGamificationService>();

            _mockUow.Setup(u => u.Quizzes).Returns(_mockQuizRepo.Object);
            _service = new QuizService(_mockUow.Object, _mockGamification.Object);
        }

        [Fact]
        public async Task GetUserQuizHistoryAsync_ShouldClampParametersAndCallRepository()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var attempts = new List<QuizAttempt>
            {
                new QuizAttempt(userId, Guid.NewGuid(), new int[] { 0, 1 }, 2, 2)
            };

            _mockQuizRepo.Setup(r => r.GetUserAttemptsWithQuizPaginatedAsync(userId, 1, 10))
                .ReturnsAsync(attempts);

            // Act
            var result = await _service.GetUserQuizHistoryAsync(userId, -5, -20); // Testing negative clamps

            // Assert
            result.Should().HaveCount(1);
            _mockQuizRepo.Verify(r => r.GetUserAttemptsWithQuizPaginatedAsync(userId, 1, 10), Times.Once);
        }
    }
}
