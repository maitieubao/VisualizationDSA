using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Interfaces;

namespace VisualizationDSA.Infrastructure.Services
{
    public class GamificationService : IGamificationService
    {
        private readonly IUnitOfWork _unitOfWork;

        public GamificationService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task AwardXPAsync(Guid userId, int amount, string reason)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null) throw new KeyNotFoundException($"User {userId} not found");

            user.AwardXP(amount);
            user.RecordActivity();  // ✅ FIX 3.4: cập nhật streak khi có hoạt động
            await _unitOfWork.CommitAsync();
        }

        public async Task CompleteModuleAsync(Guid userId, string moduleId)
        {
            var user = await _unitOfWork.Users.GetByIdWithDetailsAsync(userId);
            if (user == null) throw new KeyNotFoundException($"User {userId} not found");

            // Tránh thêm module đã tồn tại (idempotent)
            if (!user.LearningProgresses.Any(lp => lp.ModuleId == moduleId))
            {
                user.CompleteModule(moduleId);
                user.RecordActivity();  // ✅ FIX 3.4: cập nhật streak
            }
            await _unitOfWork.CommitAsync();
        }

        public async Task<IEnumerable<Badge>> CheckAndAwardBadgesAsync(Guid userId)
        {
            var user = await _unitOfWork.Users.GetByIdWithDetailsAsync(userId);
            if (user == null) throw new KeyNotFoundException("User not found");

            var newBadges  = new List<Badge>();
            var allBadges  = await _unitOfWork.Badges.GetAllAsync();

            foreach (var badge in allBadges)
            {
                // Bỏ qua nếu user đã có badge này
                if (user.UserBadges.Any(ub => ub.BadgeId == badge.Id))
                    continue;

                if (ShouldAwardBadge(user, badge))
                {
                    // ✅ FIX 2.3: Chỉ thêm UserBadge mới — KHÔNG re-add User đã tồn tại
                    var userBadge = new UserBadge(userId, badge.Id);
                    user.UserBadges.Add(userBadge);
                    newBadges.Add(badge);
                }
            }

            if (newBadges.Count > 0)
            {
                await _unitOfWork.CommitAsync();
            }

            return newBadges;
        }

        public async Task<UserProgressStats> GetUserProgressAsync(Guid userId)
        {
            var progressModel = await _unitOfWork.Users.GetUserProgressDomainModelAsync(userId);
            if (progressModel == null) throw new KeyNotFoundException($"User {userId} not found");
            return CalculateUserProgressStats(progressModel);
        }

        public UserProgressStats CalculateUserProgressStats(UserProgressDomainModel progressModel)
        {
            // ✅ A2 FIX: Dùng lookup table đồng bộ với XPEngine.ts
            var currentLevelXp = XpThresholdForLevel(progressModel.CurrentLevel);
            var nextLevelXp    = XpThresholdForLevel(progressModel.CurrentLevel + 1);

            // Xử lý edge case level 8 (Legend) — không có next level
            if (nextLevelXp == int.MaxValue)
            {
                return new UserProgressStats
                {
                    TotalXP              = progressModel.TotalXP,
                    CurrentLevel         = progressModel.CurrentLevel,
                    XpToNextLevel        = 0,
                    LevelProgressPercent = 100,
                    BadgesEarned         = progressModel.Badges.Count,
                    ModulesCompleted     = progressModel.CompletedModuleIds.Count,
                    CurrentStreak        = progressModel.StreakDays
                };
            }

            var xpInCurrentLevel = progressModel.TotalXP - currentLevelXp;
            var xpNeeded         = nextLevelXp - currentLevelXp;
            var progressPercent  = Math.Min(100, (int)((double)xpInCurrentLevel / xpNeeded * 100));

            return new UserProgressStats
            {
                TotalXP              = progressModel.TotalXP,
                CurrentLevel         = progressModel.CurrentLevel,
                XpToNextLevel        = nextLevelXp - progressModel.TotalXP,
                LevelProgressPercent = progressPercent,
                BadgesEarned         = progressModel.Badges.Count,
                ModulesCompleted     = progressModel.CompletedModuleIds.Count,
                CurrentStreak        = progressModel.StreakDays
            };
        }

        private bool ShouldAwardBadge(User user, Badge badge)
        {
            // Simple criteria checking based on badge name
            return badge.Name switch
            {
                "First Steps" => user.QuizAttempts.Count >= 1,
                "Sorting Wizard" => user.LearningProgresses.Any(lp => lp.ModuleId.Contains("sort")),
                "OOP Guru" => user.LearningProgresses.Any(lp => lp.ModuleId.Contains("oop")),
                "SOLID Master" => user.LearningProgresses.Any(lp => lp.ModuleId.Contains("solid")),
                "Pattern Hunter" => user.LearningProgresses.Any(lp => lp.ModuleId.Contains("pattern")),
                "Streak Keeper" => user.StreakDays >= 7,
                "System Architect" => user.LearningProgresses.Any(lp => lp.ModuleId.Contains("system")),
                "DSA Champion" => user.CurrentLevel >= 5,
                _ => false
            };
        }

        /// <summary>
        /// ✅ A2 FIX: Đồng bộ với XPEngine.ts LEVELS lookup table.
        /// Trả về tổng XP cần để BẮT ĐẦU level đó.
        /// Level 1=0, 2=100, 3=300, 4=600, 5=1000, 6=1500, 7=2200, 8=3000, 9+=Infinity
        /// </summary>
        private static int XpThresholdForLevel(int level)
        {
            return level switch
            {
                1 => 0,
                2 => 100,
                3 => 300,
                4 => 600,
                5 => 1000,
                6 => 1500,
                7 => 2200,
                8 => 3000,
                _ => int.MaxValue   // level 9+ không tồn tại → Grandmaster giữ nguyên
            };
        }
    }
}
