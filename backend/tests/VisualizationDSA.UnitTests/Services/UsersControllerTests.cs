using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Interfaces;
using VisualizationDSA.Infrastructure.Repositories;
using VisualizationDSA.Infrastructure.Services;
using VisualizationDSA.UnitTests.Common;
using VisualizationDSA.WebApi.Controllers;
using Xunit;

namespace VisualizationDSA.UnitTests.Services
{
    /// <summary>
    /// AD-012: UsersController.SyncXP — cap amount (≤ 50) + reason chỉ chấp nhận từ danh sách
    /// server (hoặc tiền tố bài học). AD-034: matrix bảo vệ endpoint /users/me/xp.
    /// GM-001: + hạn mức XP/ngày (429) + rate limit "auth". GM-004: XP + badge 1 transaction +
    /// Idempotency-Key replay (double-sync không double-award). GM-036: token hỏng → 401.
    /// </summary>
    [Collection("AdminControllerTests")]
    public class UsersControllerTests
    {
        static UsersControllerTests()
        {
            TestJwtBuilder.EnsureConfigured();
        }

        // SEC-2026-08-14: me/xp chỉ Teacher/Admin — default role test là Teacher
        // (Student bị 403, có test riêng SyncXP_StudentRole_Returns403).
        private static (UsersController Controller, Mock<IUnitOfWork> Uow, Mock<IGamificationService> Gam) Create(string role = "Teacher", Guid? userId = null)
        {
            var uow = new Mock<IUnitOfWork>();
            var gam = new Mock<IGamificationService>();
            gam.Setup(g => g.AwardXpAndCheckBadgesAsync(It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string?>()))
               .ReturnsAsync(new XpAwardResult { TotalXp = 100, CurrentLevel = 2 });
            var controller = new UsersController(uow.Object, gam.Object);
            SetAuthHeader(controller, (userId ?? Guid.NewGuid()).ToString(), role);
            return (controller, uow, gam);
        }

        /// <summary>
        /// SEC-2026-08-14: verify XP cho reason "Hoàn thành Quiz:" cần QuizAttempt của chính user.
        /// </summary>
        private static void SetupQuizEvidence(Mock<IUnitOfWork> uow, Guid userId)
        {
            var attempt = new QuizAttempt(userId, "heap-sort", "Heap Sort", new[] { 0 }, 1, 1);
            uow.Setup(u => u.QuizAttempts.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<QuizAttempt, bool>>>()))
                .ReturnsAsync(new List<QuizAttempt> { attempt });
        }

        private static void SetAuthHeader(UsersController controller, string sub, string role)
        {
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = $"Bearer {TestJwtBuilder.BuildToken(sub, role)}";
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
        }

        private static JsonDocument ParseResult(object? value)
            => JsonDocument.Parse(JsonSerializer.Serialize(value, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));

        [Fact]
        public async Task SyncXP_UnknownReason_Returns400()
        {
            var (controller, _, _) = Create();

            var result = await controller.SyncXP(new XPAwardRequest { Amount = 50, Reason = "tự hack XP" });
            var bad = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            using var doc = ParseResult(bad.Value);
            doc.RootElement.GetProperty("error").GetString().Should().Be("INVALID_REASON");
        }

        [Fact]
        public async Task SyncXP_AmountAboveCap_ClampedTo50()
        {
            var (controller, _, gam) = Create();

            var result = await controller.SyncXP(new XPAwardRequest { Amount = 9999, Reason = "quiz-complete" });
            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            using var doc = ParseResult(ok.Value);
            doc.RootElement.GetProperty("message").GetString().Should().Be("Đã cộng 50 XP.");

            gam.Verify(g => g.AwardXpAndCheckBadgesAsync(It.IsAny<Guid>(), 50, "quiz-complete", null), Times.Once);
        }

        [Fact]
        public async Task SyncXP_ValidServerReason_Returns200()
        {
            var (controller, _, gam) = Create();

            var result = await controller.SyncXP(new XPAwardRequest { Amount = 30, Reason = "offline-lesson" });
            result.Should().BeOfType<OkObjectResult>();
            gam.Verify(g => g.AwardXpAndCheckBadgesAsync(It.IsAny<Guid>(), 30, "offline-lesson", null), Times.Once);
        }

        [Fact]
        public async Task SyncXP_LessonDynamicReasonPrefix_Returns200()
        {
            // Luồng bài học gửi reason động chứa tên bài — tiền tố hợp lệ phải được chấp nhận.
            // SEC-2026-08-14: me/xp khóa với Student — chỉ Teacher/Admin được dùng.
            var userId = Guid.NewGuid();
            var (controller, _, gam) = Create(role: "Teacher", userId: userId);

            var result = await controller.SyncXP(new XPAwardRequest { Amount = 100, Reason = "Hoàn thành Quiz: Heap Sort" });
            result.Should().BeOfType<OkObjectResult>();
            gam.Verify(g => g.AwardXpAndCheckBadgesAsync(It.IsAny<Guid>(), 50, "Hoàn thành Quiz: Heap Sort", null), Times.Once); // cap vẫn áp dụng
        }

        [Fact]
        public async Task SyncXP_CodelabDynamicReasonPrefix_Returns200()
        {
            // SEC-2026-08-14: me/xp khóa với Student — chỉ Teacher/Admin được dùng.
            var userId = Guid.NewGuid();
            var (controller, _, _) = Create(role: "Teacher", userId: userId);

            var result = await controller.SyncXP(new XPAwardRequest { Amount = 20, Reason = "Hoàn thành CodeLab: Merge Sort" });
            result.Should().BeOfType<OkObjectResult>();
        }

        [Fact]
        public async Task SyncXP_StudentRole_Returns403()
        {
            // SEC-2026-08-14: học viên không được tự cộng XP qua me/xp — 403.
            var (controller, _, gam) = Create(role: "Student");

            var result = await controller.SyncXP(new XPAwardRequest { Amount = 20, Reason = "Hoàn thành Quiz: Heap Sort" });
            var forbidden = result.Should().BeOfType<ObjectResult>().Subject;
            forbidden.StatusCode.Should().Be(StatusCodes.Status403Forbidden);
            gam.Verify(g => g.AwardXpAndCheckBadgesAsync(It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string?>()), Times.Never);
        }

        // ── GM-001t: hạn mức XP/ngày + rate limit ─────────────────────────────

        [Fact]
        public async Task SyncXP_DailyCapExceeded_Returns429()
        {
            // GM-001: 500 XP/ngày (50/call) — call thứ 11 phải bị chặn 429.
            var (controller, _, gam) = Create();
            var request = new XPAwardRequest { Amount = 50, Reason = "quiz-complete" };

            for (var i = 0; i < 10; i++)
            {
                var ok = await controller.SyncXP(request);
                ok.Should().BeOfType<OkObjectResult>($"call {i + 1} trong hạn mức phải thành công");
            }

            var blocked = await controller.SyncXP(request);
            var objectResult = blocked.Should().BeOfType<ObjectResult>().Subject;
            objectResult.StatusCode.Should().Be(429);

            // Chỉ 10 lần award được gọi xuống service — call thứ 11 bị chặn trước service.
            gam.Verify(g => g.AwardXpAndCheckBadgesAsync(It.IsAny<Guid>(), 50, "quiz-complete", null), Times.Exactly(10));
        }

        [Fact]
        public async Task SyncXP_DailyCap_IsPerUser()
        {
            // Mỗi user có hạn mức riêng — 2 user khác nhau cùng gọi không bị chặn lẫn nhau.
            var (controllerA, _, _) = Create();
            var request = new XPAwardRequest { Amount = 50, Reason = "quiz-complete" };
            (await controllerA.SyncXP(request)).Should().BeOfType<OkObjectResult>();

            var (controllerB, _, _) = Create();
            (await controllerB.SyncXP(request)).Should().BeOfType<OkObjectResult>();
        }

        // ── GM-036: token thiếu/hỏng → 401 (không 500) ─────────────────────────

        [Fact]
        public async Task SyncXP_InvalidSubClaim_Returns401()
        {
            var (controller, _, gam) = Create();
            // Ghi đè token bằng sub không phải Guid — GetCurrentUserId phải trả 401, không throw.
            SetAuthHeader(controller, "not-a-guid", "Student");

            var result = await controller.SyncXP(new XPAwardRequest { Amount = 10, Reason = "quiz-complete" });

            result.Should().BeOfType<UnauthorizedObjectResult>();
            gam.Verify(g => g.AwardXpAndCheckBadgesAsync(It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string?>()), Times.Never);
        }

        [Fact]
        public async Task GetMyProgress_InvalidToken_Returns401()
        {
            var (controller, _, _) = Create();
            SetAuthHeader(controller, "bad-sub", "Student");

            var result = await controller.GetMyProgress();
            result.Result.Should().BeOfType<UnauthorizedObjectResult>();
        }

        // ── GM-004t: double-sync cùng Idempotency-Key → XP chỉ cộng 1 lần ──────

        private static (UsersController Controller, TestSqliteDbContext Db, UnitOfWork Uow, GamificationService Service) CreateReal()
        {
            var (db, connection) = TestSqliteDbContext.Create();
            var uow = new UnitOfWork(db);
            var service = new GamificationService(uow);
            var controller = new UsersController(uow, service);
            return (controller, db, uow, service);
        }

        [Fact]
        public async Task SyncXP_SameIdempotencyKey_NoDoubleAward()
        {
            var (controller, db, _, _) = CreateReal();

            var user = new User("xp@test.dev", "xptest", "hashed");
            db.Users.Add(user);
            await db.SaveChangesAsync();

            SetAuthHeader(controller, user.Id.ToString(), "Teacher");

            var request = new XPAwardRequest { Amount = 30, Reason = "quiz-complete" };
            controller.Request.Headers["Idempotency-Key"] = "sync-abc-123";

            var first = await controller.SyncXP(request);
            first.Should().BeOfType<OkObjectResult>();

            var second = await controller.SyncXP(request);
            var ok = second.Should().BeOfType<OkObjectResult>().Subject;
            using var doc = ParseResult(ok.Value);
            doc.RootElement.GetProperty("message").GetString().Should().Contain("trùng lặp");

            // XP chỉ cộng 1 lần (30) — không gấp đôi dù gọi 2 lần cùng key.
            db.Users.Find(user.Id)!.TotalXP.Should().Be(30);
            db.Users.Find(user.Id)!.StreakDays.Should().Be(1);
        }

        [Fact]
        public async Task SyncXP_DifferentIdempotencyKeys_EachAwarded()
        {
            var (controller, db, _, _) = CreateReal();

            var user = new User("xp2@test.dev", "xptest2", "hashed");
            db.Users.Add(user);
            await db.SaveChangesAsync();

            SetAuthHeader(controller, user.Id.ToString(), "Teacher");
            var request = new XPAwardRequest { Amount = 20, Reason = "quiz-complete" };

            controller.Request.Headers["Idempotency-Key"] = "key-1";
            (await controller.SyncXP(request)).Should().BeOfType<OkObjectResult>();

            controller.Request.Headers["Idempotency-Key"] = "key-2";
            (await controller.SyncXP(request)).Should().BeOfType<OkObjectResult>();

            db.Users.Find(user.Id)!.TotalXP.Should().Be(40);
        }

        // ── PR-023: admin-only GetUserProgress + badges shape + CompleteModule 204 ──

        [Fact]
        public async Task GetUserProgress_StudentRole_Returns403()
        {
            // PR-023: [RequireJwtRole("Admin")] trên GetUserProgress — token Student (claim + DB)
            // đi qua filter phải bị chặn 403 trước khi chạm action.
            var (_, db, _, _) = CreateReal();
            var student = new User("student403@test.dev", "student403", "hashed");
            db.Users.Add(student);
            await db.SaveChangesAsync();

            var http = new DefaultHttpContext();
            http.Request.Headers["Authorization"] = $"Bearer {TestJwtBuilder.BuildToken(student.Id.ToString(), "Student")}";
            var services = new ServiceCollection();
            services.AddScoped<IUnitOfWork>(_ => new UnitOfWork(db));
            http.RequestServices = services.BuildServiceProvider();
            var actionContext = new ActionContext(http, new RouteData(), new ActionDescriptor());
            var executing = new ActionExecutingContext(actionContext, new List<IFilterMetadata>(), new Dictionary<string, object?>(), new object());

            var filter = new VisualizationDSA.WebApi.Filters.RequireJwtRoleAttribute("Admin");
            await filter.OnActionExecutionAsync(executing, () => Task.FromResult(new ActionExecutedContext(actionContext, new List<IFilterMetadata>(), executing.Controller) { Result = new OkResult() }));

            var forbidden = executing.Result.Should().BeOfType<ObjectResult>().Subject;
            forbidden.StatusCode.Should().Be(403);
            using var doc = ParseResult(forbidden.Value);
            doc.RootElement.GetProperty("error").GetString().Should().Be("FORBIDDEN");
        }

        [Fact]
        public async Task GetMyBadges_ReturnsBadgeShape()
        {
            // PR-023: shape badge {id,name,description,icon,color,earnedAt} camelCase — không lộ
            // trường thừa (criteria).
            var (controller, db, _, _) = CreateReal();
            var user = new User("badges@test.dev", "badgetest", "hashed");
            var badge = new Badge("Bước Đầu Tiên", "Hoàn thành bài học đầu tiên", "🎯", "#10B981", "first-lesson");
            db.Users.Add(user);
            db.Badges.Add(badge);
            db.SaveChanges();
            var userBadge = new UserBadge(user.Id, badge.Id);
            db.UserBadges.Add(userBadge);
            await db.SaveChangesAsync();

            SetAuthHeader(controller, user.Id.ToString(), "Teacher");

            var result = await controller.GetMyBadges();
            var ok = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            using var doc = ParseResult(ok.Value);
            var first = doc.RootElement[0];
            first.GetProperty("id").GetGuid().Should().Be(badge.Id);
            first.GetProperty("name").GetString().Should().Be("Bước Đầu Tiên");
            first.GetProperty("description").GetString().Should().Be("Hoàn thành bài học đầu tiên");
            first.GetProperty("icon").GetString().Should().Be("🎯");
            first.GetProperty("color").GetString().Should().Be("#10B981");
            first.GetProperty("earnedAt").ValueKind.Should().Be(JsonValueKind.String);
        }

        [Fact]
        public async Task CompleteModule_Returns204()
        {
            // PR-023: CompleteModule thành công → NoContent (204), không body.
            var (controller, _, gam) = Create();
            var userId = Guid.NewGuid();
            SetAuthHeader(controller, userId.ToString(), "Student");
            gam.Setup(g => g.CompleteModuleAsync(userId, "mod-1")).Returns(Task.CompletedTask);

            var result = await controller.CompleteModule("mod-1");

            result.Should().BeOfType<NoContentResult>();
            gam.Verify(g => g.CompleteModuleAsync(userId, "mod-1"), Times.Once);
        }

        // ── PR-009t: GetMyProgress positive — lastActiveDate THẬT từ DB ─────────

        [Fact]
        public async Task GetMyProgress_ReturnsRealLastActiveDateFromDb()
        {
            // PR-009t: positive test trên SQLite — gán LastActivityDate cụ thể, assert TỪNG field
            // JSON camelCase (totalXP/currentStreak/lastActiveDate/badges) — trước đây chỉ test 401.
            var (controller, db, _, _) = CreateReal();
            var user = new User("progress@test.dev", "progresstest", "hashed");
            user.AwardXP(150); // level 2 (ngưỡng 100) — assert totalXP/currentLevel
            user.RecordActivity(new DateTime(2026, 8, 5, 9, 30, 0, DateTimeKind.Utc));
            db.Users.Add(user);
            var badge = new Badge("Chiến Binh Streak", "Giữ chuỗi ngày học liên tục", "🔥", "#F59E0B", "streak-3");
            db.Badges.Add(badge);
            db.SaveChanges();
            db.UserBadges.Add(new UserBadge(user.Id, badge.Id));
            await db.SaveChangesAsync();

            SetAuthHeader(controller, user.Id.ToString(), "Teacher");

            var result = await controller.GetMyProgress();
            var ok = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            using var doc = ParseResult(ok.Value);
            doc.RootElement.GetProperty("totalXP").GetInt32().Should().Be(150);
            doc.RootElement.GetProperty("currentLevel").GetInt32().Should().Be(2);
            doc.RootElement.GetProperty("currentStreak").GetInt32().Should().Be(1);
            doc.RootElement.GetProperty("lastActiveDate").GetDateTime().Should().Be(new DateTime(2026, 8, 5, 9, 30, 0, DateTimeKind.Utc));
            var badges = doc.RootElement.GetProperty("badges");
            badges.GetArrayLength().Should().Be(1);
            badges[0].GetProperty("name").GetString().Should().Be("Chiến Binh Streak");
            doc.RootElement.GetProperty("isPremium").GetBoolean().Should().BeFalse();
        }
    }
}
