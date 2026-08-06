using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Asp.Versioning;
using System.Text;
using System.Text.Json;
using System.Security.Cryptography;
using VisualizationDSA.Domain.Engine;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Strategies;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.WebApi.Filters;

namespace VisualizationDSA.WebApi.Controllers
{
    
    
    
    
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/concepts/quiz")]
    public class StatelessQuizController : ControllerBase
    {
        private readonly QuizBankStrategy _quizBank;
        private readonly ApplicationDbContext _dbContext;

        public StatelessQuizController(QuizBankStrategy quizBank, ApplicationDbContext dbContext)
        {
            _quizBank = quizBank;
            _dbContext = dbContext;
        }

        
        
        
        
        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            // Merge bank (quiz mặc định) + DB (quiz giảng viên tạo) — trước đây bank-only
            // → quiz teacher tạo biến mất khỏi tab quản lý sau khi chuyển DB-only.
            var bankQuizzes = _quizBank.GetAllQuizzes()
                .Select(q => new
                {
                    q.Id, q.Title, q.Topic, q.Difficulty, q.XpReward,
                    questionCount = q.Questions.Count
                });

            var dbQuizzes = await _dbContext.Quizzes
                .Select(q => new
                {
                    Id = q.Id.ToString(),
                    q.Title, q.Topic,
                    Difficulty = DifficultyToLabel(q.Difficulty),
                    XpReward = q.XPReward,
                    questionCount = q.Questions.Count
                })
                .ToListAsync();

            var merged = dbQuizzes
                .Concat(bankQuizzes)
                .GroupBy(q => q.Title, StringComparer.OrdinalIgnoreCase)
                .Select(g => g.First());
            return Ok(merged);
        }

        
        
        
        
        [HttpGet("topics")]
        public async Task<IActionResult> GetTopics()
        {
            var bankTopics = _quizBank.GetTopics();
            var dbTopics = await _dbContext.Quizzes
                .Where(q => q.Topic != null && q.Topic != "")
                .Select(q => q.Topic!)
                .Distinct()
                .ToListAsync();
            var merged = dbTopics.Concat(bankTopics).Distinct(StringComparer.OrdinalIgnoreCase);
            return Ok(merged);
        }

        
        
        
        
        [HttpGet("{quizId}")]
        public async Task<IActionResult> GetById(string quizId)
        {
            // Token hợp lệ → trả đủ đáp án (lesson flow chấm điểm trên client sau khi học viên đăng nhập);
            // công khai → chỉ trả câu hỏi (chống lộ đề trước khi làm bài).
            var authenticated = JwtHelper.RequireToken(Request) == null;

            // DB là nguồn chính (seed + quiz giảng viên tạo); bank chỉ là fallback khi DB down.
            // Parse Guid trước để tránh phụ thuộc cách EF translate Id.ToString() trên SQLite.
            var dbQuiz = Guid.TryParse(quizId, out var quizGuid)
                ? await _dbContext.Quizzes
                    .Include(q => q.Questions)
                    .FirstOrDefaultAsync(q => q.Id == quizGuid)
                : await _dbContext.Quizzes
                    .Include(q => q.Questions)
                    .FirstOrDefaultAsync(q => q.Title == quizId);
            if (dbQuiz != null)
            {
                return Ok(new StatelessQuizPublicDto
                {
                    Id = dbQuiz.Id.ToString(),
                    Title = dbQuiz.Title,
                    Topic = dbQuiz.Topic,
                    Difficulty = DifficultyToLabel(dbQuiz.Difficulty),
                    XpReward = dbQuiz.XPReward,
                    Questions = dbQuiz.Questions
                        .Select(q => authenticated
                            ? new StatelessQuestionPublicDto
                            {
                                Id = q.Id.ToString(),
                                Text = q.Question,
                                Options = q.Options.ToList(),
                                CorrectIndex = q.CorrectIndex,
                                Explanation = q.Explanation
                            }
                            : new StatelessQuestionPublicDto
                            {
                                Id = q.Id.ToString(),
                                Text = q.Question,
                                Options = q.Options.ToList()
                            })
                        .ToList()
                });
            }

            var quiz = _quizBank.GetQuizById(quizId);
            if (quiz != null)
            {
                return Ok(ToPublicDto(quiz, authenticated));
            }

            return NotFound(new { error = "QUIZ_NOT_FOUND", quizId, supportedQuizzes = _quizBank.GetAllQuizzes().Select(q => q.Id) });
        }

        private static StatelessQuizPublicDto ToPublicDto(StatelessQuizDto quiz, bool authenticated)
        {
            return new StatelessQuizPublicDto
            {
                Id = quiz.Id,
                Title = quiz.Title,
                Topic = quiz.Topic,
                Difficulty = quiz.Difficulty,
                XpReward = quiz.XpReward,
                Questions = quiz.Questions
                    .Select(q => authenticated
                        ? new StatelessQuestionPublicDto
                        {
                            Id = q.Id,
                            Text = q.Text,
                            Options = q.Options.ToList(),
                            CorrectIndex = q.CorrectIndex,
                            Explanation = q.Explanation
                        }
                        : new StatelessQuestionPublicDto
                        {
                            Id = q.Id,
                            Text = q.Text,
                            Options = q.Options.ToList()
                        })
                    .ToList()
            };
        }

        
        
        
        
        [HttpGet("topic/{topic}")]
        public async Task<IActionResult> GetByTopic(string topic)
        {
            var authenticated = JwtHelper.RequireToken(Request) == null;

            var dbQuizzes = await _dbContext.Quizzes
                .Include(q => q.Questions)
                .Where(q => q.Topic == topic)
                .ToListAsync();
            var bankQuizzes = _quizBank.GetQuizzesByTopic(topic);

            // Dedupe theo Title (DB thắng) — tránh card trùng khi teacher tạo quiz trùng tên bank.
            var all = dbQuizzes
                .Select(q => new StatelessQuizPublicDto
                {
                    Id = q.Id.ToString(),
                    Title = q.Title,
                    Topic = q.Topic,
                    Difficulty = DifficultyToLabel(q.Difficulty),
                    XpReward = q.XPReward,
                    Questions = q.Questions
                        .Select(question => authenticated
                            ? new StatelessQuestionPublicDto
                            {
                                Id = question.Id.ToString(),
                                Text = question.Question,
                                Options = question.Options.ToList(),
                                CorrectIndex = question.CorrectIndex,
                                Explanation = question.Explanation
                            }
                            : new StatelessQuestionPublicDto
                            {
                                Id = question.Id.ToString(),
                                Text = question.Question,
                                Options = question.Options.ToList()
                            })
                        .ToList()
                })
                .Concat(bankQuizzes.Select(q => ToPublicDto(q, authenticated)))
                .GroupBy(q => q.Title, StringComparer.OrdinalIgnoreCase)
                .Select(g => g.First());

            return Ok(all);
        }

        
        
        
        
        [HttpPost("submit")]
        [RequireJwtRole]  
        public async Task<IActionResult> SubmitAttempt([FromBody] StatelessQuizAttemptRequest request)
        {
            try
            {
                // Quiz từ DB (seed/giảng viên tạo) → chấm trực tiếp từ câu hỏi trong DB;
                // quiz bank in-memory → chấm qua QuizBankStrategy.
                var dbQuiz = Guid.TryParse(request.QuizId, out var quizGuid)
                    ? await _dbContext.Quizzes
                        .Include(q => q.Questions)
                        .FirstOrDefaultAsync(q => q.Id == quizGuid)
                    : await _dbContext.Quizzes
                        .Include(q => q.Questions)
                        .FirstOrDefaultAsync(q => q.Title == request.QuizId);

                StatelessQuizAttemptResult result;
                if (dbQuiz != null)
                {
                    if (request.Answers.Count != dbQuiz.Questions.Count)
                        return BadRequest(new { error = "ANSWER_COUNT_MISMATCH", message = $"Số câu trả lời ({request.Answers.Count}) không khớp số câu hỏi ({dbQuiz.Questions.Count})." });

                    var results = new List<StatelessQuestionResult>();
                    int score = 0;
                    // Giữ đúng thứ tự câu hỏi như GET trả về (index khớp request.Answers).
                    var questions = dbQuiz.Questions.ToList();
                    for (int i = 0; i < questions.Count; i++)
                    {
                        var q = questions[i];
                        var isCorrect = request.Answers[i] == q.CorrectIndex;
                        if (isCorrect) score++;
                        results.Add(new StatelessQuestionResult
                        {
                            QuestionId = q.Id.ToString(),
                            IsCorrect = isCorrect,
                            CorrectIndex = q.CorrectIndex,
                            Explanation = q.Explanation
                        });
                    }

                    var passed = score >= (int)Math.Ceiling(questions.Count * 0.7);
                    result = new StatelessQuizAttemptResult
                    {
                        Score = score,
                        MaxScore = questions.Count,
                        Passed = passed,
                        XpAwarded = passed ? dbQuiz.XPReward : 0,
                        QuestionResults = results
                    };
                }
                else
                {
                    result = _quizBank.EvaluateAttempt(request);

                    // Quiz bank (in-memory, không có Guid) — trước đây không bao giờ cấp XP thật dù UI báo.
                    // Cấp XP lần đầu đạt + ghi QuizXpGrant để chống farm khi submit lặp lại.
                    if (result.Passed && result.XpAwarded > 0)
                    {
                        var bankUserIdStr = JwtHelper.ExtractSubFromToken(Request);
                        User? bankUser = null;
                        if (Guid.TryParse(bankUserIdStr, out var bankUid))
                            bankUser = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == bankUid);

                        if (bankUser != null)
                        {
                            var alreadyGranted = await _dbContext.QuizXpGrants
                                .AnyAsync(g => g.UserId == bankUser.Id && g.QuizKey == request.QuizId);

                            if (!alreadyGranted)
                            {
                                bankUser.AwardXP(result.XpAwarded);
                                bankUser.RecordActivity();
                                _dbContext.QuizXpGrants.Add(new VisualizationDSA.Domain.Entities.QuizXpGrant(bankUser.Id, request.QuizId));
                                await _dbContext.SaveChangesAsync();
                            }
                            else
                            {
                                result.XpAwarded = 0;
                            }
                        }
                        else
                        {
                            result.XpAwarded = 0;
                        }
                    }
                }

                var quiz = dbQuiz;
                if (quiz != null)
                {
                    var userIdStr = JwtHelper.ExtractSubFromToken(Request);
                    // Guid.TryParse + so sánh theo Id (Guid) — KHÔNG dùng ToString() trong LINQ
                    // (EF Core không translate được trên SQLite → luôn không khớp).
                    User? user = null;
                    if (Guid.TryParse(userIdStr, out var parsedUid))
                        user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == parsedUid);

                    if (user != null)
                    {
                        
                        var attempt = new QuizAttempt(
                            user.Id,
                            quiz.Id,
                            request.Answers.ToArray(),
                            result.Score,
                            result.MaxScore
                        );
                        _dbContext.QuizAttempts.Add(attempt);

                        
                        
                        
                        
                        
                        int xpEarned = 0;
                        if (result.Passed)
                        {
                            var previousAttempts = await _dbContext.QuizAttempts
                                .Where(a => a.UserId == user.Id && a.QuizId == quiz.Id)
                                .ToListAsync();

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
                                    bool meetsUpgrade = (p.Score - runningMax) / (double)result.MaxScore >= 0.20 || (p.Score == result.MaxScore && runningMax < result.MaxScore);
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
                                    bool isCurrentImprovement = result.Score > overallMaxPrevScore;
                                    bool currentMeetsUpgrade = (result.Score - overallMaxPrevScore) / (double)result.MaxScore >= 0.20 || (result.Score == result.MaxScore && overallMaxPrevScore < result.MaxScore);
                                    if (isCurrentImprovement && currentMeetsUpgrade)
                                    {
                                        xpEarned = quiz.XPReward;
                                    }
                                }
                            }
                        }

                        
                        result.XpAwarded = xpEarned;

                        if (xpEarned > 0)
                        {
                            user.AwardXP(xpEarned);
                            user.RecordActivity();
                        }

                        await _dbContext.SaveChangesAsync();
                    }
                }

                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = "QUIZ_NOT_FOUND", message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = "INVALID_ANSWERS", message = ex.Message });
            }
        }

        
        
        
        
        
        [HttpPost("manage")]
        [RequireJwtRole("Teacher,Admin")]  
        public async Task<IActionResult> ManageQuiz([FromBody] StatelessQuizDto quiz)
        {

            if (quiz == null)
                return BadRequest(new { error = "INVALID_QUIZ", message = "Dữ liệu quiz trống." });

            if (string.IsNullOrWhiteSpace(quiz.Title))
                return BadRequest(new { error = "INVALID_QUIZ", message = "Quiz phải có tiêu đề." });

            if (quiz.Title.Length > 200)
                return BadRequest(new { error = "INVALID_QUIZ", message = "Tiêu đề quiz không được vượt quá 200 ký tự." });

            if (quiz.Questions == null || quiz.Questions.Count == 0)
                return BadRequest(new { error = "INVALID_QUIZ", message = "Quiz phải có ít nhất 1 câu hỏi." });

            if (quiz.Questions.Count > 100)
                return BadRequest(new { error = "INVALID_QUIZ", message = "Số lượng câu hỏi trong một bài quiz tối đa là 100." });

            
            for (int i = 0; i < quiz.Questions.Count; i++)
            {
                var q = quiz.Questions[i];
                if (string.IsNullOrWhiteSpace(q.Text))
                    return BadRequest(new { error = "INVALID_QUIZ", message = $"Câu hỏi thứ {i + 1} không được để trống nội dung." });
                if (q.Text.Length > 1000)
                    return BadRequest(new { error = "INVALID_QUIZ", message = $"Nội dung câu hỏi thứ {i + 1} không được dài quá 1000 ký tự." });
                if (q.Options == null || q.Options.Count < 2 || q.Options.Count > 10)
                    return BadRequest(new { error = "INVALID_QUIZ", message = $"Câu hỏi thứ {i + 1} phải có từ 2 đến 10 đáp án lựa chọn." });
                if (q.CorrectIndex < 0 || q.CorrectIndex >= q.Options.Count)
                    return BadRequest(new { error = "INVALID_QUIZ", message = $"Đáp án đúng của câu hỏi thứ {i + 1} không hợp lệ." });
            }

            
            quiz.Title = NormalizeText(quiz.Title);
            foreach (var q in quiz.Questions)
            {
                q.Text = NormalizeText(q.Text);
                for (int i = 0; i < q.Options.Count; i++)
                {
                    q.Options[i] = NormalizeText(q.Options[i]);
                }
                q.Explanation = NormalizeText(q.Explanation);
            }

            
            // DB là NGUỒN DUY NHẤT cho quiz giảng viên tạo — không ghi thêm vào bank in-memory
            // (trước đây 2 nguồn → delete chỉ xóa 1 nơi, quiz đã xóa vẫn hiện qua fallback bank).
            var difficultyInt = quiz.Difficulty switch
            {
                "easy" => 1, "medium" => 3, "hard" => 5, _ => 3
            };
            var dbQuiz = new Quiz(quiz.Title, quiz.Topic, quiz.Topic, difficultyInt, quiz.XpReward);
            foreach (var q in quiz.Questions)
            {
                dbQuiz.AddQuestion(q.Text, q.Options.ToArray(), q.CorrectIndex, q.Explanation ?? "");
            }
            _dbContext.Quizzes.Add(dbQuiz);
            await _dbContext.SaveChangesAsync();

            // Gắn Id GUID thật vào response (DTO đầu vào không có Id).
            var created = new StatelessQuizDto
            {
                Id = dbQuiz.Id.ToString(),
                Title = dbQuiz.Title,
                Topic = dbQuiz.Topic,
                Difficulty = DifficultyToLabel(dbQuiz.Difficulty),
                XpReward = dbQuiz.XPReward,
                Questions = quiz.Questions
            };

            return Ok(new { message = "Quiz đã được thêm thành công.", quiz = created });
        }

        
        
        
        
        
        [HttpPut("manage/{quizId}")]
        [RequireJwtRole("Teacher,Admin")]  
        public async Task<IActionResult> UpdateQuiz(string quizId, [FromBody] StatelessQuizDto quiz)
        {

            if (quiz == null)
                return BadRequest(new { error = "INVALID_QUIZ", message = "Dữ liệu quiz trống." });

            if (string.IsNullOrWhiteSpace(quiz.Title))
                return BadRequest(new { error = "INVALID_QUIZ", message = "Quiz phải có tiêu đề." });

            if (quiz.Title.Length > 200)
                return BadRequest(new { error = "INVALID_QUIZ", message = "Tiêu đề quiz không được vượt quá 200 ký tự." });

            if (quiz.Questions == null || quiz.Questions.Count == 0)
                return BadRequest(new { error = "INVALID_QUIZ", message = "Quiz phải có ít nhất 1 câu hỏi." });

            if (quiz.Questions.Count > 100)
                return BadRequest(new { error = "INVALID_QUIZ", message = "Số lượng câu hỏi trong một bài quiz tối đa là 100." });

            
            for (int i = 0; i < quiz.Questions.Count; i++)
            {
                var q = quiz.Questions[i];
                if (string.IsNullOrWhiteSpace(q.Text))
                    return BadRequest(new { error = "INVALID_QUIZ", message = $"Câu hỏi thứ {i + 1} không được để trống nội dung." });
                if (q.Text.Length > 1000)
                    return BadRequest(new { error = "INVALID_QUIZ", message = $"Nội dung câu hỏi thứ {i + 1} không được dài quá 1000 ký tự." });
                if (q.Options == null || q.Options.Count < 2 || q.Options.Count > 10)
                    return BadRequest(new { error = "INVALID_QUIZ", message = $"Câu hỏi thứ {i + 1} phải có từ 2 đến 10 đáp án lựa chọn." });
                if (q.CorrectIndex < 0 || q.CorrectIndex >= q.Options.Count)
                    return BadRequest(new { error = "INVALID_QUIZ", message = $"Đáp án đúng của câu hỏi thứ {i + 1} không hợp lệ." });
            }

            
            quiz.Title = NormalizeText(quiz.Title);
            foreach (var q in quiz.Questions)
            {
                q.Text = NormalizeText(q.Text);
                for (int i = 0; i < q.Options.Count; i++)
                {
                    q.Options[i] = NormalizeText(q.Options[i]);
                }
                q.Explanation = NormalizeText(q.Explanation);
            }

            
            // DB là nguồn duy nhất — không ghi bank (trước đây 2 nguồn lệch nhau).
            // Parse Guid trước để tránh phụ thuộc cách EF translate Id.ToString() trên SQLite.
            var dbQuiz = Guid.TryParse(quizId, out var updateGuid)
                ? await _dbContext.Quizzes
                    .Include(q => q.Questions)
                    .FirstOrDefaultAsync(q => q.Id == updateGuid)
                : await _dbContext.Quizzes
                    .Include(q => q.Questions)
                    .FirstOrDefaultAsync(q => q.Title == quizId);
            if (dbQuiz == null)
                return NotFound(new { error = "QUIZ_NOT_FOUND", message = $"Không tìm thấy quiz với ID {quizId} để cập nhật." });

            {
                var difficultyInt = quiz.Difficulty switch
                {
                    "easy" => 1, "medium" => 3, "hard" => 5, _ => 3
                };
                dbQuiz.Update(quiz.Title, quiz.Topic, quiz.Topic, difficultyInt, quiz.XpReward);
                
                
                dbQuiz.ClearQuestions();
                foreach (var q in quiz.Questions)
                {
                    dbQuiz.AddQuestion(q.Text, q.Options.ToArray(), q.CorrectIndex, q.Explanation ?? "");
                }
                
                await _dbContext.SaveChangesAsync();
            }

            return Ok(new { message = "Quiz đã được cập nhật thành công.", quiz });
        }

        
        
        
        
        
        [HttpDelete("manage/{quizId}")]
        [RequireJwtRole("Teacher,Admin")]  
        public async Task<IActionResult> DeleteQuiz(string quizId)
        {

            
            var deletedInMemory = _quizBank.DeleteQuiz(quizId);

            
            var dbQuiz = Guid.TryParse(quizId, out var deleteGuid)
                ? await _dbContext.Quizzes
                    .FirstOrDefaultAsync(q => q.Id == deleteGuid)
                : await _dbContext.Quizzes
                    .FirstOrDefaultAsync(q => q.Title == quizId);
            if (dbQuiz != null)
            {
                _dbContext.Quizzes.Remove(dbQuiz);
                await _dbContext.SaveChangesAsync();
            }

            if (!deletedInMemory && dbQuiz == null)
                return NotFound(new { error = "QUIZ_NOT_FOUND", message = $"Không tìm thấy quiz với ID {quizId} để xóa." });

            return Ok(new { message = "Quiz đã được xóa thành công." });
        }

        
        
        
        
        
        [HttpGet("analytics")]
        [RequireJwtRole("Teacher,Admin")]  
        public async Task<IActionResult> GetAnalytics()
        {
            

            
            var totalQuizzes         = await _dbContext.Quizzes.AsNoTracking().CountAsync();
            var totalQuestionsInBank = await _dbContext.QuizQuestions.AsNoTracking().CountAsync();

            
            var topicBreakdown = await _dbContext.Quizzes
                .AsNoTracking()
                .GroupBy(q => q.Topic)
                .Select(g => new
                {
                    topic     = g.Key,
                    quizCount = g.Count()
                })
                .OrderByDescending(t => t.quizCount)
                .ToListAsync();

            
            var totalAttempts = await _dbContext.QuizAttempts.CountAsync();
            var totalPassed   = await _dbContext.QuizAttempts.CountAsync(a => a.Passed);
            var passRate      = totalAttempts > 0
                ? Math.Round((double)totalPassed / totalAttempts * 100, 1)
                : 0.0;
            var averageScore  = totalAttempts > 0
                ? Math.Round(await _dbContext.QuizAttempts.AverageAsync(a => (double)a.Score / a.MaxScore * 100), 1)
                : 0.0;

            
            var perQuizStats = await _dbContext.Quizzes
                .Select(q => new
                {
                    quizId        = q.Id.ToString(),
                    title         = q.Title,
                    topic         = q.Topic,
                    difficulty    = q.Difficulty == 1 ? "easy" : q.Difficulty == 5 ? "hard" : "medium",
                    questionCount = q.Questions.Count,
                    xpReward      = q.XPReward,
                    totalAttempts = q.Attempts.Count,
                    passedCount   = q.Attempts.Count(a => a.Passed),
                    avgScore      = q.Attempts.Count > 0
                        ? Math.Round(q.Attempts.Average(a => (double)a.Score / a.MaxScore * 100), 1)
                        : 0.0,
                    passRatePercent = q.Attempts.Count > 0
                        ? Math.Round((double)q.Attempts.Count(a => a.Passed) / q.Attempts.Count * 100, 1)
                        : 0.0
                })
                .OrderByDescending(q => q.totalAttempts)
                .ToListAsync();

            
            var totalUsers   = await _dbContext.Users.CountAsync();
            var premiumUsers = await _dbContext.Users.CountAsync(u => u.IsPremium);

            return Ok(new
            {
                totalQuizzes,
                totalQuestionsInBank,
                totalAttempts,
                totalPassed,
                passRate,
                averageScore,
                totalUsers,
                premiumUsers,
                topicBreakdown,
                perQuizStats
            });
        }


        
        
        
        
        [HttpGet("history")]
        [RequireJwtRole]  
        public async Task<IActionResult> GetHistory([FromQuery] string? userId)
        {
            var currentUserId = JwtHelper.ExtractSubFromToken(Request);
            var targetUserId = userId ?? currentUserId;
            if (targetUserId != currentUserId && !JwtHelper.IsTeacherOrAdmin(Request))
            {
                return StatusCode(403, new { error = "FORBIDDEN", message = "Bạn không có quyền xem lịch sử của người khác." });
            }

            if (!Guid.TryParse(targetUserId, out var guidUserId))
            {
                return BadRequest(new { error = "INVALID_USER_ID" });
            }

            var attempts = await _dbContext.QuizAttempts
                .Include(a => a.Quiz)
                .Where(a => a.UserId == guidUserId)
                .OrderByDescending(a => a.AttemptedAt)
                .Select(a => new
                {
                    a.Id,
                    a.QuizId,
                    quizTitle = a.Quiz.Title,
                    quizTopic = a.Quiz.Topic,
                    a.Score,
                    a.MaxScore,
                    a.Passed,
                    a.AttemptedAt,
                    a.Answers
                })
                .ToListAsync();

            return Ok(attempts);
        }

        private static string NormalizeText(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return string.Empty;
            return System.Text.RegularExpressions.Regex.Replace(text.Trim(), @"\s+", " ");
        }

        // Map difficulty DB (int) sang nhãn — bank dùng "easy/medium/hard"; trước đây
        // ToString() trả "1/2/3" làm teacher sửa quiz DB bị reset về medium.
        private static string DifficultyToLabel(int difficulty) =>
            difficulty == 1 ? "easy" : difficulty == 5 ? "hard" : "medium";
    }
}
