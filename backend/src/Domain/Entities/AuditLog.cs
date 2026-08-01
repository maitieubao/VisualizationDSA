using System;

namespace VisualizationDSA.Domain.Entities
{
    public class AuditLog
    {
        public Guid Id { get; private set; }
        public string Action { get; private set; } = string.Empty; 
        public Guid ActorId { get; private set; }
        public string ActorName { get; private set; } = string.Empty;
        public Guid? TargetId { get; private set; }
        public string Details { get; private set; } = string.Empty;
        public DateTime CreatedAt { get; private set; }

        private AuditLog() { }

        public AuditLog(string action, Guid actorId, string actorName, Guid? targetId, string details)
        {
            Id = Guid.NewGuid();
            Action = action;
            ActorId = actorId;
            ActorName = actorName;
            TargetId = targetId;
            Details = details;
            CreatedAt = DateTime.UtcNow;
        }
    }
}
