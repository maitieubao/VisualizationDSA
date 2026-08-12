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

        /// <summary>
        /// GM-004: cộng XP + kiểm tra/trao huy hiệu trong 1 transaction duy nhất (trước đây 2 transaction
        /// rời → retry XP gấp đôi / badge mất khi commit giữa chừng lỗi).
        /// Idempotent theo Idempotency-Key (user + ngày + key): gọi lặp với cùng key → replay kết quả cũ,
        /// không cộng XP lần 2. Khi thành công sẽ broadcast real-time bảng xếp hạng (GM-006).
        /// </summary>
        Task<XpAwardResult> AwardXpAndCheckBadgesAsync(Guid userId, int amount, string reason, string? idempotencyKey);

        UserProgressStats CalculateUserProgressStats(UserProgressDomainModel progressModel);
    }

    public class XpAwardResult
    {
        public int TotalXp { get; set; }
        public int CurrentLevel { get; set; }
        public List<Badge> NewBadges { get; set; } = new();

        /// <summary>True khi request này là replay của 1 Idempotency-Key đã xử lý trước đó (không cộng XP).</summary>
        public bool Replayed { get; set; }
    }

    /// <summary>
    /// GM-006: broker broadcast bảng xếp hạng — GamificationService publish SAU khi commit;
    /// LeaderboardHub (WebApi) subscribe và đẩy real-time cho client. Không client đang kết nối → no-op.
    /// </summary>
    public static class LeaderboardBroadcastBroker
    {
        public static event Func<LeaderboardUpdateMessage, Task>? Broadcast;

        public static Task PublishAsync(LeaderboardUpdateMessage message)
        {
            var handler = Broadcast;
            return handler == null ? Task.CompletedTask : handler(message);
        }
    }

    public sealed class LeaderboardUpdateMessage
    {
        public Guid UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public int TotalXp { get; set; }
        public int CurrentLevel { get; set; }
        public int Rank { get; set; }
        public int XpGained { get; set; }
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
