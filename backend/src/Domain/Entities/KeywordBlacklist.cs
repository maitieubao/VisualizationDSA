using System;

namespace VisualizationDSA.Domain.Entities
{
    public class KeywordBlacklist
    {
        public Guid Id { get; private set; }
        public string Keyword { get; private set; } = string.Empty; // lowercase, trim
        public string Category { get; private set; } = "general"; // general/offensive/spam
        public DateTime CreatedAt { get; private set; }
        public Guid CreatedBy { get; private set; } // Admin ID

        private KeywordBlacklist() { }

        public KeywordBlacklist(string keyword, string category, Guid createdBy)
        {
            Id = Guid.NewGuid();
            Keyword = keyword.Trim().ToLowerInvariant();
            Category = category;
            CreatedBy = createdBy;
            CreatedAt = DateTime.UtcNow;
        }
    }
}
