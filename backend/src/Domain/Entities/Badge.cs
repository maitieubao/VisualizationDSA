using System;
using System.Collections.Generic;

namespace VisualizationDSA.Domain.Entities
{
    public class Badge
    {
        public Guid Id { get; private set; }
        public string Name { get; private set; }
        public string Description { get; private set; }
        public string Icon { get; private set; }
        public string Color { get; private set; }
        public string Criteria { get; private set; } 
        
        public virtual ICollection<UserBadge> UserBadges { get; private set; }

        private Badge() { }

        public Badge(string name, string description, string icon, string color, string criteria)
        {
            Id = Guid.NewGuid();
            Name = name;
            Description = description;
            Icon = icon;
            Color = color;
            Criteria = criteria;
            UserBadges = new List<UserBadge>();
        }
    }

    public class UserBadge
    {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }
        public Guid BadgeId { get; private set; }
        public DateTime EarnedAt { get; private set; }
        
        public virtual User User { get; private set; }
        public virtual Badge Badge { get; private set; }

        private UserBadge() { }

        public UserBadge(Guid userId, Guid badgeId)
        {
            // GM-007: KHÔNG set Id client-side — để EF sinh Guid tại SaveChanges (Guid key
            // ValueGeneratedOnAdd). Trước đây set sẵn Guid → EF tưởng entity đã tồn tại trong DB
            // (state Modified thay vì Added) → INSERT biến thành UPDATE 0 dòng → DbUpdateException.
            UserId = userId;
            BadgeId = badgeId;
            EarnedAt = DateTime.UtcNow;
        }
    }
}
