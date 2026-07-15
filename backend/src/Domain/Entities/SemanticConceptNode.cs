using System;
using System.Collections.Generic;

namespace VisualizationDSA.Domain.Entities
{
    /// <summary>
    /// Semantic concept node — đỉnh trong đồ thị tri thức (Graph RAG) mô hình hóa
    /// một khái niệm software engineering (OOP, DSA, SOLID, System Design...).
    /// Mỗi node mang một vector embedding để phục vụ truy vấn ngữ nghĩa.
    /// </summary>
    public class SemanticConceptNode
    {
        public Guid Id { get; private set; }

        /// <summary>Khóa định danh ổn định, ví dụ: "solid.srp", "dsa.binary-search".</summary>
        public string ConceptKey { get; private set; } = string.Empty;

        public string Title { get; private set; } = string.Empty;

        /// <summary>Nhóm khái niệm: OOP, DSA, SOLID, SystemDesign, DesignPattern...</summary>
        public string Category { get; private set; } = string.Empty;

        public string Description { get; private set; } = string.Empty;

        /// <summary>Vector embedding ngữ nghĩa — lưu dưới dạng double precision[] trong PostgreSQL.</summary>
        public double[] Embedding { get; private set; } = Array.Empty<double>();

        /// <summary>Trọng số tầm quan trọng của khái niệm trong đồ thị (PageRank-like).</summary>
        public double Importance { get; private set; }

        public DateTime CreatedAt { get; private set; }

        // Navigation — các cạnh xuất phát từ / trỏ tới node này.
        public virtual ICollection<KnowledgeEdge> OutgoingEdges { get; private set; } = new List<KnowledgeEdge>();
        public virtual ICollection<KnowledgeEdge> IncomingEdges { get; private set; } = new List<KnowledgeEdge>();

        private SemanticConceptNode() { } // EF Core constructor

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
