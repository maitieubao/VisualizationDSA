using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Interfaces;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Application.Features.Analytics.Queries.GetQuizAnalytics
{
    public class GetQuizAnalyticsQuery : IRequest<QuizAnalyticsResult>
    {
    }

    public class QuizAnalyticsResult
    {
        // TC-012: totalQuizzes = SỐ QUIZ (không phải số lượt làm) — khớp nhãn "Tổng số bài trắc nghiệm".
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
            // TC-012: đếm trực tiếp bằng CountAsync thay vì ToListAsync kéo toàn bộ bảng về memory.
            var totalQuizzes = await _context.Quizzes.AsNoTracking().CountAsync(cancellationToken);
            var totalQuestionsInBank = await _context.Set<QuizQuestion>().AsNoTracking().CountAsync(cancellationToken);
            var totalUsers = await _context.Users.AsNoTracking().CountAsync(cancellationToken);
            var premiumUsers = await _context.Users.AsNoTracking().CountAsync(u => u.IsPremium, cancellationToken);

            // Điểm trung bình chỉ tính khi có attempt — tránh Average trên query rỗng (500).
            var attemptQuery = _context.Set<QuizAttempt>().AsNoTracking();
            double averageScore = 0;
            if (await attemptQuery.AnyAsync(cancellationToken))
            {
                averageScore = await attemptQuery.AverageAsync(
                    a => a.MaxScore > 0 ? (double)a.Score / a.MaxScore * 100 : 0,
                    cancellationToken);
            }

            return new QuizAnalyticsResult
            {
                TotalQuizzes = totalQuizzes,
                TotalQuestionsInBank = totalQuestionsInBank,
                TotalUsers = totalUsers,
                PremiumUsers = premiumUsers,
                AverageScore = Math.Round(averageScore, 2)
            };
        }
    }
}
