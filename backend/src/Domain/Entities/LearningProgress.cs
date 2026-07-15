using System;

namespace VisualizationDSA.Domain.Entities
{
    public class LearningProgress
    {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }
        public string ModuleId { get; private set; } // e.g., "bubble-sort", "oop-encapsulation"
        public DateTime CompletedAt { get; private set; }
        public int TimeSpentMinutes { get; private set; }
        
        public virtual User User { get; private set; }

        private LearningProgress() { }

        public LearningProgress(Guid userId, string moduleId, int timeSpentMinutes = 0)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            ModuleId = moduleId;
            TimeSpentMinutes = timeSpentMinutes;
            CompletedAt = DateTime.UtcNow;
        }

        public void UpdateTimeSpent(int minutes)
        {
            TimeSpentMinutes = minutes;
        }
    }
}
