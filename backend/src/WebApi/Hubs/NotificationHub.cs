using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using VisualizationDSA.Application.Services;

namespace VisualizationDSA.WebApi.Hubs
{
    /// <summary>
    /// NotificationHub — NT-002/NT-003:
    /// 1) [Authorize]: chặn anonymous connect/spoof.
    /// 2) KHÔNG còn method public client-invokable — mọi push đi qua NotificationBroadcastBroker:
    ///    NotificationService publish SAU khi commit, hub subscribe (khi có ≥1 client) và đẩy
    ///    "NewNotification"/"BadgeAwarded"/"LevelUp" đúng Clients.User(userId) — client không thể
    ///    invoke gửi event giả tới user khác.
    /// </summary>
    [Authorize]
    public class NotificationHub : Hub
    {
        // Broker nối từ service (Application) — hub chỉ subscribe khi có client thật sự kết nối.
        private static readonly object Sync = new();
        private static readonly HashSet<NotificationHub> Live = new();
        private static NotificationHub? Bound;
        private static bool Subscribed;

        public override async Task OnConnectedAsync()
        {
            lock (Sync)
            {
                Live.Add(this);
                Bound = this;
                if (!Subscribed)
                {
                    NotificationBroadcastBroker.Broadcast += HandleBrokerBroadcast;
                    Subscribed = true;
                }
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            lock (Sync)
            {
                Live.Remove(this);
                if (ReferenceEquals(Bound, this))
                    Bound = Live.FirstOrDefault();

                if (Live.Count == 0)
                {
                    if (Subscribed)
                    {
                        NotificationBroadcastBroker.Broadcast -= HandleBrokerBroadcast;
                        Subscribed = false;
                    }
                    Bound = null;
                }
            }
            await base.OnDisconnectedAsync(exception);
        }

        private Task HandleBrokerBroadcast(NotificationBroadcastMessage message)
        {
            NotificationHub? bound;
            lock (Sync)
            {
                bound = Bound;
            }

            return bound == null ? Task.CompletedTask : DispatchAsync(bound.Clients, message);
        }

        /// <summary>
        /// NT-003: dispatch event đúng user theo message.UserId qua Clients.User — KHÔNG bao giờ
        /// dùng Clients.All. Tách static (không client-invokable) để unit test xác thực routing.
        /// </summary>
        public static Task DispatchAsync(IHubCallerClients clients, NotificationBroadcastMessage message)
        {
            object payload = message.EventType switch
            {
                NotificationEventType.BadgeAwarded => new
                {
                    message.UserId,
                    message.Username,
                    message.BadgeName,
                    message.BadgeDescription,
                    AwardedAt = message.AwardedAt.ToString("o")
                },
                NotificationEventType.LevelUp => new
                {
                    message.UserId,
                    message.Username,
                    message.OldLevel,
                    message.NewLevel,
                    TotalXP = message.TotalXp
                },
                _ => new
                {
                    message.NotificationId,
                    message.Content,
                    message.LinkUrl,
                    message.CreatedAt
                }
            };

            return clients.User(message.UserId.ToString()).SendAsync(message.EventType.ToString(), payload, CancellationToken.None);
        }
    }
}
