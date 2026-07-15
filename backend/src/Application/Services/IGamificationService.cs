using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Application.Services
{
    public interface IGamificationService
    {
        Task AwardXPAsync(Guid userId, int amount, string reason);
        Task CompleteModuleAsync(Guid userId, string moduleId);
        Task<IEnumerable<Badge>> CheckAndAwardBadgesAsync(Guid userId);
        Task<UserProgressStats> GetUserProgressAsync(Guid userId);
        UserProgressStats CalculateUserProgressStats(UserProgressDomainModel progressModel);
    }

    public class UserProgressStats
    {
        public int TotalXP { get; set; }
        public int CurrentLevel { get; set; }
        public int XpToNextLevel { get; set; }
        public int LevelProgressPercent { get; set; }
        public int BadgesEarned { get; set; }
        public int ModulesCompleted { get; set; }
        public int CurrentStreak { get; set; }
    }
}
