using System;
using System.Collections.Generic;

namespace VisualizationDSA.Domain.Entities
{
    /// <summary>
    /// F9 (FR-2.10) — Learning Path (lộ trình học).
    /// Một lộ trình gồm nhiều node tuần tự, mở khóa lần lượt theo thứ tự OrderIndex.
    /// </summary>
    public class LearningPath
    {
        public Guid Id { get; private set; }
        public string Title { get; private set; } = string.Empty;
        public string? Description { get; private set; }
        public DateTime CreatedAt { get; private set; }

        public virtual ICollection<LearningPathNode> Nodes { get; private set; }

        private LearningPath() { }

        public LearningPath(string title, string? description = null)
        {
            Id = Guid.NewGuid();
            Title = string.IsNullOrWhiteSpace(title)
                ? throw new ArgumentException("Title cannot be empty.", nameof(title))
                : title;
            Description = description;
            CreatedAt = DateTime.UtcNow;
            Nodes = new HashSet<LearningPathNode>();
        }
    }
}
