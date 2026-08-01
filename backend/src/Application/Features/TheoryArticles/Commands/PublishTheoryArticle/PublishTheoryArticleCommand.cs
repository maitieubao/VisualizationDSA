using MediatR;
using System;

namespace VisualizationDSA.Application.Features.TheoryArticles.Commands.PublishTheoryArticle
{
    public record PublishTheoryArticleCommand : IRequest
    {
        public Guid ArticleId { get; init; }
        public Guid AuthorId { get; init; }
        public bool Publish { get; init; } = true;
    }
}