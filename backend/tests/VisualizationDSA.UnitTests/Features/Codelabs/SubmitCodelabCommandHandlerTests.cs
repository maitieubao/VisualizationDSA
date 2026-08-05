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

        [Fact]
        public async Task Handle_GivenDisallowedLanguage_ShouldThrow()
        {
            var codelab = new Codelab("X", "Desc", "code", 1, 50, allowedLanguages: "csharp");
            _dbContext.Codelabs.Add(codelab);
            await _dbContext.SaveChangesAsync();

            var act = async () => await _handler.Handle(new SubmitCodelabCommand
            {
                UserId = Guid.NewGuid(),
                CodelabId = codelab.Id,
                Code = "x",
                Language = "python"
            }, CancellationToken.None);

            await act.Should().ThrowAsync<ArgumentException>()
                .WithMessage("Language python is not allowed for this codelab.");
            (await _dbContext.CodelabSubmissions.CountAsync()).Should().Be(0);
        }

        [Fact]
        public async Task Handle_GivenMissingCodelab_ShouldThrow()
        {
            var act = async () => await _handler.Handle(new SubmitCodelabCommand
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
        public async Task Handle_GivenAccepted_ShouldIncludeHiddenCasesAndUpsertModuleProgress()
        {
            var user = new User("prog@test.com", "prog", "hash");
            _dbContext.Users.Add(user);

            var codelab = new Codelab("Prog Codelab", "Desc", "code", 1, 100);
            codelab.TestCases.Add(new CodelabTestCase(codelab.Id, "1", "1", false, 1, 0));
            codelab.TestCases.Add(new CodelabTestCase(codelab.Id, "2", "2", true, 1, 1));
            _dbContext.Codelabs.Add(codelab);

            var moduleItem = new VisualizationDSA.Domain.Entities.ModuleItem(
                moduleId: Guid.NewGuid(), classroomId: null,
                itemType: VisualizationDSA.Domain.Enums.ModuleItemType.Codelab,
                lessonId: null, quizId: null, codelabId: codelab.Id,
                overrideTitle: "Two Sum", orderIndex: 1, isRequired: true);
            _dbContext.Set<VisualizationDSA.Domain.Entities.ModuleItem>().Add(moduleItem);
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
                    PassedCount = 2,
                    TotalCount = 2,
                    TotalScore = 100
                });

            var result = await _handler.Handle(new SubmitCodelabCommand
            {
                UserId = user.Id,
                CodelabId = codelab.Id,
                Code = "print(1)",
                Language = "python"
            }, CancellationToken.None);

            result.Score.Should().Be(100);

            // Submit truyền CẢ test case ẩn cho judge (khác với Run)
            receivedCases.Should().HaveCount(2);
            receivedCases!.Count(tc => tc.IsHidden).Should().Be(1);

            // Progress được upsert + đánh dấu hoàn thành
            var progress = await _dbContext.Set<VisualizationDSA.Domain.Entities.UserModuleItemProgress>()
                .SingleOrDefaultAsync(p => p.UserId == user.Id && p.ModuleItemId == moduleItem.Id);
            progress.Should().NotBeNull();
            progress!.Status.Should().Be("Completed");
            progress.Score.Should().Be(100);
            progress.ProgressPercent.Should().Be(100);

            _mockProgressEngine.Verify(
                e => e.ProcessCompletionAsync(user.Id, moduleItem.Id),
                Times.Once);
        }

        [Fact]
        public async Task Handle_GivenAccepted_ShouldUpdateExistingProgressNotDuplicate()
        {
            var user = new User("prog2@test.com", "prog2", "hash");
            _dbContext.Users.Add(user);

            var codelab = new Codelab("Prog Codelab 2", "Desc", "code", 1, 100);
            codelab.TestCases.Add(new CodelabTestCase(codelab.Id, "1", "1", false, 1, 0));
            _dbContext.Codelabs.Add(codelab);

            var moduleItem = new VisualizationDSA.Domain.Entities.ModuleItem(
                moduleId: Guid.NewGuid(), classroomId: null,
                itemType: VisualizationDSA.Domain.Enums.ModuleItemType.Codelab,
                lessonId: null, quizId: null, codelabId: codelab.Id,
                overrideTitle: "Two Sum", orderIndex: 1, isRequired: true);
            _dbContext.Set<VisualizationDSA.Domain.Entities.ModuleItem>().Add(moduleItem);

            var existingProgress = new VisualizationDSA.Domain.Entities.UserModuleItemProgress(user.Id, moduleItem.Id);
            _dbContext.Set<VisualizationDSA.Domain.Entities.UserModuleItemProgress>().Add(existingProgress);
            await _dbContext.SaveChangesAsync();

            _mockJudgeService
                .Setup(s => s.EvaluateCodeAsync(
                    It.IsAny<string>(), It.IsAny<string>(), It.IsAny<List<CodelabTestCase>>(),
                    It.IsAny<int>(), It.IsAny<int>()))
                .ReturnsAsync(new CodeJudgeResult
                {
                    Passed = true,
                    Status = SubmissionStatus.Accepted,
                    PassedCount = 1,
                    TotalCount = 1,
                    TotalScore = 100
                });

            await _handler.Handle(new SubmitCodelabCommand
            {
                UserId = user.Id,
                CodelabId = codelab.Id,
                Code = "print(1)",
                Language = "python"
            }, CancellationToken.None);

            (await _dbContext.Set<VisualizationDSA.Domain.Entities.UserModuleItemProgress>()
                .CountAsync(p => p.UserId == user.Id)).Should().Be(1);
        }

        [Fact]
        public async Task Handle_GivenFailed_ShouldNotCreateModuleProgress()
        {
            var user = new User("fail@test.com", "fail", "hash");
            _dbContext.Users.Add(user);

            var codelab = new Codelab("Fail Codelab", "Desc", "code", 1, 100);
            codelab.TestCases.Add(new CodelabTestCase(codelab.Id, "1", "2", false, 1, 0));
            _dbContext.Codelabs.Add(codelab);

            var moduleItem = new VisualizationDSA.Domain.Entities.ModuleItem(
                moduleId: Guid.NewGuid(), classroomId: null,
                itemType: VisualizationDSA.Domain.Enums.ModuleItemType.Codelab,
                lessonId: null, quizId: null, codelabId: codelab.Id,
                overrideTitle: "Two Sum", orderIndex: 1, isRequired: true);
            _dbContext.Set<VisualizationDSA.Domain.Entities.ModuleItem>().Add(moduleItem);
            await _dbContext.SaveChangesAsync();

            _mockJudgeService
                .Setup(s => s.EvaluateCodeAsync(
                    It.IsAny<string>(), It.IsAny<string>(), It.IsAny<List<CodelabTestCase>>(),
                    It.IsAny<int>(), It.IsAny<int>()))
                .ReturnsAsync(new CodeJudgeResult
                {
                    Passed = false,
                    Status = SubmissionStatus.WrongAnswer,
                    PassedCount = 0,
                    TotalCount = 1,
                    TotalScore = 0
                });

            await _handler.Handle(new SubmitCodelabCommand
            {
                UserId = user.Id,
                CodelabId = codelab.Id,
                Code = "print(1)",
                Language = "python"
            }, CancellationToken.None);

            (await _dbContext.Set<VisualizationDSA.Domain.Entities.UserModuleItemProgress>()
                .CountAsync(p => p.UserId == user.Id)).Should().Be(0);
            _mockProgressEngine.Verify(
                e => e.ProcessCompletionAsync(It.IsAny<Guid>(), It.IsAny<Guid>()),
                Times.Never);
        }
    }
}
