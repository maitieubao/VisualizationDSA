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

        
        public User? User { get; private set; }

        
        private Notification() { }

        public Notification(Guid userId, string content, string linkUrl)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            Content = content;
            IsRead = false;
            LinkUrl = linkUrl;
            CreatedAt = DateTime.UtcNow;
        }

        public void MarkAsRead()
        {
            IsRead = true;
        }
    }
}
