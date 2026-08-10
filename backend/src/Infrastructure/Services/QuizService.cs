using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Interfaces;


namespace VisualizationDSA.Infrastructure.Services
{
    public class QuizService : IQuizService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IGamificationService _gamificationService;
        private readonly VisualizationDSA.Application.Interfaces.IApplicationDbContext _context;
        private readonly IProgressRuleEngine _progressRuleEngine;
        private readonly ILogger<QuizService> _logger;

        public QuizService(IUnitOfWork unitOfWork, IGamificationService gamificationService, 
            VisualizationDSA.Application.Interfaces.IApplicationDbContext context, IProgressRuleEngine progressRuleEngine,
            ILogger<QuizService> logger)
        {
            _unitOfWork = unitOfWork;
            _gamificationService = gamificationService;
            _context = context;
            _progressRuleEngine = progressRuleEngine;
            _logger = logger;
        }

        public async Task<IEnumerable<QuizDto>> GetAllQuizzesAsync()
        {
            var quizzes = await _unitOfWork.Quizzes.GetAllAsync();
            return quizzes.Select(MapToQuizDto);
        }

        public async Task<QuizDto> GetQuizByIdAsync(Guid id)
        {
            var quiz = await _unitOfWork.Quizzes.GetByIdWithQuestionsAsync(id);
            // QZ-015: KeyNotFoundException → ErrorHandlingMiddleware map sang 404 (RESOURCE_NOT_FOUND).
            if (quiz == null) throw new KeyNotFoundException("Quiz not found");
            return MapToQuizDto(quiz);
        }

        public async Task<IEnumerable<QuizDto>> GetQuizzesByTopicAsync(string topic)
        {
            var quizzes = await _unitOfWork.Quizzes.FindAsync(q => q.Topic == topic);
            return quizzes.Select(MapToQuizDto);
        }

        public async Task<QuizAttemptResult> SubmitQuizAttemptAsync(Guid userId, QuizAttemptRequest request)
        {
            var quiz = await _unitOfWork.Quizzes.GetByIdWithQuestionsAsync(request.QuizId);
            // QZ-015: quiz không tồn tại → 404 (KeyNotFoundException) thay vì Exception chung → 500.
            if (quiz == null) throw new KeyNotFoundException("Quiz not found");

            var questions = quiz.Questions.ToList();
            if (request.Answers.Length != questions.Count)
            {
                // Số câu trả lời sai → 400 (VALIDATION_ERROR) thay vì Exception chung → 500.
                throw new ArgumentException("Number of answers does not match number of questions");
            }

            
            int score = 0;
            var questionResults = new List<QuestionResult>();

            for (int i = 0; i < questions.Count; i++)
            {
                var question = questions[i];
                var isCorrect = request.Answers[i] == question.CorrectIndex;
                if (isCorrect) score++;

                questionResults.Add(new QuestionResult
                {
                    QuestionId = question.Id,
                    IsCorrect = isCorrect,
                    CorrectIndex = question.CorrectIndex,
                    Explanation = question.Explanation
                });
            }

            var maxScore = questions.Count;
            var passed = score >= maxScore * 0.7; 

            
            var attempt = new QuizAttempt(userId, quiz.Id, request.Answers, score, maxScore);
            await _unitOfWork.QuizAttempts.AddAsync(attempt);
            // Commit attempt TRƯỚC khi đọc previousAttempts — chống race double XP
            // (2 request đồng thời cùng thấy 0 pass → cả 2 được thưởng).
            await _unitOfWork.CommitAsync();

            
            int xpEarned = 0;
            if (passed)
            {
                var previousAttempts = await _unitOfWork.QuizAttempts.FindAsync(a => a.UserId == userId && a.QuizId == quiz.Id);
                var chronologicalPasses = previousAttempts
                    .Where(a => a.Passed && a.Id != attempt.Id) 
                    .OrderBy(a => a.AttemptedAt)
                    .ToList();

                if (chronologicalPasses.Count == 0)
                {
                    xpEarned = quiz.XPReward;
                }
                else
                {
                    int runningMax = chronologicalPasses[0].Score;
                    bool hasEarnedSecondReward = false;
                    for (int i = 1; i < chronologicalPasses.Count; i++)
                    {
                        var p = chronologicalPasses[i];
                        bool isImprovement = p.Score > runningMax;
                        bool meetsUpgrade = (p.Score - runningMax) / (double)maxScore >= 0.20 || (p.Score == maxScore && runningMax < maxScore);
                        if (isImprovement && meetsUpgrade)
                        {
                            hasEarnedSecondReward = true;
                            break;
                        }
                        if (p.Score > runningMax)
                        {
                            runningMax = p.Score;
                        }
                    }

                    if (!hasEarnedSecondReward)
                    {
                        int overallMaxPrevScore = chronologicalPasses.Max(a => a.Score);
                        bool isCurrentImprovement = score > overallMaxPrevScore;
                        bool currentMeetsUpgrade = (score - overallMaxPrevScore) / (double)maxScore >= 0.20 || (score == maxScore && overallMaxPrevScore < maxScore);
                        if (isCurrentImprovement && currentMeetsUpgrade)
                        {
                            xpEarned = quiz.XPReward;
                        }
                    }
                }

                if (xpEarned > 0)
                {
                    try
                    {
                        await _gamificationService.AwardXPAsync(userId, xpEarned, $"Completed quiz: {quiz.Title}");
                        await _gamificationService.CompleteModuleAsync(userId, $"quiz-{quiz.Topic}");
                    }
                    catch (Exception xpEx)
                    {
                        // Attempt đã commit (chống race) — không làm hỏng kết quả bài làm;
                        // chỉ log để tránh mất XP im lặng.
                        _logger.LogError(xpEx, "AwardXP sau quiz {QuizId} thất bại — user {UserId} có thể bị thiếu XP", quiz.Id, userId);
                    }
                }

                
                var moduleItems = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync(_context.ModuleItems
                    .Where(m => m.QuizId == quiz.Id && !m.IsDeleted));

                // Khử N+1: gom toàn bộ progress của user trong 1 query.
                var moduleItemIds = moduleItems.Select(m => m.Id).ToList();
                var existingProgress = moduleItemIds.Count > 0
                    ? (await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync(_context.UserModuleItemProgresses
                        .Where(p => p.UserId == userId && moduleItemIds.Contains(p.ModuleItemId))))
                        .ToDictionary(p => p.ModuleItemId)
                    : new Dictionary<Guid, UserModuleItemProgress>();

                foreach (var moduleItem in moduleItems)
                {
                    existingProgress.TryGetValue(moduleItem.Id, out var progress);

                    if (progress == null)
                    {
                        progress = new UserModuleItemProgress(userId, moduleItem.Id);
                        _context.UserModuleItemProgresses.Add(progress);
                    }
                    
                    progress.UpdateProgress(activeFrame: 0, scrollPercent: 100, isCompleted: true, score: score);
                    await _progressRuleEngine.ProcessCompletionAsync(userId, moduleItem.Id);
                }

                await _context.SaveChangesAsync(new System.Threading.CancellationToken());
            }

            await _unitOfWork.CommitAsync();

            return new QuizAttemptResult
            {
                Score = score,
                MaxScore = maxScore,
                Passed = passed,
                XPEarned = xpEarned,
                QuestionResults = questionResults
            };
        }

        public async Task<IEnumerable<QuizAttemptDto>> GetUserQuizHistoryAsync(Guid userId, int pageNumber, int pageSize)
        {
            
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100;

            var attempts = await _unitOfWork.Quizzes.GetUserAttemptsWithQuizPaginatedAsync(userId, pageNumber, pageSize);

            return attempts.Select(attempt => new QuizAttemptDto
            {
                QuizId      = attempt.QuizId,
                QuizTitle   = attempt.Quiz?.Title ?? "Unknown Quiz",
                Score       = attempt.Score,
                MaxScore    = attempt.MaxScore,
                Passed      = attempt.Passed,
                AttemptedAt = attempt.AttemptedAt
            });
        }

        private QuizDto MapToQuizDto(Quiz quiz)
        {
            return new QuizDto
            {
                Id = quiz.Id,
                Title = quiz.Title,
                Description = quiz.Description,
                Topic = quiz.Topic,
                Difficulty = quiz.Difficulty,
                XPReward = quiz.XPReward,
                Questions = quiz.Questions.Select(q => new QuizQuestionDto
                {
                    Id = q.Id,
                    Question = q.Question,
                    Options = q.Options,
                    Explanation = string.Empty 
                }).ToList()
            };
        }
    }
}
