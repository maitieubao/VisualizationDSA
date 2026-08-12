using System;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.Infrastructure.Services;
using VisualizationDSA.UnitTests.Common;
using Xunit;

namespace VisualizationDSA.UnitTests.Services;

// CR-013: Grading/Analytics — best-attempt (quiz/codelab), pass/completion rate,
// IDOR owner check, Admin được cho qua (CR-035), đọc ClassroomModuleItems (CR-019).
public class ClassroomGradingServiceTests
{
    private sealed class Fixture
    {
        public ApplicationDbContext Db { get; }
        public Guid ClassroomId { get; }
        public Guid CourseId { get; }
        public Guid TeacherId { get; }
        public Guid StudentA { get; }
        public Guid StudentB { get; }
        public Guid QuizId { get; }
        public Guid RequiredItemId { get; }

        public Fixture(string dbName)
        {
            Db = TestDbContextFactory.CreateSimple("Grading_" + dbName);
            TeacherId = Guid.NewGuid();
            StudentA = Guid.NewGuid();
            StudentB = Guid.NewGuid();

            var teacher = new User("teacher@test.com", "teacher", "hash");
            SetId(teacher, TeacherId);
            Db.Users.Add(teacher);

            var studentA = new User("a@test.com", "studentA", "hash");
            SetId(studentA, StudentA);
            var studentB = new User("b@test.com", "studentB", "hash");
            SetId(studentB, StudentB);
            Db.Users.AddRange(studentA, studentB);

            var classroom = new Classroom(TeacherId, "C", "", "CODE");
            Db.Classrooms.Add(classroom);
            CourseId = Guid.NewGuid();
            classroom.LinkToCourse(CourseId);
            Db.SaveChanges();

            ClassroomId = classroom.Id;
            Db.ClassroomEnrollments.AddRange(
                new ClassroomEnrollment(classroom.Id, StudentA),
                new ClassroomEnrollment(classroom.Id, StudentB));
            Db.SaveChanges();

            var module = new ClassroomModule(classroom.Id, "M", "", 0);
            Db.ClassroomModules.Add(module);
            Db.SaveChanges();

            QuizId = Guid.NewGuid();
            var quiz = new Quiz("Classroom Quiz", "d", "t", 1, 10);
            Db.Quizzes.Add(quiz);
            QuizId = quiz.Id;
            var classroomQuiz = new ClassroomQuiz(classroom.Id, quiz.Id, DateTime.UtcNow.AddDays(-1), DateTime.UtcNow.AddDays(1), 3);
            Db.ClassroomQuizzes.Add(classroomQuiz);
            var quizItem = new ClassroomModuleItem(module.Id, ModuleItemType.Quiz, null, quiz.Id, null, "QuizItem", "", 0, isRequired: false);
            Db.ClassroomModuleItems.Add(quizItem);
            Db.SaveChanges();

            var lesson = new Lesson("L", "# md", "monaco", "{}", 5);
            Db.Lessons.Add(lesson);
            var requiredItem = new ClassroomModuleItem(module.Id, ModuleItemType.Lesson, lesson.Id, null, null, "RequiredLesson", "", 1, isRequired: true);
            var optionalItem = new ClassroomModuleItem(module.Id, ModuleItemType.Lesson, lesson.Id, null, null, "OptionalLesson", "", 2, isRequired: false);
            Db.ClassroomModuleItems.AddRange(requiredItem, optionalItem);
            Db.SaveChanges();

            RequiredItemId = requiredItem.Id;
        }

        public static void SetId(User user, Guid id)
        {
            typeof(User).GetProperty("Id")!.SetValue(user, id);
        }

        public void AddQuizAttempt(Guid studentId, int score, int maxScore)
        {
            var classroomQuiz = Db.ClassroomQuizzes.Single();
            Db.ClassroomQuizAttempts.Add(
                new ClassroomQuizAttempt(classroomQuiz.Id, studentId, score, maxScore, DateTime.UtcNow.AddDays(1)));
            Db.SaveChanges();
        }

        public void AddCodelabItemAndSubmission(Guid studentId, int score)
        {
            var module = Db.ClassroomModules.Single();
            var codelab = new Codelab("CodeLab", "d", "init", 1, 10);
            Db.Codelabs.Add(codelab);
            var item = new ClassroomModuleItem(module.Id, ModuleItemType.Codelab, null, null, codelab.Id, "CodeItem", "", 3, true);
            Db.ClassroomModuleItems.Add(item);
            Db.SaveChanges();

            var submission = new CodelabSubmission(studentId, codelab.Id, "code", "csharp", isSubmit: true);
            submission.UpdateResult(SubmissionStatus.Accepted, 5, 100, 1, 1, score, "[]");
            Db.CodelabSubmissions.Add(submission);
            Db.SaveChanges();
        }

        public void CompleteRequired(Guid studentId)
        {
            var progress = new UserModuleItemProgress(studentId, RequiredItemId, attemptNumber: 1);
            progress.UpdateProgress(0, 100, isCompleted: true);
            Db.UserModuleItemProgresses.Add(progress);
            Db.SaveChanges();
        }
    }

    private static ClassroomGradingService Service(ApplicationDbContext db) => new(db);

    // ---------- CR-013: best-attempt ----------

    [Fact]
    public async Task QuizBestAttempt_UsesHighestScore_NotLatest()
    {
        var fx = new Fixture("BestAttempt");
        fx.AddQuizAttempt(fx.StudentA, 40, 100); // attempt cũ, thấp
        fx.AddQuizAttempt(fx.StudentA, 80, 100); // attempt mới, cao

        var stats = await Service(fx.Db).GetClassStatisticsAsync(fx.ClassroomId, fx.TeacherId);

        var row = stats.StudentScores.Single(s => s.StudentId == fx.StudentA);
        row.ScoresPerQuiz[fx.QuizId].Should().Be(80);
        stats.PassRate.Should().Be(100);
    }

    [Fact]
    public async Task CodelabBestSubmission_UsesHighestScore()
    {
        var fx = new Fixture("CodelabBest");
        fx.AddCodelabItemAndSubmission(fx.StudentA, 60);
        fx.AddCodelabItemAndSubmission(fx.StudentA, 90);

        var stats = await Service(fx.Db).GetClassStatisticsAsync(fx.ClassroomId, fx.TeacherId);

        var row = stats.StudentScores.Single(s => s.StudentId == fx.StudentA);
        row.ScoresPerCodelab.Values.Max().Should().Be(90);
    }

    // ---------- CR-019: completion rate + classroom scope ----------

    [Fact]
    public async Task CompletionRate_FiltersRequired_OnBothSides()
    {
        var fx = new Fixture("CompletionRate");
        // Chỉ studentA hoàn thành item bắt buộc; item optional KHÔNG tính vào mẫu.
        fx.CompleteRequired(fx.StudentA);

        var stats = await Service(fx.Db).GetClassStatisticsAsync(fx.ClassroomId, fx.TeacherId);

        // 2 học viên × 1 item required = 2; studentA completed 1 → 0.5.
        stats.CompletionRate.Should().Be(0.5);
    }

    [Fact]
    public async Task Analytics_DoesNotReadCourseOriginalModuleItems()
    {
        var fx = new Fixture("CourseScope");

        // Item Quiz thuộc course GỐC (không nằm trong classroom) — không được xuất hiện.
        var courseModule = new CourseModule(fx.CourseId, "CM", "", 0);
        fx.Db.CourseModules.Add(courseModule);
        var courseQuiz = new Quiz("Course Original Quiz", "d", "t", 1, 10);
        fx.Db.Quizzes.Add(courseQuiz);
        var courseItem = new ModuleItem(courseModule.Id, null, ModuleItemType.Quiz, null, courseQuiz.Id, null, "CourseItem", 0, true);
        fx.Db.ModuleItems.Add(courseItem);
        fx.Db.SaveChanges();

        var stats = await Service(fx.Db).GetClassStatisticsAsync(fx.ClassroomId, fx.TeacherId);

        stats.QuizTitles.Keys.Should().Contain(fx.QuizId);
        stats.QuizTitles.Keys.Should().NotContain(courseQuiz.Id);
        stats.StudentScores.Should().NotBeEmpty();
    }

    [Fact]
    public async Task Analytics_UsesClassroomModuleItems_WhenClassroomHasCourse()
    {
        var fx = new Fixture("ClassroomItems");
        fx.AddQuizAttempt(fx.StudentA, 70, 100);

        var stats = await Service(fx.Db).GetClassStatisticsAsync(fx.ClassroomId, fx.TeacherId);

        stats.TotalStudents.Should().Be(2);
        stats.QuizTitles.Should().ContainKey(fx.QuizId);
        var row = stats.StudentScores.Single(s => s.StudentId == fx.StudentA);
        row.ScoresPerQuiz[fx.QuizId].Should().Be(70);
    }

    // ---------- CR-013/035: IDOR owner + Admin ----------

    [Fact]
    public async Task Analytics_NotOwner_ThrowsUnauthorized()
    {
        var fx = new Fixture("NotOwner");

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => Service(fx.Db).GetClassStatisticsAsync(fx.ClassroomId, Guid.NewGuid()));
    }

    [Fact]
    public async Task Analytics_ClassroomNotFound_ThrowsUnauthorized()
    {
        var fx = new Fixture("NotFound");

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => Service(fx.Db).GetClassStatisticsAsync(Guid.NewGuid(), fx.TeacherId));
    }

    [Fact]
    public async Task Analytics_AdminRoleDb_Allowed()
    {
        var fx = new Fixture("AdminAccess");
        var adminId = Guid.NewGuid();
        var admin = new User("admin@test.com", "admin", "hash");
        Fixture.SetId(admin, adminId);
        admin.SetRole("Admin");
        fx.Db.Users.Add(admin);
        fx.Db.SaveChanges();

        var stats = await Service(fx.Db).GetClassStatisticsAsync(fx.ClassroomId, adminId);

        stats.TotalStudents.Should().Be(2);
    }

    [Fact]
    public async Task Analytics_TeacherNonOwner_StillDenied_WhenNotAdmin()
    {
        var fx = new Fixture("TeacherDenied");
        var otherTeacherId = Guid.NewGuid();
        var otherTeacher = new User("t2@test.com", "t2", "hash");
        Fixture.SetId(otherTeacher, otherTeacherId);
        otherTeacher.SetRole("Teacher");
        fx.Db.Users.Add(otherTeacher);
        fx.Db.SaveChanges();

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => Service(fx.Db).GetClassStatisticsAsync(fx.ClassroomId, otherTeacherId));
    }

    // ---------- PassRate ----------

    [Fact]
    public async Task PassRate_CountsPassedAssignments()
    {
        var fx = new Fixture("PassRate");
        fx.AddQuizAttempt(fx.StudentA, 30, 100);   // fail
        fx.AddQuizAttempt(fx.StudentB, 75, 100);   // pass

        var stats = await Service(fx.Db).GetClassStatisticsAsync(fx.ClassroomId, fx.TeacherId);

        stats.PassRate.Should().Be(50);
        stats.AvgScore.Should().Be(52.5);
    }
}
