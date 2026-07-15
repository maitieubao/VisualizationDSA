using Microsoft.EntityFrameworkCore.Storage;
using System.Threading.Tasks;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Interfaces;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        private IDbContextTransaction? _currentTransaction;

        public IUserRepository            Users              { get; }
        public IRepository<Badge>            Badges             { get; }
        public IQuizRepository            Quizzes            { get; }
        public IRepository<QuizAttempt>      QuizAttempts       { get; }
        public IRepository<LearningProgress> LearningProgresses { get; }
        public IRepository<RefreshToken>     RefreshTokens      { get; }
        public IRepository<Order>            Orders             { get; }
 
        public UnitOfWork(ApplicationDbContext context)
        {
            _context           = context;
            Users              = new UserRepository(context);
            Badges             = new Repository<Badge>(context);
            Quizzes            = new QuizRepository(context);
            QuizAttempts       = new Repository<QuizAttempt>(context);
            LearningProgresses = new Repository<LearningProgress>(context);
            RefreshTokens      = new Repository<RefreshToken>(context);
            Orders             = new Repository<Order>(context);
        }

        public async Task<int> CommitAsync()
            => await _context.SaveChangesAsync();

        public async Task BeginTransactionAsync()
        {
            _currentTransaction = await _context.Database.BeginTransactionAsync();
        }

        public async Task CommitTransactionAsync()
        {
            if (_currentTransaction != null)
            {
                await _currentTransaction.CommitAsync();
                await _currentTransaction.DisposeAsync();
                _currentTransaction = null;
            }
        }

        public async Task RollbackTransactionAsync()
        {
            if (_currentTransaction != null)
            {
                await _currentTransaction.RollbackAsync();
                await _currentTransaction.DisposeAsync();
                _currentTransaction = null;
            }
        }
    }
}
