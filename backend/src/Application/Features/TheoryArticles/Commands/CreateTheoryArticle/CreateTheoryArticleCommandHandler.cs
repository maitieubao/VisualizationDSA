using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using VisualizationDSA.Application.Interfaces;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Application.Features.TheoryArticles.Commands.CreateTheoryArticle
{
    public class CreateTheoryArticleCommandHandler : IRequestHandler<CreateTheoryArticleCommand, Guid>
    {
        private readonly IApplicationDbContext _context;

        public CreateTheoryArticleCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Guid> Handle(CreateTheoryArticleCommand request, CancellationToken cancellationToken)
        {
            var article = new TheoryArticle(
                request.AuthorId,
                request.Title,
                request.Slug,
                request.ContentMd,
                request.Category,
                request.Difficulty,
                request.Tags,
                request.ReadTimeMinutes);

            _context.TheoryArticles.Add(article);
            await _context.SaveChangesAsync(cancellationToken);

            return article.Id;
        }
    }
}