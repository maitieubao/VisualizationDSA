using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Features.Analytics.Queries.GetQuizAnalytics;
using VisualizationDSA.Domain;
using VisualizationDSA.Domain.Engine;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Strategies;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.WebApi.Controllers;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Quizzes
{
    /// <summary>
    /// TC-001/TC-012/TC-021/TC-022/TC-042: bộ test cho Teacher Panel backend —
    /// /concepts/quiz/manage CRUD (quiz + câu hỏi), ownership gate, xóa mềm giữ attempt,
    /// chặn title trùng + xpReward ngoài khung, analytics đếm đúng nghĩa, GetHistory role từ DB.
    /// </summary>
    public class TeacherQuizManageTests
    {
        private const string TeacherA = "aaaaaaaa-0000-0000-0000-000000000001";
        private const string TeacherB = "bbbbbbbb-0000-0000-0000-000000000002";
        private const string StudentId = "cccccccc-0000-0000-0000-000000000003";

        private static string CreateToken(string userId, string role = "Student")
        {
            var header = JwtSigningConfig.Base64UrlEncode(Encoding.UTF8.GetBytes("{\"alg\":\"HS256\",\"typ\":\"JWT\"}"));
            var payloadJson = JsonSerializer.Serialize(new
            {
                sub = userId,
                role,
                iss = JwtSigningConfig.Issuer ?? "VisualizationDSA",
                aud = JwtSigningConfig.Audience ?? "VisualizationDSA-Client",
                exp = DateTimeOffset.UtcNow.AddMinutes(15).ToUnixTimeSeconds()
            });
            var payload = JwtSigningConfig.Base64UrlEncode(Encoding.UTF8.GetBytes(payloadJson));
            var signature = JwtSigningConfig.Base64UrlEncode(
                HMACSHA256.HashData(JwtSigningConfig.Key, Encoding.UTF8.GetBytes($"{header}.{payload}"))
            );
            return $"{header}.{payload}.{signature}";
        }

        private static StatelessQuizController CreateController(ApplicationDbContext ctx, string userId, string role = "Teacher")
        {
            var controller = new StatelessQuizController(new QuizBankStrategy(), ctx);
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = $"Bearer {CreateToken(userId, role)}";
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
            return controller;
        }

        private static User CreateUser(ApplicationDbContext ctx, string id, string email, string role)
        {
            var user = new User(email, email.Split('@')[0], "hash");
            user.SetRole(role);
            // User.Id setter private — gán qua reflection để khớp sub trong token test.
            typeof(User).GetProperty("Id")!.SetValue(user, Guid.Parse(id));
            ctx.Users.Add(user);
            ctx.SaveChanges();
            return user;
        }

        private static StatelessQuizDto BuildQuizPayload(string title = "Quiz của thầy A", int xpReward = 50)
        {
            return new StatelessQuizDto
            {
                Title = title,
                Topic = "sorting",
                Difficulty = "easy",
                XpReward = xpReward,
                Questions = new List<StatelessQuestionDto>
                {
                    new() { Text = "Câu hỏi 1", Options = new List<string> { "Đúng", "Sai" }, CorrectIndex = 0, Explanation = "Giải thích" }
                }
            };
        }

        private static Quiz CreateOwnedQuiz(ApplicationDbContext ctx, string title, string ownerId)
        {
            var quiz = new Quiz(title, title, "sorting", 3, 50, Guid.Parse(ownerId));
            quiz.AddQuestion("Q?", new[] { "A", "B" }, 0, "E");
            ctx.Quizzes.Add(quiz);
            ctx.SaveChanges();
            return quiz;
        }

        private static Quiz CreateSeedQuiz(ApplicationDbContext ctx, string title)
        {
            var quiz = new Quiz(title, title, "sorting", 3, 50);
            quiz.AddQuestion("Q?", new[] { "A", "B" }, 0, "E");
            ctx.Quizzes.Add(quiz);
            ctx.SaveChanges();
            return quiz;
        }

        private sealed class DbSetup : IDisposable
        {
            public ApplicationDbContext Context { get; }
            public SqliteConnection Connection { get; }

            public DbSetup()
            {
                Connection = new SqliteConnection("DataSource=:memory:");
                Connection.Open();
                Context = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>()
                    .UseSqlite(Connection)
                    .Options);
                Context.Database.EnsureCreated();
            }

            public void Dispose()
            {
                Context.Dispose();
                Connection.Dispose();
            }
        }

        // ---------- TC-021: ownership + validate ----------

        [Fact]
        public async Task Manage_CreateQuiz_TeacherA_OwnsQuiz()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            var teacher = CreateUser(ctx, TeacherA, "ta@test.com", "Teacher");
            var controller = CreateController(ctx, TeacherA);

            var result = await controller.ManageQuiz(BuildQuizPayload());

            result.Should().BeOfType<OkObjectResult>();
            ctx.Quizzes.Single().CreatedByTeacherId.Should().Be(Guid.Parse(TeacherA), "owner phải là sub trong token");
        }

        [Fact]
        public async Task Manage_UpdateQuiz_OwnerTeacher_Ok()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            var quiz = CreateOwnedQuiz(ctx, "Quiz riêng của A", TeacherA);
            var controller = CreateController(ctx, TeacherA);

            var payload = BuildQuizPayload("Quiz riêng của A (sửa)");
            var result = await controller.UpdateQuiz(quiz.Id.ToString(), payload);

            result.Should().BeOfType<OkObjectResult>();
            ctx.Entry(quiz).Reload();
            quiz.Title.Should().Be("Quiz riêng của A (sửa)");
        }

        [Fact]
        public async Task Manage_UpdateQuiz_OtherTeacher_Forbidden()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            CreateUser(ctx, TeacherA, "ta@test.com", "Teacher");
            CreateUser(ctx, TeacherB, "tb@test.com", "Teacher");
            var quiz = CreateOwnedQuiz(ctx, "Quiz của A", TeacherA);
            var controller = CreateController(ctx, TeacherB);

            var result = await controller.UpdateQuiz(quiz.Id.ToString(), BuildQuizPayload());

            var forbidden = result.Should().BeOfType<ObjectResult>().Subject;
            forbidden.StatusCode.Should().Be(403);
            ctx.Entry(quiz).Reload();
            quiz.Title.Should().Be("Quiz của A"); // không bị sửa
        }

        [Fact]
        public async Task Manage_DeleteQuiz_OtherTeacher_Forbidden()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            CreateUser(ctx, TeacherA, "ta@test.com", "Teacher");
            var quiz = CreateOwnedQuiz(ctx, "Quiz của A", TeacherA);
            var controller = CreateController(ctx, TeacherB);

            var result = await controller.DeleteQuiz(quiz.Id.ToString());

            var forbidden = result.Should().BeOfType<ObjectResult>().Subject;
            forbidden.StatusCode.Should().Be(403);
            ctx.Quizzes.Count().Should().Be(1); // chưa bị xóa
        }

        [Fact]
        public async Task Manage_DeleteQuiz_Admin_Ok()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            var quiz = CreateOwnedQuiz(ctx, "Quiz của A", TeacherA);
            var controller = CreateController(ctx, "ffffffff-0000-0000-0000-000000000009", "Admin");

            var result = await controller.DeleteQuiz(quiz.Id.ToString());

            result.Should().BeOfType<OkObjectResult>();
            ctx.Quizzes.Count().Should().Be(0); // filter toàn cục ẩn quiz đã soft-delete
        }

        [Fact]
        public async Task Manage_CreateQuiz_DuplicateTitle_Conflict()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            var controller = CreateController(ctx, TeacherA);
            CreateOwnedQuiz(ctx, "Trùng tiêu đề", TeacherA);

            var result = await controller.ManageQuiz(BuildQuizPayload("Trùng tiêu đề"));

            result.Should().BeOfType<ConflictObjectResult>();
        }

        [Fact]
        public async Task Manage_UpdateQuiz_DuplicateTitle_Conflict()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            var controller = CreateController(ctx, TeacherA);
            CreateOwnedQuiz(ctx, "Tiêu đề A", TeacherA);
            CreateOwnedQuiz(ctx, "Tiêu đề B", TeacherA);

            var result = await controller.UpdateQuiz("Tiêu đề A", BuildQuizPayload("Tiêu đề B"));

            result.Should().BeOfType<ConflictObjectResult>();
        }

        [Theory]
        [InlineData(-1)]
        [InlineData(1001)]
        public async Task Manage_CreateQuiz_XpRewardOutOfRange_BadRequest(int xpReward)
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            var controller = CreateController(ctx, TeacherA);

            var result = await controller.ManageQuiz(BuildQuizPayload(xpReward: xpReward));

            result.Should().BeOfType<BadRequestObjectResult>();
            ctx.Quizzes.Count().Should().Be(0);
        }

        // ---------- TC-022: xóa mềm giữ attempt history + XP ----------

        [Fact]
        public async Task Manage_DeleteQuiz_SoftDelete_KeepsAttempts()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            var quiz = CreateOwnedQuiz(ctx, "Quiz bị xóa", TeacherA);
            var student = CreateUser(ctx, StudentId, "stu@test.com", "Student");
            ctx.QuizAttempts.Add(new QuizAttempt(student.Id, quiz.Id, new[] { 0 }, 1, 1));
            ctx.QuizXpGrants.Add(new QuizXpGrant(student.Id, quiz.Id.ToString()));
            ctx.SaveChanges();

            var controller = CreateController(ctx, TeacherA);
            var result = await controller.DeleteQuiz(quiz.Id.ToString());

            result.Should().BeOfType<OkObjectResult>();
            ctx.QuizAttempts.Count().Should().Be(1, "attempt history phải được giữ lại sau soft-delete");
            ctx.QuizXpGrants.Count().Should().Be(1, "ledger XP phải được giữ lại");
            ctx.Quizzes.Count().Should().Be(0, "quiz soft-deleted bị filter khỏi mọi truy vấn");
        }

        // ---------- TC-001: manage list/detail + questions CRUD ----------

        [Fact]
        public async Task GetManageQuizzes_Teacher_SeesOwnAndSeed_NotOtherTeacher()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            CreateOwnedQuiz(ctx, "Của A", TeacherA);
            CreateOwnedQuiz(ctx, "Của B", TeacherB);
            CreateSeedQuiz(ctx, "Seed chung");
            var controller = CreateController(ctx, TeacherA);

            var result = await controller.GetManageQuizzes();

            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            using var doc = JsonDocument.Parse(JsonSerializer.Serialize(ok.Value, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
            var titles = doc.RootElement.GetProperty("quizzes").EnumerateArray()
                .Select(q => q.GetProperty("title").GetString()).ToList();
            titles.Should().Contain("Của A");
            titles.Should().Contain("Seed chung");
            titles.Should().NotContain("Của B");
        }

        [Fact]
        public async Task GetManageQuizzes_Admin_SeesAll()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            CreateOwnedQuiz(ctx, "Của A", TeacherA);
            CreateOwnedQuiz(ctx, "Của B", TeacherB);
            var controller = CreateController(ctx, "ffffffff-0000-0000-0000-000000000009", "Admin");

            var result = await controller.GetManageQuizzes();

            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            using var doc = JsonDocument.Parse(JsonSerializer.Serialize(ok.Value));
            doc.RootElement.GetProperty("quizzes").GetArrayLength().Should().Be(2);
        }

        [Fact]
        public async Task GetManageQuizById_OtherTeacher_Forbidden()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            var quiz = CreateOwnedQuiz(ctx, "Của A", TeacherA);
            var controller = CreateController(ctx, TeacherB);

            var result = await controller.GetManageQuizById(quiz.Id.ToString());

            var forbidden = result.Should().BeOfType<ObjectResult>().Subject;
            forbidden.StatusCode.Should().Be(403);
        }

        [Fact]
        public async Task GetManageQuizById_Owner_ReturnsQuizWithAnswers()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            var quiz = CreateOwnedQuiz(ctx, "Của A", TeacherA);
            var controller = CreateController(ctx, TeacherA);

            var result = await controller.GetManageQuizById(quiz.Id.ToString());

            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            var dto = ok.Value.Should().BeOfType<StatelessQuizPublicDto>().Subject;
            dto.Id.Should().Be(quiz.Id.ToString());
            dto.Questions.Should().ContainSingle(q => q.CorrectIndex == 0);
        }

        [Fact]
        public async Task QuestionCrud_Owner_AddUpdateDelete_Ok()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            var quiz = CreateOwnedQuiz(ctx, "Của A", TeacherA);
            var controller = CreateController(ctx, TeacherA);

            // Thêm
            var addResult = await controller.AddManageQuizQuestion(quiz.Id.ToString(),
                new StatelessQuestionDto { Text = "Câu mới", Options = new List<string> { "1", "2", "3" }, CorrectIndex = 2, Explanation = "E" });
            addResult.Should().BeOfType<OkObjectResult>();
            ctx.Entry(quiz).Reload();
            var newQuestion = quiz.Questions.Single(q => q.Question == "Câu mới");

            // Sửa
            var updateResult = await controller.UpdateManageQuizQuestion(quiz.Id.ToString(), newQuestion.Id.ToString(),
                new StatelessQuestionDto { Text = "Câu sửa", Options = new List<string> { "X", "Y" }, CorrectIndex = 1, Explanation = "E2" });
            updateResult.Should().BeOfType<OkObjectResult>();
            ctx.Entry(quiz).Reload();
            var updated = quiz.Questions.Single(q => q.Id == newQuestion.Id);
            updated.Question.Should().Be("Câu sửa");
            updated.CorrectIndex.Should().Be(1);

            // Xóa
            var deleteResult = await controller.DeleteManageQuizQuestion(quiz.Id.ToString(), newQuestion.Id.ToString());
            deleteResult.Should().BeOfType<OkObjectResult>();
            ctx.Entry(quiz).Reload();
            quiz.Questions.Should().ContainSingle(); // chỉ còn câu gốc
        }

        [Fact]
        public async Task QuestionCrud_OtherTeacher_Forbidden()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            var quiz = CreateOwnedQuiz(ctx, "Của A", TeacherA);
            var controller = CreateController(ctx, TeacherB);

            var result = await controller.AddManageQuizQuestion(quiz.Id.ToString(),
                new StatelessQuestionDto { Text = "Xâm nhập", Options = new List<string> { "1", "2" }, CorrectIndex = 0, Explanation = "" });

            var forbidden = result.Should().BeOfType<ObjectResult>().Subject;
            forbidden.StatusCode.Should().Be(403);
        }

        // ---------- TC-012: analytics đếm đúng nghĩa ----------

        [Fact]
        public async Task GetQuizAnalytics_CountsQuizzesQuestionsUsers_NotAttempts()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            var handler = new GetQuizAnalyticsQueryHandler(ctx);

            // 2 quiz (mỗi quiz 1 câu), 3 user (1 premium), 4 attempts — totalQuizzes PHẢI là 2.
            var quiz1 = CreateOwnedQuiz(ctx, "Quiz 1", TeacherA);
            var quiz2 = CreateOwnedQuiz(ctx, "Quiz 2", TeacherA);
            var student = CreateUser(ctx, StudentId, "stu@test.com", "Student");
            student.SetPremiumStatus(true);
            var student2 = CreateUser(ctx, "dddddddd-0000-0000-0000-000000000004", "stu2@test.com", "Student");
            var student3 = CreateUser(ctx, "eeeeeeee-0000-0000-0000-000000000005", "stu3@test.com", "Student");
            ctx.SaveChanges();
            ctx.QuizAttempts.Add(new QuizAttempt(student.Id, quiz1.Id, new[] { 0 }, 1, 1));
            ctx.QuizAttempts.Add(new QuizAttempt(student2.Id, quiz1.Id, new[] { 0 }, 1, 1));
            ctx.QuizAttempts.Add(new QuizAttempt(student3.Id, quiz1.Id, new[] { 0 }, 1, 1));
            ctx.QuizAttempts.Add(new QuizAttempt(student.Id, quiz2.Id, new[] { 0 }, 0, 1));
            ctx.SaveChanges();

            var result = await handler.Handle(new GetQuizAnalyticsQuery(), CancellationToken.None);

            result.TotalQuizzes.Should().Be(2, "đếm số QUIZ, không phải số attempt");
            result.TotalQuestionsInBank.Should().Be(2);
            result.TotalUsers.Should().Be(3);
            result.PremiumUsers.Should().Be(1);
            result.AverageScore.Should().Be(75.0);
        }

        [Fact]
        public async Task GetQuizAnalytics_EmptyDatabase_ReturnsZeroes()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            var handler = new GetQuizAnalyticsQueryHandler(ctx);

            var result = await handler.Handle(new GetQuizAnalyticsQuery(), CancellationToken.None);

            result.TotalQuizzes.Should().Be(0);
            result.TotalQuestionsInBank.Should().Be(0);
            result.TotalUsers.Should().Be(0);
            result.PremiumUsers.Should().Be(0);
            result.AverageScore.Should().Be(0);
        }

        // ---------- TC-042: GetHistory đối chiếu role từ DB ----------

        [Fact]
        public async Task GetHistory_Student_OwnHistory_Ok()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            var student = CreateUser(ctx, StudentId, "stu@test.com", "Student");
            var controller = CreateController(ctx, StudentId, "Student");

            var result = await controller.GetHistory(null);

            result.Should().BeOfType<OkObjectResult>();
        }

        [Fact]
        public async Task GetHistory_Student_OtherUser_Forbidden()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            CreateUser(ctx, StudentId, "stu@test.com", "Student");
            var controller = CreateController(ctx, StudentId, "Student");

            var result = await controller.GetHistory("99999999-0000-0000-0000-000000000099");

            var forbidden = result.Should().BeOfType<ObjectResult>().Subject;
            forbidden.StatusCode.Should().Be(403);
        }

        [Fact]
        public async Task GetHistory_ClaimTeacher_ButDbStudent_Forbidden()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            CreateUser(ctx, StudentId, "stu@test.com", "Student"); // DB role = Student
            var controller = CreateController(ctx, StudentId, "Teacher"); // token claim = Teacher

            var result = await controller.GetHistory("99999999-0000-0000-0000-000000000099");

            // TC-042 (AD-003): role phải đối chiếu DB — teacher bị demote mất quyền NGAY.
            var forbidden = result.Should().BeOfType<ObjectResult>().Subject;
            forbidden.StatusCode.Should().Be(403);
        }

        [Fact]
        public async Task GetHistory_DbTeacher_Ok()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            CreateUser(ctx, TeacherA, "ta@test.com", "Teacher");
            var controller = CreateController(ctx, TeacherA, "Teacher");

            var result = await controller.GetHistory(StudentId);

            result.Should().BeOfType<OkObjectResult>();
        }

        [Fact]
        public async Task GetHistory_DbAdmin_Ok()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            CreateUser(ctx, "ffffffff-0000-0000-0000-000000000009", "admin@test.com", "Admin");
            var controller = CreateController(ctx, "ffffffff-0000-0000-0000-000000000009", "Admin");

            var result = await controller.GetHistory(StudentId);

            result.Should().BeOfType<OkObjectResult>();
        }
    }
}
