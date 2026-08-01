using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using VisualizationDSA.Application.Features.Codelabs.Commands;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Codelabs
{
    public class SubmitCodelabCommandHandlerTests
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly Mock<ICodeJudgeService> _mockJudgeService;
        private readonly SubmitCodelabCommandHandler _handler;

        public SubmitCodelabCommandHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _dbContext = new ApplicationDbContext(options);
            _mockJudgeService = new Mock<ICodeJudgeService>();
            
            _handler = new SubmitCodelabCommandHandler(_dbContext, _mockJudgeService.Object);
        }

        [Fact]
        public async Task Handle_GivenValidSubmission_ShouldSaveSubmissionAndAwardXP()
        {
            
            var user = new User("test@test.com", "test", "hash");
            _dbContext.Users.Add(user);

            var codelab = new Codelab("Test Codelab", "Desc", "int main() {}", "42", 1, 100);
            _dbContext.Codelabs.Add(codelab);
            
            await _dbContext.SaveChangesAsync();

            var command = new SubmitCodelabCommand
            {
                UserId = user.Id,
                CodelabId = codelab.Id,
                Code = "print(42)",
                Language = "python"
            };

            _mockJudgeService.Setup(s => s.EvaluateCodeAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>(), It.IsAny<int>()))
                .ReturnsAsync(new CodeJudgeResult
                {
                    Passed = true,
                    Status = "Passed",
                    RuntimeMs = 50,
                    MemoryBytes = 1024
                });

            
            var result = await _handler.Handle(command, CancellationToken.None);

            
            result.Passed.Should().BeTrue();
            result.SubmissionId.Should().NotBeEmpty();

            var submission = await _dbContext.CodelabSubmissions.FirstOrDefaultAsync(s => s.Id == result.SubmissionId);
            submission.Should().NotBeNull();
            submission!.Status.Should().Be("Passed");

            var updatedUser = await _dbContext.Users.FindAsync(user.Id);
            updatedUser!.TotalXP.Should().Be(100); 
        }

        [Fact]
        public async Task Handle_GivenFailedSubmission_ShouldNotAwardXP()
        {
            
            var user = new User("test2@test.com", "test2", "hash");
            _dbContext.Users.Add(user);

            var codelab = new Codelab("Test Codelab 2", "Desc", "int main() {}", "42", 1, 150);
            _dbContext.Codelabs.Add(codelab);
            
            await _dbContext.SaveChangesAsync();

            var command = new SubmitCodelabCommand
            {
                UserId = user.Id,
                CodelabId = codelab.Id,
                Code = "print(43)",
                Language = "python"
            };

            _mockJudgeService.Setup(s => s.EvaluateCodeAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>(), It.IsAny<int>()))
                .ReturnsAsync(new CodeJudgeResult
                {
                    Passed = false,
                    Status = "Failed",
                    RuntimeMs = 60,
                    MemoryBytes = 1024
                });

            
            var result = await _handler.Handle(command, CancellationToken.None);

            
            result.Passed.Should().BeFalse();

            var updatedUser = await _dbContext.Users.FindAsync(user.Id);
            updatedUser!.TotalXP.Should().Be(0); 
        }
    }
}
