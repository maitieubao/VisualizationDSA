using System;

namespace VisualizationDSA.Domain.Entities
{
    public class TheoryArticleVersion
    {
        public Guid Id { get; private set; }
        public Guid ArticleId { get; private set; }
        public string ContentMd { get; private set; } = string.Empty;
        public string ChangeSummary { get; private set; } = string.Empty;
        public Guid ChangedBy { get; private set; }
        public DateTime CreatedAt { get; private set; }

        
        public virtual TheoryArticle Article { get; private set; } = null!;
        public virtual User ChangedByUser { get; private set; } = null!;

        private TheoryArticleVersion() { }

        public TheoryArticleVersion(Guid articleId, string contentMd, string changeSummary, Guid changedBy)
        {
            Id = Guid.NewGuid();
            ArticleId = articleId;
            ContentMd = contentMd ?? string.Empty;
            ChangeSummary = changeSummary ?? string.Empty;
            ChangedBy = changedBy;
            CreatedAt = DateTime.UtcNow;
        }
    }
}