using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Strategies;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.UnitTests.Common;
using VisualizationDSA.WebApi.Controllers;
using Xunit;

namespace VisualizationDSA.UnitTests.Services
{
    /// <summary>
    /// TC-034: bộ test TeacherController.GetUsers (/concepts/admin/users):
    /// teacher chỉ thấy Student (không lộ email Admin/Teacher khác), admin thấy mọi role,
    /// clamp phân trang (page 0/âm, pageSize 10000), search email/username không phân biệt hoa thường,
    /// fallback in-memory vẫn giữ ràng buộc role.
    /// </summary>
    [Collection("AdminControllerTests")]
    public class TeacherControllerTests
    {
        static TeacherControllerTests()
        {
            TestJwtBuilder.EnsureConfigured();
        }

        private static (TeacherController Controller, ApplicationDbContext Db, SqliteConnectionHolder Holder) Create(string role, string sub)
        {
            var (ctx, connection) = TestSqliteDbContext.Create();
            var controller = new TeacherController(ctx, new StatelessAuthStrategy());
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = $"Bearer {TestJwtBuilder.BuildToken(sub, role)}";
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
            return (controller, ctx, new SqliteConnectionHolder(connection));
        }

        private static User AddUser(ApplicationDbContext db, string role, string email)
        {
            var user = new User(email, email.Split('@')[0], "hash");
            user.SetRole(role);
            db.Users.Add(user);
            db.SaveChanges();
            return user;
        }

        private static JsonDocument ParseResult(object? value)
            => JsonDocument.Parse(JsonSerializer.Serialize(value, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));

        // ---------- role filter ----------

        [Fact]
        public async Task GetUsers_TeacherRole_ReturnsOnlyStudents()
        {
            var (controller, db, holder) = Create("Teacher", Guid.NewGuid().ToString());
            using (holder)
            {
                AddUser(db, "Student", "s1@test.com");
                AddUser(db, "Student", "s2@test.com");
                AddUser(db, "Teacher", "t1@test.com");
                AddUser(db, "Admin", "a1@test.com");

                var result = await controller.GetUsers();

                var ok = result.Should().BeOfType<OkObjectResult>().Subject;
                using var doc = ParseResult(ok.Value);
                doc.RootElement.GetProperty("total").GetInt32().Should().Be(2);
                var users = doc.RootElement.GetProperty("users");
                users.GetArrayLength().Should().Be(2);
                foreach (var u in users.EnumerateArray())
                {
                    u.GetProperty("role").GetString().Should().Be("Student");
                    u.GetProperty("email").GetString().Should().Match("*@test.com");
                }
            }
        }

        [Fact]
        public async Task GetUsers_AdminRole_ReturnsAllRoles()
        {
            var (controller, db, holder) = Create("Admin", Guid.NewGuid().ToString());
            using (holder)
            {
                AddUser(db, "Student", "s1@test.com");
                AddUser(db, "Teacher", "t1@test.com");
                AddUser(db, "Admin", "a1@test.com");

                var result = await controller.GetUsers();

                var ok = result.Should().BeOfType<OkObjectResult>().Subject;
                using var doc = ParseResult(ok.Value);
                doc.RootElement.GetProperty("total").GetInt32().Should().Be(3);
            }
        }

        // ---------- page clamp ----------

        [Fact]
        public async Task GetUsers_PageZero_ClampedToOne()
        {
            var (controller, db, holder) = Create("Admin", Guid.NewGuid().ToString());
            using (holder)
            {
                for (int i = 0; i < 5; i++) AddUser(db, "Student", $"c{i}@test.com");

                var result = await controller.GetUsers(page: 0);

                var ok = result.Should().BeOfType<OkObjectResult>().Subject;
                using var doc = ParseResult(ok.Value);
                doc.RootElement.GetProperty("page").GetInt32().Should().Be(1);
                doc.RootElement.GetProperty("users").GetArrayLength().Should().Be(5);
            }
        }

        [Fact]
        public async Task GetUsers_PageNegative_ClampedToOne()
        {
            var (controller, db, holder) = Create("Admin", Guid.NewGuid().ToString());
            using (holder)
            {
                AddUser(db, "Student", "n1@test.com");

                var result = await controller.GetUsers(page: -5);

                var ok = result.Should().BeOfType<OkObjectResult>().Subject;
                using var doc = ParseResult(ok.Value);
                doc.RootElement.GetProperty("page").GetInt32().Should().Be(1);
            }
        }

        [Fact]
        public async Task GetUsers_PageSizeHuge_ClampedTo100()
        {
            var (controller, db, holder) = Create("Admin", Guid.NewGuid().ToString());
            using (holder)
            {
                for (int i = 0; i < 120; i++) AddUser(db, "Student", $"bulk{i:D3}@test.com");

                var result = await controller.GetUsers(pageSize: 10000);

                var ok = result.Should().BeOfType<OkObjectResult>().Subject;
                using var doc = ParseResult(ok.Value);
                doc.RootElement.GetProperty("total").GetInt32().Should().Be(120);
                doc.RootElement.GetProperty("pageSize").GetInt32().Should().Be(100);
                doc.RootElement.GetProperty("users").GetArrayLength().Should().Be(100);
            }
        }

        // ---------- search (case-insensitive) ----------

        [Fact]
        public async Task GetUsers_SearchByEmail_CaseInsensitive()
        {
            var (controller, db, holder) = Create("Teacher", Guid.NewGuid().ToString());
            using (holder)
            {
                AddUser(db, "Student", "Alice.STUDENT@test.com");
                AddUser(db, "Student", "bob@test.com");

                var result = await controller.GetUsers(search: "ALICE.student");

                var ok = result.Should().BeOfType<OkObjectResult>().Subject;
                using var doc = ParseResult(ok.Value);
                doc.RootElement.GetProperty("total").GetInt32().Should().Be(1);
                doc.RootElement.GetProperty("users")[0].GetProperty("email").GetString().Should().Be("Alice.STUDENT@test.com");
            }
        }

        [Fact]
        public async Task GetUsers_SearchByUsername_Partial()
        {
            var (controller, db, holder) = Create("Teacher", Guid.NewGuid().ToString());
            using (holder)
            {
                AddUser(db, "Student", "zhang@test.com"); // username = "zhang"
                AddUser(db, "Student", "zhao@test.com");  // username = "zhao"

                var result = await controller.GetUsers(search: "ZHAN");

                var ok = result.Should().BeOfType<OkObjectResult>().Subject;
                using var doc = ParseResult(ok.Value);
                doc.RootElement.GetProperty("total").GetInt32().Should().Be(1);
                doc.RootElement.GetProperty("users")[0].GetProperty("username").GetString().Should().Be("zhang");
            }
        }

        [Fact]
        public async Task GetUsers_SearchNoMatch_ReturnsEmpty()
        {
            var (controller, db, holder) = Create("Teacher", Guid.NewGuid().ToString());
            using (holder)
            {
                AddUser(db, "Student", "only@test.com");

                var result = await controller.GetUsers(search: "không-tồn-tại");

                var ok = result.Should().BeOfType<OkObjectResult>().Subject;
                using var doc = ParseResult(ok.Value);
                doc.RootElement.GetProperty("total").GetInt32().Should().Be(0);
                doc.RootElement.GetProperty("users").GetArrayLength().Should().Be(0);
            }
        }

        // ---------- DB down → fallback in-memory giữ ràng buộc role ----------

        [Fact]
        public async Task GetUsers_DbDown_FallbackKeepsTeacherStudentOnly()
        {
            var (ctx, connection) = TestSqliteDbContext.Create();
            var strategy = new StatelessAuthStrategy();
            // Seed user in-memory: 1 teacher + 2 students.
            strategy.AddUser("mem-teacher-1", "memt@test.com", "memteacher", "hash", "Teacher", false);
            strategy.AddUser("mem-student-1", "mems1@test.com", "memstudent1", "hash", "Student", false);
            strategy.AddUser("mem-student-2", "mems2@test.com", "memstudent2", "hash", "Student", true);

            var controller = new TeacherController(ctx, strategy);
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = $"Bearer {TestJwtBuilder.BuildToken("mem-teacher-1", "Teacher")}";
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };

            connection.Close(); // xác nhận DB down → rơi vào fallback in-memory

            var result = await controller.GetUsers();

            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            using var doc = ParseResult(ok.Value);
            // Teacher KHÔNG được thấy teacher/admin khác kể cả khi fallback.
            doc.RootElement.GetProperty("total").GetInt32().Should().Be(2);
            foreach (var u in doc.RootElement.GetProperty("users").EnumerateArray())
            {
                u.GetProperty("role").GetString().Should().Be("Student");
            }

            connection.Dispose();
        }
    }

    /// <summary>Giữ SqliteConnection sống tới khi test xong (dispose theo using).</summary>
    internal sealed class SqliteConnectionHolder : IDisposable
    {
        private readonly Microsoft.Data.Sqlite.SqliteConnection _connection;

        public SqliteConnectionHolder(Microsoft.Data.Sqlite.SqliteConnection connection)
        {
            _connection = connection;
        }

        public void Dispose()
        {
            _connection.Dispose();
        }
    }
}
