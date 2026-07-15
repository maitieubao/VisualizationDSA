using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Domain.Interfaces
{
    public interface IQuizRepository : IRepository<Quiz>
    {
        /// <summary>Lấy thông tin Quiz kèm eager load Questions</summary>
        Task<Quiz?> GetByIdWithQuestionsAsync(Guid id);

        /// <summary>Lấy danh sách các lượt thi của một User kèm eager load thông tin Quiz (Fix N+1 query)</summary>
        Task<IEnumerable<QuizAttempt>> GetUserAttemptsWithQuizAsync(Guid userId);

        /// <summary>Lấy danh sách các lượt thi của một User phân trang ở tầng SQL (Skip/Take)</summary>
        Task<IEnumerable<QuizAttempt>> GetUserAttemptsWithQuizPaginatedAsync(Guid userId, int pageNumber, int pageSize);
    }
}
