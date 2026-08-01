using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Interfaces;

namespace VisualizationDSA.Application.Features.Analytics.Queries.GetQuizAnalytics
{
    public class GetQuizAnalyticsQuery : IRequest<QuizAnalyticsResult>
    {
    }

    public class QuizAnalyticsResult
    {
        public int TotalQuizzes { get; set; }
        public double AverageScore { get; set; }
        
    }

    public class GetQuizAnalyticsQueryHandler : IRequestHandler<GetQuizAnalyticsQuery, QuizAnalyticsResult>
    {
        private readonly IApplicationDbContext _context;

        public GetQuizAnalyticsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<QuizAnalyticsResult> Handle(GetQuizAnalyticsQuery request, CancellationToken cancellationToken)
        {
            var attempts = await _context.Set<VisualizationDSA.Domain.Entities.QuizAttempt>().ToListAsync(cancellationToken);

            int totalQuizzes = attempts.Count;
            double averageScore = totalQuizzes > 0 ? attempts.Average(a => a.MaxScore > 0 ? (double)a.Score / a.MaxScore * 100 : 0) : 0;

            return new QuizAnalyticsResult
            {
                TotalQuizzes = totalQuizzes,
                AverageScore = Math.Round(averageScore, 2)
            };
        }
    }
}
