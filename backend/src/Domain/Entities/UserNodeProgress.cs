using System;

namespace VisualizationDSA.Domain.Entities
{
    /// <summary>
    /// F9 (FR-2.10) — Tiến độ node Learning Path của từng người dùng.
    /// Status: 0 = Locked, 1 = Open (đang học), 2 = Passed. unique (UserId, NodeId).
    /// </summary>
    public class UserNodeProgress
    {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }
        public Guid NodeId { get; private set; }
        public int Status { get; private set; }
        public int Stars { get; private set; }
        public int? NodeScore { get; private set; }
        public DateTime? UnlockedAt { get; private set; }
        public DateTime? PassedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        public const int StatusLocked = 0;
        public const int StatusOpen = 1;
        public const int StatusPassed = 2;

        public virtual User User { get; private set; } = null!;
        public virtual LearningPathNode Node { get; private set; } = null!;

        private UserNodeProgress() { }

        public UserNodeProgress(
            Guid userId,
            Guid nodeId,
            int status = StatusOpen,
            int stars = 0,
            int? nodeScore = null,
            DateTime? unlockedAt = null)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            NodeId = nodeId;
            Status = status;
            Stars = stars;
            NodeScore = nodeScore;
            UnlockedAt = status == StatusOpen ? (unlockedAt ?? DateTime.UtcNow) : unlockedAt;
            PassedAt = status == StatusPassed ? DateTime.UtcNow : null;
            UpdatedAt = DateTime.UtcNow;
        }

        /// <summary>Mở khóa node (không hạ cấp node đã pass).</summary>
        public void Open()
        {
            if (Status == StatusPassed) return;
            Status = StatusOpen;
            if (!UnlockedAt.HasValue) UnlockedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        /// <summary>Đánh dấu pass node — stars/score chỉ tăng, không bao giờ giảm.</summary>
        public void MarkPassed(int stars, int? nodeScore)
        {
            Status = StatusPassed;
            PassedAt = DateTime.UtcNow;
            Stars = Math.Max(Stars, Math.Clamp(stars, 0, 3));
            if (nodeScore.HasValue)
            {
                NodeScore = NodeScore.HasValue ? Math.Max(NodeScore.Value, nodeScore.Value) : nodeScore.Value;
            }
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
