using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using VisualizationDSA.Application.Features.TheoryArticles.Queries.GetTheoryArticles;
using VisualizationDSA.Application.Interfaces;

namespace VisualizationDSA.Application.Features.TheoryArticles.Queries.GetTheoryArticles
{
    public class GetTheoryArticlesQueryHandler : IRequestHandler<GetTheoryArticlesQuery, TheoryArticlesListDto>
    {
        private readonly IApplicationDbContext _context;

        public GetTheoryArticlesQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<TheoryArticlesListDto> Handle(GetTheoryArticlesQuery request, CancellationToken cancellationToken)
        {
            var query = _context.TheoryArticles.AsQueryable();

            if (request.OnlyPublished)
                query = query.Where(a => a.IsPublished);

            if (!string.IsNullOrWhiteSpace(request.Category))
                query = query.Where(a => a.Category == request.Category);

            if (!string.IsNullOrWhiteSpace(request.Difficulty))
                query = query.Where(a => a.Difficulty == request.Difficulty);

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var search = request.Search.ToLower();
                query = query.Where(a => a.Title.ToLower().Contains(search) 
                    || a.ContentMd.ToLower().Contains(search)
                    || a.Tags.ToLower().Contains(search));
            }

            var totalCount = await query.CountAsync(cancellationToken);
            var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);

            var articles = await query
                .OrderByDescending(a => a.CreatedAt)
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(a => new TheoryArticleDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    Slug = a.Slug,
                    Category = a.Category,
                    Difficulty = a.Difficulty,
                    Tags = a.Tags,
                    ReadTimeMinutes = a.ReadTimeMinutes,
                    ViewCount = a.ViewCount,
                    IsPublished = a.IsPublished,
                    CreatedAt = a.CreatedAt,
                    PublishedAt = a.PublishedAt,
                    AuthorName = a.Author.Username
                })
                .ToListAsync(cancellationToken);

            return new TheoryArticlesListDto
            {
                Articles = articles,
                TotalCount = totalCount,
                Page = request.Page,
                PageSize = request.PageSize,
                TotalPages = totalPages
            };
        }
    }
}