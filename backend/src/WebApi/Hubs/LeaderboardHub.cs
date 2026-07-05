using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace VisualizationDSA.WebApi.Hubs
{
    public class LeaderboardHub : Hub
    {
        public async Task SendLeaderboardUpdate(string username, int totalXP, int currentLevel, int rank, int xpGained)
        {
            await Clients.All.SendAsync("LeaderboardUpdated", new
            {
                Username = username,
                TotalXP = totalXP,
                CurrentLevel = currentLevel,
                Rank = rank,
                XpGained = xpGained
            });
        }
    }
}
