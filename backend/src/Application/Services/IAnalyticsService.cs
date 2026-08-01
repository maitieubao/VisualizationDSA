using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace VisualizationDSA.Application.Services
{
    public interface IAnalyticsService
    {
        
        Task<SystemOverviewDto> GetSystemOverviewAsync();

        
        Task<UserAnalyticsDto> GetUserAnalyticsAsync(Guid userId);

        
        Task<IEnumerable<ModulePopularityDto>> GetModulePopularityAsync(int limit = 10);
    }

    public class SystemOverviewDto
    {
        public int      TotalUsers        { get; set; }
        public int      ActiveToday       { get; set; }  
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
        public double           QuizPassRate       { get; set; }  
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
