using System;
using System.Collections.Generic;
using System.Linq;
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
    /// <summary>
    /// Bao phủ RunCodelabCommandHandler: lọc hidden test cases, lưu submission isSubmit=false (không XP),
    /// language allow-list, not-found, judge unavailable.
    /// </summary>
    public class RunCodelabCommandHandlerTests
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly Mock<ICodeJudgeService> _mockJudgeService;
        private readonly RunCodelabCommandHandler _handler;

        public RunCodelabCommandHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _dbContext = new ApplicationDbContext(options);
            _mockJudgeService = new Mock<ICodeJudgeService>();
            _handler = new RunCodelabCommandHandler(_dbContext, _mockJudgeService.Object);
        }

        private async Task<Codelab> SeedCodelabWithCasesAsync()
        {
            var codelab = new Codelab("Run Codelab", "Desc", "code", 1, 100);
            codelab.TestCases.Add(new CodelabTestCase(codelab.Id, "1", "1", false, 1, 0));
            codelab.TestCases.Add(new CodelabTestCase(codelab.Id, "2", "2", true, 1, 1));
            _dbContext.Codelabs.Add(codelab);
            await _dbContext.SaveChangesAsync();
            return codelab;
        }

        [Fact]
        public async Task Handle_GivenVisibleOnlyCases_ShouldPassOnlyVisibleToJudge()
        {
            var codelab = await SeedCodelabWithCasesAsync();
            var user = new User("run@test.com", "runner", "hash");
            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();

            List<CodelabTestCase>? receivedCases = null;
            _mockJudgeService
                .Setup(s => s.EvaluateCodeAsync(
                    It.IsAny<string>(), It.IsAny<string>(), It.IsAny<List<CodelabTestCase>>(),
                    It.IsAny<int>(), It.IsAny<int>()))
                .Callback<string, string, List<CodelabTestCase>, int, int>((_, _, cases, _, _) => receivedCases = cases)
                .ReturnsAsync(new CodeJudgeResult
                {
                    Passed = true,
                    Status = SubmissionStatus.Accepted,
                    PassedCount = 1,
                    TotalCount = 1,
                    TotalScore = 100,
                    TestCaseResults = new List<TestCaseResult>
                    {
                        new() { Passed = true, Name = "Testcase #1", IsHidden = false, ActualOutput = "1" }
                    }
                });

            var result = await _handler.Handle(new RunCodelabCommand
            {
                UserId = user.Id,
                CodelabId = codelab.Id,
                Code = "print(1)",
                Language = "python"
            }, CancellationToken.None);

            result.Passed.Should().BeTrue();
            receivedCases.Should().HaveCount(1);
            receivedCases![0].IsHidden.Should().BeFalse();
            receivedCases[0].Input.Should().Be("1");
        }

        [Fact]
        public async Task Handle_ShouldPersistRunSubmissionWithoutXP()
        {
            var codelab = await SeedCodelabWithCasesAsync();
            var user = new User("run2@test.com", "runner2", "hash");
            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();

            _mockJudgeService
                .Setup(s => s.EvaluateCodeAsync(
                    It.IsAny<string>(), It.IsAny<string>(), It.IsAny<List<CodelabTestCase>>(),
                    It.IsAny<int>(), It.IsAny<int>()))
                .ReturnsAsync(new CodeJudgeResult
                {
                    Passed = true,
                    Status = SubmissionStatus.Accepted,
                    RuntimeMs = 12,
                    MemoryBytes = 256,
                    PassedCount = 1,
                    TotalCount = 1,
                    TotalScore = 100,
                    TestCaseResults = new List<TestCaseResult>
                    {
                        new() { Passed = true, Name = "Testcase #1", IsHidden = false, ActualOutput = "1" }
                    }
                });

            var result = await _handler.Handle(new RunCodelabCommand
            {
                UserId = user.Id,
                CodelabId = codelab.Id,
                Code = "print(1)",
                Language = "python"
            }, CancellationToken.None);

            var submission = await _dbContext.CodelabSubmissions.SingleOrDefaultAsync();
            submission.Should().NotBeNull();
            submission!.IsSubmit.Should().BeFalse();
            submission.Status.Should().Be(SubmissionStatus.Accepted);
            submission.RuntimeMs.Should().Be(12);
            submission.PerTestCaseResultJson.Should().NotBe("[]");

            result.TestCaseResultsJson.Should().NotBeNullOrEmpty();

            var updatedUser = await _dbContext.Users.FindAsync(user.Id);
            updatedUser!.TotalXP.Should().Be(0);
        }

        [Fact]
        public async Task Handle_GivenDisallowedLanguage_ShouldThrow()
        {
            var codelab = new Codelab("X", "Desc", "code", 1, 50, allowedLanguages: "csharp");
            _dbContext.Codelabs.Add(codelab);
            await _dbContext.SaveChangesAsync();

            var act = async () => await _handler.Handle(new RunCodelabCommand
            {
                UserId = Guid.NewGuid(),
                CodelabId = codelab.Id,
                Code = "x",
                Language = "python"
            }, CancellationToken.None);

            await act.Should().ThrowAsync<ArgumentException>()
                .WithMessage("Language python is not allowed for this codelab.");
        }

        [Fact]
        public async Task Handle_GivenMissingCodelab_ShouldThrow()
        {
            var act = async () => await _handler.Handle(new RunCodelabCommand
            {
                UserId = Guid.NewGuid(),
                CodelabId = Guid.NewGuid(),
                Code = "x",
                Language = "python"
            }, CancellationToken.None);

            await act.Should().ThrowAsync<ArgumentException>()
                .WithMessage("Codelab not found.");
        }

        [Fact]
        public async Task Handle_GivenJudgeUnavailable_ShouldPersistResultAndNotThrow()
        {
            var codelab = await SeedCodelabWithCasesAsync();

            _mockJudgeService
                .Setup(s => s.EvaluateCodeAsync(
                    It.IsAny<string>(), It.IsAny<string>(), It.IsAny<List<CodelabTestCase>>(),
                    It.IsAny<int>(), It.IsAny<int>()))
                .ReturnsAsync(new CodeJudgeResult
                {
                    Passed = false,
                    Status = SubmissionStatus.JudgeUnavailable,
                    ErrorMessage = "Judge down"
                });

            var result = await _handler.Handle(new RunCodelabCommand
            {
                UserId = Guid.NewGuid(),
                CodelabId = codelab.Id,
                Code = "x",
                Language = "python"
            }, CancellationToken.None);

            result.Status.Should().Be(SubmissionStatus.JudgeUnavailable);
            result.ErrorMessage.Should().Be("Judge down");

            var submission = await _dbContext.CodelabSubmissions.SingleOrDefaultAsync();
            submission!.Status.Should().Be(SubmissionStatus.JudgeUnavailable);
        }
    }
}
