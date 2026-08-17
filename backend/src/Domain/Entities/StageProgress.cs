using System;

namespace VisualizationDSA.Domain.Entities
{
    /// <summary>
    /// F8 (FR-4.11, FR-4.3) — Practice Ladder 3 bậc gắn theo từng bài học.
    /// Mỗi người dùng có tối đa 1 bản ghi cho mỗi (LessonId, Stage) — unique (UserId, LessonId, Stage).
    /// Status: 0 = Locked, 1 = Open, 2 = Passed.
    /// </summary>
    public class StageProgress
    {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }
        public Guid LessonId { get; private set; }
        public int Stage { get; private set; }
        public int Status { get; private set; }
        public int? BestScore { get; private set; }
        public DateTime? PassedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        public const int StatusLocked = 0;
        public const int StatusOpen = 1;
        public const int StatusPassed = 2;

        public virtual User User { get; private set; } = null!;
        public virtual Lesson Lesson { get; private set; } = null!;

        private StageProgress() { }

        public StageProgress(Guid userId, Guid lessonId, int stage, int status = StatusOpen, int? bestScore = null)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            LessonId = lessonId;
            Stage = stage;
            Status = status;
            BestScore = bestScore;
            PassedAt = status == StatusPassed ? DateTime.UtcNow : null;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Open()
        {
            if (Status == StatusPassed) return;
            Status = StatusOpen;
            UpdatedAt = DateTime.UtcNow;
        }

        public void MarkPassed(int? bestScore)
        {
            Status = StatusPassed;
            PassedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
            if (bestScore.HasValue)
            {
                BestScore = BestScore.HasValue ? Math.Max(BestScore.Value, bestScore.Value) : bestScore.Value;
            }
        }
    }
}
