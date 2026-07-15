using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace VisualizationDSA.Application.Services
{
    public interface ILeaderboardService
    {
        /// <summary>Top N user theo TotalXP — dùng cho bảng xếp hạng toàn cục.</summary>
        Task<IEnumerable<LeaderboardEntryDto>> GetTopUsersAsync(int limit = 20);

        /// <summary>Xếp hạng của một user cụ thể trong leaderboard.</summary>
        Task<UserRankDto> GetUserRankAsync(Guid userId);
    }

    public class LeaderboardEntryDto
    {
        public int    Rank        { get; set; }
        public Guid   UserId      { get; set; }
        public string Username    { get; set; } = string.Empty;
        public int    TotalXP     { get; set; }
        public int    Level       { get; set; }
        public int    StreakDays  { get; set; }
        public int    BadgeCount  { get; set; }
    }

    public class UserRankDto
    {
        public int  Rank    { get; set; }
        public int  TotalXP { get; set; }
        public bool IsInTop { get; set; }
    }
}
