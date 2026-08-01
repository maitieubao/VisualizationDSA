using MediatR;
using System;

namespace VisualizationDSA.Application.Features.TheoryArticles.Commands.UpdateTheoryArticle
{
    public record UpdateTheoryArticleCommand : IRequest
    {
        public Guid ArticleId { get; init; }
        public Guid AuthorId { get; init; }
        public string Title { get; init; } = string.Empty;
        public string Slug { get; init; } = string.Empty;
        public string ContentMd { get; init; } = string.Empty;
        public string Category { get; init; } = string.Empty;
        public string Difficulty { get; init; } = "Beginner";
        public string Tags { get; init; } = string.Empty;
        public int ReadTimeMinutes { get; init; }
    }
}