using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Interfaces;

namespace VisualizationDSA.Application.Features.Codelabs.Queries
{
    public class GetCodelabsQuery : IRequest<List<CodelabListItemDto>>
    {
        public string? Search { get; set; }
        public int? Difficulty { get; set; }
        public string? Language { get; set; }
        public string? Tag { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }

    public class CodelabListItemDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public int Difficulty { get; set; }
        public int XPReward { get; set; }
        public string AllowedLanguages { get; set; } = string.Empty;
        public int TestCaseCount { get; set; }
        public string Tags { get; set; } = string.Empty;
    }

    public class GetCodelabsQueryHandler : IRequestHandler<GetCodelabsQuery, List<CodelabListItemDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetCodelabsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<CodelabListItemDto>> Handle(GetCodelabsQuery request, CancellationToken cancellationToken)
        {
            var query = _context.Codelabs.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var keyword = request.Search.Trim();
                query = query.Where(c => c.Title.Contains(keyword) || c.Description.Contains(keyword) || c.Tags.Contains(keyword));
            }

            if (request.Difficulty.HasValue)
            {
                query = query.Where(c => c.Difficulty == request.Difficulty.Value);
            }

            if (!string.IsNullOrWhiteSpace(request.Language))
            {
                var lang = request.Language.Trim();
                query = query.Where(c => c.AllowedLanguages.Contains(lang));
            }

            if (!string.IsNullOrWhiteSpace(request.Tag))
            {
                var tag = request.Tag.Trim();
                query = query.Where(c => c.Tags.Contains(tag));
            }

            var page = Math.Max(1, request.Page);
            var pageSize = Math.Clamp(request.PageSize, 1, 100);

            var items = await query
                .OrderByDescending(c => c.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new CodelabListItemDto
                {
                    Id = c.Id,
                    Title = c.Title,
                    Difficulty = c.Difficulty,
                    XPReward = c.XPReward,
                    AllowedLanguages = c.AllowedLanguages,
                    Tags = c.Tags,
                    TestCaseCount = c.TestCases.Count
                })
                .ToListAsync(cancellationToken);

            return items;
        }
    }
}
