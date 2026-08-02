using System;

namespace VisualizationDSA.Domain.Entities
{
    public class UserInventory
    {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }
        public string ItemId { get; private set; } = string.Empty;
        public string ItemType { get; private set; } = string.Empty;
        public DateTime PurchasedAt { get; private set; }

        public User User { get; private set; } = null!;

        // Default constructor for EF Core
        protected UserInventory() { }

        public UserInventory(Guid userId, string itemId, string itemType)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            ItemId = itemId;
            ItemType = itemType;
            PurchasedAt = DateTime.UtcNow;
        }
    }
}
