using System;
using System.Collections.Generic;

namespace VisualizationDSA.Domain.Entities
{
    public class UserProgressDomainModel
    {
        public int TotalXP { get; set; }
        public int CurrentLevel { get; set; }
        public int StreakDays { get; set; }
        public bool IsPremium { get; set; }
        public List<string> CompletedModuleIds { get; set; } = new();
        public List<UserBadgeDomainModel> Badges { get; set; } = new();
    }

    public class UserBadgeDomainModel
    {
        public Guid BadgeId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public DateTime EarnedAt { get; set; }
    }
}
