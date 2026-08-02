using Microsoft.EntityFrameworkCore;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs.PracticeLadder;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.Infrastructure.Services;
using Xunit;

namespace VisualizationDSA.UnitTests.Services
{
    public class PracticeLadderServiceTests
    {
        private ApplicationDbContext GetInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlite($"Data Source=file:{Guid.NewGuid()}?mode=memory&cache=shared")
                .Options;

            var dbContext = new ApplicationDbContext(options);
            dbContext.Database.OpenConnection();
            dbContext.Database.EnsureCreated();
            return dbContext;
        }

        [Fact]
        public async Task SubmitLabAsync_WithoutQuizPass_ThrowsException()
        {
            // Arrange
            using var db = GetInMemoryDbContext();
            var user = new User("test@example.com", "testuser", "hash");
            db.Users.Add(user);
            
            var session = new LearningSession(user.Id, "test-node");
            // Not calling RecordQuizPass on session, so QuizScore is null
            db.LearningSessions.Add(session);
            await db.SaveChangesAsync();

            var mockJudge0 = new Mock<IJudge0Service>();
            var mockHeart = new Mock<IHeartService>();
            
            var service = new PracticeLadderService(db, mockJudge0.Object, mockHeart.Object);

            var request = new LabSubmitRequestDto
            {
                SessionId = session.Id,
                Operations = new List<string> { "push(1)" }
            };

            // Act & Assert
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(
                () => service.SubmitLabAsync(user.Id, "test-node", request)
            );
            
            Assert.Equal("QUIZ_NOT_PASSED", exception.Message);
        }

        [Fact]
        public async Task SubmitLabAsync_WithQuizPass_ReturnsSuccess()
        {
            // Arrange
            using var db = GetInMemoryDbContext();
            var user = new User("test2@example.com", "testuser2", "hash");
            db.Users.Add(user);
            
            var session = new LearningSession(user.Id, "test-node-2");
            session.RecordQuizPass(100); // Quiz passed!
            db.LearningSessions.Add(session);
            await db.SaveChangesAsync();

            var mockJudge0 = new Mock<IJudge0Service>();
            var mockHeart = new Mock<IHeartService>();
            
            var service = new PracticeLadderService(db, mockJudge0.Object, mockHeart.Object);

            var request = new LabSubmitRequestDto
            {
                SessionId = session.Id,
                Operations = new List<string> { "op1", "op2" }
            };

            // Act
            var result = await service.SubmitLabAsync(user.Id, "test-node-2", request);

            // Assert
            Assert.True(result.Passed);
            Assert.Equal(100, result.Score);
            Assert.Equal("LeetCode", result.NextStep);
            
            // Check session updated
            var updatedSession = await db.LearningSessions.FindAsync(session.Id);
            Assert.Equal(100, updatedSession!.LabScore);
        }
    }
}
