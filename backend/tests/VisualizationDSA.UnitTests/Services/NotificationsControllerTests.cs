using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text.Json;
using System.Threading.Tasks;
using Asp.Versioning;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.Infrastructure.Services;
using VisualizationDSA.UnitTests.Common;
using VisualizationDSA.WebApi.Controllers;
using Xunit;

namespace VisualizationDSA.UnitTests.Services
{
    /// <summary>
    /// NT-007: bộ test NotificationsController (/api/v1/notifications):
    /// route chuẩn (contract), unauth 401, IDOR chéo user → 404, mark-all idempotent,
    /// Take(100) biên 101 bản, unread-count server-side (badge đúng khi &gt;100 unread).
    /// Pattern: TeacherControllerTests (TestSqliteDbContext + token thật qua TestJwtBuilder).
    /// </summary>
    [Collection("Notifications")]
    public class NotificationsControllerTests
    {
        static NotificationsControllerTests()
        {
            TestJwtBuilder.EnsureConfigured();
        }

        private static (NotificationsController Controller, ApplicationDbContext Db, SqliteConnectionHolder Holder) Create(string? sub)
        {
            var (ctx, connection) = TestSqliteDbContext.Create();
            var controller = new NotificationsController(new NotificationService(ctx));
            var httpContext = new DefaultHttpContext();
            if (sub != null)
            {
                httpContext.Request.Headers["Authorization"] = $"Bearer {TestJwtBuilder.BuildToken(sub, "Student")}";
            }
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
            return (controller, ctx, new SqliteConnectionHolder(connection));
        }

        private static User AddUser(ApplicationDbContext db, Guid id, string email)
        {
            var user = new User(email, email.Split('@')[0], "hash");
            typeof(User).GetProperty("Id")!.SetValue(user, id);
            db.Users.Add(user);
            db.SaveChanges();
            return user;
        }

        private static Notification AddNotification(ApplicationDbContext db, Guid userId, string content = "Nội dung", bool isRead = false)
        {
            var notification = new Notification(userId, content, "/lessons/1");
            if (isRead)
                notification.MarkAsRead();
            db.Notifications.Add(notification);
            db.SaveChanges();
            return notification;
        }

        private static JsonDocument ParseResult(object? value)
            => JsonDocument.Parse(JsonSerializer.Serialize(value, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));

        private static readonly Guid UserA = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        private static readonly Guid UserB = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");

        // ---------- NT-001: contract route ----------

        [Fact]
        public void Route_IsApiV1Notifications()
        {
            var type = typeof(NotificationsController);

            type.GetCustomAttribute<ApiControllerAttribute>().Should().NotBeNull();
            var version = type.GetCustomAttribute<ApiVersionAttribute>();
            version!.Versions.Should().Contain(new ApiVersion(1, 0));
            var route = type.GetCustomAttribute<RouteAttribute>();
            route!.Template.Should().Be("api/v{version:apiVersion}/[controller]");

            // Tên controller "NotificationsController" → route thật là /api/v1/notifications
            // (frontend phải gọi đúng URL này, không phải /concepts/notifications — NT-001).
            type.Name.Should().Be("NotificationsController");
            typeof(NotificationsController).GetMethods(BindingFlags.Public | BindingFlags.Instance)
                .SelectMany(m => m.GetCustomAttributes<HttpMethodAttribute>())
                .Select(a => a.Template)
                .Should().Contain(new[] { null, "unread-count", "{id}/read", "read-all" });
        }

        // ---------- unauth 401 ----------

        [Fact]
        public async Task GetNotifications_NoToken_Unauthorized()
        {
            var (controller, db, holder) = Create(sub: null);
            using (holder)
            {
                var result = await controller.GetNotifications();
                result.Should().BeOfType<UnauthorizedResult>();
            }
        }

        [Fact]
        public async Task MarkAsRead_NoToken_Unauthorized()
        {
            var (controller, db, holder) = Create(sub: null);
            using (holder)
            {
                var result = await controller.MarkAsRead(Guid.NewGuid());
                result.Should().BeOfType<UnauthorizedResult>();
            }
        }

        [Fact]
        public async Task MarkAllAsRead_NoToken_Unauthorized()
        {
            var (controller, db, holder) = Create(sub: null);
            using (holder)
            {
                var result = await controller.MarkAllAsRead();
                result.Should().BeOfType<UnauthorizedResult>();
            }
        }

        [Fact]
        public async Task GetUnreadCount_NoToken_Unauthorized()
        {
            var (controller, db, holder) = Create(sub: null);
            using (holder)
            {
                var result = await controller.GetUnreadCount();
                result.Should().BeOfType<UnauthorizedResult>();
            }
        }

        // ---------- GET list + totalUnread ----------

        [Fact]
        public async Task GetNotifications_ReturnsOwnNotifications_WithTotalUnread()
        {
            var (controller, db, holder) = Create(UserA.ToString());
            using (holder)
            {
                AddUser(db, UserA, "a@test.com");
                AddUser(db, UserB, "b@test.com");
                AddNotification(db, UserA, "Thông báo 1", isRead: false);
                AddNotification(db, UserA, "Thông báo 2", isRead: false);
                AddNotification(db, UserA, "Thông báo đã đọc", isRead: true);
                AddNotification(db, UserB, "Của user B", isRead: false);

                var result = await controller.GetNotifications();

                var ok = result.Should().BeOfType<OkObjectResult>().Subject;
                using var doc = ParseResult(ok.Value);
                doc.RootElement.GetProperty("totalUnread").GetInt32().Should().Be(2);
                var notifications = doc.RootElement.GetProperty("notifications");
                notifications.GetArrayLength().Should().Be(3);
                // CreatedAt trùng tick giữa các bản ghi seed → không chốt thứ tự phần tử đầu, chỉ chốt tập nội dung.
                notifications.EnumerateArray()
                    .Select(n => n.GetProperty("content").GetString())
                    .Should().BeEquivalentTo(new[] { "Thông báo 1", "Thông báo 2", "Thông báo đã đọc" });
            }
        }

        [Fact]
        public async Task GetNotifications_101Unread_ListClampedAt100_ButTotalUnreadIs101()
        {
            var (controller, db, holder) = Create(UserA.ToString());
            using (holder)
            {
                AddUser(db, UserA, "a@test.com");
                for (var i = 0; i < 101; i++)
                {
                    db.Notifications.Add(new Notification(UserA, $"Thông báo {i}", "/lessons/1"));
                }
                db.SaveChanges();

                var result = await controller.GetNotifications();

                var ok = result.Should().BeOfType<OkObjectResult>().Subject;
                using var doc = ParseResult(ok.Value);
                doc.RootElement.GetProperty("totalUnread").GetInt32().Should().Be(101, "unread phải đếm server-side, không phụ thuộc Take(100)");
                doc.RootElement.GetProperty("notifications").GetArrayLength().Should().Be(100);
            }
        }

        // ---------- MarkAsRead + IDOR ----------

        [Fact]
        public async Task MarkAsRead_OwnNotification_ReturnsOkAndPersists()
        {
            var (controller, db, holder) = Create(UserA.ToString());
            using (holder)
            {
                AddUser(db, UserA, "a@test.com");
                var notification = AddNotification(db, UserA, "Chưa đọc", isRead: false);

                var result = await controller.MarkAsRead(notification.Id);

                result.Should().BeOfType<OkObjectResult>();
                // ExecuteUpdateAsync bypass ChangeTracker → reload từ DB để đọc giá trị THẬT.
                db.Entry(notification).Reload();
                notification.IsRead.Should().BeTrue();
            }
        }

        [Fact]
        public async Task MarkAsRead_OtherUsersNotification_ReturnsNotFound()
        {
            var (controller, db, holder) = Create(UserA.ToString());
            using (holder)
            {
                AddUser(db, UserA, "a@test.com");
                AddUser(db, UserB, "b@test.com");
                var victim = AddNotification(db, UserB, "Của B", isRead: false);

                var result = await controller.MarkAsRead(victim.Id);

                result.Should().BeOfType<NotFoundObjectResult>();
                db.Entry(victim).Reload();
                victim.IsRead.Should().BeFalse("IDOR: user A không được đọc thông báo của B");
            }
        }

        [Fact]
        public async Task MarkAsRead_UnknownId_ReturnsNotFound()
        {
            var (controller, db, holder) = Create(UserA.ToString());
            using (holder)
            {
                AddUser(db, UserA, "a@test.com");

                var result = await controller.MarkAsRead(Guid.NewGuid());

                result.Should().BeOfType<NotFoundObjectResult>();
            }
        }

        // ---------- MarkAllAsRead (NT-010) ----------

        [Fact]
        public async Task MarkAllAsRead_MarksOnlyOwnNotifications()
        {
            var (controller, db, holder) = Create(UserA.ToString());
            using (holder)
            {
                AddUser(db, UserA, "a@test.com");
                AddUser(db, UserB, "b@test.com");
                AddNotification(db, UserA, "A1", isRead: false);
                AddNotification(db, UserA, "A2", isRead: false);
                AddNotification(db, UserA, "A đã đọc", isRead: true);
                var bUnread = AddNotification(db, UserB, "B1", isRead: false);

                var result = await controller.MarkAllAsRead();

                result.Should().BeOfType<OkObjectResult>();
                db.Notifications.Count(n => n.UserId == UserA && !n.IsRead).Should().Be(0);
                db.Notifications.Single(n => n.Id == bUnread.Id).IsRead.Should().BeFalse("mark-all không được đụng thông báo user khác");
            }
        }

        [Fact]
        public async Task MarkAllAsRead_NothingUnread_Idempotent()
        {
            var (controller, db, holder) = Create(UserA.ToString());
            using (holder)
            {
                AddUser(db, UserA, "a@test.com");
                AddNotification(db, UserA, "Đã đọc", isRead: true);

                var result = await controller.MarkAllAsRead();

                var ok = result.Should().BeOfType<OkObjectResult>().Subject;
                using var doc = ParseResult(ok.Value);
                doc.RootElement.GetProperty("updated").GetInt32().Should().Be(0, "mark-all khi không còn unread phải idempotent (không lỗi)");
                db.Notifications.Count(n => n.UserId == UserA && !n.IsRead).Should().Be(0);
            }
        }

        // ---------- unread-count (NT-011) ----------

        [Fact]
        public async Task GetUnreadCount_ReturnsServerSideCount_EvenWhenAbove100()
        {
            var (controller, db, holder) = Create(UserA.ToString());
            using (holder)
            {
                AddUser(db, UserA, "a@test.com");
                AddUser(db, UserB, "b@test.com");
                for (var i = 0; i < 101; i++)
                {
                    db.Notifications.Add(new Notification(UserA, $"A{i}", "/lessons/1"));
                }
                db.Notifications.Add(new Notification(UserB, "B1", "/lessons/1"));
                db.SaveChanges();

                var result = await controller.GetUnreadCount();

                var ok = result.Should().BeOfType<OkObjectResult>().Subject;
                using var doc = ParseResult(ok.Value);
                doc.RootElement.GetProperty("totalUnread").GetInt32().Should().Be(101);
            }
        }

        [Fact]
        public async Task GetUnreadCount_NoNotifications_ReturnsZero()
        {
            var (controller, db, holder) = Create(UserA.ToString());
            using (holder)
            {
                AddUser(db, UserA, "a@test.com");

                var result = await controller.GetUnreadCount();

                var ok = result.Should().BeOfType<OkObjectResult>().Subject;
                using var doc = ParseResult(ok.Value);
                doc.RootElement.GetProperty("totalUnread").GetInt32().Should().Be(0);
            }
        }
    }
}
