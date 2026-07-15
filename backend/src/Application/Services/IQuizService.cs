using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;

namespace VisualizationDSA.Application.Services
{
    public interface IQuizService
    {
        Task<IEnumerable<QuizDto>>           GetAllQuizzesAsync();
        Task<QuizDto>                        GetQuizByIdAsync(Guid id);
        Task<IEnumerable<QuizDto>>           GetQuizzesByTopicAsync(string topic);
        Task<QuizAttemptResult>              SubmitQuizAttemptAsync(Guid userId, QuizAttemptRequest request);
        Task<IEnumerable<QuizAttemptDto>>    GetUserQuizHistoryAsync(Guid userId, int pageNumber, int pageSize);
    }

    /// <summary>DTO tóm tắt lịch sử làm quiz — tránh trùng với Domain.Entities.QuizAttempt</summary>
    public class QuizAttemptDto
    {
        public Guid     QuizId      { get; set; }
        public string   QuizTitle   { get; set; } = string.Empty;
        public int      Score       { get; set; }
        public int      MaxScore    { get; set; }
        public bool     Passed      { get; set; }
        public DateTime AttemptedAt { get; set; }
    }
}
