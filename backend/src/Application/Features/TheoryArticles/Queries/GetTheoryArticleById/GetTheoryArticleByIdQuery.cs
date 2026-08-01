using MediatR;

namespace VisualizationDSA.Application.Features.TheoryArticles.Queries.GetTheoryArticleById
{
    public record GetTheoryArticleByIdQuery : IRequest<TheoryArticleDetailDto?>
    {
        public Guid ArticleId { get; init; }
        public bool IncrementView { get; init; } = false;
    }

    public class TheoryArticleDetailDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string ContentMd { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Difficulty { get; set; } = string.Empty;
        public string Tags { get; set; } = string.Empty;
        public int ReadTimeMinutes { get; set; }
        public int ViewCount { get; set; }
        public bool IsPublished { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? PublishedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public Guid AuthorId { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        
        
        public List<TheoryArticleVersionDto> Versions { get; set; } = new();
    }

    public class TheoryArticleVersionDto
    {
        public Guid Id { get; set; }
        public string ContentMd { get; set; } = string.Empty;
        public string ChangeSummary { get; set; } = string.Empty;
        public Guid ChangedBy { get; set; }
        public string ChangedByName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}