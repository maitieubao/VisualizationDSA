using System;
using System.Linq;
using System.Reflection;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.SignalR;
using Moq;
using VisualizationDSA.Application.Services;
using VisualizationDSA.WebApi.Hubs;
using Xunit;

namespace VisualizationDSA.UnitTests.Services
{
    /// <summary>
    /// NT-007/NT-003: bộ test NotificationHub — KHÔNG còn method public client-invokable
    /// (không spoof được), DispatchAsync route đúng Clients.User(userId) theo EventType,
    /// không bao giờ broadcast Clients.All.
    /// </summary>
    [Collection("Notifications")]
    public class NotificationHubTests
    {
        // ---------- NT-003: không client-invokable ----------

        [Fact]
        public void HasNoClientInvokablePublicInstanceMethods()
        {
            var declaredPublicInstance = typeof(NotificationHub)
                .GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
                .Select(m => m.Name)
                .OrderBy(n => n)
                .ToArray();

            // Chỉ cho phép lifecycle override của Hub — mọi push phải đi qua broker/IHubContext.
            declaredPublicInstance.Should().BeEquivalentTo(new[] { "OnConnectedAsync", "OnDisconnectedAsync" });
        }

        [Fact]
        public void DispatchAsync_IsStatic_NotClientInvokable()
        {
            var method = typeof(NotificationHub).GetMethod("DispatchAsync", BindingFlags.Public | BindingFlags.Static);
            method.Should().NotBeNull("DispatchAsync phải là static — static method SignalR không thể invoke từ client");
        }

        // ---------- NT-002: routing đúng user + payload ----------

        [Fact]
        public async Task DispatchAsync_BadgeAwarded_RoutesToClientsUserWithPayload()
        {
            var userId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
            var userProxy = new Mock<IClientProxy>();
            string? sentMethod = null;
            object?[]? sentArgs = null;
            userProxy.Setup(p => p.SendCoreAsync(It.IsAny<string>(), It.IsAny<object?[]>(), It.IsAny<CancellationToken>()))
                .Callback<string, object?[], CancellationToken>((method, args, ct) => { sentMethod = method; sentArgs = args; })
                .Returns(Task.CompletedTask);
            var clients = new Mock<IHubCallerClients>();
            clients.Setup(c => c.User(It.IsAny<string>())).Returns(userProxy.Object);

            var message = new NotificationBroadcastMessage
            {
                UserId = userId,
                EventType = NotificationEventType.BadgeAwarded,
                Username = "alice",
                BadgeName = "Quiz Master",
                BadgeDescription = "Hoàn thành 1 quiz",
                AwardedAt = new DateTime(2026, 8, 11, 0, 0, 0, DateTimeKind.Utc)
            };

            await NotificationHub.DispatchAsync(clients.Object, message);

            clients.Verify(c => c.User(userId.ToString()), Times.Once);
            clients.Verify(c => c.All, Times.Never, "push phải đi đúng Clients.User, không bao giờ Clients.All (chống spoof)");
            sentMethod.Should().Be("BadgeAwarded");
            using var doc = PayloadAsJson(sentArgs);
            doc.RootElement.GetProperty("userId").GetString().Should().Be(userId.ToString());
            doc.RootElement.GetProperty("username").GetString().Should().Be("alice");
            doc.RootElement.GetProperty("badgeName").GetString().Should().Be("Quiz Master");
            doc.RootElement.GetProperty("badgeDescription").GetString().Should().Be("Hoàn thành 1 quiz");
            doc.RootElement.GetProperty("awardedAt").GetString().Should().Be("2026-08-11T00:00:00.0000000Z");
        }

        [Fact]
        public async Task DispatchAsync_LevelUp_RoutesToClientsUserWithPayload()
        {
            var userId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
            var userProxy = new Mock<IClientProxy>();
            string? sentMethod = null;
            object?[]? sentArgs = null;
            userProxy.Setup(p => p.SendCoreAsync(It.IsAny<string>(), It.IsAny<object?[]>(), It.IsAny<CancellationToken>()))
                .Callback<string, object?[], CancellationToken>((method, args, ct) => { sentMethod = method; sentArgs = args; })
                .Returns(Task.CompletedTask);
            var clients = new Mock<IHubCallerClients>();
            clients.Setup(c => c.User(It.IsAny<string>())).Returns(userProxy.Object);

            var message = new NotificationBroadcastMessage
            {
                UserId = userId,
                EventType = NotificationEventType.LevelUp,
                Username = "bob",
                OldLevel = 3,
                NewLevel = 4,
                TotalXp = 1250
            };

            await NotificationHub.DispatchAsync(clients.Object, message);

            clients.Verify(c => c.User(userId.ToString()), Times.Once);
            clients.Verify(c => c.All, Times.Never);
            sentMethod.Should().Be("LevelUp");
            using var doc = PayloadAsJson(sentArgs);
            doc.RootElement.GetProperty("oldLevel").GetInt32().Should().Be(3);
            doc.RootElement.GetProperty("newLevel").GetInt32().Should().Be(4);
            doc.RootElement.GetProperty("totalXP").GetInt32().Should().Be(1250, "contract frontend dùng key 'totalXP' (XP hoa)");
        }

        [Fact]
        public async Task DispatchAsync_NewNotification_RoutesToClientsUserWithPayload()
        {
            var userId = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc");
            var userProxy = new Mock<IClientProxy>();
            string? sentMethod = null;
            object?[]? sentArgs = null;
            userProxy.Setup(p => p.SendCoreAsync(It.IsAny<string>(), It.IsAny<object?[]>(), It.IsAny<CancellationToken>()))
                .Callback<string, object?[], CancellationToken>((method, args, ct) => { sentMethod = method; sentArgs = args; })
                .Returns(Task.CompletedTask);
            var clients = new Mock<IHubCallerClients>();
            clients.Setup(c => c.User(It.IsAny<string>())).Returns(userProxy.Object);

            var message = new NotificationBroadcastMessage
            {
                UserId = userId,
                EventType = NotificationEventType.NewNotification,
                NotificationId = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd"),
                Content = "Bạn có thông báo mới",
                LinkUrl = "/lessons/5?tab=discussion",
                CreatedAt = new DateTime(2026, 8, 11, 12, 0, 0, DateTimeKind.Utc)
            };

            await NotificationHub.DispatchAsync(clients.Object, message);

            clients.Verify(c => c.User(userId.ToString()), Times.Once);
            clients.Verify(c => c.All, Times.Never);
            sentMethod.Should().Be("NewNotification");
            using var doc = PayloadAsJson(sentArgs);
            doc.RootElement.GetProperty("content").GetString().Should().Be("Bạn có thông báo mới");
            doc.RootElement.GetProperty("linkUrl").GetString().Should().Be("/lessons/5?tab=discussion");
            doc.RootElement.GetProperty("notificationId").GetString().Should().Be("dddddddd-dddd-dddd-dddd-dddddddddddd");
        }

        [Fact]
        public async Task DispatchAsync_NoSubscriber_BrokerPublishIsNoOp()
        {
            // Không client hub nào subscribe → PublishAsync phải trả về ngay, không throw.
            var task = NotificationBroadcastBroker.PublishAsync(new NotificationBroadcastMessage
            {
                UserId = UserA,
                EventType = NotificationEventType.BadgeAwarded,
                BadgeName = "X"
            });
            await task;
            task.IsCompletedSuccessfully.Should().BeTrue();
        }

        private static readonly Guid UserA = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");

        private static JsonDocument PayloadAsJson(object?[]? args)
        {
            args.Should().NotBeNull();
            args!.Length.Should().Be(1);
            return JsonDocument.Parse(JsonSerializer.Serialize(args[0], new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            }));
        }
    }
}
