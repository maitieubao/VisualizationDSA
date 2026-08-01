using System;

namespace VisualizationDSA.Domain.Entities
{
    
    
    
    
    
    public class KnowledgeEdge
    {
        public Guid Id { get; private set; }

        public Guid SourceNodeId { get; private set; }
        public Guid TargetNodeId { get; private set; }

        
        public string RelationType { get; private set; } = string.Empty;

        
        public double Weight { get; private set; }

        public DateTime CreatedAt { get; private set; }

        
        public virtual SemanticConceptNode SourceNode { get; private set; } = null!;
        public virtual SemanticConceptNode TargetNode { get; private set; } = null!;

        private KnowledgeEdge() { } 

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
