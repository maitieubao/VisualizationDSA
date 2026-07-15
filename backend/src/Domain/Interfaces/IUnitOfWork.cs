using System.Threading.Tasks;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Domain.Interfaces
{
    public interface IUnitOfWork
    {
        IUserRepository            Users          { get; }
        IRepository<Badge>         Badges         { get; }
        IQuizRepository            Quizzes        { get; }
        IRepository<QuizAttempt>   QuizAttempts   { get; }
        IRepository<LearningProgress> LearningProgresses { get; }
        IRepository<RefreshToken>  RefreshTokens  { get; }
        IRepository<Order>         Orders         { get; }

        Task<int> CommitAsync();
        Task BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task RollbackTransactionAsync();
    }
}
