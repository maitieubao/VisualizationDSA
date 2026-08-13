using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Interfaces;
using VisualizationDSA.Domain.Strategies;

namespace VisualizationDSA.Infrastructure.Services
{
    public class GamificationService : IGamificationService
    {
        private readonly IUnitOfWork _unitOfWork;
        // C2: notification level-up + badge award — gửi SAU commit, lỗi notification không làm hỏng request.
        private readonly INotificationService? _notificationService;

	public GamificationService(IUnitOfWork unitOfWork, INotificationService? notificationService = null)
        {
            _unitOfWork = unitOfWork;
            _notificationService = notificationService;
        }

        // GM-004: ledger idempotency — (userId|ngày|Idempotency-Key) → kết quả đã cấp.
        // Static để replay hoạt động xuyên instance/service (cùng tiến trình server).
        private static readonly ConcurrentDictionary<string, XpAwardResult> XpGrantLedger = new();
        private const int XpGrantLedgerMax = 50_000;

        public async Task AwardXPAsync(Guid userId, int amount, string reason)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null) throw new KeyNotFoundException($"User {userId} not found");

            user.AwardXP(amount);
            user.RecordActivity();  // cập nhật streak + LastActivityDate (server là source of truth — GM-008)
            await _unitOfWork.CommitAsync();
        }

        public async Task CompleteModuleAsync(Guid userId, string moduleId)
        {
            var user = await _unitOfWork.Users.GetByIdWithDetailsAsync(userId);
            if (user == null) throw new KeyNotFoundException($"User {userId} not found");

            // Chống cộng trùng khi client bấm lại cùng module (check-then-act trong 1 request).
            if (!user.LearningProgresses.Any(lp => lp.ModuleId == moduleId))
            {
                user.CompleteModule(moduleId);
                user.RecordActivity();  // cập nhật streak
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
                if (user.UserBadges.Any(ub => ub.BadgeId == badge.Id))
                    continue;

                if (ShouldAwardBadge(user, badge))
                {
                    var userBadge = new UserBadge(userId, badge.Id);
                    user.UserBadges.Add(userBadge);
                    newBadges.Add(badge);
                }
            }

            if (newBadges.Count > 0)
            {
                try
                {
                    await _unitOfWork.CommitAsync();
                }
                catch (DbUpdateException)
                {
                    // GM-007: 2 request song song cùng trao 1 badge → unique (UserId, BadgeId) chặn kẻ thua.
                    // Không phải lỗi: badge đã được request kia trao — trả về rỗng, không throw 500.
                    return new List<Badge>();
                }            }

            return newBadges;
        }

        public async Task<XpAwardResult> AwardXpAndCheckBadgesAsync(
            Guid userId, int amount, string reason, string? idempotencyKey)
        {
            // GM-004: idempotent theo (user, ngày, Idempotency-Key) — retry/double-sync không cộng XP 2 lần.
            string? dedupKey = null;
            if (!string.IsNullOrWhiteSpace(idempotencyKey))
            {
                dedupKey = $"{userId:N}|{DateTime.UtcNow:yyyy-MM-dd}|{idempotencyKey.Trim()}";
                if (XpGrantLedger.TryGetValue(dedupKey, out var cached))
                {
                    cached.Replayed = true;
                    return cached;
                }
            }

            var user = await _unitOfWork.Users.GetByIdWithDetailsAsync(userId);
            if (user == null) throw new KeyNotFoundException($"User {userId} not found");

            // GM-004: cộng XP + trao badge gom 1 transaction — commit 1 lần duy nhất.
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // C2: ghi nhận level TRƯỚC khi cộng XP để phát hiện level-up sau commit.
                var oldLevel = user.CurrentLevel;
                user.AwardXP(amount);
                user.RecordActivity();
                var newBadges = await AwardEligibleBadgesAsync(user);
                await _unitOfWork.CommitAsync();
                await _unitOfWork.CommitTransactionAsync();

                var result = new XpAwardResult
                {
                    TotalXp = user.TotalXP,
                    CurrentLevel = user.CurrentLevel,
                    NewBadges = newBadges
                };

                if (dedupKey != null)
                {
                    PruneLedger();
                    XpGrantLedger[dedupKey] = result;
                }

                // GM-006: broadcast real-time SAU commit — bảng xếp hạng không còn là dead code.
                try
                {
                    var rank = await _unitOfWork.Users.GetUserRankAsync(userId);
                    await LeaderboardBroadcastBroker.PublishAsync(new LeaderboardUpdateMessage
                    {
                        UserId = userId,
                        Username = user.Username,
                        TotalXp = user.TotalXP,
                        CurrentLevel = user.CurrentLevel,
                        Rank = rank,
                        XpGained = amount
                    });
                }
                catch (Exception broadcastEx)
                {
                    // Broadcast thất bại không được làm hỏng request cấp XP đã commit.
                    Serilog.Log.Warning(broadcastEx, "Không broadcast được cập nhật bảng xếp hạng (XP đã lưu).");
                }

                // C2: thông báo level-up + badge award (chỉ khi thực sự xảy ra, SAU commit).
                await NotifyLevelUpAndBadgesAsync(user, oldLevel, newBadges);

                return result;
            }
            catch (DbUpdateException)
            {
                // GM-007: race trao badge trùng (UserId, BadgeId) — rollback toàn bộ (XP + badge),
                // trả trạng thái hiện tại của user (kẻ thua không được cộng 2 lần).
                await _unitOfWork.RollbackTransactionAsync();
                var fresh = await _unitOfWork.Users.GetByIdWithDetailsAsync(userId, track: false);
                var current = new XpAwardResult
                {
                    TotalXp = fresh?.TotalXP ?? user.TotalXP,
                    CurrentLevel = fresh?.CurrentLevel ?? user.CurrentLevel
                };
                if (dedupKey != null)
                    XpGrantLedger[dedupKey] = current;
                return current;
            }
            catch
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }

        public async Task<UserProgressStats> GetUserProgressAsync(Guid userId)
        {
            var progressModel = await _unitOfWork.Users.GetUserProgressDomainModelAsync(userId);
            if (progressModel == null) throw new KeyNotFoundException($"User {userId} not found");
            return CalculateUserProgressStats(progressModel);
        }

        public UserProgressStats CalculateUserProgressStats(UserProgressDomainModel progressModel)
        {
            // GM-019: ngưỡng level dùng chung GamificationLevelTable — 1 nguồn duy nhất.
            var currentLevelXp = GamificationLevelTable.XpThresholdForLevel(progressModel.CurrentLevel);
            var nextLevelXp    = GamificationLevelTable.XpThresholdForLevel(progressModel.CurrentLevel + 1);

            // Level cao nhất (ngoài bảng → int.MaxValue): không còn XP để lên level nữa.
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

        private async Task<List<Badge>> AwardEligibleBadgesAsync(User user)
        {
            var newBadges = new List<Badge>();
            var allBadges = await _unitOfWork.Badges.GetAllAsync();

            foreach (var badge in allBadges)
            {
                if (user.UserBadges.Any(ub => ub.BadgeId == badge.Id))
                    continue;

                if (ShouldAwardBadge(user, badge))
                {
                    user.UserBadges.Add(new UserBadge(user.Id, badge.Id));
                    newBadges.Add(badge);
                }
            }

            return newBadges;
        }

        // GM-045: ShouldAwardBadge đọc Criteria THẬT của badge (định dạng seed: { 'quizCompleted': 1 })
        // thay vì switch theo Name bỏ qua Criteria — test trước đây pass giả vì khai báo Criteria khác source.
        private static readonly Regex CriteriaPattern = new(
            @"'(\w+)'\s*:\s*(\d+)",
            RegexOptions.Compiled);

        private bool ShouldAwardBadge(User user, Badge badge)
        {
            if (string.IsNullOrWhiteSpace(badge.Criteria))
                return false;

            var anyCriterion = false;
            foreach (Match match in CriteriaPattern.Matches(badge.Criteria))
            {
                anyCriterion = true;
                var key = match.Groups[1].Value;
                if (!int.TryParse(match.Groups[2].Value, out var required))
                    return false;

                var actual = ResolveCriteriaValue(user, key);
                if (actual == null || actual.Value < required)
                    return false;
            }

            return anyCriterion;
        }

        private static int? ResolveCriteriaValue(User user, string key) => key switch
        {
            "quizCompleted"      => user.QuizAttempts.Count,
            "sortingCompleted"   => user.LearningProgresses.Count(lp => lp.ModuleId.Contains("sort", StringComparison.OrdinalIgnoreCase)),
            "oopCompleted"       => user.LearningProgresses.Count(lp => lp.ModuleId.Contains("oop", StringComparison.OrdinalIgnoreCase)),
            "solidCompleted"     => user.LearningProgresses.Count(lp => lp.ModuleId.Contains("solid", StringComparison.OrdinalIgnoreCase)),
            "patternsCompleted"  => user.LearningProgresses.Count(lp => lp.ModuleId.Contains("pattern", StringComparison.OrdinalIgnoreCase)),
            "streakDays"         => user.StreakDays,
            "systemCompleted"    => user.LearningProgresses.Count(lp => lp.ModuleId.Contains("system", StringComparison.OrdinalIgnoreCase)),
            "level"              => user.CurrentLevel,
            _                    => null
        };

        /// <summary>Dọn ledger quá lớn: chỉ giữ entries của ngày hôm nay.</summary>
        private static void PruneLedger()
        {
            if (XpGrantLedger.Count < XpGrantLedgerMax)
                return;

            var today = DateTime.UtcNow.ToString("yyyy-MM-dd");
            foreach (var kvp in XpGrantLedger)
            {
                if (!kvp.Key.Contains(today, StringComparison.Ordinal))
                    XpGrantLedger.TryRemove(kvp.Key, out _);
            }
        }

        /// <summary>
        /// C2: gửi notification level-up + badge award SAU khi XP/badge đã commit.
        /// Lỗi notification KHÔNG được làm hỏng request cấp XP đã thành công.
        /// </summary>
        private async Task NotifyLevelUpAndBadgesAsync(User user, int oldLevel, List<Badge> newBadges)
        {
            if (_notificationService == null)
                return;

            // Level-up: chỉ gửi khi level thực sự tăng (có thể nhảy nhiều bậc).
            if (user.CurrentLevel > oldLevel)
            {
                try
                {
                    await _notificationService.NotifyLevelUpAsync(
                        user.Id, user.Username, oldLevel, user.CurrentLevel, user.TotalXP);
                }
                catch (Exception ex)
                {
                    Serilog.Log.Warning(ex, "Không gửi được notification level-up cho user {UserId}.", user.Id);
                }
            }

            // Badge mới: gửi từng badge một (toast gamification riêng).
            foreach (var badge in newBadges)
            {
                try
                {
                    await _notificationService.NotifyBadgeAwardedAsync(
                        user.Id, user.Username, badge.Name, badge.Description);
                }
                catch (Exception ex)
                {
                    Serilog.Log.Warning(ex, "Không gửi được notification badge '{Badge}' cho user {UserId}.", badge.Name, user.Id);
                }
            }
        }
    }
}
