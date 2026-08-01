using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Interfaces;
using System.Collections.Generic;

namespace VisualizationDSA.Application.Features.Analytics.Queries.GetQuizHistory
{
    public class GetQuizHistoryQuery : IRequest<QuizHistoryResult>
    {
        public Guid UserId { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class QuizHistoryResult
    {
        public List<QuizAttemptDto> Attempts { get; set; } = new();
        public int TotalCount { get; set; }
    }

    public class QuizAttemptDto
    {
        public Guid Id { get; set; }
        public Guid QuizId { get; set; }
        public string QuizTitle { get; set; } = string.Empty;
        public int Score { get; set; }
        public int MaxScore { get; set; }
        public bool Passed { get; set; }
        public DateTime AttemptedAt { get; set; }
    }

    public class GetQuizHistoryQueryHandler : IRequestHandler<GetQuizHistoryQuery, QuizHistoryResult>
    {
        private readonly IApplicationDbContext _context;

        public GetQuizHistoryQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<QuizHistoryResult> Handle(GetQuizHistoryQuery request, CancellationToken cancellationToken)
        {
            var query = _context.Set<VisualizationDSA.Domain.Entities.QuizAttempt>()
                .Where(a => a.UserId == request.UserId);

            int totalCount = await query.CountAsync(cancellationToken);

            var attempts = await query
                .Include(a => a.Quiz)
                .OrderByDescending(a => a.AttemptedAt)
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(a => new QuizAttemptDto
                {
                    Id = a.Id,
                    QuizId = a.QuizId,
                    QuizTitle = a.Quiz.Title,
                    Score = a.Score,
                    MaxScore = a.MaxScore,
                    Passed = a.Passed,
                    AttemptedAt = a.AttemptedAt
                })
                .ToListAsync(cancellationToken);

            return new QuizHistoryResult
            {
                Attempts = attempts,
                TotalCount = totalCount
            };
        }
    }
}
