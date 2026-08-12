using System;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.Infrastructure.Services;
using VisualizationDSA.UnitTests.Common;
using Xunit;

namespace VisualizationDSA.UnitTests.Services
{
    /// <summary>
    /// NT-029: bộ test NotificationService — NotifyUser/NotifyAdmins/MarkAsRead/MarkAllAsRead/
    /// unread-count + broker push real-time. NT-016: batch admin, 1 admin lỗi không fail cả batch.
    /// </summary>
    [Collection("Notifications")]
    public class NotificationServiceTests
    {
        static NotificationServiceTests()
        {
            TestJwtBuilder.EnsureConfigured();
        }

        private static (NotificationService Service, ApplicationDbContext Db, SqliteConnectionHolder Holder) Create()
        {
            var (ctx, connection) = TestSqliteDbContext.Create();
            return (new NotificationService(ctx), ctx, new SqliteConnectionHolder(connection));
        }

        private static User AddUser(ApplicationDbContext db, string email, string role = "Student")
        {
            var user = new User(email, email.Split('@')[0], "hash");
            user.SetRole(role);
            db.Users.Add(user);
            db.SaveChanges();
            return user;
        }

        private static readonly Guid UserA = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        private static readonly Guid UserB = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");

        // ---------- NotifyUserAsync ----------

        [Fact]
        public async Task NotifyUserAsync_CreatesNotification_AndPersists()
        {
            var (service, db, holder) = Create();
            using (holder)
            {
                var user = AddUser(db, "a@test.com");

                await service.NotifyUserAsync(user.Id, "Nội dung mới", "/lessons/5");

                var notification = db.Notifications.Single(n => n.UserId == user.Id);
                notification.Content.Should().Be("Nội dung mới");
                notification.LinkUrl.Should().Be("/lessons/5");
                notification.IsRead.Should().BeFalse();
                notification.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromMinutes(1));
            }
        }

        [Fact]
        public async Task NotifyUserAsync_PublishesNewNotificationEvent()
        {
            var (service, db, holder) = Create();
            using (holder)
            {
                var user = AddUser(db, "a@test.com");
                NotificationBroadcastMessage? captured = null;
                Func<NotificationBroadcastMessage, Task> handler = m =>
                {
                    if (m.UserId == user.Id) captured = m;
                    return Task.CompletedTask;
                };

                NotificationBroadcastBroker.Broadcast += handler;
                try
                {
                    await service.NotifyUserAsync(user.Id, "Chào", "/lessons/9");
                }
                finally
                {
                    NotificationBroadcastBroker.Broadcast -= handler;
                }

                captured.Should().NotBeNull("NotifyUserAsync phải push real-time sau khi commit (NT-002)");
                captured!.EventType.Should().Be(NotificationEventType.NewNotification);
                captured.Content.Should().Be("Chào");
                captured.LinkUrl.Should().Be("/lessons/9");
                captured.NotificationId.Should().NotBeNull();
            }
        }

        // ---------- NotifyAdminsAsync (NT-016) ----------

        [Fact]
        public async Task NotifyAdminsAsync_OnlyAdminUsersGetNotifications()
        {
            var (service, db, holder) = Create();
            using (holder)
            {
                var admin1 = AddUser(db, "admin1@test.com", "Admin");
                var admin2 = AddUser(db, "admin2@test.com", "Admin");
                AddUser(db, "teacher@test.com", "Teacher");
                AddUser(db, "student@test.com", "Student");

                await service.NotifyAdminsAsync("Cảnh báo hệ thống", "/admin");

                db.Notifications.Count(n => n.UserId == admin1.Id).Should().Be(1);
                db.Notifications.Count(n => n.UserId == admin2.Id).Should().Be(1);
                db.Notifications.Count(n => n.UserId != admin1.Id && n.UserId != admin2.Id).Should().Be(0, "teacher/student không được nhận thông báo admin");
            }
        }

        [Fact]
        public async Task NotifyAdminsAsync_NoAdmins_NoOp()
        {
            var (service, db, holder) = Create();
            using (holder)
            {
                AddUser(db, "student@test.com");

                await service.NotifyAdminsAsync("Cảnh báo hệ thống");

                db.Notifications.Count().Should().Be(0);
            }
        }

        [Fact]
        public async Task NotifyAdminsAsync_OneAdminFails_OthersStillInserted()
        {
            var (service, db, holder) = Create();
            using (holder)
            {
                var admin1 = AddUser(db, "admin1@test.com", "Admin");
                var admin2 = AddUser(db, "admin2@test.com", "Admin");

                // Mô phỏng 1 admin lỗi insert (vd ràng buộc FK/trigger) — chỉ cái admin2 bị abort.
                var victimId = admin2.Id.ToString();
                db.Database.ExecuteSqlRaw(
                    "CREATE TRIGGER trg_notification_fail BEFORE INSERT ON Notifications " +
                    $"WHEN NEW.UserId = '{victimId}' BEGIN SELECT RAISE(ABORT, 'forced failure'); END;");

                await service.NotifyAdminsAsync("Cảnh báo hệ thống");

                db.Notifications.Count(n => n.UserId == admin1.Id).Should().Be(1, "admin1 vẫn nhận được thông báo");
                db.Notifications.Count(n => n.UserId == admin2.Id).Should().Be(0, "admin2 lỗi bị bỏ qua, không fail cả batch");
            }
        }

        // ---------- MarkAsRead ----------

        [Fact]
        public async Task MarkAsRead_OwnNotification_ReturnsTrueAndPersists()
        {
            var (service, db, holder) = Create();
            using (holder)
            {
                var user = AddUser(db, "a@test.com");
                var notification = new Notification(user.Id, "Chưa đọc", "");
                db.Notifications.Add(notification);
                db.SaveChanges();

                var marked = await service.MarkAsReadAsync(user.Id, notification.Id);

                marked.Should().BeTrue();
                // ExecuteUpdateAsync bypass ChangeTracker → reload từ DB để đọc giá trị THẬT.
                db.Entry(notification).Reload();
                notification.IsRead.Should().BeTrue();
            }
        }

        [Fact]
        public async Task MarkAsRead_OtherUsersNotification_ReturnsFalse()
        {
            var (service, db, holder) = Create();
            using (holder)
            {
                AddUser(db, "a@test.com");
                var userB = AddUser(db, "b@test.com");
                var victim = new Notification(userB.Id, "Của B", "");
                db.Notifications.Add(victim);
                db.SaveChanges();

                var marked = await service.MarkAsReadAsync(UserA, victim.Id);

                marked.Should().BeFalse("user A không sở hữu thông báo của B");
                db.Entry(victim).Reload();
                victim.IsRead.Should().BeFalse();
            }
        }

        [Fact]
        public async Task MarkAsRead_UnknownId_ReturnsFalse()
        {
            var (service, db, holder) = Create();
            using (holder)
            {
                AddUser(db, "a@test.com");

                var marked = await service.MarkAsReadAsync(UserA, Guid.NewGuid());

                marked.Should().BeFalse();
            }
        }

        [Fact]
        public async Task MarkAsRead_AlreadyRead_ReturnsTrue_Idempotent()
        {
            var (service, db, holder) = Create();
            using (holder)
            {
                var user = AddUser(db, "a@test.com");
                var notification = new Notification(user.Id, "Đã đọc", "");
                notification.MarkAsRead();
                db.Notifications.Add(notification);
                db.SaveChanges();

                var marked = await service.MarkAsReadAsync(user.Id, notification.Id);

                marked.Should().BeTrue("thông báo hợp lệ + thuộc user → vẫn trả true dù đã đọc");
                db.Notifications.Single(n => n.Id == notification.Id).IsRead.Should().BeTrue();
            }
        }

        // ---------- MarkAllAsRead (NT-010: 1 UPDATE atomic) ----------

        [Fact]
        public async Task MarkAllAsRead_UpdatesOnlyOwnUnread()
        {
            var (service, db, holder) = Create();
            using (holder)
            {
                var userA = AddUser(db, "a@test.com");
                var userB = AddUser(db, "b@test.com");
                db.Notifications.Add(new Notification(userA.Id, "A1", ""));
                db.Notifications.Add(new Notification(userA.Id, "A2", ""));
                var aRead = new Notification(userA.Id, "A đã đọc", "");
                aRead.MarkAsRead();
                db.Notifications.Add(aRead);
                var bUnread = new Notification(userB.Id, "B1", "");
                db.Notifications.Add(bUnread);
                db.SaveChanges();

                var updated = await service.MarkAllAsReadAsync(userA.Id);

                updated.Should().Be(2);
                db.Notifications.Count(n => n.UserId == userA.Id && !n.IsRead).Should().Be(0);
                db.Notifications.Single(n => n.Id == bUnread.Id).IsRead.Should().BeFalse();
            }
        }

        [Fact]
        public async Task MarkAllAsRead_NothingUnread_ReturnsZero()
        {
            var (service, db, holder) = Create();
            using (holder)
            {
                var user = AddUser(db, "a@test.com");
                var read = new Notification(user.Id, "Đã đọc", "");
                read.MarkAsRead();
                db.Notifications.Add(read);
                db.SaveChanges();

                var updated = await service.MarkAllAsReadAsync(user.Id);

                updated.Should().Be(0);
            }
        }

        // ---------- GetUnreadCount ----------

        [Fact]
        public async Task GetUnreadCount_CountsOnlyOwnUnread()
        {
            var (service, db, holder) = Create();
            using (holder)
            {
                var userA = AddUser(db, "a@test.com");
                var userB = AddUser(db, "b@test.com");
                for (var i = 0; i < 101; i++)
                {
                    db.Notifications.Add(new Notification(userA.Id, $"A{i}", ""));
                }
                var aRead = new Notification(userA.Id, "A đọc", "");
                aRead.MarkAsRead();
                db.Notifications.Add(aRead);
                db.Notifications.Add(new Notification(userB.Id, "B1", ""));
                db.SaveChanges();

                var unread = await service.GetUnreadCountAsync(userA.Id);

                unread.Should().Be(101, "đếm server-side không bị giới hạn bởi Take(100)");
            }
        }

        // ---------- Badge / LevelUp push (NT-002) ----------

        [Fact]
        public async Task NotifyBadgeAwardedAsync_PublishesBadgeAwardedEvent()
        {
            var (service, db, holder) = Create();
            using (holder)
            {
                NotificationBroadcastMessage? captured = null;
                Func<NotificationBroadcastMessage, Task> handler = m =>
                {
                    if (m.UserId == UserA) captured = m;
                    return Task.CompletedTask;
                };

                NotificationBroadcastBroker.Broadcast += handler;
                try
                {
                    await service.NotifyBadgeAwardedAsync(UserA, "alice", "Quiz Master", "Hoàn thành 1 quiz");
                }
                finally
                {
                    NotificationBroadcastBroker.Broadcast -= handler;
                }

                captured.Should().NotBeNull();
                captured!.EventType.Should().Be(NotificationEventType.BadgeAwarded);
                captured.Username.Should().Be("alice");
                captured.BadgeName.Should().Be("Quiz Master");
                captured.BadgeDescription.Should().Be("Hoàn thành 1 quiz");
            }
        }

        [Fact]
        public async Task NotifyLevelUpAsync_PublishesLevelUpEvent()
        {
            var (service, db, holder) = Create();
            using (holder)
            {
                NotificationBroadcastMessage? captured = null;
                Func<NotificationBroadcastMessage, Task> handler = m =>
                {
                    if (m.UserId == UserA) captured = m;
                    return Task.CompletedTask;
                };

                NotificationBroadcastBroker.Broadcast += handler;
                try
                {
                    await service.NotifyLevelUpAsync(UserA, "alice", 3, 4, 1250);
                }
                finally
                {
                    NotificationBroadcastBroker.Broadcast -= handler;
                }

                captured.Should().NotBeNull();
                captured!.EventType.Should().Be(NotificationEventType.LevelUp);
                captured.OldLevel.Should().Be(3);
                captured.NewLevel.Should().Be(4);
                captured.TotalXp.Should().Be(1250);
            }
        }
    }
}
