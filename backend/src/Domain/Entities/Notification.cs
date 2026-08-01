using System;

namespace VisualizationDSA.Domain.Entities
{
    public class Notification
    {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }
        public string Content { get; private set; } = string.Empty;
        public bool IsRead { get; private set; }
        public string LinkUrl { get; private set; } = string.Empty;
        public DateTime CreatedAt { get; private set; }

        public string Type { get; private set; } = "General";
        public Guid? RefId { get; private set; }
        public string? DeepLink { get; private set; }

        // Navigation property
        public User? User { get; private set; }

        // EF Constructor
        private Notification() { }

        public Notification(Guid userId, string content, string linkUrl, string type = "General", Guid? refId = null)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            Content = content;
            IsRead = false;
            LinkUrl = linkUrl;
            DeepLink = linkUrl;
            Type = type;
            RefId = refId;
            CreatedAt = DateTime.UtcNow;
        }

        public void MarkAsRead()
        {
            IsRead = true;
        }
    }
}
