using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using VisualizationDSA.Application.Interfaces;

namespace VisualizationDSA.Application.Features.TheoryArticles.Commands.PublishTheoryArticle
{
    public class PublishTheoryArticleCommandHandler : IRequestHandler<PublishTheoryArticleCommand>
    {
        private readonly IApplicationDbContext _context;

        public PublishTheoryArticleCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task Handle(PublishTheoryArticleCommand request, CancellationToken cancellationToken)
        {
            var article = await _context.TheoryArticles.FindAsync(new object[] { request.ArticleId }, cancellationToken);
            if (article == null)
                throw new ArgumentException("Article not found.");

            if (article.AuthorId != request.AuthorId)
                throw new UnauthorizedAccessException("Only the author can publish/unpublish this article.");

            if (request.Publish)
                article.Publish();
            else
                article.Unpublish();

            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}