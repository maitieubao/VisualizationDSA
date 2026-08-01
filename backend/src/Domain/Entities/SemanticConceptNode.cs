using System;
using System.Collections.Generic;

namespace VisualizationDSA.Domain.Entities
{
    
    
    
    
    
    public class SemanticConceptNode
    {
        public Guid Id { get; private set; }

        
        public string ConceptKey { get; private set; } = string.Empty;

        public string Title { get; private set; } = string.Empty;

        
        public string Category { get; private set; } = string.Empty;

        public string Description { get; private set; } = string.Empty;

        
        public double[] Embedding { get; private set; } = Array.Empty<double>();

        
        public double Importance { get; private set; }

        public DateTime CreatedAt { get; private set; }

        
        public virtual ICollection<KnowledgeEdge> OutgoingEdges { get; private set; } = new List<KnowledgeEdge>();
        public virtual ICollection<KnowledgeEdge> IncomingEdges { get; private set; } = new List<KnowledgeEdge>();

        private SemanticConceptNode() { } 

        public SemanticConceptNode(
            string conceptKey,
            string title,
            string category,
            string description,
            double[]? embedding = null,
            double importance = 0.0)
        {
            if (string.IsNullOrWhiteSpace(conceptKey))
                throw new ArgumentException("ConceptKey không được để trống.", nameof(conceptKey));
            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("Title không được để trống.", nameof(title));

            Id = Guid.NewGuid();
            ConceptKey = conceptKey;
            Title = title;
            Category = category ?? string.Empty;
            Description = description ?? string.Empty;
            Embedding = embedding ?? Array.Empty<double>();
            Importance = importance;
            CreatedAt = DateTime.UtcNow;
        }

        public void UpdateEmbedding(double[] embedding)
        {
            Embedding = embedding ?? throw new ArgumentNullException(nameof(embedding));
        }

        public void SetImportance(double importance) => Importance = importance;
    }
}
