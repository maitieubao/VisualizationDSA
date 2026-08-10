using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Domain.Interfaces
{
    public interface IQuizRepository : IRepository<Quiz>
    {
        Task<Quiz?> GetByIdWithQuestionsAsync(Guid id);
        Task<IEnumerable<QuizAttempt>> GetUserAttemptsWithQuizAsync(Guid userId);
        Task<IEnumerable<QuizAttempt>> GetUserAttemptsWithQuizPaginatedAsync(Guid userId, int pageNumber, int pageSize);
    }
}
