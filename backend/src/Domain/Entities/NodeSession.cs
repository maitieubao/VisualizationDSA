using System;

namespace VisualizationDSA.Domain.Entities
{
    /// <summary>
    /// F9 (FR-2.10) — Session học 30 phút cho một node Learning Path.
    /// Trong session còn hạn, enter lại KHÔNG trừ thêm Tim. unique (UserId, NodeId) —
    /// hàng rào atomic chống race trừ Tim 2 lần khi 2 request song song cùng enter 1 node.
    /// </summary>
    public class NodeSession
    {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }
        public Guid NodeId { get; private set; }
        public DateTime StartedAt { get; private set; }
        public DateTime ExpiresAt { get; private set; }

        public virtual User User { get; private set; } = null!;
        public virtual LearningPathNode Node { get; private set; } = null!;

        private NodeSession() { }

        public NodeSession(Guid userId, Guid nodeId, DateTime startedAt, DateTime expiresAt)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            NodeId = nodeId;
            StartedAt = startedAt;
            ExpiresAt = expiresAt;
        }

        /// <summary>Gia hạn session (khi session cũ đã hết hạn).</summary>
        public void Renew(DateTime startedAt, DateTime expiresAt)
        {
            StartedAt = startedAt;
            ExpiresAt = expiresAt;
        }
    }
}
