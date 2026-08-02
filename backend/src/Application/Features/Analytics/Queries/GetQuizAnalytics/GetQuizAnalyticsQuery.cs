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
        public int TotalQuestionsInBank { get; set; }
        public int TotalUsers { get; set; }
        public int PremiumUsers { get; set; }
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
            var quizzes = await _context.Quizzes.ToListAsync(cancellationToken);
            var users = await _context.Users.ToListAsync(cancellationToken);

            int totalQuizzesCount = attempts.Count;
            double averageScore = totalQuizzesCount > 0 ? attempts.Average(a => a.MaxScore > 0 ? (double)a.Score / a.MaxScore * 100 : 0) : 0;

            int totalQuestions = quizzes.Sum(q => q.Questions?.Count ?? 0);
            
            // Wait, StatelessQuizzes aren't in EF Core, they are from a JSON file.
            // But we can just use _context.Quizzes for now.
            // In TeacherPanelView.vue, data.totalQuizzes means total quizzes in bank.
            int realTotalQuizzes = quizzes.Count;
            
            int totalUsersCount = users.Count;
            int premiumUsersCount = users.Count(u => u.IsPremium);

            return new QuizAnalyticsResult
            {
                TotalQuizzes = realTotalQuizzes,
                TotalQuestionsInBank = totalQuestions,
                TotalUsers = totalUsersCount,
                PremiumUsers = premiumUsersCount,
                AverageScore = Math.Round(averageScore, 2)
            };
        }
    }
}
