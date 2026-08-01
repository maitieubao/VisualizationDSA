using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.DTOs.PracticeLadder;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.Infrastructure.Services
{
    public class PracticeLadderService : IPracticeLadderService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IJudge0Service _judge0Service;
        private readonly IHeartService _heartService;

        public PracticeLadderService(ApplicationDbContext dbContext, IJudge0Service judge0Service, IHeartService heartService)
        {
            _dbContext = dbContext;
            _judge0Service = judge0Service;
            _heartService = heartService;
        }

        public async Task<PracticeStatusDto> GetPracticeStatusAsync(Guid userId, string nodeId)
        {
            var session = await GetActiveSessionAsync(userId, nodeId);
            var lessonId = Guid.TryParse(nodeId, out var id) ? id : Guid.Empty;
            
            var progress = await _dbContext.UserLessonProgresses
                .FirstOrDefaultAsync(p => p.UserId == userId && p.LessonId == lessonId);

            return new PracticeStatusDto
            {
                NodeId = nodeId,
                SessionId = session?.Id ?? Guid.Empty,
                QuizPassed = progress?.QuizPassed ?? false,
                QuizScore = session?.QuizScore,
                LabPassed = progress?.LabPassed ?? false,
                LabScore = session?.LabScore,
                LeetcodePassed = progress?.LeetCodePassed ?? false,
                LeetcodeScore = session?.LeetCodeScore,
                NodeFinalScore = progress?.WeightedScore,
                PreviousBestScore = progress?.WeightedScore
            };
        }

        public async Task<QuizSubmitResponseDto> SubmitQuizAsync(Guid userId, string nodeId, QuizSubmitRequestDto request)
        {
            var session = await ValidateSessionAsync(userId, nodeId, request.SessionId);

            // In a real app, query correct answers from DB. Mocking for now:
            int total = request.Answers.Count > 0 ? request.Answers.Count : 5;
            int correct = request.Answers.Count > 0 ? request.Answers.Count(a => a == 0) : 3; // Mock logic
            
            int score = (int)Math.Round((double)correct / total * 100);
            bool passed = score >= 60;

            if (passed)
            {
                session.RecordQuizPass(score);
                await UpdateProgressAsync(userId, nodeId, p => {
                    p.GetType().GetProperty("QuizPassed")?.SetValue(p, true);
                });
                await _dbContext.SaveChangesAsync();
            }

            return new QuizSubmitResponseDto
            {
                Passed = passed,
                Score = score,
                CorrectCount = correct,
                TotalCount = total,
                NextStep = passed ? "Lab" : null,
                Message = passed ? null : "Cần ≥60% để qua. Thử lại không giới hạn!"
            };
        }

        public async Task<LabSubmitResponseDto> SubmitLabAsync(Guid userId, string nodeId, LabSubmitRequestDto request)
        {
            var session = await ValidateSessionAsync(userId, nodeId, request.SessionId);
            
            if (session.QuizScore == null)
            {
                throw new InvalidOperationException("QUIZ_NOT_PASSED");
            }

            // Mock grading logic
            int totalSteps = request.Operations.Count > 0 ? request.Operations.Count : 4;
            int correctSteps = request.Operations.Count;
            int score = (int)Math.Round((double)correctSteps / totalSteps * 100);
            bool passed = score == 100;

            if (passed)
            {
                session.RecordLabPass(score);
                await UpdateProgressAsync(userId, nodeId, p => {
                    p.GetType().GetProperty("LabPassed")?.SetValue(p, true);
                });
                await _dbContext.SaveChangesAsync();
            }

            return new LabSubmitResponseDto
            {
                Passed = passed,
                Score = score,
                CorrectSteps = correctSteps,
                TotalSteps = totalSteps,
                NextStep = passed ? "LeetCode" : null
            };
        }

        public async Task<LeetCodeSubmitResponseDto> SubmitLeetCodeAsync(Guid userId, string nodeId, LeetCodeSubmitRequestDto request)
        {
            var session = await ValidateSessionAsync(userId, nodeId, request.SessionId);

            if (session.LabScore == null)
            {
                throw new InvalidOperationException("LAB_NOT_PASSED");
            }

            // Mock test cases for Judge0 submission
            var testCases = new[]
            {
                new TestCaseDto { Input = "test1", ExpectedOutput = "output1" },
                new TestCaseDto { Input = "test2", ExpectedOutput = "output2" }
            };

            var judgeResult = await _judge0Service.ExecuteAsync(request.SourceCode, request.Language, testCases);
            
            if (judgeResult.Passed)
            {
                session.RecordLeetCodePass(judgeResult.Score);
                
                await UpdateProgressAsync(userId, nodeId, p => {
                    p.GetType().GetProperty("LeetCodePassed")?.SetValue(p, true);
                    
                    // Calculate final score
                    int quizScore = session.QuizScore ?? 0;
                    int labScore = session.LabScore ?? 0;
                    int codeScore = judgeResult.Score;
                    
                    int currentScore = (int)Math.Round(quizScore * 0.20 + labScore * 0.30 + codeScore * 0.50);
                    int previousBest = p.WeightedScore ?? 0;
                    int finalScore = Math.Max(currentScore, previousBest);
                    
                    p.GetType().GetProperty("WeightedScore")?.SetValue(p, finalScore);
                    
                    int stars = finalScore >= 95 ? 3 : (finalScore >= 80 ? 2 : (finalScore >= 60 ? 1 : 0));
                    p.GetType().GetProperty("Stars")?.SetValue(p, stars);
                });
                
                await _dbContext.SaveChangesAsync();
            }

            return judgeResult;
        }

        public async Task<HintResponseDto> GetHintAsync(Guid userId, string nodeId, HintRequestDto request)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) throw new UnauthorizedAccessException("User not found");

            var now = DateTime.UtcNow;
            if (user.LastHintAt != null && (now - user.LastHintAt.Value).TotalSeconds < 10)
            {
                throw new InvalidOperationException("COOLDOWN_ACTIVE");
            }

            user.RecordHintUsed();
            await _dbContext.SaveChangesAsync();

            return new HintResponseDto
            {
                Hint = "Thử dùng HashMap để lưu các giá trị đã gặp...",
                RemainingAiRequests = user.IsPremium ? 29 : null,
                CooldownSeconds = 10
            };
        }

        private async Task<LearningSession> ValidateSessionAsync(Guid userId, string nodeId, Guid sessionId)
        {
            var session = await _dbContext.LearningSessions
                .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId && s.NodeId == nodeId);

            if (session == null || session.IsExpired())
            {
                throw new UnauthorizedAccessException("SESSION_EXPIRED_OR_INVALID");
            }

            return session;
        }

        private async Task<LearningSession?> GetActiveSessionAsync(Guid userId, string nodeId)
        {
            var now = DateTime.UtcNow;
            return await _dbContext.LearningSessions
                .Where(s => s.UserId == userId && s.NodeId == nodeId && s.ExpiresAt > now)
                .OrderByDescending(s => s.CreatedAt)
                .FirstOrDefaultAsync();
        }

        private async Task UpdateProgressAsync(Guid userId, string nodeId, Action<UserLessonProgress> updateAction)
        {
            if (Guid.TryParse(nodeId, out var lessonId))
            {
                var progress = await _dbContext.UserLessonProgresses
                    .FirstOrDefaultAsync(p => p.UserId == userId && p.LessonId == lessonId);
                
                if (progress == null)
                {
                    progress = new UserLessonProgress(userId, lessonId, "InProgress");
                    _dbContext.UserLessonProgresses.Add(progress);
                }
                
                updateAction(progress);
            }
        }
    }
}
