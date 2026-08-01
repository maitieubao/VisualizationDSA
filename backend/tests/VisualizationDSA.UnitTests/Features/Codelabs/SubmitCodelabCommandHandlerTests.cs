using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using VisualizationDSA.Application.Features.Codelabs.Commands;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Infrastructure.Data;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Codelabs
{
    public class SubmitCodelabCommandHandlerTests
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly Mock<ICodeJudgeService> _mockJudgeService;
        private readonly Mock<IProgressRuleEngine> _mockProgressEngine;
        private readonly SubmitCodelabCommandHandler _handler;

        public SubmitCodelabCommandHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _dbContext = new ApplicationDbContext(options);
            _mockJudgeService = new Mock<ICodeJudgeService>();
            _mockProgressEngine = new Mock<IProgressRuleEngine>();

            _handler = new SubmitCodelabCommandHandler(_dbContext, _mockJudgeService.Object, _mockProgressEngine.Object);
        }

        [Fact]
        public async Task Handle_GivenValidSubmission_ShouldSaveSubmissionAndAwardXP()
        {
            var user = new User("test@test.com", "test", "hash");
            _dbContext.Users.Add(user);

            var codelab = new Codelab("Test Codelab", "Desc", "print('x')", 1, 100);
            codelab.TestCases.Add(new CodelabTestCase(codelab.Id, "1", "1", false, 1, 0));
            _dbContext.Codelabs.Add(codelab);
            await _dbContext.SaveChangesAsync();

            var command = new SubmitCodelabCommand
            {
                UserId = user.Id,
                CodelabId = codelab.Id,
                Code = "print(1)",
                Language = "python"
            };

            _mockJudgeService
                .Setup(s => s.EvaluateCodeAsync(
                    It.IsAny<string>(), It.IsAny<string>(), It.IsAny<List<CodelabTestCase>>(),
                    It.IsAny<int>(), It.IsAny<int>()))
                .ReturnsAsync(new CodeJudgeResult
                {
                    Passed = true,
                    Status = SubmissionStatus.Accepted,
                    RuntimeMs = 50,
                    MemoryBytes = 1024,
                    PassedCount = 1,
                    TotalCount = 1,
                    TotalScore = 100
                });

            var result = await _handler.Handle(command, CancellationToken.None);

            result.Passed.Should().BeTrue();
            result.SubmissionId.Should().NotBeEmpty();

            var submission = await _dbContext.CodelabSubmissions.FirstOrDefaultAsync(s => s.Id == result.SubmissionId);
            submission.Should().NotBeNull();
            submission!.Status.Should().Be(SubmissionStatus.Accepted);

            var updatedUser = await _dbContext.Users.FindAsync(user.Id);
            updatedUser!.TotalXP.Should().Be(100);
        }

        [Fact]
        public async Task Handle_GivenFailedSubmission_ShouldNotAwardXP()
        {
            var user = new User("test2@test.com", "test2", "hash");
            _dbContext.Users.Add(user);

            var codelab = new Codelab("Test Codelab 2", "Desc", "print('x')", 1, 150);
            codelab.TestCases.Add(new CodelabTestCase(codelab.Id, "1", "2", false, 1, 0));
            _dbContext.Codelabs.Add(codelab);
            await _dbContext.SaveChangesAsync();

            var command = new SubmitCodelabCommand
            {
                UserId = user.Id,
                CodelabId = codelab.Id,
                Code = "print(1)",
                Language = "python"
            };

            _mockJudgeService
                .Setup(s => s.EvaluateCodeAsync(
                    It.IsAny<string>(), It.IsAny<string>(), It.IsAny<List<CodelabTestCase>>(),
                    It.IsAny<int>(), It.IsAny<int>()))
                .ReturnsAsync(new CodeJudgeResult
                {
                    Passed = false,
                    Status = SubmissionStatus.WrongAnswer,
                    RuntimeMs = 60,
                    MemoryBytes = 1024,
                    PassedCount = 0,
                    TotalCount = 1,
                    TotalScore = 0
                });

            var result = await _handler.Handle(command, CancellationToken.None);

            result.Passed.Should().BeFalse();

            var updatedUser = await _dbContext.Users.FindAsync(user.Id);
            updatedUser!.TotalXP.Should().Be(0);
        }

        [Fact]
        public async Task Handle_GivenJudgeUnavailable_ShouldNotAwardXP()
        {
            var user = new User("test3@test.com", "test3", "hash");
            _dbContext.Users.Add(user);

            var codelab = new Codelab("Test Codelab 3", "Desc", "print('x')", 1, 150);
            codelab.TestCases.Add(new CodelabTestCase(codelab.Id, "1", "2", false, 1, 0));
            _dbContext.Codelabs.Add(codelab);
            await _dbContext.SaveChangesAsync();

            var command = new SubmitCodelabCommand
            {
                UserId = user.Id,
                CodelabId = codelab.Id,
                Code = "print(1)",
                Language = "python"
            };

            _mockJudgeService
                .Setup(s => s.EvaluateCodeAsync(
                    It.IsAny<string>(), It.IsAny<string>(), It.IsAny<List<CodelabTestCase>>(),
                    It.IsAny<int>(), It.IsAny<int>()))
                .ReturnsAsync(new CodeJudgeResult
                {
                    Passed = false,
                    Status = SubmissionStatus.JudgeUnavailable,
                    RuntimeMs = 0,
                    MemoryBytes = 0,
                    ErrorMessage = "Judge unavailable"
                });

            var result = await _handler.Handle(command, CancellationToken.None);

            result.Passed.Should().BeFalse();
            result.Status.Should().Be(SubmissionStatus.JudgeUnavailable);

            var updatedUser = await _dbContext.Users.FindAsync(user.Id);
            updatedUser!.TotalXP.Should().Be(0);
        }
    }
}
