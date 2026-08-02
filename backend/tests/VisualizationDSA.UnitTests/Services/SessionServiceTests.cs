using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.Infrastructure.Services;
using Xunit;

namespace VisualizationDSA.UnitTests.Services
{
    public class SessionServiceTests : IDisposable
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly Mock<IHeartService> _heartServiceMock;
        private readonly SessionService _sessionService;
        private readonly User _testUser;

        public SessionServiceTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _dbContext = new ApplicationDbContext(options);
            _heartServiceMock = new Mock<IHeartService>();

            _testUser = new User("session_tester", "test@dsa.com", "hash");
            _dbContext.Users.Add(_testUser);
            _dbContext.SaveChanges();

            _sessionService = new SessionService(_dbContext, _heartServiceMock.Object);
        }

        public void Dispose()
        {
            _dbContext.Database.EnsureDeleted();
            _dbContext.Dispose();
        }

        [Fact]
        public async Task EnterNodeAsync_NoActiveSession_DeductsHeartAndCreatesNewSession()
        {
            // Arrange
            _heartServiceMock.Setup(h => h.DeductHeartAtomicAsync(_testUser.Id)).ReturnsAsync(true);
            _heartServiceMock.Setup(h => h.GetHeartStatusAsync(_testUser.Id))
                .ReturnsAsync(new HeartStatusDto { Hearts = 4, MaxHearts = 5 });

            // Act
            var response = await _sessionService.EnterNodeAsync(_testUser.Id, "node-1");

            // Assert
            Assert.False(response.Resumed);
            Assert.Equal("Theory", response.CurrentStep);
            Assert.Equal(4, response.Hearts);
            _heartServiceMock.Verify(h => h.DeductHeartAtomicAsync(_testUser.Id), Times.Once);

            var sessionInDb = await _dbContext.LearningSessions.FindAsync(response.SessionId);
            Assert.NotNull(sessionInDb);
            Assert.Equal("node-1", sessionInDb.NodeId);
        }

        [Fact]
        public async Task EnterNodeAsync_HasActiveSession_ResumesWithoutDeductingHeart()
        {
            // Arrange
            var activeSession = new LearningSession(_testUser.Id, "node-1");
            activeSession.RecordQuizPass(85);
            _dbContext.LearningSessions.Add(activeSession);
            await _dbContext.SaveChangesAsync();

            _heartServiceMock.Setup(h => h.CalculateRecoveredHearts(It.IsAny<User>())).Returns(0);

            // Act
            var response = await _sessionService.EnterNodeAsync(_testUser.Id, "node-1");

            // Assert
            Assert.True(response.Resumed);
            Assert.Equal("Lab", response.CurrentStep); // Because RecordQuizPass sets it to Lab
            Assert.Equal(85, response.QuizScore);
            Assert.Equal(activeSession.Id, response.SessionId);
            
            _heartServiceMock.Verify(h => h.DeductHeartAtomicAsync(It.IsAny<Guid>()), Times.Never);
        }

        [Fact]
        public async Task EnterNodeAsync_OutOfHearts_ThrowsOutOfHeartsException()
        {
            // Arrange
            _heartServiceMock.Setup(h => h.DeductHeartAtomicAsync(_testUser.Id)).ReturnsAsync(false);
            _heartServiceMock.Setup(h => h.GetHeartStatusAsync(_testUser.Id))
                .ReturnsAsync(new HeartStatusDto { NextHeartInSeconds = 3600 });

            // Act & Assert
            var ex = await Assert.ThrowsAsync<OutOfHeartsException>(() => _sessionService.EnterNodeAsync(_testUser.Id, "node-1"));
            Assert.Equal("OUT_OF_HEARTS", ex.Message);
            Assert.Equal(3600, ex.RecoveryInfo.HeartRecoverySeconds);
        }
    }
}
