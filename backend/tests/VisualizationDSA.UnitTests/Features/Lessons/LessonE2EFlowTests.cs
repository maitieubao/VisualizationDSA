using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using VisualizationDSA.Application.Features.Codelabs.Commands;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.Infrastructure.Services;
using VisualizationDSA.WebApi.Controllers;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Lessons
{
    /// <summary>
    /// A3 — Đóng vòng E2E: học viên đi xuyên khóa mẫu trên dữ liệu SEED THẬT.
    /// Mô phỏng đúng luồng sản phẩm: GET bài học (published + codelab payload)
    /// → chạy codelab (judge) → hoàn thành bài (XP + progress).
    /// Dùng DbSeeder thật (40 lesson, 3 course published, 7 codelab mẫu, 5 lesson gắn codelab).
    /// </summary>
    public class LessonE2EFlowTests
    {
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

        private static Guid FixedId(string seed)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(seed));
            var guid = new byte[16];
            Array.Copy(bytes, guid, 16);
            return new Guid(guid);
        }

        private static void SetUserProperty(object entity, string property, Guid value)
        {
            entity.GetType().GetProperty(property)!.SetValue(entity, value);
        }

        private static ApplicationDbContext CreateContext() =>
            new(new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase($"e2e-{Guid.NewGuid():N}")
                .Options);

        private static async Task<(ApplicationDbContext Ctx, Guid StudentId, Lesson Lesson, Codelab Codelab)> SeedCourseAndStudentAsync()
        {
            var ctx = CreateContext();
            await new DbSeeder(ctx).SeedAsync();

            // Student: gắn Id cố định để ký JWT.
            var studentId = FixedId("e2e-student");
            var student = new User("e2e@test.com", "Học viên E2E", "hash");
            SetUserProperty(student, "Id", studentId);
            ctx.Users.Add(student);
            await ctx.SaveChangesAsync();

            // Lesson "Sắp xếp cơ bản" — A2 seed đã gắn codelab Bubble Sort + Published.
            var lesson = await ctx.Lessons.FirstAsync(l => l.Title.Contains("Sắp xếp cơ bản"));
            var codelab = await ctx.Codelabs
                .Include(c => c.TestCases)
                .FirstAsync(c => c.Id == lesson.CodelabId);

            return (ctx, studentId, lesson, codelab);
        }

        private static LessonController CreateController(ApplicationDbContext ctx, string userId, string role)
        {
            var controller = new LessonController(ctx, Mock.Of<IProgressRuleEngine>());
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = $"Bearer {CreateToken(userId, role)}";
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
            return controller;
        }

        [Fact]
        public async Task E2E_Student_LoadsSeededLesson_WithFullCodelabPayload()
        {
            var (ctx, studentId, lesson, _) = await SeedCourseAndStudentAsync();

            var controller = CreateController(ctx, studentId.ToString(), role: "Student");
            var result = await controller.GetLessonById(lesson.Id);

            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            // API thật serialize theo camelCase (MVC options) — test mô phỏng đúng shape FE nhận.
            var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            using var doc = JsonDocument.Parse(JsonSerializer.Serialize(ok.Value, jsonOptions));
            var root = doc.RootElement;

            root.GetProperty("id").GetGuid().Should().Be(lesson.Id);
            root.GetProperty("publishStatus").GetString().Should().Be("Published");
            root.GetProperty("codelabId").GetGuid().Should().Be(lesson.CodelabId!.Value);
            root.GetProperty("contentMd").GetString()!.Length.Should().BeGreaterThan(800);
            // Quiz liên kết phải có (seed: quiz ngay sau lesson).
            root.GetProperty("quizId").ValueKind.Should().Be(JsonValueKind.String);

            var codelab = root.GetProperty("codelab");
            codelab.GetProperty("title").GetString().Should().Be("Bubble Sort");
            codelab.GetProperty("initialCode").GetString()!.Should().Contain("function solution");
            codelab.GetProperty("timeLimitMs").GetInt32().Should().BeGreaterThan(0);
            // Testcases: 5 (1 ẩn) — test ẩn không lộ ExpectedOutput.
            var testCases = codelab.GetProperty("testCases").EnumerateArray().ToList();
            testCases.Count.Should().BeGreaterThanOrEqualTo(4);
            testCases.Any(tc => tc.GetProperty("isHidden").GetBoolean()).Should().BeTrue();
            testCases
                .First(tc => tc.GetProperty("isHidden").GetBoolean())
                .GetProperty("expectedOutput").GetString().Should().BeEmpty();
            // Hints miễn phí (XpCost=0) phải lộ content cho bước 4.
            codelab.GetProperty("hints").EnumerateArray().Any(h => h.GetProperty("content").GetString()!.Length > 0).Should().BeTrue();
            // Template javascript có starterCode.
            codelab.GetProperty("templates").EnumerateArray()
                .Any(t => t.GetProperty("language").GetString() == "javascript").Should().BeTrue();
        }

        [Fact]
        public async Task E2E_RunCodelab_WithSeedSolution_Passes()
        {
            var (ctx, studentId, _, codelab) = await SeedCourseAndStudentAsync();

            var handler = new RunCodelabCommandHandler(ctx, new MockCodeJudgeService());
            var result = await handler.Handle(new RunCodelabCommand
            {
                UserId = studentId,
                CodelabId = codelab.Id,
                Code = "function solution(arr) { return arr.sort((a, b) => a - b); }",
                Language = "javascript"
            }, default);

            result.Passed.Should().BeTrue("solution đúng phải pass toàn bộ testcase public");
            result.TestCaseResultsJson.Should().NotBeNullOrEmpty();
            // Submission được lưu (judge có ghi nhận).
            (await ctx.CodelabSubmissions.CountAsync(s => s.CodelabId == codelab.Id)).Should().Be(1);
        }

        [Fact]
        public async Task E2E_RunCodelab_BuggyCode_FailsWithWrongAnswer()
        {
            var (ctx, studentId, _, codelab) = await SeedCourseAndStudentAsync();

            var handler = new RunCodelabCommandHandler(ctx, new MockCodeJudgeService());
            var result = await handler.Handle(new RunCodelabCommand
            {
                UserId = studentId,
                CodelabId = codelab.Id,
                Code = "function solution(arr) { return arr; } // bug",
                Language = "javascript"
            }, default);

            result.Passed.Should().BeFalse();
            result.Status.Should().Be(VisualizationDSA.Domain.Enums.SubmissionStatus.WrongAnswer);
        }

        [Fact]
        public async Task E2E_CompleteSeededLesson_AwardsXpAndProgress()
        {
            var (ctx, studentId, lesson, _) = await SeedCourseAndStudentAsync();

            var xpBefore = (await ctx.Users.FindAsync(studentId))!.TotalXP;
            var controller = CreateController(ctx, studentId.ToString(), role: "Student");
            var result = await controller.CompleteLesson(lesson.Id);

            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            using var doc = JsonDocument.Parse(JsonSerializer.Serialize(ok.Value));
            doc.RootElement.GetProperty("xpAwarded").GetInt32().Should().Be(lesson.XPReward);

            var xpAfter = (await ctx.Users.FindAsync(studentId))!.TotalXP;
            xpAfter.Should().Be(xpBefore + lesson.XPReward);

            var progress = await ctx.UserLessonProgresses.FirstAsync(p => p.UserId == studentId && p.LessonId == lesson.Id);
            progress.Status.Should().Be("Completed");
            // ModuleItem progress cũng được đánh dấu hoàn thành (sidebar lớp cập nhật ngay).
            (await ctx.UserModuleItemProgresses.CountAsync(p => p.UserId == studentId && p.Status == "Completed")).Should().BeGreaterThan(0);
        }

        [Fact]
        public async Task E2E_CompleteLesson_Twice_DoesNotDoubleXp()
        {
            var (ctx, studentId, lesson, _) = await SeedCourseAndStudentAsync();
            var controller = CreateController(ctx, studentId.ToString(), role: "Student");

            var first = await controller.CompleteLesson(lesson.Id);
            var second = await controller.CompleteLesson(lesson.Id);

            using var firstDoc = JsonDocument.Parse(JsonSerializer.Serialize(((OkObjectResult)first).Value));
            using var secondDoc = JsonDocument.Parse(JsonSerializer.Serialize(((OkObjectResult)second).Value));
            firstDoc.RootElement.GetProperty("xpAwarded").GetInt32().Should().Be(lesson.XPReward);
            secondDoc.RootElement.GetProperty("xpAwarded").GetInt32().Should().Be(0, "complete lần 2 không cộng XP nữa");
        }
    }
}
