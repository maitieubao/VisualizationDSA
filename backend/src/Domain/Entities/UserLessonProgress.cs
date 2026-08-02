using System;

namespace VisualizationDSA.Domain.Entities
{
    public class UserLessonProgress
    {
        public Guid UserId { get; private set; }
        public Guid LessonId { get; private set; }
        public string Status { get; private set; } = "NotStarted"; 
        public DateTime? CompletedAt { get; private set; }
        public int XPRewarded { get; private set; }
        public int LastActiveFrameIndex { get; private set; }
        public double LastScrollPercent { get; private set; }

        // Fields v4.0 thêm mới:
        public int? Stars { get; private set; }  // 1, 2, hoặc 3 sao
        public bool QuizPassed { get; private set; } = false;
        public bool LabPassed { get; private set; } = false;
        public bool LeetCodePassed { get; private set; } = false;
        public int? WeightedScore { get; private set; }  // 0 - 100%
        public string? Hint1UsedSteps { get; private set; }  // JSON array string: ["Quiz", "LeetCode"]

        public virtual User User { get; private set; } = null!;
        public virtual Lesson Lesson { get; private set; } = null!;

        private UserLessonProgress() { }

        public UserLessonProgress(Guid userId, Guid lessonId, string status = "InProgress")
        {
            UserId = userId;
            LessonId = lessonId;
            Status = status;
            CompletedAt = status == "Completed" ? DateTime.UtcNow : null;
            LastActiveFrameIndex = 0;
            LastScrollPercent = 0.0;
        }

        public void MarkAsCompleted(int xpRewarded)
        {
            Status = "Completed";
            CompletedAt = DateTime.UtcNow;
            XPRewarded = xpRewarded;
        }

        public void UpdateProgress(int frameIndex, double scrollPercent)
        {
            LastActiveFrameIndex = frameIndex;
            LastScrollPercent = scrollPercent;
            if (Status == "NotStarted")
            {
                Status = "InProgress";
            }
        }
    }
}
