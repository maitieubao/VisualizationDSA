using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace VisualizationDSA.Application.Services
{
    public interface ILeaderboardService
    {
        
        Task<IEnumerable<LeaderboardEntryDto>> GetTopUsersAsync(int limit = 20);

        
        Task<UserRankDto> GetUserRankAsync(Guid userId);

        /// <summary>Top N user theo Weekly XP trong một Lớp học (hiện tại).</summary>
        Task<IEnumerable<LeaderboardEntryDto>> GetClassroomWeeklyLeaderboardAsync(string classroomId, int limit = 20);
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
