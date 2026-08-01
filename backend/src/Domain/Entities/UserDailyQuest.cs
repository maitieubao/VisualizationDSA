using System;

namespace VisualizationDSA.Domain.Entities
{
    public class UserDailyQuest
    {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }
        public DateTime Date { get; private set; } // Only date part is relevant (UTC)
        public string QuestType { get; private set; } = string.Empty; // e.g. "EARN_XP", "COMPLETE_QUIZ", "PERFECT_QUIZ", "COMPLETE_MODULE"
        public string Difficulty { get; private set; } = string.Empty; // "Easy", "Medium", "Hard"
        public string Description { get; private set; } = string.Empty;
        public int TargetValue { get; private set; }
        public int CurrentValue { get; private set; }
        public int GemsReward { get; private set; }
        
        public bool IsCompleted => CurrentValue >= TargetValue;
        public bool IsClaimed { get; private set; }

        public User User { get; private set; } = null!;

        protected UserDailyQuest() { }

        public UserDailyQuest(Guid userId, DateTime date, string questType, string difficulty, string description, int targetValue, int gemsReward)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            Date = date.Date;
            QuestType = questType;
            Difficulty = difficulty;
            Description = description;
            TargetValue = targetValue;
            CurrentValue = 0;
            GemsReward = gemsReward;
            IsClaimed = false;
        }

        public void AddProgress(int amount)
        {
            if (!IsCompleted)
            {
                CurrentValue += amount;
                if (CurrentValue > TargetValue)
                    CurrentValue = TargetValue;
            }
        }

        public void ClaimReward()
        {
            if (IsCompleted && !IsClaimed)
            {
                IsClaimed = true;
            }
        }
    }
}
