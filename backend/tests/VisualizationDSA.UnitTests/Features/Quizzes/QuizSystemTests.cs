using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Domain;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Engine;
using VisualizationDSA.Domain.Strategies;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.UnitTests.Common;
using VisualizationDSA.WebApi.Controllers;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Quizzes
{
    /// <summary>
    /// QZ-016: Bộ test cho StatelessQuizController (/concepts/quiz/*):
    /// chấm điểm + threshold 70%, XP first-pass, race double-submit, bank path, ẩn đáp án GET.
    /// </summary>
    public class QuizSystemTests
    {
        private const int BankReward = 50;

        // ── Helpers ──────────────────────────────────────────────────────────

        private static string CreateToken(string userId, string role = "Student")
        {
            var header = JwtSigningConfig.Base64UrlEncode(Encoding.UTF8.GetBytes("{\"alg\":\"HS256\",\"typ\":\"JWT\"}"));
            // iss/aud theo JwtSigningConfig (fail-closed của JwtHelper.RequireToken khi đã cấu hình)
            // — giữ token test luôn hợp lệ bất kể global config (giống GenerateMockJwt của strategy).
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

        private static StatelessQuizController CreateController(ApplicationDbContext ctx, string userId)
        {
            var controller = new StatelessQuizController(new QuizBankStrategy(), ctx);
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = $"Bearer {CreateToken(userId)}";
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
            return controller;
        }

        private static User CreateUser(ApplicationDbContext ctx, string email = "student@test.dev")
        {
            var user = new User(email, "student", "hash");
            ctx.Users.Add(user);
            ctx.SaveChanges();
            return user;
        }

        /// <summary>Tạo quiz DB có questionCount câu (2 lựa chọn, đáp án luôn index 0).</summary>
        private static Quiz CreateDbQuiz(ApplicationDbContext ctx, string title, int questionCount, int xpReward = 100)
        {
            var quiz = new Quiz(title, title, "test-topic", 3, xpReward);
            for (var i = 0; i < questionCount; i++)
            {
                quiz.AddQuestion($"Câu hỏi {i + 1}", new[] { "Đáp án đúng", "Sai" }, 0, "Giải thích");
            }
            ctx.Quizzes.Add(quiz);
            ctx.SaveChanges();
            return quiz;
        }

        private static StatelessQuizAttemptResult ReadSubmitResult(IActionResult actionResult)
        {
            var ok = actionResult.Should().BeOfType<OkObjectResult>().Subject;
            return ok.Value.Should().BeOfType<StatelessQuizAttemptResult>().Subject;
        }

        private static StatelessQuizPublicDto ReadPublicQuiz(IActionResult actionResult)
        {
            var ok = actionResult.Should().BeOfType<OkObjectResult>().Subject;
            return ok.Value.Should().BeOfType<StatelessQuizPublicDto>().Subject;
        }

        /// <summary>DbContext in-memory SQLite + connection — giải phóng connection là mất toàn bộ DB.</summary>
        /// <remarks>
        /// KHÔNG dùng Database.Migrate(): các Designer migration cũ (sinh thời Npgsql/EF 8-9) gọi
        /// UseIdentityByDefaultColumns → MissingMethodException với EF Core 10 (lỗi pre-existing).
        /// EnsureCreated() dựng schema từ model hiện tại — bao gồm unique index QuizXpGrant (QZ-001).
        /// </remarks>
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

        // ── Chấm điểm & threshold 70% ────────────────────────────────────────

        [Fact]
        public async Task Submit_AllCorrectAnswers_ScoresFullAndPasses()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            var user = CreateUser(ctx);
            var quiz = CreateDbQuiz(ctx, "Quiz đầy đủ", questionCount: 10, xpReward: 100);
            var controller = CreateController(ctx, user.Id.ToString());

            var result = ReadSubmitResult(await controller.SubmitAttempt(
                new StatelessQuizAttemptRequest { QuizId = quiz.Id.ToString(), Answers = Enumerable.Repeat(0, 10).ToList() }));

            result.Score.Should().Be(10);
            result.MaxScore.Should().Be(10);
            result.Passed.Should().BeTrue();
            result.XpAwarded.Should().Be(100);
            result.QuestionResults.Should().HaveCount(10);
            result.QuestionResults.Should().OnlyContain(q => q.IsCorrect);

            ctx.Entry(user).Reload();
            user.TotalXP.Should().Be(100);
        }

        [Fact]
        public async Task Submit_SevenOfTen_PassesThreshold()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            var user = CreateUser(ctx);
            var quiz = CreateDbQuiz(ctx, "Quiz 7/10", questionCount: 10, xpReward: 80);
            var controller = CreateController(ctx, user.Id.ToString());

            var answers = Enumerable.Repeat(0, 7).Concat(Enumerable.Repeat(1, 3)).ToList();
            var result = ReadSubmitResult(await controller.SubmitAttempt(
                new StatelessQuizAttemptRequest { QuizId = quiz.Id.ToString(), Answers = answers }));

            result.Score.Should().Be(7);
            result.Passed.Should().BeTrue();
            result.XpAwarded.Should().Be(80);
        }

        [Fact]
        public async Task Submit_SixOfTen_BelowThreshold_Fails()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            var user = CreateUser(ctx);
            var quiz = CreateDbQuiz(ctx, "Quiz 6/10", questionCount: 10, xpReward: 80);
            var controller = CreateController(ctx, user.Id.ToString());

            var answers = Enumerable.Repeat(0, 6).Concat(Enumerable.Repeat(1, 4)).ToList();
            var result = ReadSubmitResult(await controller.SubmitAttempt(
                new StatelessQuizAttemptRequest { QuizId = quiz.Id.ToString(), Answers = answers }));

            result.Score.Should().Be(6);
            result.Passed.Should().BeFalse();
            result.XpAwarded.Should().Be(0);
            ctx.Entry(user).Reload();
            user.TotalXP.Should().Be(0);
        }

        // ── XP chỉ cấp lần đầu ───────────────────────────────────────────────

        [Fact]
        public async Task Submit_SecondPassSameQuiz_XpAwardedZero()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            var user = CreateUser(ctx);
            var quiz = CreateDbQuiz(ctx, "Quiz một lần", questionCount: 5, xpReward: 60);
            var controller = CreateController(ctx, user.Id.ToString());
            var request = new StatelessQuizAttemptRequest { QuizId = quiz.Id.ToString(), Answers = Enumerable.Repeat(0, 5).ToList() };

            var first = ReadSubmitResult(await controller.SubmitAttempt(request));
            first.XpAwarded.Should().Be(60);

            var second = ReadSubmitResult(await controller.SubmitAttempt(request));
            second.Passed.Should().BeTrue();
            second.XpAwarded.Should().Be(0);

            ctx.Entry(user).Reload();
            user.TotalXP.Should().Be(60);
            ctx.QuizXpGrants.Count(g => g.UserId == user.Id && g.QuizKey == quiz.Id.ToString()).Should().Be(1);
        }

        // ── Guard body null / quiz not found ─────────────────────────────────

        [Fact]
        public async Task Submit_NullBody_ReturnsBadRequest()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            var user = CreateUser(ctx);
            var controller = CreateController(ctx, user.Id.ToString());

            var result = await controller.SubmitAttempt(null!);

            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.Should().NotBeNull();
        }

        [Fact]
        public async Task Submit_UnknownQuizId_ReturnsNotFound()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            var user = CreateUser(ctx);
            var controller = CreateController(ctx, user.Id.ToString());

            var byGuid = await controller.SubmitAttempt(new StatelessQuizAttemptRequest
            {
                QuizId = Guid.NewGuid().ToString(),
                Answers = new List<int> { 0 }
            });
            byGuid.Should().BeOfType<NotFoundObjectResult>();

            var byBankName = await controller.SubmitAttempt(new StatelessQuizAttemptRequest
            {
                QuizId = "không-tồn-tại",
                Answers = new List<int> { 0 }
            });
            byBankName.Should().BeOfType<NotFoundObjectResult>();
        }

        [Fact]
        public async Task GetById_UnknownQuizId_ReturnsNotFound()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            var user = CreateUser(ctx);
            var controller = CreateController(ctx, user.Id.ToString());

            var result = await controller.GetById(Guid.NewGuid().ToString());

            result.Should().BeOfType<NotFoundObjectResult>();
        }

        // ── QZ-047: trùng Title → 409 thay vì bất định ───────────────────────

        [Fact]
        public async Task GetById_AmbiguousTitle_ReturnsConflict()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            var user = CreateUser(ctx);
            CreateDbQuiz(ctx, "Trùng tiêu đề", questionCount: 2);
            CreateDbQuiz(ctx, "Trùng tiêu đề", questionCount: 3);
            var controller = CreateController(ctx, user.Id.ToString());

            var result = await controller.GetById("Trùng tiêu đề");

            var conflict = result.Should().BeOfType<ConflictObjectResult>().Subject;
            conflict.Value.Should().NotBeNull();
        }

        [Fact]
        public async Task Submit_AmbiguousTitle_ReturnsConflict()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            var user = CreateUser(ctx);
            CreateDbQuiz(ctx, "Trùng tiêu đề", questionCount: 2);
            CreateDbQuiz(ctx, "Trùng tiêu đề", questionCount: 3);
            var controller = CreateController(ctx, user.Id.ToString());

            var result = await controller.SubmitAttempt(new StatelessQuizAttemptRequest
            {
                QuizId = "Trùng tiêu đề",
                Answers = new List<int> { 0, 0 }
            });

            result.Should().BeOfType<ConflictObjectResult>();
        }

        // ── QZ-003: GET ẩn đáp án mặc định, withAnswers=true mới trả ──────────

        [Fact]
        public async Task GetById_Default_HidesCorrectIndexAndExplanation()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            var user = CreateUser(ctx);
            var quiz = CreateDbQuiz(ctx, "Quiz bí mật", questionCount: 3);
            var controller = CreateController(ctx, user.Id.ToString());

            var dto = ReadPublicQuiz(await controller.GetById(quiz.Id.ToString()));

            dto.Questions.Should().HaveCount(3);
            dto.Questions.Should().OnlyContain(q => q.CorrectIndex == null);
            dto.Questions.Should().OnlyContain(q => q.Explanation == null);
        }

        [Fact]
        public async Task GetById_WithAnswers_ReturnsCorrectIndexAndExplanation()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            var user = CreateUser(ctx);
            var quiz = CreateDbQuiz(ctx, "Quiz lesson", questionCount: 3);
            var controller = CreateController(ctx, user.Id.ToString());

            // SEC-2026-08-14: hoc vien chi nhan dap an khi DA NOP BAI (co QuizAttempt).
            ctx.QuizAttempts.Add(new QuizAttempt(user.Id, quiz.Id, new[] { 0, 0, 0 }, 3, 3));
            await ctx.SaveChangesAsync();

            var dto = ReadPublicQuiz(await controller.GetById(quiz.Id.ToString(), withAnswers: true));

            dto.Questions.Should().OnlyContain(q => q.CorrectIndex == 0);
            dto.Questions.Should().OnlyContain(q => q.Explanation == "Giải thích");
        }

        // ── Bank path ────────────────────────────────────────────────────────

        [Fact]
        public async Task Submit_BankQuiz_WritesQuizAttempt_WithKeyAndTitleReference()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            var user = CreateUser(ctx);
            var controller = CreateController(ctx, user.Id.ToString());

            // sorting-fundamentals: 5 câu, đáp án đúng lần lượt [2, 2, 1, 0, 2].
            var result = ReadSubmitResult(await controller.SubmitAttempt(
                new StatelessQuizAttemptRequest { QuizId = "sorting-fundamentals", Answers = new List<int> { 2, 2, 1, 0, 2 } }));

            result.Passed.Should().BeTrue();
            result.XpAwarded.Should().Be(BankReward);
            result.MaxScore.Should().Be(5);

            ctx.Entry(user).Reload();
            user.TotalXP.Should().Be(BankReward);

            // PR-002: attempt bank quiz PHẢI được ghi — QuizId null + QuizKey/QuizTitle làm reference
            // (trước đây không ghi được vì QuizId là Guid FK bắt buộc → history gần như rỗng).
            var attempt = ctx.QuizAttempts.Single(a => a.UserId == user.Id);
            attempt.QuizId.Should().BeNull();
            attempt.QuizKey.Should().Be("sorting-fundamentals");
            attempt.QuizTitle.Should().Be("Cơ bản về Sắp xếp");
            attempt.Score.Should().Be(5);
            attempt.MaxScore.Should().Be(5);
            attempt.Passed.Should().BeTrue();
            ctx.QuizXpGrants.Count(g => g.UserId == user.Id && g.QuizKey == "sorting-fundamentals").Should().Be(1);
        }

        [Fact]
        public async Task Submit_BankQuiz_HistoryShowsAttempt_WithTitleFallback()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            var user = CreateUser(ctx);
            var controller = CreateController(ctx, user.Id.ToString());

            await controller.SubmitAttempt(
                new StatelessQuizAttemptRequest { QuizId = "sorting-fundamentals", Answers = new List<int> { 2, 2, 1, 0, 2 } });

            var history = await controller.GetHistory(null);
            var ok = history.Should().BeOfType<OkObjectResult>().Subject;
            using var doc = JsonDocument.Parse(JsonSerializer.Serialize(ok.Value, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
            doc.RootElement.GetArrayLength().Should().Be(1);
            var first = doc.RootElement[0];
            first.GetProperty("quizId").ValueKind.Should().Be(JsonValueKind.Null);
            first.GetProperty("quizTitle").GetString().Should().Be("Cơ bản về Sắp xếp");
            first.GetProperty("quizTopic").GetString().Should().Be("sorting-fundamentals");
            first.GetProperty("score").GetInt32().Should().Be(5);
            first.GetProperty("passed").GetBoolean().Should().BeTrue();
            // PR-024: không lộ đáp án thô trong lịch sử.
            first.TryGetProperty("answers", out _).Should().BeFalse();
        }

        [Fact]
        public async Task Submit_BankQuiz_SecondTime_XpAwardedZero()
        {
            using var setup = new DbSetup();
            var ctx = setup.Context;
            var user = CreateUser(ctx);
            var controller = CreateController(ctx, user.Id.ToString());
            var request = new StatelessQuizAttemptRequest { QuizId = "sorting-fundamentals", Answers = new List<int> { 2, 2, 1, 0, 2 } };

            var first = ReadSubmitResult(await controller.SubmitAttempt(request));
            first.XpAwarded.Should().Be(BankReward);

            var second = ReadSubmitResult(await controller.SubmitAttempt(request));
            second.Passed.Should().BeTrue();
            second.XpAwarded.Should().Be(0);

            ctx.Entry(user).Reload();
            user.TotalXP.Should().Be(BankReward);
            ctx.QuizXpGrants.Count().Should().Be(1);
        }

        // ── Race: 2 submit đồng thời cùng quiz → XP chỉ 1 lần ────────────────

        [Fact]
        public async Task Race_SequentialFreshContext_SecondSubmitGetsNoXp()
        {
            // Mô phỏng 2 request tuần tự trên 2 DbContext độc lập (cùng 1 DB):
            // request 2 đọc previousAttempts SAU khi request 1 commit → thấy pass → 0 XP.
            using var setup = new DbSetup();
            var ctxA = setup.Context;
            var connection = setup.Connection;

            var user = CreateUser(ctxA);
            var quiz = CreateDbQuiz(ctxA, "Quiz race", questionCount: 5, xpReward: 70);

            var ctxB = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlite(connection).Options);

            var controllerA = CreateController(ctxA, user.Id.ToString());
            var controllerB = CreateController(ctxB, user.Id.ToString());
            var request = new StatelessQuizAttemptRequest { QuizId = quiz.Id.ToString(), Answers = Enumerable.Repeat(0, 5).ToList() };

            var first = ReadSubmitResult(await controllerA.SubmitAttempt(request));
            first.XpAwarded.Should().Be(70);

            var second = ReadSubmitResult(await controllerB.SubmitAttempt(request));
            second.Passed.Should().BeTrue();
            second.XpAwarded.Should().Be(0);

            ctxA.Users.Single(u => u.Id == user.Id).TotalXP.Should().Be(70);
            ctxA.QuizAttempts.Count(a => a.UserId == user.Id && a.QuizId == quiz.Id).Should().Be(2);
            ctxA.QuizXpGrants.Count(g => g.UserId == user.Id && g.QuizKey == quiz.Id.ToString()).Should().Be(1);
        }

        [Fact]
        public async Task Race_Parallel_TwoConnections_DbQuiz_XpGrantedOnce()
        {
            var dbName = $"race-{Guid.NewGuid():N}";
            var connectionString = $"Data Source={dbName};Mode=Memory;Cache=Shared";
            using var connA = new SqliteConnection(connectionString);
            using var connB = new SqliteConnection(connectionString);
            connA.Open();
            connB.Open();
            ExecPragma(connA);
            ExecPragma(connB);

            var ctxA = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseSqlite(connA).Options);
            ctxA.Database.EnsureCreated();

            var user = CreateUser(ctxA);
            var quiz = CreateDbQuiz(ctxA, "Quiz race song song", questionCount: 5, xpReward: 70);

            var ctxB = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseSqlite(connB).Options);
            var controllerA = CreateController(ctxA, user.Id.ToString());
            var controllerB = CreateController(ctxB, user.Id.ToString());
            var request = new StatelessQuizAttemptRequest { QuizId = quiz.Id.ToString(), Answers = Enumerable.Repeat(0, 5).ToList() };

            var responses = await Task.WhenAll(
                controllerA.SubmitAttempt(request),
                controllerB.SubmitAttempt(request));

            var xpTotal = responses.Sum(r => ((StatelessQuizAttemptResult)((OkObjectResult)r).Value!).XpAwarded);
            xpTotal.Should().Be(70, "2 submit song song chỉ được cấp XP 1 lần");

            ctxA.Users.Single(u => u.Id == user.Id).TotalXP.Should().Be(70);
            ctxA.QuizAttempts.Count(a => a.UserId == user.Id && a.QuizId == quiz.Id).Should().Be(2);
            ctxA.QuizXpGrants.Count(g => g.UserId == user.Id && g.QuizKey == quiz.Id.ToString()).Should().Be(1);
        }

        [Fact]
        public async Task Race_Parallel_TwoConnections_BankQuiz_XpGrantedOnce()
        {
            var dbName = $"race-bank-{Guid.NewGuid():N}";
            var connectionString = $"Data Source={dbName};Mode=Memory;Cache=Shared";
            using var connA = new SqliteConnection(connectionString);
            using var connB = new SqliteConnection(connectionString);
            connA.Open();
            connB.Open();
            ExecPragma(connA);
            ExecPragma(connB);

            var ctxA = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseSqlite(connA).Options);
            ctxA.Database.EnsureCreated();

            var user = CreateUser(ctxA);

            var ctxB = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseSqlite(connB).Options);
            var controllerA = CreateController(ctxA, user.Id.ToString());
            var controllerB = CreateController(ctxB, user.Id.ToString());
            var request = new StatelessQuizAttemptRequest { QuizId = "sorting-fundamentals", Answers = new List<int> { 2, 2, 1, 0, 2 } };

            var responses = await Task.WhenAll(
                controllerA.SubmitAttempt(request),
                controllerB.SubmitAttempt(request));

            // Cả 2 request đều thành công (không 500) — kẻ thua bị unique (UserId, QuizKey) chặn.
            responses.Should().OnlyContain(r => r is OkObjectResult);
            var xpTotal = responses.Sum(r => ((StatelessQuizAttemptResult)((OkObjectResult)r).Value!).XpAwarded);
            xpTotal.Should().Be(BankReward, "2 submit song song cùng bank quiz chỉ được cấp XP 1 lần");

            ctxA.Users.Single(u => u.Id == user.Id).TotalXP.Should().Be(BankReward);
            ctxA.QuizXpGrants.Count(g => g.UserId == user.Id && g.QuizKey == "sorting-fundamentals").Should().Be(1);
        }

        private static void ExecPragma(SqliteConnection connection)
        {
            using var cmd = connection.CreateCommand();
            cmd.CommandText = "PRAGMA busy_timeout = 30000;";
            cmd.ExecuteNonQuery();
        }
    }
}
