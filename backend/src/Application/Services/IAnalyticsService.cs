using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace VisualizationDSA.Application.Services
{
    public interface IAnalyticsService
    {
        /// <summary>Tổng quan hệ thống — dùng cho admin dashboard.</summary>
        Task<SystemOverviewDto> GetSystemOverviewAsync();

        /// <summary>Thống kê cá nhân của user — dùng cho profile/gamification page.</summary>
        Task<UserAnalyticsDto> GetUserAnalyticsAsync(Guid userId);

        /// <summary>Top các module được học nhiều nhất.</summary>
        Task<IEnumerable<ModulePopularityDto>> GetModulePopularityAsync(int limit = 10);
    }

    public class SystemOverviewDto
    {
        public int      TotalUsers        { get; set; }
        public int      ActiveToday       { get; set; }  // users có activity hôm nay
        public int      TotalQuizAttempts { get; set; }
        public int      TotalXPAwarded    { get; set; }
        public double   AverageLevel      { get; set; }
        public DateTime GeneratedAt       { get; set; }
    }

    public class UserAnalyticsDto
    {
        public int              TotalXP            { get; set; }
        public int              CurrentLevel       { get; set; }
        public int              StreakDays         { get; set; }
        public int              TotalQuizAttempts  { get; set; }
        public int              QuizzesPassedCount { get; set; }
        public double           QuizPassRate       { get; set; }  // 0.0 – 1.0
        public int              ModulesCompleted   { get; set; }
        public int              BadgesEarned       { get; set; }
        public DateTime?        LastActivityDate   { get; set; }
        public List<string>     CompletedModules   { get; set; } = new();
    }

    public class ModulePopularityDto
    {
        public string ModuleId        { get; set; } = string.Empty;
        public int    CompletionCount { get; set; }
    }
}
