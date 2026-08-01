using System;
using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Domain.Entities
{
    public class QuestTemplate
    {
        [Key]
        public Guid Id { get; private set; }

        public string QuestType { get; private set; }
        
        public string Difficulty { get; private set; }
        
        public string Description { get; private set; }
        
        public int TargetValue { get; private set; }
        
        public int GemsReward { get; private set; }

        public bool IsActive { get; private set; }

        public QuestTemplate(string questType, string difficulty, string description, int targetValue, int gemsReward)
        {
            Id = Guid.NewGuid();
            QuestType = questType;
            Difficulty = difficulty;
            Description = description;
            TargetValue = targetValue;
            GemsReward = gemsReward;
            IsActive = true;
        }

        // For EF Core
        protected QuestTemplate() { }
        
        public void SetActive(bool isActive)
        {
            IsActive = isActive;
        }
    }
}
