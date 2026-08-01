using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using VisualizationDSA.Application.Features.TheoryArticles.Queries.GetTheoryArticleById;
using VisualizationDSA.Application.Interfaces;

namespace VisualizationDSA.Application.Features.TheoryArticles.Queries.GetTheoryArticleById
{
    public class GetTheoryArticleByIdQueryHandler : IRequestHandler<GetTheoryArticleByIdQuery, TheoryArticleDetailDto?>
    {
        private readonly IApplicationDbContext _context;

        public GetTheoryArticleByIdQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<TheoryArticleDetailDto?> Handle(GetTheoryArticleByIdQuery request, CancellationToken cancellationToken)
        {
            var article = await _context.TheoryArticles
                .Include(a => a.Author)
                .Include(a => a.Versions.OrderByDescending(v => v.CreatedAt))
                    .ThenInclude(v => v.ChangedByUser)
                .FirstOrDefaultAsync(a => a.Id == request.ArticleId, cancellationToken);

            if (article == null)
                return null;

            if (request.IncrementView)
            {
                article.IncrementViewCount();
                await _context.SaveChangesAsync(cancellationToken);
            }

            return new TheoryArticleDetailDto
            {
                Id = article.Id,
                Title = article.Title,
                Slug = article.Slug,
                ContentMd = article.ContentMd,
                Category = article.Category,
                Difficulty = article.Difficulty,
                Tags = article.Tags,
                ReadTimeMinutes = article.ReadTimeMinutes,
                ViewCount = article.ViewCount,
                IsPublished = article.IsPublished,
                CreatedAt = article.CreatedAt,
                PublishedAt = article.PublishedAt,
                UpdatedAt = article.UpdatedAt,
                AuthorId = article.AuthorId,
                AuthorName = article.Author.Username,
                Versions = article.Versions.Select(v => new TheoryArticleVersionDto
                {
                    Id = v.Id,
                    ContentMd = v.ContentMd,
                    ChangeSummary = v.ChangeSummary,
                    ChangedBy = v.ChangedBy,
                    ChangedByName = v.ChangedByUser.Username,
                    CreatedAt = v.CreatedAt
                }).ToList()
            };
        }
    }
}