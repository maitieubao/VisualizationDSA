using System;

namespace VisualizationDSA.Domain.Entities
{
    public class ContentReport
    {
        public Guid Id { get; private set; }
        public Guid NodeId { get; private set; }
        public Guid ReporterId { get; private set; }
        public string Reason { get; private set; } = string.Empty; // spam|offensive|wrong_info|other
        public string? Detail { get; private set; }
        public string Status { get; private set; } = "Pending"; // Pending/Resolved/Dismissed
        public DateTime CreatedAt { get; private set; }

        public virtual CustomNode Node { get; private set; } = null!;
        public virtual User Reporter { get; private set; } = null!;

        private ContentReport() { }

        public ContentReport(Guid nodeId, Guid reporterId, string reason, string? detail = null)
        {
            Id = Guid.NewGuid();
            NodeId = nodeId;
            ReporterId = reporterId;
            Reason = reason;
            Detail = detail;
            Status = "Pending";
            CreatedAt = DateTime.UtcNow;
        }

        public void Resolve(string newStatus)
        {
            if (newStatus == "Resolved" || newStatus == "Dismissed")
            {
                Status = newStatus;
            }
        }
    }
}
