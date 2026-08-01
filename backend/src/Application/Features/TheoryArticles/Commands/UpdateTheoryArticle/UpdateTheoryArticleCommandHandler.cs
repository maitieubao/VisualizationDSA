using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using VisualizationDSA.Application.Interfaces;

namespace VisualizationDSA.Application.Features.TheoryArticles.Commands.UpdateTheoryArticle
{
    public class UpdateTheoryArticleCommandHandler : IRequestHandler<UpdateTheoryArticleCommand>
    {
        private readonly IApplicationDbContext _context;

        public UpdateTheoryArticleCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task Handle(UpdateTheoryArticleCommand request, CancellationToken cancellationToken)
        {
            var article = await _context.TheoryArticles.FindAsync(new object[] { request.ArticleId }, cancellationToken);
            if (article == null)
                throw new ArgumentException("Article not found.");

            if (article.AuthorId != request.AuthorId)
                throw new UnauthorizedAccessException("Only the author can update this article.");

            article.Update(request.Title, request.Slug, request.ContentMd, request.Category, request.Difficulty, request.Tags, request.ReadTimeMinutes);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}