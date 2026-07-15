using System;

namespace VisualizationDSA.Domain.Entities
{
    /// <summary>
    /// Knowledge edge — cạnh có hướng nối hai <see cref="SemanticConceptNode"/>,
    /// mô hình hóa quan hệ phụ thuộc cross-cutting giữa các khái niệm
    /// (ví dụ: "DependsOn", "Generalizes", "Implements", "Precedes").
    /// </summary>
    public class KnowledgeEdge
    {
        public Guid Id { get; private set; }

        public Guid SourceNodeId { get; private set; }
        public Guid TargetNodeId { get; private set; }

        /// <summary>Loại quan hệ: DependsOn, Generalizes, Implements, Precedes...</summary>
        public string RelationType { get; private set; } = string.Empty;

        /// <summary>Độ mạnh của quan hệ (0.0 – 1.0), dùng để xếp hạng truy vấn.</summary>
        public double Weight { get; private set; }

        public DateTime CreatedAt { get; private set; }

        // Navigation
        public virtual SemanticConceptNode SourceNode { get; private set; } = null!;
        public virtual SemanticConceptNode TargetNode { get; private set; } = null!;

        private KnowledgeEdge() { } // EF Core constructor

        public KnowledgeEdge(Guid sourceNodeId, Guid targetNodeId, string relationType, double weight = 1.0)
        {
            if (sourceNodeId == Guid.Empty)
                throw new ArgumentException("SourceNodeId không hợp lệ.", nameof(sourceNodeId));
            if (targetNodeId == Guid.Empty)
                throw new ArgumentException("TargetNodeId không hợp lệ.", nameof(targetNodeId));
            if (string.IsNullOrWhiteSpace(relationType))
                throw new ArgumentException("RelationType không được để trống.", nameof(relationType));

            Id = Guid.NewGuid();
            SourceNodeId = sourceNodeId;
            TargetNodeId = targetNodeId;
            RelationType = relationType;
            Weight = weight;
            CreatedAt = DateTime.UtcNow;
        }

        public void SetWeight(double weight) => Weight = weight;
    }
}
