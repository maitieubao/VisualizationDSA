using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.UnitTests.Common;
using VisualizationDSA.WebApi.Controllers;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Ladder
{
    /// <summary>
    /// F8 (FR-4.11, FR-4.3) — Practice Ladder 3 bậc.
    /// Kiểm tra guard thứ tự bậc + chấm trạng thái cuối của Interactive Lab + pass đủ 3 bậc.
    /// </summary>
    public class LadderControllerTests : IAsyncLifetime
    {
        private readonly F8LadderTestDbContext _db;
        private readonly Guid _userId = Guid.Parse("00000000-0000-0000-0000-0000000000f8");
        private readonly Guid _lessonId = Guid.Parse("00000000-0000-0000-0000-000000000f81");
        private readonly Guid _codelabId = Guid.Parse("00000000-0000-0000-0000-000000000f82");

        public LadderControllerTests()
        {
            TestJwtBuilder.EnsureConfigured();
            var (db, _) = F8LadderTestDbContext.Create();
            _db = db;
        }

        public Task InitializeAsync() => Task.CompletedTask;

        public async Task DisposeAsync()
        {
            await _db.DisposeAsync();
        }

        private LadderController CreateController()
        {
            var controller = new LadderController(_db);
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = $"Bearer {TestJwtBuilder.BuildToken(_userId.ToString(), "Student")}";
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
            return controller;
        }

        private async Task SeedBaseAsync()
        {
            var user = TestUserFactory.CreateStudent(_userId, "ladder@test.com");
            _db.Users.Add(user);

            // Codelab dùng cho bậc 3 (FK bắt buộc trên CodelabSubmission).
            var codelab = new Codelab(
                "Ladder CodeLab", "Hoàn thiện hàm solution.", "function solution(arr) { return arr; }",
                1, 30, 1500, 128000000, "javascript", "", "", "sorting", null);
            var idProp = typeof(Codelab).GetProperty("Id");
            idProp!.SetValue(codelab, _codelabId);
            _db.Codelabs.Add(codelab);

            var lesson = new Lesson("Bài học Ladder", "# Ladder", "dsa", "{}", 50);
            var lessonIdProp = typeof(Lesson).GetProperty("Id");
            lessonIdProp!.SetValue(lesson, _lessonId);
            _db.Lessons.Add(lesson);

            await _db.SaveChangesAsync();
        }

        private static JsonElement JsonValue(object? value)
            => JsonDocument.Parse(JsonSerializer.Serialize(value)).RootElement;

        private static StageProgress MakeProgress(Guid userId, Guid lessonId, int stage, int status)
            => new StageProgress(userId, lessonId, stage, status);

        [Fact]
        public async Task PassStage_Stage2_WithoutStage1_ReturnsLadderLocked()
        {
            await SeedBaseAsync();
            var controller = CreateController();

            var result = await controller.PassStage(_lessonId, 2, new PassStageRequest
            {
                Operations = new List<LabOperationDto> { new LabOperationDto { FromIndex = 0, ToIndex = 3 } },
                FinalArray = new[] { 1, 2, 3, 4 }
            });

            var status = result.Should().BeOfType<ObjectResult>().Subject;
            status.StatusCode.Should().Be(403);
            JsonValue(status.Value).GetProperty("error").GetString().Should().Be("LADDER_LOCKED");
        }

        [Fact]
        public async Task PassStage_Stage3_WithoutStage2_ReturnsLadderLocked()
        {
            await SeedBaseAsync();
            _db.Set<StageProgress>().Add(MakeProgress(_userId, _lessonId, 1, StageProgress.StatusPassed));
            await _db.SaveChangesAsync();
            var controller = CreateController();

            var result = await controller.PassStage(_lessonId, 3, new PassStageRequest
            {
                CodelabSubmissionId = Guid.NewGuid().ToString()
            });

            var status = result.Should().BeOfType<ObjectResult>().Subject;
            status.StatusCode.Should().Be(403);
            JsonValue(status.Value).GetProperty("error").GetString().Should().Be("LADDER_LOCKED");
        }

        [Fact]
        public async Task PassStage_Lab_RejectsWrongFinalArray()
        {
            await SeedBaseAsync();
            _db.Set<StageProgress>().Add(MakeProgress(_userId, _lessonId, 1, StageProgress.StatusPassed));
            await _db.SaveChangesAsync();
            var controller = CreateController();

            var result = await controller.PassStage(_lessonId, 2, new PassStageRequest
            {
                Operations = new List<LabOperationDto> { new LabOperationDto { FromIndex = 0, ToIndex = 3 } },
                FinalArray = new[] { 4, 2, 3, 1 }
            });

            var bad = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            JsonValue(bad.Value).GetProperty("passed").GetBoolean().Should().Be(false);
            (await _db.Set<StageProgress>().CountAsync(p => p.Stage == 2 && p.Status == StageProgress.StatusPassed)).Should().Be(0);
        }

        [Fact]
        public async Task PassStage_Lab_AcceptsCorrectSortedArray()
        {
            await SeedBaseAsync();
            _db.Set<StageProgress>().Add(MakeProgress(_userId, _lessonId, 1, StageProgress.StatusPassed));
            await _db.SaveChangesAsync();
            var controller = CreateController();

            var result = await controller.PassStage(_lessonId, 2, new PassStageRequest
            {
                Operations = new List<LabOperationDto> { new LabOperationDto { FromIndex = 0, ToIndex = 3 } },
                FinalArray = new[] { 1, 2, 3, 4 }
            });

            result.Should().BeOfType<OkObjectResult>();
            var progress = await _db.Set<StageProgress>()
                .SingleAsync(p => p.UserId == _userId && p.LessonId == _lessonId && p.Stage == 2);
            progress.Status.Should().Be(StageProgress.StatusPassed);
            progress.BestScore.Should().Be(100);
        }

        [Fact]
        public async Task FullLadder_AllThreeStages_PassSequentially()
        {
            await SeedBaseAsync();
            var controller = CreateController();

            // Bậc 1: quiz 6/10 = 60% (đúng ngưỡng). Dùng reference bank (QuizId null) để tránh FK.
            var attempt = new QuizAttempt(_userId, "ladder-quiz", "Ladder Quiz", new[] { 0, 1, 0, 1, 0, 1, 0, 1, 0, 1 }, 6, 10);
            _db.QuizAttempts.Add(attempt);
            await _db.SaveChangesAsync();

            var stage1 = await controller.PassStage(_lessonId, 1, new PassStageRequest { QuizAttemptId = attempt.Id.ToString() });
            stage1.Should().BeOfType<OkObjectResult>();

            // Bậc 2: 1 swap (0,3) biến [4,2,3,1] thành [1,2,3,4].
            var stage2 = await controller.PassStage(_lessonId, 2, new PassStageRequest
            {
                Operations = new List<LabOperationDto> { new LabOperationDto { FromIndex = 0, ToIndex = 3 } },
                FinalArray = new[] { 1, 2, 3, 4 }
            });
            stage2.Should().BeOfType<OkObjectResult>();

            // Bậc 3: codelab 8/10 = 80% (≥ 70%).
            var submission = new CodelabSubmission(_userId, _codelabId, "function solution(arr){return arr.sort((a,b)=>a-b);}", "javascript", isSubmit: true);
            submission.UpdateResult(SubmissionStatus.Accepted, 20, 1024, 8, 10, 8, "[]");
            _db.CodelabSubmissions.Add(submission);
            await _db.SaveChangesAsync();

            var stage3 = await controller.PassStage(_lessonId, 3, new PassStageRequest { CodelabSubmissionId = submission.Id.ToString() });
            stage3.Should().BeOfType<OkObjectResult>();

            var progresses = await _db.Set<StageProgress>()
                .Where(p => p.UserId == _userId && p.LessonId == _lessonId)
                .OrderBy(p => p.Stage)
                .ToListAsync();
            progresses.Select(p => p.Status).Should().Equal(2, 2, 2);
        }
    }
}
