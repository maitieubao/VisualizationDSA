using MediatR;
using System.Collections.Generic;

namespace VisualizationDSA.Application.Features.TheoryArticles.Queries.GetTheoryArticles
{
    public record GetTheoryArticlesQuery : IRequest<TheoryArticlesListDto>
    {
        public string? Category { get; init; }
        public string? Difficulty { get; init; }
        public string? Search { get; init; }
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 20;
        public bool OnlyPublished { get; init; } = true;
    }

    public class TheoryArticlesListDto
    {
        public List<TheoryArticleDto> Articles { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class TheoryArticleDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Difficulty { get; set; } = string.Empty;
        public string Tags { get; set; } = string.Empty;
        public int ReadTimeMinutes { get; set; }
        public int ViewCount { get; set; }
        public bool IsPublished { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? PublishedAt { get; set; }
        public string AuthorName { get; set; } = string.Empty;
    }
}