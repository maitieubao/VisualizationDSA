using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace VisualizationDSA.WebApi.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        public async Task SendBadgeNotification(string userId, string username, string badgeName, string badgeDescription)
        {
            await Clients.User(userId).SendAsync("BadgeAwarded", new
            {
                UserId = userId,
                Username = username,
                BadgeName = badgeName,
                BadgeDescription = badgeDescription,
                AwardedAt = DateTime.UtcNow.ToString("o")
            });
        }

        public async Task SendLevelUpNotification(string userId, string username, int oldLevel, int newLevel, int totalXP)
        {
            await Clients.User(userId).SendAsync("LevelUp", new
            {
                UserId = userId,
                Username = username,
                OldLevel = oldLevel,
                NewLevel = newLevel,
                TotalXP = totalXP
            });
        }
    }
}
