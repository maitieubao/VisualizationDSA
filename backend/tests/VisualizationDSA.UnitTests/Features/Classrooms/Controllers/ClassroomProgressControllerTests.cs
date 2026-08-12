using System;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.Infrastructure.Services;
using VisualizationDSA.UnitTests.Common;
using VisualizationDSA.WebApi.Controllers;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Classrooms.Controllers;

// CR-012: ClassroomProgressController — start/progress/complete/unlock-status/my-progress
// + IDOR: học viên không enroll / bị kick phải nhận 403 (CR-016/017/036) + score server-side (CR-020).
public class ClassroomProgressControllerTests
{
    static ClassroomProgressControllerTests()
    {
        TestJwtBuilder.EnsureConfigured();
    }

    private sealed class Fixture
    {
        public ApplicationDbContext Db { get; }
        public Guid ClassroomId { get; }
        public Guid StudentId { get; }
        public Guid ModuleId { get; }
        public Guid LessonItemId { get; }
        public ClassroomProgressController Controller { get; }

        public Fixture(string dbName, bool enrollStudent = true, bool kickStudent = false)
        {
            Db = TestDbContextFactory.CreateSimple("ProgressCtrl_" + dbName);
            var teacherId = Guid.NewGuid();
            StudentId = Guid.NewGuid();

            var classroom = new Classroom(teacherId, "C", "", "CODE");
            Db.Classrooms.Add(classroom);
            var module = new ClassroomModule(classroom.Id, "M", "", 0);
            Db.ClassroomModules.Add(module);
            var lesson = new Lesson("L", "# md", "monaco", "{}", 5);
            Db.Lessons.Add(lesson);
            var item = new ClassroomModuleItem(module.Id, ModuleItemType.Lesson, lesson.Id, null, null, "Item", "", 0, true);
            Db.ClassroomModuleItems.Add(item);
            Db.SaveChanges();

            ClassroomId = classroom.Id;
            ModuleId = module.Id;
            LessonItemId = item.Id;

            if (enrollStudent)
            {
                var enrollment = new ClassroomEnrollment(classroom.Id, StudentId);
                if (kickStudent) enrollment.Kick(teacherId, "kick");
                Db.ClassroomEnrollments.Add(enrollment);
                Db.SaveChanges();
            }

            var engine = new ClassroomUnlockRuleEngine(Db);
            var progressService = new ClassroomProgressService(Db, engine);
            Controller = new ClassroomProgressController(progressService, engine, Db);
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = $"Bearer {TestJwtBuilder.BuildToken(StudentId.ToString(), "Student")}";
            Controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
        }

        public Guid AddQuizItem(Guid quizId, Guid classroomQuizId, int attemptScore, int maxScore)
        {
            var item = new ClassroomModuleItem(ModuleId, ModuleItemType.Quiz, null, quizId, null, "QuizItem", "", 1, true);
            Db.ClassroomModuleItems.Add(item);
            Db.ClassroomQuizAttempts.Add(new ClassroomQuizAttempt(classroomQuizId, StudentId, attemptScore, maxScore, DateTime.UtcNow.AddDays(1)));
            Db.SaveChanges();
            return item.Id;
        }

        public Guid AddCodelabItem(Guid codelabId, int submissionScore)
        {
            var item = new ClassroomModuleItem(ModuleId, ModuleItemType.Codelab, null, null, codelabId, "CodeItem", "", 1, true);
            Db.ClassroomModuleItems.Add(item);
            var submission = new CodelabSubmission(StudentId, codelabId, "code", "csharp", isSubmit: true);
            submission.UpdateResult(SubmissionStatus.Accepted, 10, 100, 1, 1, submissionScore, "[]");
            Db.CodelabSubmissions.Add(submission);
            Db.SaveChanges();
            return item.Id;
        }
    }

    // ---------- CR-036: không enroll → 403 ----------

    [Fact]
    public async Task StartModuleItem_NotEnrolled_Returns403()
    {
        var fx = new Fixture("StartNotEnrolled", enrollStudent: false);
        var result = await fx.Controller.StartModuleItem(fx.LessonItemId);

        var status = result.Should().BeOfType<ObjectResult>().Subject;
        status.StatusCode.Should().Be(403);
    }

    [Fact]
    public async Task UpdateProgress_NotEnrolled_Returns403()
    {
        var fx = new Fixture("ProgressNotEnrolled", enrollStudent: false);
        var result = await fx.Controller.UpdateProgress(fx.LessonItemId, new UpdateProgressRequest { ActiveFrame = 1, ScrollPercent = 50 });

        var status = result.Should().BeOfType<ObjectResult>().Subject;
        status.StatusCode.Should().Be(403);
    }

    [Fact]
    public async Task CompleteModuleItem_NotEnrolled_Returns403()
    {
        var fx = new Fixture("CompleteNotEnrolled", enrollStudent: false);
        var result = await fx.Controller.CompleteModuleItem(fx.LessonItemId, new CompleteItemRequest { Score = 100 });

        var status = result.Should().BeOfType<ObjectResult>().Subject;
        status.StatusCode.Should().Be(403);
    }

    // ---------- IDOR: unlock-status (CR-016) ----------

    [Fact]
    public async Task GetUnlockStatus_KickedStudent_Returns403()
    {
        var fx = new Fixture("UnlockKicked", kickStudent: true);

        var result = await fx.Controller.GetUnlockStatus(fx.LessonItemId);

        var status = result.Should().BeOfType<ObjectResult>().Subject;
        status.StatusCode.Should().Be(403);
    }

    [Fact]
    public async Task GetUnlockStatus_NotEnrolled_Returns403()
    {
        var fx = new Fixture("UnlockNotEnrolled", enrollStudent: false);

        var result = await fx.Controller.GetUnlockStatus(fx.LessonItemId);

        var status = result.Should().BeOfType<ObjectResult>().Subject;
        status.StatusCode.Should().Be(403);
    }

    [Fact]
    public async Task GetUnlockStatus_Enrolled_ReturnsOk()
    {
        var fx = new Fixture("UnlockEnrolled");

        var result = await fx.Controller.GetUnlockStatus(fx.LessonItemId);

        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetUnlockStatus_ItemNotFound_Returns404()
    {
        var fx = new Fixture("UnlockMissing");

        var result = await fx.Controller.GetUnlockStatus(Guid.NewGuid());

        var status = result.Should().BeAssignableTo<ObjectResult>().Which;
        status.StatusCode.Should().Be(404);
    }

    // ---------- /my-progress (CR-017) ----------

    [Fact]
    public async Task GetMyProgress_NotEnrolled_Returns403()
    {
        var fx = new Fixture("MyProgressNotEnrolled", enrollStudent: false);

        var result = await fx.Controller.GetMyProgress(fx.ClassroomId);

        var status = result.Should().BeOfType<ObjectResult>().Subject;
        status.StatusCode.Should().Be(403);
    }

    [Fact]
    public async Task GetMyProgress_Enrolled_Returns200()
    {
        var fx = new Fixture("MyProgressEnrolled");

        var result = await fx.Controller.GetMyProgress(fx.ClassroomId);

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        ok.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task GetMyProgress_UnknownClassroom_Returns403()
    {
        var fx = new Fixture("MyProgressMissing");

        // Service check enrollment TRƯỚC classroom — không enroll → 403.
        var result = await fx.Controller.GetMyProgress(Guid.NewGuid());

        var status = result.Should().BeAssignableTo<ObjectResult>().Which;
        status.StatusCode.Should().Be(403);
    }

    // ---------- unlocked-items ----------

    [Fact]
    public async Task GetUnlockedItems_NotEnrolled_Returns403()
    {
        var fx = new Fixture("UnlockedNotEnrolled", enrollStudent: false);

        var result = await fx.Controller.GetUnlockedItems(fx.ClassroomId);

        var status = result.Should().BeOfType<ObjectResult>().Subject;
        status.StatusCode.Should().Be(403);
    }

    [Fact]
    public async Task GetUnlockedItems_Enrolled_ReturnsItemIds()
    {
        var fx = new Fixture("UnlockedEnrolled");

        var result = await fx.Controller.GetUnlockedItems(fx.ClassroomId);

        result.Should().BeOfType<OkObjectResult>();
    }

    // ---------- CR-020: score server-side ----------

    [Fact]
    public async Task CompleteModuleItem_Lesson_IgnoresClientScore()
    {
        var fx = new Fixture("LessonScore");

        var result = await fx.Controller.CompleteModuleItem(fx.LessonItemId, new CompleteItemRequest { Score = 99 });

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var value = ok.Value.Should().BeOfType<ItemProgressResult>().Subject;
        value.Success.Should().BeTrue();
        value.Score.Should().BeNull(); // Lesson không nhận score client
    }

    [Fact]
    public async Task CompleteModuleItem_Quiz_UsesBestAttemptScore_FromServer()
    {
        var fx = new Fixture("QuizScore");
        var quiz = new Quiz("Q", "d", "t", 1, 10);
        fx.Db.Quizzes.Add(quiz);
        var classroomQuiz = new ClassroomQuiz(fx.ClassroomId, quiz.Id, DateTime.UtcNow.AddDays(-1), DateTime.UtcNow.AddDays(1), 3);
        fx.Db.ClassroomQuizzes.Add(classroomQuiz);
        fx.Db.SaveChanges();
        var quizItemId = fx.AddQuizItem(quiz.Id, classroomQuiz.Id, attemptScore: 80, maxScore: 100);

        // Client tự khai 5 — server phải ghi đè bằng attempt tốt nhất (80%).
        var result = await fx.Controller.CompleteModuleItem(quizItemId, new CompleteItemRequest { Score = 5 });

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var value = ok.Value.Should().BeOfType<ItemProgressResult>().Subject;
        value.Score.Should().Be(80);
    }

    [Fact]
    public async Task CompleteModuleItem_Codelab_UsesBestSubmissionScore_FromServer()
    {
        var fx = new Fixture("CodelabScore");
        var codelab = new Codelab("Code", "d", "initial", 1, 10);
        fx.Db.Codelabs.Add(codelab);
        fx.Db.SaveChanges();
        var codelabItemId = fx.AddCodelabItem(codelab.Id, submissionScore: 75);

        var result = await fx.Controller.CompleteModuleItem(codelabItemId, new CompleteItemRequest { Score = 5 });

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var value = ok.Value.Should().BeOfType<ItemProgressResult>().Subject;
        value.Score.Should().Be(75);
    }
}
