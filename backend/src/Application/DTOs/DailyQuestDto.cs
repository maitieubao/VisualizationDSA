using System;

namespace VisualizationDSA.Application.DTOs
{
    public class DailyQuestDto
    {
        public Guid Id { get; set; }
        public string QuestType { get; set; } = string.Empty;
        public string Difficulty { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int TargetValue { get; set; }
        public int CurrentValue { get; set; }
        public int GemsReward { get; set; }
        public bool IsCompleted { get; set; }
        public bool IsClaimed { get; set; }
    }
}
