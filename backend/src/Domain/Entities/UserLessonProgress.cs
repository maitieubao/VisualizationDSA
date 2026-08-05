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
        public bool HasWatchedVisualizer { get; private set; }
        public int? QuizScore { get; private set; }
        public int BestScore { get; private set; }
        public bool CodelabCompleted { get; private set; }

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
            XPRewarded = Math.Max(XPRewarded, xpRewarded);
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

        public void RecordVisualizerWatched()
        {
            HasWatchedVisualizer = true;
        }

        /// <summary>Ghi nhận lượt làm quiz — BestScore chỉ tăng, không bao giờ giảm.</summary>
        public void RecordQuizAttempt(int score)
        {
            QuizScore = score;
            if (score > BestScore)
            {
                BestScore = score;
            }
        }

        public void RecordCodelabCompleted()
        {
            CodelabCompleted = true;
        }
    }
}
