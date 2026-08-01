using System;

namespace VisualizationDSA.Domain.Entities
{
    public class UserModuleItemProgress
    {
        public Guid UserId { get; private set; }
        public Guid ModuleItemId { get; private set; }
        public int AttemptNumber { get; private set; }
        
        public string Status { get; private set; } = "NotStarted"; 
        public int LastActiveFrameIndex { get; private set; }
        public double LastScrollPercent { get; private set; }
        public double ProgressPercent { get; private set; }
        public DateTime? CompletedAt { get; private set; }
        public int? Score { get; private set; }
        public DateTime LastAccessedAt { get; private set; }

        public virtual User User { get; private set; } = null!;
        public virtual ModuleItem ModuleItem { get; private set; } = null!;

        private UserModuleItemProgress() { }

        public UserModuleItemProgress(Guid userId, Guid moduleItemId, int attemptNumber = 1)
        {
            UserId = userId;
            ModuleItemId = moduleItemId;
            AttemptNumber = attemptNumber;
            Status = "NotStarted";
            LastAccessedAt = DateTime.UtcNow;
            ProgressPercent = 0;
        }

        public void UpdateProgress(int activeFrame, double scrollPercent, bool isCompleted, int? score = null)
        {
            LastActiveFrameIndex = activeFrame;
            LastScrollPercent = scrollPercent;
            LastAccessedAt = DateTime.UtcNow;
            
            if (score.HasValue)
            {
                Score = score;
            }

            if (Status == "NotStarted")
            {
                Status = "InProgress";
            }

            if (isCompleted && Status != "Completed")
            {
                Status = "Completed";
                CompletedAt = DateTime.UtcNow;
                ProgressPercent = 100;
            }
            else if (isCompleted)
            {
                ProgressPercent = 100;
            }
            else
            {
                ProgressPercent = scrollPercent;
            }
        }

        public void SetProgressPercent(double percent)
        {
            ProgressPercent = Math.Clamp(percent, 0, 100);
        }
    }
}