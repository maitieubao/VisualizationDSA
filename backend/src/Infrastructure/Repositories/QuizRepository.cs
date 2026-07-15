using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Interfaces;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.Infrastructure.Repositories
{
    public class QuizRepository : Repository<Quiz>, IQuizRepository
    {
        public QuizRepository(ApplicationDbContext context) : base(context) { }

        public override async Task<IEnumerable<Quiz>> GetAllAsync()
        {
            return await _context.Quizzes
                .AsNoTracking()
                .Include(q => q.Questions)
                .ToListAsync();
        }

        public override async Task<IEnumerable<Quiz>> FindAsync(Expression<Func<Quiz, bool>> predicate)
        {
            return await _context.Quizzes
                .AsNoTracking()
                .Include(q => q.Questions)
                .Where(predicate)
                .ToListAsync();
        }

        public async Task<Quiz?> GetByIdWithQuestionsAsync(Guid id)
        {
            return await _context.Quizzes
                .AsNoTracking()
                .Include(q => q.Questions)
                .FirstOrDefaultAsync(q => q.Id == id);
        }

        public async Task<IEnumerable<QuizAttempt>> GetUserAttemptsWithQuizAsync(Guid userId)
        {
            return await _context.QuizAttempts
                .AsNoTracking()
                .Include(a => a.Quiz)
                .Where(a => a.UserId == userId)
                .ToListAsync();
        }

        public async Task<IEnumerable<QuizAttempt>> GetUserAttemptsWithQuizPaginatedAsync(Guid userId, int pageNumber, int pageSize)
        {
            return await _context.QuizAttempts
                .AsNoTracking()
                .Include(a => a.Quiz)
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.AttemptedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }
    }
}
