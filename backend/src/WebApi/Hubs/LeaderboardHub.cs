using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VisualizationDSA.Application.Services;

namespace VisualizationDSA.WebApi.Hubs
{
    /// <summary>
    /// LeaderboardHub — GM-006:
    /// 1) [Authorize]: chặn anonymous connect/spoof (trước đây không xác thực).
    /// 2) SendLeaderboardUpdate chỉ cho phép Teacher/Admin gọi (chống spam broadcast giả).
    /// 3) Real-time THẬT: GamificationService publish qua LeaderboardBroadcastBroker SAU khi commit
    ///    XP; hub subscribe (khi có ≥1 client kết nối) và đẩy "LeaderboardUpdated" cho mọi client.
    ///    Không client kết nối → no-op (không ai cần nhận) — hết dead code.
    /// </summary>
    [Authorize]
    public class LeaderboardHub : Hub
    {
        // Broker nối từ service (Application) — hub chỉ subscribe khi có client thật sự kết nối.
        private static readonly object Sync = new();
        private static readonly HashSet<LeaderboardHub> Live = new();
        private static LeaderboardHub? Bound;
        private static bool Subscribed;

        public override async Task OnConnectedAsync()
        {
            lock (Sync)
            {
                Live.Add(this);
                Bound = this;
                if (!Subscribed)
                {
                    LeaderboardBroadcastBroker.Broadcast += HandleBrokerBroadcast;
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
                        LeaderboardBroadcastBroker.Broadcast -= HandleBrokerBroadcast;
                        Subscribed = false;
                    }
                    Bound = null;
                }
            }
            await base.OnDisconnectedAsync(exception);
        }

        // GM-006: xác thực role — chỉ Teacher/Admin được phát broadcast (client-callable).
        public async Task SendLeaderboardUpdate(string username, int totalXP, int currentLevel, int rank, int xpGained)
        {
            var role = Context.User?.FindFirst("role")?.Value;
            if (role != "Teacher" && role != "Admin")
                throw new HubException("Chỉ giáo viên/Admin được phát cập nhật bảng xếp hạng.");

            await Clients.All.SendAsync("LeaderboardUpdated", new
            {
                Username = username,
                TotalXP = totalXP,
                CurrentLevel = currentLevel,
                Rank = rank,
                XpGained = xpGained
            });
        }

        private Task HandleBrokerBroadcast(LeaderboardUpdateMessage message)
        {
            LeaderboardHub? bound;
            lock (Sync)
            {
                bound = Bound;
            }

            if (bound == null)
                return Task.CompletedTask;

            return bound.Clients.All.SendAsync("LeaderboardUpdated", new
            {
                Username = message.Username,
                TotalXP = message.TotalXp,
                CurrentLevel = message.CurrentLevel,
                Rank = message.Rank,
                XpGained = message.XpGained
            });
        }
    }
}
