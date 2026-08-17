using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using VisualizationDSA.Domain.Engine;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Strategies;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.UnitTests.Common;
using VisualizationDSA.WebApi.Controllers;
using Xunit;

namespace VisualizationDSA.UnitTests.Services
{
    /// <summary>
    /// F3 (FR-1.8) — Phê duyệt giảng viên:
    /// đăng ký isTeacher=true → Role PendingTeacher (response + DB);
    /// login tài khoản PendingTeacher bị chặn 403 TEACHER_PENDING;
    /// admin duyệt (PUT users/{id}/role → Teacher) → login bình thường.
    /// </summary>
    [Collection("TeacherApprovalTests")]
    public class TeacherApprovalTests
    {
        static TeacherApprovalTests()
        {
            TestJwtBuilder.EnsureConfigured();
        }

        private static (ApplicationDbContext Db, StatelessAuthStrategy Strategy) CreateDb()
        {
            var (db, _) = TestSqliteDbContext.Create();
            return (db, new StatelessAuthStrategy());
        }

        private static StatelessAuthController CreateAuthController(ApplicationDbContext db, StatelessAuthStrategy strategy)
        {
            var env = new Mock<IWebHostEnvironment>();
            env.Setup(e => e.EnvironmentName).Returns("Development");
            return new StatelessAuthController(strategy, db, env.Object);
        }

        private static AdminController CreateAdminController(
            ApplicationDbContext db,
            StatelessAuthStrategy strategy,
            string actorId)
        {
            var controller = new AdminController(db, strategy, new QuizBankStrategy());
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = $"Bearer {TestJwtBuilder.BuildToken(actorId, "Admin")}";
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
            return controller;
        }

        private static string ErrorCode(IActionResult result)
        {
            using var doc = JsonDocument.Parse(JsonSerializer.Serialize(
                ((ObjectResult)result).Value,
                new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
            return doc.RootElement.GetProperty("error").GetString()!;
        }

        [Fact]
        public async Task Register_IsTeacherTrue_SetsPendingTeacherRole()
        {
            var (db, strategy) = CreateDb();
            var auth = CreateAuthController(db, strategy);

            var result = await auth.Register(new StatelessRegisterRequest
            {
                Email = "gv@test.com",
                Username = "gv-user",
                Password = "Password123",
                IsTeacher = true
            });

            var ok = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var response = ok.Value.Should().BeOfType<StatelessAuthResponse>().Subject;
            response.User.Role.Should().Be("PendingTeacher");

            var dbUser = db.Users.Single(u => u.Email == "gv@test.com");
            dbUser.Role.Should().Be("PendingTeacher");
        }

        [Fact]
        public async Task Register_IsTeacherFalse_KeepsStudentRole()
        {
            var (db, strategy) = CreateDb();
            var auth = CreateAuthController(db, strategy);

            var result = await auth.Register(new StatelessRegisterRequest
            {
                Email = "sv@test.com",
                Username = "sv-user",
                Password = "Password123"
            });

            var ok = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var response = ok.Value.Should().BeOfType<StatelessAuthResponse>().Subject;
            response.User.Role.Should().Be("Student");

            db.Users.Single(u => u.Email == "sv@test.com").Role.Should().Be("Student");
        }

        [Fact]
        public async Task Login_PendingTeacher_IsBlockedWithTeacherPending()
        {
            var (db, strategy) = CreateDb();
            var auth = CreateAuthController(db, strategy);
            await auth.Register(new StatelessRegisterRequest
            {
                Email = "pending@test.com",
                Username = "pending-user",
                Password = "Password123",
                IsTeacher = true
            });

            var login = await auth.Login(new StatelessLoginRequest
            {
                Email = "pending@test.com",
                Password = "Password123"
            });

            var forbidden = login.Result.Should().BeOfType<ObjectResult>().Subject;
            forbidden.StatusCode.Should().Be(403);
            ErrorCode(forbidden).Should().Be("TEACHER_PENDING");
        }

        [Fact]
        public async Task AdminApprovesTeacher_ThenLoginSucceeds()
        {
            var (db, strategy) = CreateDb();
            var auth = CreateAuthController(db, strategy);

            // Admin thật trong DB (để audit + self-role-guard có actor hợp lệ).
            var admin = new User("admin@test.com", "admin-user", "hash");
            admin.SetRole("Admin");
            db.Users.Add(admin);
            await db.SaveChangesAsync();

            await auth.Register(new StatelessRegisterRequest
            {
                Email = "gv-approve@test.com",
                Username = "gv-approve",
                Password = "Password123",
                IsTeacher = true
            });
            var teacher = db.Users.Single(u => u.Email == "gv-approve@test.com");
            teacher.Role.Should().Be("PendingTeacher");

            // Chưa duyệt → login bị chặn.
            var pendingLogin = await auth.Login(new StatelessLoginRequest
            {
                Email = "gv-approve@test.com",
                Password = "Password123"
            });
            var forbidden = pendingLogin.Result.Should().BeOfType<ObjectResult>().Subject;
            forbidden.StatusCode.Should().Be(403);
            ErrorCode(forbidden).Should().Be("TEACHER_PENDING");

            // Admin duyệt → Teacher.
            var adminCtl = CreateAdminController(db, strategy, admin.Id.ToString());
            var approve = await adminCtl.UpdateUserRole(teacher.Id.ToString(), new UpdateRoleRequest("Teacher"));
            approve.Should().BeOfType<OkObjectResult>();
            db.Users.Single(u => u.Id == teacher.Id).Role.Should().Be("Teacher");
            db.AuditLogs.Should().Contain(l => l.Action == "ApproveTeacher" && l.TargetId == teacher.Id);

            // Sau khi duyệt → login 200, role Teacher.
            var login = await auth.Login(new StatelessLoginRequest
            {
                Email = "gv-approve@test.com",
                Password = "Password123"
            });
            var ok = login.Result.Should().BeOfType<OkObjectResult>().Subject;
            var response = ok.Value.Should().BeOfType<StatelessAuthResponse>().Subject;
            response.User.Role.Should().Be("Teacher");
        }

        [Fact]
        public async Task AdminRejectsTeacher_ThenRoleIsStudent_AndLoginSucceedsAsStudent()
        {
            var (db, strategy) = CreateDb();
            var auth = CreateAuthController(db, strategy);

            var admin = new User("admin-reject@test.com", "admin-reject", "hash");
            admin.SetRole("Admin");
            db.Users.Add(admin);
            await db.SaveChangesAsync();

            await auth.Register(new StatelessRegisterRequest
            {
                Email = "gv-reject@test.com",
                Username = "gv-reject",
                Password = "Password123",
                IsTeacher = true
            });
            var teacher = db.Users.Single(u => u.Email == "gv-reject@test.com");

            var adminCtl = CreateAdminController(db, strategy, admin.Id.ToString());
            var reject = await adminCtl.UpdateUserRole(teacher.Id.ToString(), new UpdateRoleRequest("Student"));
            reject.Should().BeOfType<OkObjectResult>();
            db.Users.Single(u => u.Id == teacher.Id).Role.Should().Be("Student");
            db.AuditLogs.Should().Contain(l => l.Action == "RejectTeacher" && l.TargetId == teacher.Id);

            var login = await auth.Login(new StatelessLoginRequest
            {
                Email = "gv-reject@test.com",
                Password = "Password123"
            });
            var ok = login.Result.Should().BeOfType<OkObjectResult>().Subject;
            var response = ok.Value.Should().BeOfType<StatelessAuthResponse>().Subject;
            response.User.Role.Should().Be("Student");
        }

        [Fact]
        public async Task AdminListUsers_ByPendingTeacherRole_ReturnsOnlyPending()
        {
            var (db, strategy) = CreateDb();
            var adminCtl = CreateAdminController(db, strategy, Guid.NewGuid().ToString());

            var pending = new User("p1@test.com", "p1-user", "hash");
            pending.SetPendingTeacherRole();
            var student = new User("s1@test.com", "s1-user", "hash");
            var teacher = new User("t1@test.com", "t1-user", "hash");
            teacher.SetRole("Teacher");
            db.Users.AddRange(pending, student, teacher);
            await db.SaveChangesAsync();

            var result = await adminCtl.GetUsers("PendingTeacher");
            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            using var doc = JsonDocument.Parse(JsonSerializer.Serialize(
                ok.Value, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
            var users = doc.RootElement.EnumerateArray().ToList();
            users.Should().ContainSingle();
            users[0].GetProperty("id").GetString().Should().Be(pending.Id.ToString());
            users[0].GetProperty("role").GetString().Should().Be("PendingTeacher");
        }
    }
}
