using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using VisualizationDSA.Domain.Engine;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Domain.Interfaces;
using VisualizationDSA.Domain.Strategies;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.Infrastructure.Repositories;
using VisualizationDSA.UnitTests.Common;
using VisualizationDSA.WebApi.Controllers;
using VisualizationDSA.WebApi.Filters;
using Xunit;

namespace VisualizationDSA.UnitTests.Services
{
    /// <summary>
    /// AD-034: matrix phân quyền + an toàn AdminController (Phase 1.3 — Admin Panel).
    /// Phủ: impersonate round-trip 200 (AD-001), target Admin/Teacher 409 (AD-002),
    /// role DB (AD-003), ban/unban audit (AD-004), DeleteUser FK + last-admin (AD-005/AD-023),
    /// dashboard fallback (AD-006), rate limit impersonate 429 (AD-031), TogglePremium order
    /// Pending 409 (AD-032), CreateUser 201 + role validate (AD-033), shape currentLevel (AD-013).
    /// </summary>
    [Collection("AdminControllerTests")]
    public class AdminControllerTests
    {
        static AdminControllerTests()
        {
            TestJwtBuilder.EnsureConfigured();
        }

        private static (AdminController Controller, ApplicationDbContext Db, StatelessAuthStrategy Strategy) Create()
        {
            var (ctx, _) = CreateSqlite(); // Sqlite in-memory (hỗ trợ ExecuteDeleteAsync) — EnsureCreated thay Migrate
            var strategy = new StatelessAuthStrategy();
            var controller = new AdminController(ctx, strategy, new QuizBankStrategy());
            return (controller, ctx, strategy);
        }

        /// <summary>
        /// Sqlite in-memory + EnsureCreated qua TestSqliteDbContext (Guid lưu TEXT "D" — khớp
        /// format lookup `u.Id.ToString() == id` của controller). Không dùng Migrate vì migration
        /// cũ tham chiếu Npgsql 9 — MissingMethodException với EF Core 10 (pre-existing).
        /// </summary>
        private static (ApplicationDbContext Db, Microsoft.Data.Sqlite.SqliteConnection Connection) CreateSqlite()
        {
            return TestSqliteDbContext.Create();
        }

        private static void SetAuthHeader(AdminController controller, string accessToken)
        {
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = $"Bearer {accessToken}";
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
        }

        private static User AddUser(ApplicationDbContext db, string role, string email, bool isActive = true)
        {
            var user = new User(email, email.Split('@')[0], "hash");
            user.SetRole(role);
            if (!isActive) user.SetActiveStatus(false);
            db.Users.Add(user);
            db.SaveChanges();
            return user;
        }

        private static JsonDocument ParseResult(object? value)
            => JsonDocument.Parse(JsonSerializer.Serialize(value, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));

        // ---------- AD-001: round-trip impersonate → accessToken dùng được ----------

        [Fact]
        public async Task Impersonate_RoundTrip_AccessTokenAccepted_ApiReturns200()
        {
            var (adminCtl, db, strategy) = Create();
            var admin = AddUser(db, "Admin", "roundtrip-admin@test.com");
            var student = AddUser(db, "Student", "roundtrip-student@test.com");
            SetAuthHeader(adminCtl, TestJwtBuilder.BuildToken(admin.Id.ToString(), "Admin"));

            var impersonate = await adminCtl.ImpersonateUser(student.Id.ToString());
            var ok = impersonate.Should().BeOfType<OkObjectResult>().Subject;
            using var doc = ParseResult(ok.Value);
            var accessToken = doc.RootElement.GetProperty("accessToken").GetString()!;
            var refreshToken = doc.RootElement.GetProperty("refreshToken").GetString()!;
            accessToken.Should().NotBeNullOrEmpty();
            refreshToken.Should().NotBeNullOrEmpty();

            // Bước 2: token impersonate vượt qua JwtHelper.RequireToken (fail-closed iss/aud).
            var http = new DefaultHttpContext();
            http.Request.Headers["Authorization"] = $"Bearer {accessToken}";
            JwtHelper.RequireToken(http.Request).Should().BeNull();

            // Bước 3: gọi API thật qua pipeline RequireJwtRole (không role) → action chạy → 200.
            var env = new Mock<IWebHostEnvironment>();
            env.Setup(e => e.EnvironmentName).Returns("Development");
            var userCtl = new StatelessAuthController(strategy, db, env.Object);
            userCtl.ControllerContext = new ControllerContext { HttpContext = http };
            var services = new ServiceCollection();
            services.AddScoped<IUnitOfWork>(_ => new UnitOfWork(db));
            http.RequestServices = services.BuildServiceProvider();
            var actionContext = new ActionContext(http, new RouteData(), new ActionDescriptor());
            var executing = new ActionExecutingContext(actionContext, new List<IFilterMetadata>(), new Dictionary<string, object?>(), userCtl);
            IActionResult? executed = null;
            var filter = new RequireJwtRoleAttribute();
            await filter.OnActionExecutionAsync(executing, async () =>
            {
                var actionResult = await userCtl.GetMe();
                executed = actionResult.Result;
                return new ActionExecutedContext(actionContext, new List<IFilterMetadata>(), userCtl) { Result = executed! };
            });
            executing.Result.Should().BeNull(); // filter không chặn → token hợp lệ
            executed.Should().BeOfType<OkObjectResult>();
        }

        // ---------- AD-013: shape response impersonate ----------

        [Fact]
        public async Task Impersonate_ResponseShape_HasCurrentLevelTotalXpStreakBadges()
        {
            var (adminCtl, db, _) = Create();
            var admin = AddUser(db, "Admin", "shape-admin@test.com");
            var student = AddUser(db, "Student", "shape-student@test.com");
            SetAuthHeader(adminCtl, TestJwtBuilder.BuildToken(admin.Id.ToString(), "Admin"));

            var impersonate = await adminCtl.ImpersonateUser(student.Id.ToString());
            var ok = impersonate.Should().BeOfType<OkObjectResult>().Subject;
            using var doc = ParseResult(ok.Value);
            var user = doc.RootElement.GetProperty("user");
            user.GetProperty("currentLevel").ValueKind.Should().Be(JsonValueKind.Number);
            user.GetProperty("totalXP").ValueKind.Should().Be(JsonValueKind.Number);
            user.GetProperty("streakDays").ValueKind.Should().Be(JsonValueKind.Number);
            user.GetProperty("createdAt").ValueKind.Should().Be(JsonValueKind.String);
            user.GetProperty("badges").ValueKind.Should().Be(JsonValueKind.Array);
            user.GetProperty("role").GetString().Should().Be("Student");
        }

        // ---------- AD-002: chỉ impersonate Student ----------

        [Theory]
        [InlineData("Admin")]
        [InlineData("Teacher")]
        public async Task Impersonate_TargetAdminOrTeacher_Returns409(string targetRole)
        {
            var (adminCtl, db, _) = Create();
            var admin = AddUser(db, "Admin", "guard-admin@test.com");
            var target = AddUser(db, targetRole, $"guard-{targetRole.ToLower()}-target@test.com");
            SetAuthHeader(adminCtl, TestJwtBuilder.BuildToken(admin.Id.ToString(), "Admin"));

            var impersonate = await adminCtl.ImpersonateUser(target.Id.ToString());
            var conflict = impersonate.Should().BeOfType<ConflictObjectResult>().Subject;
            using var doc = ParseResult(conflict.Value);
            doc.RootElement.GetProperty("error").GetString().Should().Be("IMPERSONATE_TARGET_NOT_STUDENT");
        }

        // ---------- AD-031: rate limit impersonate 429 ----------

        [Fact]
        public async Task Impersonate_OverRateLimit_Returns429()
        {
            var (adminCtl, db, _) = Create();
            // Admin id DUY NHẤT cho test này — rate limiter là static, không để lọt qua test khác.
            var adminId = Guid.NewGuid().ToString();
            var student = AddUser(db, "Student", "ratelimit-student@test.com");
            SetAuthHeader(adminCtl, TestJwtBuilder.BuildToken(adminId, "Admin"));

            for (var i = 0; i < IMPERSONATION_RATE_LIMIT; i++)
            {
                var result = await adminCtl.ImpersonateUser(student.Id.ToString());
                result.Should().BeOfType<OkObjectResult>();
            }

            var blocked = await adminCtl.ImpersonateUser(student.Id.ToString());
            var tooMany = blocked.Should().BeOfType<ObjectResult>().Subject;
            tooMany.StatusCode.Should().Be(429);
            using var doc = ParseResult(tooMany.Value);
            doc.RootElement.GetProperty("error").GetString().Should().Be("RATE_LIMITED");
        }

        private const int IMPERSONATION_RATE_LIMIT = 5;

        // ---------- AD-003: role đối chiếu DB + self role change ----------

        [Fact]
        public async Task RequireJwtRole_AdminClaimButDbRoleDemoted_Returns403()
        {
            var (_, db, _) = Create();
            var demoted = AddUser(db, "Student", "demoted@test.com"); // DB đã demote, claim vẫn Admin.
            var token = TestJwtBuilder.BuildToken(demoted.Id.ToString(), "Admin");

            var http = new DefaultHttpContext();
            http.Request.Headers["Authorization"] = $"Bearer {token}";
            var services = new ServiceCollection();
            services.AddScoped<IUnitOfWork>(_ => new UnitOfWork(db));
            http.RequestServices = services.BuildServiceProvider();
            var actionContext = new ActionContext(http, new RouteData(), new ActionDescriptor());
            var executing = new ActionExecutingContext(actionContext, new List<IFilterMetadata>(), new Dictionary<string, object?>(), new object());

            var filter = new RequireJwtRoleAttribute("Admin");
            await filter.OnActionExecutionAsync(executing, () => Task.FromResult(new ActionExecutedContext(actionContext, new List<IFilterMetadata>(), executing.Controller) { Result = new OkResult() }));

            var forbidden = executing.Result.Should().BeOfType<ObjectResult>().Subject;
            forbidden.StatusCode.Should().Be(403);
            using var doc = ParseResult(forbidden.Value);
            doc.RootElement.GetProperty("error").GetString().Should().Be("FORBIDDEN");
        }

        [Fact]
        public async Task RequireJwtRole_AdminClaimAndDbRoleAdmin_Passes()
        {
            var (_, db, _) = Create();
            var admin = AddUser(db, "Admin", "pass-admin@test.com");
            var token = TestJwtBuilder.BuildToken(admin.Id.ToString(), "Admin");

            var http = new DefaultHttpContext();
            http.Request.Headers["Authorization"] = $"Bearer {token}";
            var services = new ServiceCollection();
            services.AddScoped<IUnitOfWork>(_ => new UnitOfWork(db));
            http.RequestServices = services.BuildServiceProvider();
            var actionContext = new ActionContext(http, new RouteData(), new ActionDescriptor());
            var executing = new ActionExecutingContext(actionContext, new List<IFilterMetadata>(), new Dictionary<string, object?>(), new object());

            var filter = new RequireJwtRoleAttribute("Admin");
            await filter.OnActionExecutionAsync(executing, () => Task.FromResult(new ActionExecutedContext(actionContext, new List<IFilterMetadata>(), executing.Controller) { Result = new OkResult() }));

            executing.Result.Should().BeNull(); // không bị chặn
        }

        [Fact]
        public async Task UpdateRole_SelfRoleChange_Returns400()
        {
            var (adminCtl, db, _) = Create();
            var admin = AddUser(db, "Admin", "self-admin@test.com");
            SetAuthHeader(adminCtl, TestJwtBuilder.BuildToken(admin.Id.ToString(), "Admin"));

            var result = await adminCtl.UpdateUserRole(admin.Id.ToString(), new UpdateRoleRequest("Student"));
            var bad = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            using var doc = ParseResult(bad.Value);
            doc.RootElement.GetProperty("error").GetString().Should().Be("SELF_ROLE_CHANGE_FORBIDDEN");
        }

        // ---------- AD-034: LAST_ADMIN_PROTECTED (demote/ban/delete admin cuối → 409) ----------

        [Fact]
        public async Task UpdateRole_DemoteLastAdmin_Returns409()
        {
            var (adminCtl, db, _) = Create();
            // Actor KHÔNG tồn tại trong DB (claim-only) — target là admin duy nhất trong DB.
            var actorId = Guid.NewGuid().ToString();
            var lastAdmin = AddUser(db, "Admin", "last-admin@test.com");
            SetAuthHeader(adminCtl, TestJwtBuilder.BuildToken(actorId, "Admin"));

            var result = await adminCtl.UpdateUserRole(lastAdmin.Id.ToString(), new UpdateRoleRequest("Teacher"));
            var conflict = result.Should().BeOfType<ConflictObjectResult>().Subject;
            using var doc = ParseResult(conflict.Value);
            doc.RootElement.GetProperty("error").GetString().Should().Be("LAST_ADMIN_PROTECTED");
        }

        [Fact]
        public async Task BanUser_BanLastAdmin_Returns409()
        {
            var (adminCtl, db, _) = Create();
            var actorId = Guid.NewGuid().ToString();
            var lastAdmin = AddUser(db, "Admin", "last-admin-ban@test.com");
            SetAuthHeader(adminCtl, TestJwtBuilder.BuildToken(actorId, "Admin"));

            var result = await adminCtl.BanUser(lastAdmin.Id.ToString(), new BanUserRequest(false));
            var conflict = result.Should().BeOfType<ConflictObjectResult>().Subject;
            using var doc = ParseResult(conflict.Value);
            doc.RootElement.GetProperty("error").GetString().Should().Be("LAST_ADMIN_PROTECTED");
        }

        [Fact]
        public async Task DeleteUser_DeleteLastAdmin_Returns409()
        {
            var (adminCtl, db, _) = Create();
            var actorId = Guid.NewGuid().ToString();
            var lastAdmin = AddUser(db, "Admin", "last-admin-delete@test.com");
            SetAuthHeader(adminCtl, TestJwtBuilder.BuildToken(actorId, "Admin"));

            var result = await adminCtl.DeleteUser(lastAdmin.Id.ToString());
            var conflict = result.Should().BeOfType<ConflictObjectResult>().Subject;
            using var doc = ParseResult(conflict.Value);
            doc.RootElement.GetProperty("error").GetString().Should().Be("LAST_ADMIN_PROTECTED");
        }

        // ---------- AD-004: ban/unban ghi audit ----------

        [Fact]
        public async Task BanUser_WritesAuditLog()
        {
            var (adminCtl, db, _) = Create();
            var admin = AddUser(db, "Admin", "audit-admin@test.com");
            var student = AddUser(db, "Student", "audit-student@test.com");
            SetAuthHeader(adminCtl, TestJwtBuilder.BuildToken(admin.Id.ToString(), "Admin"));

            await adminCtl.BanUser(student.Id.ToString(), new BanUserRequest(false));

            var log = db.AuditLogs.Single(l => l.Action == "BanUser");
            log.ActorId.Should().Be(admin.Id);
            log.TargetId.Should().Be(student.Id);

            await adminCtl.BanUser(student.Id.ToString(), new BanUserRequest(true));
            db.AuditLogs.Should().Contain(l => l.Action == "UnbanUser");
        }

        [Fact]
        public async Task BanUser_LoginAndRefreshBlocked_Unban_LoginAllowed()
        {
            var (adminCtl, db, strategy) = Create();
            var admin = AddUser(db, "Admin", "banflow-admin@test.com");
            var password = "Password123";
            var student = new User("banflow-student@test.com", "banflow-student", BCrypt.Net.BCrypt.HashPassword(password));
            db.Users.Add(student);
            db.SaveChanges();
            strategy.EnsureUserInMemory(student.Id.ToString(), student.Email, student.Username, student.PasswordHash, false, "Student", 0, 1, 0);
            SetAuthHeader(adminCtl, TestJwtBuilder.BuildToken(admin.Id.ToString(), "Admin"));

            var env = new Mock<IWebHostEnvironment>();
            env.Setup(e => e.EnvironmentName).Returns("Development");
            var authCtl = new StatelessAuthController(strategy, db, env.Object);

            var loginBefore = await authCtl.Login(new StatelessLoginRequest { Email = student.Email, Password = password });
            var before = loginBefore.Result.Should().BeOfType<OkObjectResult>().Subject;
            using var beforeDoc = ParseResult(before.Value);
            var refreshToken = beforeDoc.RootElement.GetProperty("refreshToken").GetString()!;

            // Ban → login 401 + refresh 401 + audit ghi BanUser.
            await adminCtl.BanUser(student.Id.ToString(), new BanUserRequest(false));
            db.AuditLogs.Should().Contain(l => l.Action == "BanUser");

            var loginBanned = await authCtl.Login(new StatelessLoginRequest { Email = student.Email, Password = password });
            loginBanned.Result.Should().BeOfType<UnauthorizedObjectResult>();

            var refreshBanned = await authCtl.Refresh(new StatelessRefreshRequest { RefreshToken = refreshToken });
            refreshBanned.Result.Should().BeOfType<UnauthorizedObjectResult>();

            // Unban → login 200.
            await adminCtl.BanUser(student.Id.ToString(), new BanUserRequest(true));
            var loginAfter = await authCtl.Login(new StatelessLoginRequest { Email = student.Email, Password = password });
            loginAfter.Result.Should().BeOfType<OkObjectResult>();
        }

        // ---------- AD-005: DeleteUser FK Conflict + xóa sạch ----------

        [Fact]
        public async Task DeleteUser_UserOwnsTheoryArticle_Returns409()
        {
            var (adminCtl, db, _) = Create();
            var admin = AddUser(db, "Admin", "fk-admin@test.com");
            var student = AddUser(db, "Student", "fk-student@test.com");
            db.TheoryArticles.Add(new TheoryArticle(student.Id, "Bài viết", "bai-viet", "# md", "DSA", "Beginner", "tag", 5));
            db.SaveChanges();
            SetAuthHeader(adminCtl, TestJwtBuilder.BuildToken(admin.Id.ToString(), "Admin"));

            var result = await adminCtl.DeleteUser(student.Id.ToString());
            var conflict = result.Should().BeOfType<ConflictObjectResult>().Subject;
            using var doc = ParseResult(conflict.Value);
            doc.RootElement.GetProperty("error").GetString().Should().Be("USER_HAS_CONTENT");
        }

        [Fact]
        public async Task DeleteUser_CleanStudent_ReturnsOkAndRemovesUser()
        {
            var (adminCtl, db, strategy) = Create();
            var admin = AddUser(db, "Admin", "clean-admin@test.com");
            var student = AddUser(db, "Student", "clean-student@test.com");
            strategy.EnsureUserInMemory(student.Id.ToString(), student.Email, student.Username, "hash", false, "Student", 0, 1, 0);
            SetAuthHeader(adminCtl, TestJwtBuilder.BuildToken(admin.Id.ToString(), "Admin"));

            var result = await adminCtl.DeleteUser(student.Id.ToString());
            result.Should().BeOfType<OkObjectResult>();

            db.Users.Any(u => u.Id == student.Id).Should().BeFalse();
            db.AuditLogs.Should().Contain(l => l.Action == "DeleteUser");
        }

        // ---------- IDOR: user không tồn tại → 404 ----------

        [Theory]
        [InlineData("ban")]
        [InlineData("premium")]
        [InlineData("impersonate")]
        [InlineData("role")]
        [InlineData("delete")]
        public async Task Operations_UnknownUser_Returns404(string operation)
        {
            var (adminCtl, db, _) = Create();
            var admin = AddUser(db, "Admin", "idor-admin@test.com");
            SetAuthHeader(adminCtl, TestJwtBuilder.BuildToken(admin.Id.ToString(), "Admin"));
            var missing = Guid.NewGuid().ToString();

            IActionResult? result = operation switch
            {
                "ban" => await adminCtl.BanUser(missing, new BanUserRequest(false)),
                "premium" => await adminCtl.TogglePremium(missing, new TogglePremiumRequest(true)),
                "impersonate" => await adminCtl.ImpersonateUser(missing),
                "role" => await adminCtl.UpdateUserRole(missing, new UpdateRoleRequest("Teacher")),
                "delete" => await adminCtl.DeleteUser(missing),
                _ => null
            };

            result.Should().BeOfType<NotFoundObjectResult>();
        }

        // ---------- AD-032: TogglePremium chặn thu hồi khi còn order Pending ----------

        [Fact]
        public async Task TogglePremium_RevokeWithPendingOrder_Returns409()
        {
            var (adminCtl, db, _) = Create();
            var admin = AddUser(db, "Admin", "order-admin@test.com");
            var student = AddUser(db, "Student", "order-student@test.com");
            student.SetPremiumStatus(true);
            db.SaveChanges();
            db.Orders.Add(new Order(student.Id, "PAYCODE-1", 199000));
            db.SaveChanges();
            SetAuthHeader(adminCtl, TestJwtBuilder.BuildToken(admin.Id.ToString(), "Admin"));

            var result = await adminCtl.TogglePremium(student.Id.ToString(), new TogglePremiumRequest(false));
            var conflict = result.Should().BeOfType<ConflictObjectResult>().Subject;
            using var doc = ParseResult(conflict.Value);
            doc.RootElement.GetProperty("error").GetString().Should().Be("PENDING_ORDER_EXISTS");

            db.Users.Single(u => u.Id == student.Id).IsPremium.Should().BeTrue(); // không bị thu hồi
        }

        [Fact]
        public async Task TogglePremium_NoPendingOrder_Succeeds()
        {
            var (adminCtl, db, _) = Create();
            var admin = AddUser(db, "Admin", "premium-admin@test.com");
            var student = AddUser(db, "Student", "premium-student@test.com");
            SetAuthHeader(adminCtl, TestJwtBuilder.BuildToken(admin.Id.ToString(), "Admin"));

            var result = await adminCtl.TogglePremium(student.Id.ToString(), new TogglePremiumRequest(false));
            result.Should().BeOfType<OkObjectResult>();
        }

        // ---------- AD-033: CreateUser validate role + 201 ----------

        [Fact]
        public async Task CreateUser_InvalidRole_Returns400()
        {
            var (adminCtl, db, _) = Create();
            var admin = AddUser(db, "Admin", "create-admin@test.com");
            SetAuthHeader(adminCtl, TestJwtBuilder.BuildToken(admin.Id.ToString(), "Admin"));

            var result = await adminCtl.CreateUser(new CreateUserRequest("new@test.com", "newuser", "Password123", "SuperAdmin", false));
            var bad = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            using var doc = ParseResult(bad.Value);
            doc.RootElement.GetProperty("error").GetString().Should().Be("INVALID_ROLE");
        }

        [Fact]
        public async Task CreateUser_ValidRequest_Returns201()
        {
            var (adminCtl, db, _) = Create();
            var admin = AddUser(db, "Admin", "create-admin-ok@test.com");
            SetAuthHeader(adminCtl, TestJwtBuilder.BuildToken(admin.Id.ToString(), "Admin"));

            var result = await adminCtl.CreateUser(new CreateUserRequest("new-ok@test.com", "newuserok", "Password123", "Teacher", false));
            var created = result.Should().BeOfType<ObjectResult>().Subject;
            created.StatusCode.Should().Be(201);
            db.Users.Should().Contain(u => u.Email == "new-ok@test.com" && u.Role == "Teacher");
        }

        // ---------- AD-043: refresh token đóng vai giữ marker isImpersonated ----------

        [Fact]
        public async Task Impersonate_RefreshRotation_KeepsImpersonatedMarker()
        {
            var (adminCtl, db, strategy) = Create();
            var admin = AddUser(db, "Admin", "marker-admin@test.com");
            var student = AddUser(db, "Student", "marker-student@test.com");
            SetAuthHeader(adminCtl, TestJwtBuilder.BuildToken(admin.Id.ToString(), "Admin"));

            var impersonate = await adminCtl.ImpersonateUser(student.Id.ToString());
            var ok = impersonate.Should().BeOfType<OkObjectResult>().Subject;
            using var doc = ParseResult(ok.Value);
            var refreshToken = doc.RootElement.GetProperty("refreshToken").GetString()!;

            var rotated = strategy.RefreshToken(refreshToken); // xoay vòng → access token mới
            rotated.AccessToken.Should().NotBeNullOrEmpty();

            var parts = rotated.AccessToken.Split('.');
            parts.Length.Should().Be(3);
            var payloadJson = System.Text.Encoding.UTF8.GetString(
                VisualizationDSA.Domain.JwtSigningConfig.DecodeBase64Url(parts[1]));
            using var payload = JsonDocument.Parse(payloadJson);
            payload.RootElement.GetProperty("isImpersonated").GetBoolean().Should().BeTrue();
            payload.RootElement.GetProperty("originalAdminId").GetString().Should().Be(admin.Id.ToString());
            payload.RootElement.GetProperty("sub").GetString().Should().Be(student.Id.ToString());
        }

        // ---------- AD-006: dashboard thật + fallback xác nhận DB down ----------

        [Fact]
        public async Task GetDashboard_DbUp_ReturnsRealDataWithIsFallbackFalse()
        {
            var (adminCtl, db, _) = Create();
            AddUser(db, "Admin", "dash-admin@test.com");
            AddUser(db, "Student", "dash-student@test.com");
            AddUser(db, "Teacher", "dash-teacher@test.com");
            SetAuthHeader(adminCtl, TestJwtBuilder.BuildToken(Guid.NewGuid().ToString(), "Admin"));

            var result = await adminCtl.GetDashboard();
            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            using var doc = ParseResult(ok.Value);
            doc.RootElement.GetProperty("isFallback").GetBoolean().Should().BeFalse();
            doc.RootElement.GetProperty("users").GetProperty("total").GetInt32().Should().Be(3);
        }

        [Fact]
        public async Task GetDashboard_DbDown_ReturnsDeterministicFallbackWithIsFallbackTrue()
        {
            var (ctx, conn) = CreateSqlite();
            var strategy = new StatelessAuthStrategy();
            var controller = new AdminController(ctx, strategy, new QuizBankStrategy());
            SetAuthHeader(controller, TestJwtBuilder.BuildToken(Guid.NewGuid().ToString(), "Admin"));

            conn.Close(); // xác nhận DB down

            var result = await controller.GetDashboard();
            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            using var doc = ParseResult(ok.Value);
            doc.RootElement.GetProperty("isFallback").GetBoolean().Should().BeTrue();
            doc.RootElement.GetProperty("orders").GetProperty("total").GetInt32().Should().Be(0);
            doc.RootElement.GetProperty("registrationsLast7Days").GetArrayLength().Should().Be(7);
        }

        // ---------- D4: learning analytics (hiệu quả học tập) ----------

        [Fact]
        public async Task GetLearningAnalytics_ReturnsOverallAndPerLessonStats()
        {
            var (adminCtl, db, _) = Create();
            var admin = AddUser(db, "Admin", "la-admin@test.com");
            SetAuthHeader(adminCtl, TestJwtBuilder.BuildToken(admin.Id.ToString(), "Admin"));

            // 2 user học cùng 1 lesson — 1 user xem viz + pass quiz, 1 user không xem + fail.
            var teacher = AddUser(db, "Teacher", "la-teacher@test.com");
            var lesson = new Lesson("Sắp xếp cơ bản (D4)", "Nội dung lý thuyết " + new string('x', 900), "sorting", "{}", 30, teacher.Id, null, LessonPublishStatus.Published);
            db.Lessons.Add(lesson);

            var u1 = AddUser(db, "Student", "la-u1@test.com");
            var p1 = new UserLessonProgress(u1.Id, lesson.Id, "Completed");
            p1.RecordVisualizerWatched();
            p1.RecordQuizAttempt(85);
            p1.RecordCodelabCompleted();
            db.UserLessonProgresses.Add(p1);

            var u2 = AddUser(db, "Student", "la-u2@test.com");
            var p2 = new UserLessonProgress(u2.Id, lesson.Id, "Completed");
            p2.RecordQuizAttempt(40);
            db.UserLessonProgresses.Add(p2);

            await db.SaveChangesAsync();

            var result = await adminCtl.GetLearningAnalytics();
            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            using var doc = ParseResult(ok.Value);

            doc.RootElement.GetProperty("overall").GetProperty("totalLearners").GetInt32().Should().Be(2);
            var lessonNode = doc.RootElement.GetProperty("lessons").EnumerateArray().Single();
            lessonNode.GetProperty("learners").GetInt32().Should().Be(2);
            lessonNode.GetProperty("visualizerWatchRate").GetDouble().Should().Be(50.0);
            lessonNode.GetProperty("quizPassRate").GetDouble().Should().Be(50.0);
            lessonNode.GetProperty("codelabCompletionRate").GetDouble().Should().Be(50.0);
            // Nhóm có xem viz: 1/1 pass (100%) — nhóm không xem: 0/1 fail (0%).
            lessonNode.GetProperty("passRateWithVisualizer").GetDouble().Should().Be(100.0);
            lessonNode.GetProperty("passRateWithoutVisualizer").GetDouble().Should().Be(0.0);
        }

        [Fact]
        public async Task GetLearningAnalytics_NoProgress_ReturnsZeroStatsWithoutError()
        {
            var (adminCtl, db, _) = Create();
            var admin = AddUser(db, "Admin", "la-empty@test.com");
            SetAuthHeader(adminCtl, TestJwtBuilder.BuildToken(admin.Id.ToString(), "Admin"));

            var result = await adminCtl.GetLearningAnalytics();
            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            using var doc = ParseResult(ok.Value);

            doc.RootElement.GetProperty("overall").GetProperty("totalLearners").GetInt32().Should().Be(0);
            doc.RootElement.GetProperty("overall").GetProperty("avgVisualizerWatchRate").GetDouble().Should().Be(0.0);
            doc.RootElement.GetProperty("lessons").GetArrayLength().Should().Be(0);
        }
    }
}
