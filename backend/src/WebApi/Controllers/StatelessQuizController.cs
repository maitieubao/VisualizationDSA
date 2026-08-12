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
        public async Task<IActionResult> GetById(string quizId, [FromQuery] bool withAnswers = false)
        {
            // QZ-003: đáp án chỉ trả khi client CHỦ ĐỘNG yêu cầu withAnswers=true (lesson flow thật sự,
            // teacher/admin sửa quiz). Workspace (mặc định false) không nhận CorrectIndex/Explanation
            // → không lộ đáp án trước khi nộp; submit vẫn chấm server-side (backend giữ đáp án).
            var authenticated = JwtHelper.RequireToken(Request) == null;
            var includeAnswers = authenticated && withAnswers;

            // DB là nguồn chính (seed + quiz giảng viên tạo); bank chỉ là fallback khi DB down.
            // Parse Guid trước để tránh phụ thuộc cách EF translate Id.ToString() trên SQLite.
            var (dbQuiz, ambiguityError) = await FindQuizByReferenceAsync(quizId);
            if (ambiguityError != null)
                return Conflict(new { error = "QUIZ_AMBIGUOUS_TITLE", message = ambiguityError });

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
                        .Select(q => includeAnswers
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
                return Ok(ToPublicDto(quiz, includeAnswers));
            }

            return NotFound(new { error = "QUIZ_NOT_FOUND", quizId, supportedQuizzes = _quizBank.GetAllQuizzes().Select(q => q.Id) });
        }

        private static StatelessQuizPublicDto ToPublicDto(StatelessQuizDto quiz, bool includeAnswers)
        {
            return new StatelessQuizPublicDto
            {
                Id = quiz.Id,
                Title = quiz.Title,
                Topic = quiz.Topic,
                Difficulty = quiz.Difficulty,
                XpReward = quiz.XpReward,
                Questions = quiz.Questions
                    .Select(q => includeAnswers
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
        public async Task<IActionResult> GetByTopic(string topic, [FromQuery] bool withAnswers = false)
        {
            // QZ-003: cùng chính sách ẩn đáp án như GetById — mặc định false.
            var authenticated = JwtHelper.RequireToken(Request) == null;
            var includeAnswers = authenticated && withAnswers;

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
                        .Select(question => includeAnswers
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
                .Concat(bankQuizzes.Select(q => ToPublicDto(q, includeAnswers)))
                .GroupBy(q => q.Title, StringComparer.OrdinalIgnoreCase)
                .Select(g => g.First());

            return Ok(all);
        }

        
        
        
        
        [HttpPost("submit")]
        [RequireJwtRole]  
        public async Task<IActionResult> SubmitAttempt([FromBody] StatelessQuizAttemptRequest request)
        {
            // QZ-014: body null → 400 thay vì NRE 500.
            if (request == null)
                return BadRequest(new { error = "INVALID_REQUEST", message = "Dữ liệu bài làm trống." });

            try
            {
                // Quiz từ DB (seed/giảng viên tạo) → chấm trực tiếp từ câu hỏi trong DB;
                // quiz bank in-memory → chấm qua QuizBankStrategy.
                var (dbQuiz, ambiguityError) = await FindQuizByReferenceAsync(request.QuizId);
                if (ambiguityError != null)
                    return Conflict(new { error = "QUIZ_AMBIGUOUS_TITLE", message = ambiguityError });

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
                    // EvaluateAttempt đã ném KeyNotFoundException nếu quiz không tồn tại → an toàn.
                    var bankQuiz = _quizBank.GetQuizById(request.QuizId)!;

                    // PR-002: quiz bank (in-memory, không có row trong Quizzes) giờ VẪN ghi
                    // QuizAttempt — QuizId=null + QuizKey/QuizTitle làm reference → GetHistory
                    // hiển thị đủ attempt bank quiz (trước đây history gần như rỗng với người dùng thường).
                    var bankUserIdStr = JwtHelper.ExtractSubFromToken(Request);
                    User? bankUser = null;
                    if (Guid.TryParse(bankUserIdStr, out var bankUid))
                        bankUser = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == bankUid);

                    if (bankUser != null)
                    {
                        _dbContext.QuizAttempts.Add(new QuizAttempt(
                            bankUser.Id,
                            bankQuiz.Id,
                            bankQuiz.Title,
                            request.Answers.ToArray(),
                            result.Score,
                            result.MaxScore
                        ));

                        // Commit attempt TRƯỚC (giống nhánh DB quiz) — attempt luôn được lưu dù
                        // XP sau đó bị chặn bởi unique (UserId, QuizKey).
                        await _dbContext.SaveChangesAsync();

                        if (result.Passed && result.XpAwarded > 0)
                        {
                            try
                            {
                                bankUser.AwardXP(result.XpAwarded);
                                bankUser.RecordActivity();
                                _dbContext.QuizXpGrants.Add(new VisualizationDSA.Domain.Entities.QuizXpGrant(bankUser.Id, request.QuizId));
                                await _dbContext.SaveChangesAsync();
                            }
                            catch (DbUpdateException ex) when (IsXpGrantConflict(ex))
                            {
                                // Unique (UserId, QuizKey) bị vi phạm → request song song đã cấp XP.
                                // Attempt đã commit ở bước trên (giữ lại); chỉ huỷ XP.
                                await _dbContext.Entry(bankUser).ReloadAsync();
                                result.XpAwarded = 0;
                            }
                        }
                    }
                    else
                    {
                        result.XpAwarded = 0;
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

                        // QZ-001: commit attempt TRƯỚC khi đọc previousAttempts — chống race double XP
                        // (2 request đồng thời cùng thấy 0 pass → cả 2 được thưởng). Mẫu QuizService.cs:88-91.
                        await _dbContext.SaveChangesAsync();

                        int xpEarned = 0;
                        bool isFirstReward = false;
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
                                isFirstReward = true;
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

                            if (isFirstReward)
                            {
                                // QZ-005: ghi chung ledger QuizXpGrant (unique UserId+QuizKey) —
                                // cùng 1 quiz chỉ được cấp XP 1 lần bất kể kênh lesson/workspace.
                                _dbContext.QuizXpGrants.Add(new VisualizationDSA.Domain.Entities.QuizXpGrant(user.Id, quiz.Id.ToString()));
                            }

                            try
                            {
                                await _dbContext.SaveChangesAsync();
                            }
                            catch (DbUpdateException ex) when (isFirstReward && IsXpGrantConflict(ex))
                            {
                                // Unique (UserId, QuizKey) bị vi phạm → kênh khác đã cấp XP cho quiz này.
                                // Attempt đã commit ở bước trên (giữ lại — bài làm hợp lệ); chỉ huỷ XP.
                                await _dbContext.Entry(user).ReloadAsync();
                                result.XpAwarded = 0;
                            }
                        }
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

            var validationError = ValidateQuizPayload(quiz);
            if (validationError != null)
                return BadRequest(validationError);

            // TC-021: XP thưởng phải nằm trong khung 0..1000 (khớp giới hạn XP của lesson).
            if (quiz.XpReward < 0 || quiz.XpReward > 1000)
                return BadRequest(new { error = "INVALID_XP_REWARD", message = "XP thưởng phải nằm trong khoảng 0 đến 1000." });

            // TC-021: chặn tạo quiz trùng tiêu đề (so sánh chuẩn hóa, không phân biệt hoa thường).
            var normalizedTitle = NormalizeText(quiz.Title);
            var titleExists = await _dbContext.Quizzes.AnyAsync(q => q.Title.ToLower() == normalizedTitle.ToLower());
            if (titleExists)
                return Conflict(new { error = "QUIZ_TITLE_DUPLICATE", message = $"Đã tồn tại bài trắc nghiệm có tiêu đề '{quiz.Title}'. Hãy chọn tiêu đề khác." });

            
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

            // TC-021: ghi lại chủ sở hữu quiz — teacher khác quản lý quiz này sẽ bị chặn 403.
            Guid? ownerId = null;
            if (Guid.TryParse(JwtHelper.ExtractSubFromToken(Request), out var currentTeacherId))
                ownerId = currentTeacherId;

            
            // DB là NGUỒN DUY NHẤT cho quiz giảng viên tạo — không ghi thêm vào bank in-memory
            // (trước đây 2 nguồn → delete chỉ xóa 1 nơi, quiz đã xóa vẫn hiện qua fallback bank).
            var difficultyInt = quiz.Difficulty switch
            {
                "easy" => 1, "medium" => 3, "hard" => 5, _ => 3
            };
            var dbQuiz = new Quiz(quiz.Title, quiz.Topic, quiz.Topic, difficultyInt, quiz.XpReward, ownerId);
            foreach (var q in quiz.Questions)
            {
                // Add() tường minh cho từng câu hỏi (key client-generated — xem UpdateQuiz).
                _dbContext.QuizQuestions.Add(dbQuiz.AddQuestion(q.Text, q.Options.ToArray(), q.CorrectIndex, q.Explanation ?? ""));
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

            var validationError = ValidateQuizPayload(quiz);
            if (validationError != null)
                return BadRequest(validationError);

            // TC-021: XP thưởng phải nằm trong khung 0..1000 (khớp giới hạn XP của lesson).
            if (quiz.XpReward < 0 || quiz.XpReward > 1000)
                return BadRequest(new { error = "INVALID_XP_REWARD", message = "XP thưởng phải nằm trong khoảng 0 đến 1000." });

            
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
            // QZ-047: lookup theo Guid trước; theo Title chỉ khi không parse được — trùng title → 409.
            var (dbQuiz, ambiguityError) = await FindQuizByReferenceAsync(quizId);
            if (ambiguityError != null)
                return Conflict(new { error = "QUIZ_AMBIGUOUS_TITLE", message = ambiguityError });
            if (dbQuiz == null)
                return NotFound(new { error = "QUIZ_NOT_FOUND", message = $"Không tìm thấy quiz với ID {quizId} để cập nhật." });

            // TC-021: teacher chỉ được sửa quiz mình tạo (seed quiz là nội dung chung, không thuộc ai).
            if (!IsOwnerOrAdmin(dbQuiz))
                return StatusCode(403, new { error = "FORBIDDEN", message = "Bạn không có quyền chỉnh sửa bài trắc nghiệm của giáo viên khác." });

            // TC-021: chặn đổi sang tiêu đề trùng quiz khác (loại trừ chính nó).
            var normalizedTitle = NormalizeText(quiz.Title);
            var duplicate = await _dbContext.Quizzes
                .AnyAsync(q => q.Id != dbQuiz.Id && q.Title.ToLower() == normalizedTitle.ToLower());
            if (duplicate)
                return Conflict(new { error = "QUIZ_TITLE_DUPLICATE", message = $"Đã tồn tại bài trắc nghiệm có tiêu đề '{quiz.Title}'. Hãy chọn tiêu đề khác." });

            {
                var difficultyInt = quiz.Difficulty switch
                {
                    "easy" => 1, "medium" => 3, "hard" => 5, _ => 3
                };
                dbQuiz.Update(quiz.Title, quiz.Topic, quiz.Topic, difficultyInt, quiz.XpReward);
                
                
                dbQuiz.ClearQuestions();
                foreach (var q in quiz.Questions)
                {
                    // Add() tường minh — QuizQuestion.Id là key client-generated, DetectChanges
                    // mặc định coi là entity đã tồn tại → UPDATE 0 row → DbUpdateConcurrencyException.
                    var questionEntity = dbQuiz.AddQuestion(q.Text, q.Options.ToArray(), q.CorrectIndex, q.Explanation ?? "");
                    _dbContext.QuizQuestions.Add(questionEntity);
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

            // QZ-047: lookup theo Guid trước; theo Title chỉ khi không parse được — trùng title → 409.
            var (dbQuiz, ambiguityError) = await FindQuizByReferenceAsync(quizId, includeQuestions: false);
            if (ambiguityError != null)
                return Conflict(new { error = "QUIZ_AMBIGUOUS_TITLE", message = ambiguityError });

            // TC-021: teacher chỉ được xóa quiz mình tạo (seed quiz là nội dung chung).
            if (dbQuiz != null && !IsOwnerOrAdmin(dbQuiz))
                return StatusCode(403, new { error = "FORBIDDEN", message = "Bạn không có quyền xóa bài trắc nghiệm của giáo viên khác." });

            if (dbQuiz != null)
            {
                // TC-022: xóa MỀM thay vì hard-delete — giữ nguyên QuizAttempt (lịch sử làm bài,
                // bằng chứng XP) và QuizXpGrant ledger. Query filter toàn cục ẩn quiz khỏi mọi GET.
                dbQuiz.Delete();
                await _dbContext.SaveChangesAsync();
            }

            if (!deletedInMemory && dbQuiz == null)
                return NotFound(new { error = "QUIZ_NOT_FOUND", message = $"Không tìm thấy quiz với ID {quizId} để xóa." });

            return Ok(new { message = "Quiz đã được xóa thành công." });
        }

        // TC-001: GET manage — danh sách quiz mà teacher/admin có thể quản lý (QuizBuilderTab).
        // Teacher chỉ thấy quiz mình tạo + seed quiz chung; admin thấy tất cả.
        [HttpGet("manage")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> GetManageQuizzes()
        {
            var isAdmin = JwtHelper.IsAdmin(Request);
            Guid? currentTeacherId = null;
            if (!isAdmin && Guid.TryParse(JwtHelper.ExtractSubFromToken(Request), out var parsedTeacherId))
                currentTeacherId = parsedTeacherId;

            var query = _dbContext.Quizzes.AsNoTracking();
            if (!isAdmin && currentTeacherId.HasValue)
            {
                query = query.Where(q => q.CreatedByTeacherId == null || q.CreatedByTeacherId == currentTeacherId.Value);
            }

            var quizzes = await query
                .OrderBy(q => q.Title)
                .Select(q => new
                {
                    id = q.Id.ToString(),
                    q.Title,
                    q.Topic,
                    difficulty = DifficultyToLabel(q.Difficulty),
                    xpReward = q.XPReward,
                    questionCount = q.Questions.Count,
                    canEdit = true
                })
                .ToListAsync();

            return Ok(new { quizzes });
        }

        // TC-001: GET manage/{quizId} — chi tiết quiz kèm đáp án (teacher/admin sửa câu hỏi).
        [HttpGet("manage/{quizId}")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> GetManageQuizById(string quizId)
        {
            var (dbQuiz, ambiguityError) = await FindQuizByReferenceAsync(quizId);
            if (ambiguityError != null)
                return Conflict(new { error = "QUIZ_AMBIGUOUS_TITLE", message = ambiguityError });
            if (dbQuiz == null)
                return NotFound(new { error = "QUIZ_NOT_FOUND", message = $"Không tìm thấy quiz với ID {quizId}." });

            if (!IsOwnerOrAdmin(dbQuiz))
                return StatusCode(403, new { error = "FORBIDDEN", message = "Bạn không có quyền quản lý bài trắc nghiệm của giáo viên khác." });

            return Ok(new StatelessQuizPublicDto
            {
                Id = dbQuiz.Id.ToString(),
                Title = dbQuiz.Title,
                Topic = dbQuiz.Topic,
                Difficulty = DifficultyToLabel(dbQuiz.Difficulty),
                XpReward = dbQuiz.XPReward,
                Questions = dbQuiz.Questions
                    .Select(q => new StatelessQuestionPublicDto
                    {
                        Id = q.Id.ToString(),
                        Text = q.Question,
                        Options = q.Options.ToList(),
                        CorrectIndex = q.CorrectIndex,
                        Explanation = q.Explanation
                    })
                    .ToList()
            });
        }

        // TC-001: GET manage/{quizId}/questions — danh sách câu hỏi con (kèm đáp án cho teacher).
        [HttpGet("manage/{quizId}/questions")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> GetManageQuizQuestions(string quizId)
        {
            var (dbQuiz, ambiguityError) = await FindQuizByReferenceAsync(quizId);
            if (ambiguityError != null)
                return Conflict(new { error = "QUIZ_AMBIGUOUS_TITLE", message = ambiguityError });
            if (dbQuiz == null)
                return NotFound(new { error = "QUIZ_NOT_FOUND", message = $"Không tìm thấy quiz với ID {quizId}." });

            if (!IsOwnerOrAdmin(dbQuiz))
                return StatusCode(403, new { error = "FORBIDDEN", message = "Bạn không có quyền quản lý bài trắc nghiệm của giáo viên khác." });

            var questions = dbQuiz.Questions
                .Select(q => new StatelessQuestionPublicDto
                {
                    Id = q.Id.ToString(),
                    Text = q.Question,
                    Options = q.Options.ToList(),
                    CorrectIndex = q.CorrectIndex,
                    Explanation = q.Explanation
                })
                .ToList();
            return Ok(new { questions });
        }

        // TC-001: POST manage/{quizId}/questions — thêm 1 câu hỏi con.
        [HttpPost("manage/{quizId}/questions")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> AddManageQuizQuestion(string quizId, [FromBody] StatelessQuestionDto question)
        {
            if (question == null)
                return BadRequest(new { error = "INVALID_QUESTION", message = "Dữ liệu câu hỏi trống." });

            var (dbQuiz, ambiguityError) = await FindQuizByReferenceAsync(quizId);
            if (ambiguityError != null)
                return Conflict(new { error = "QUIZ_AMBIGUOUS_TITLE", message = ambiguityError });
            if (dbQuiz == null)
                return NotFound(new { error = "QUIZ_NOT_FOUND", message = $"Không tìm thấy quiz với ID {quizId}." });

            if (!IsOwnerOrAdmin(dbQuiz))
                return StatusCode(403, new { error = "FORBIDDEN", message = "Bạn không có quyền quản lý bài trắc nghiệm của giáo viên khác." });

            if (dbQuiz.Questions.Count >= 100)
                return BadRequest(new { error = "INVALID_QUIZ", message = "Số lượng câu hỏi trong một bài quiz tối đa là 100." });

            var questionError = ValidateQuestionPayload(question, dbQuiz.Questions.Count + 1);
            if (questionError != null)
                return BadRequest(questionError);

            // Add() tường minh — key client-generated không được để DetectChanges tự gán state.
            var questionEntity = dbQuiz.AddQuestion(
                NormalizeText(question.Text),
                question.Options.Select(NormalizeText).ToArray(),
                question.CorrectIndex,
                NormalizeText(question.Explanation));
            _dbContext.QuizQuestions.Add(questionEntity);
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Đã thêm câu hỏi vào bài trắc nghiệm." });
        }

        // TC-001: PUT manage/{quizId}/questions/{questionId} — sửa 1 câu hỏi con.
        [HttpPut("manage/{quizId}/questions/{questionId}")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> UpdateManageQuizQuestion(string quizId, string questionId, [FromBody] StatelessQuestionDto question)
        {
            if (question == null)
                return BadRequest(new { error = "INVALID_QUESTION", message = "Dữ liệu câu hỏi trống." });

            if (!Guid.TryParse(questionId, out var questionGuid))
                return BadRequest(new { error = "INVALID_QUESTION_ID", message = "ID câu hỏi không hợp lệ." });

            var (dbQuiz, ambiguityError) = await FindQuizByReferenceAsync(quizId);
            if (ambiguityError != null)
                return Conflict(new { error = "QUIZ_AMBIGUOUS_TITLE", message = ambiguityError });
            if (dbQuiz == null)
                return NotFound(new { error = "QUIZ_NOT_FOUND", message = $"Không tìm thấy quiz với ID {quizId}." });

            if (!IsOwnerOrAdmin(dbQuiz))
                return StatusCode(403, new { error = "FORBIDDEN", message = "Bạn không có quyền quản lý bài trắc nghiệm của giáo viên khác." });

            var existing = dbQuiz.Questions.FirstOrDefault(q => q.Id == questionGuid);
            if (existing == null)
                return NotFound(new { error = "QUESTION_NOT_FOUND", message = "Không tìm thấy câu hỏi trong bài trắc nghiệm này." });

            var questionError = ValidateQuestionPayload(question, 0);
            if (questionError != null)
                return BadRequest(questionError);

            existing.Update(
                NormalizeText(question.Text),
                question.Options.Select(NormalizeText).ToArray(),
                question.CorrectIndex,
                NormalizeText(question.Explanation));
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Đã cập nhật câu hỏi." });
        }

        // TC-001: DELETE manage/{quizId}/questions/{questionId} — xóa 1 câu hỏi con.
        [HttpDelete("manage/{quizId}/questions/{questionId}")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> DeleteManageQuizQuestion(string quizId, string questionId)
        {
            if (!Guid.TryParse(questionId, out var questionGuid))
                return BadRequest(new { error = "INVALID_QUESTION_ID", message = "ID câu hỏi không hợp lệ." });

            var (dbQuiz, ambiguityError) = await FindQuizByReferenceAsync(quizId);
            if (ambiguityError != null)
                return Conflict(new { error = "QUIZ_AMBIGUOUS_TITLE", message = ambiguityError });
            if (dbQuiz == null)
                return NotFound(new { error = "QUIZ_NOT_FOUND", message = $"Không tìm thấy quiz với ID {quizId}." });

            if (!IsOwnerOrAdmin(dbQuiz))
                return StatusCode(403, new { error = "FORBIDDEN", message = "Bạn không có quyền quản lý bài trắc nghiệm của giáo viên khác." });

            if (!dbQuiz.RemoveQuestion(questionGuid))
                return NotFound(new { error = "QUESTION_NOT_FOUND", message = "Không tìm thấy câu hỏi trong bài trắc nghiệm này." });

            await _dbContext.SaveChangesAsync();
            return Ok(new { message = "Đã xóa câu hỏi." });
        }

        // TC-021: seed quiz (CreatedByTeacherId = null) là nội dung chung — mọi teacher quản lý được;
        // quiz do teacher tạo chỉ teacher đó (hoặc admin) quản lý.
        private bool IsOwnerOrAdmin(Quiz quiz)
        {
            if (JwtHelper.IsAdmin(Request)) return true;
            if (quiz.CreatedByTeacherId == null) return true; // seed — không thuộc teacher riêng
            var currentTeacherIdStr = JwtHelper.ExtractSubFromToken(Request);
            return Guid.TryParse(currentTeacherIdStr, out var currentTeacherId) && quiz.CreatedByTeacherId == currentTeacherId;
        }

        // TC-001/TC-021: validate chung payload quiz (rút gọn trùng lặp giữa create/update).
        private static IActionResult? ValidateQuizPayload(StatelessQuizDto quiz)
        {
            if (string.IsNullOrWhiteSpace(quiz.Title))
                return new BadRequestObjectResult(new { error = "INVALID_QUIZ", message = "Quiz phải có tiêu đề." });

            if (quiz.Title.Length > 200)
                return new BadRequestObjectResult(new { error = "INVALID_QUIZ", message = "Tiêu đề quiz không được vượt quá 200 ký tự." });

            if (quiz.Questions == null || quiz.Questions.Count == 0)
                return new BadRequestObjectResult(new { error = "INVALID_QUIZ", message = "Quiz phải có ít nhất 1 câu hỏi." });

            if (quiz.Questions.Count > 100)
                return new BadRequestObjectResult(new { error = "INVALID_QUIZ", message = "Số lượng câu hỏi trong một bài quiz tối đa là 100." });

            for (int i = 0; i < quiz.Questions.Count; i++)
            {
                var questionError = ValidateQuestionPayload(quiz.Questions[i], i + 1);
                if (questionError != null) return questionError;
            }

            return null;
        }

        private static IActionResult? ValidateQuestionPayload(StatelessQuestionDto q, int index)
        {
            if (string.IsNullOrWhiteSpace(q.Text))
                return new BadRequestObjectResult(new { error = "INVALID_QUIZ", message = $"Câu hỏi thứ {index} không được để trống nội dung." });
            if (q.Text.Length > 1000)
                return new BadRequestObjectResult(new { error = "INVALID_QUIZ", message = $"Nội dung câu hỏi thứ {index} không được dài quá 1000 ký tự." });
            if (q.Options == null || q.Options.Count < 2 || q.Options.Count > 10)
                return new BadRequestObjectResult(new { error = "INVALID_QUIZ", message = $"Câu hỏi thứ {index} phải có từ 2 đến 10 đáp án lựa chọn." });
            if (q.CorrectIndex < 0 || q.CorrectIndex >= q.Options.Count)
                return new BadRequestObjectResult(new { error = "INVALID_QUIZ", message = $"Đáp án đúng của câu hỏi thứ {index} không hợp lệ." });
            return null;
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
            if (targetUserId != currentUserId)
            {
                // TC-042 (pattern AD-003): quyền Teacher/Admin đối chiếu role từ DB, KHÔNG tin claim
                // trong token — teacher bị demote mất quyền xem lịch sử người khác NGAY.
                var isTeacherOrAdmin = false;
                if (Guid.TryParse(currentUserId, out var currentUserGuid))
                {
                    var currentUser = await _dbContext.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == currentUserGuid);
                    if (currentUser != null)
                    {
                        isTeacherOrAdmin = currentUser.Role == "Teacher" || currentUser.Role == "Admin";
                    }
                    else
                    {
                        // User chỉ tồn tại ở memory (demo) — fallback về claim để không phá luồng demo.
                        isTeacherOrAdmin = JwtHelper.IsTeacherOrAdmin(Request);
                    }
                }

                if (!isTeacherOrAdmin)
                {
                    return StatusCode(403, new { error = "FORBIDDEN", message = "Bạn không có quyền xem lịch sử của người khác." });
                }
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
                    // PR-002: attempt bank quiz (QuizId null) fallback về QuizKey/QuizTitle.
                    quizTitle = a.Quiz != null ? a.Quiz.Title : a.QuizTitle,
                    quizTopic = a.Quiz != null ? a.Quiz.Topic : a.QuizKey,
                    a.Score,
                    a.MaxScore,
                    a.Passed,
                    a.AttemptedAt
                })
                .ToListAsync();

            return Ok(attempts);
        }

        // QZ-047: lookup quiz theo reference (Guid ưu tiên, Title fallback). Khi nhiều quiz trùng
        // Title → trả lỗi ambiguity (409) thay vì FirstOrDefault bất định. Parse Guid trước để tránh
        // phụ thuộc cách EF translate Id.ToString() trên SQLite.
        private async Task<(Quiz? Quiz, string? AmbiguityError)> FindQuizByReferenceAsync(string quizId, bool includeQuestions = true)
        {
            if (Guid.TryParse(quizId, out var quizGuid))
            {
                var byId = includeQuestions
                    ? await _dbContext.Quizzes.Include(q => q.Questions).FirstOrDefaultAsync(q => q.Id == quizGuid)
                    : await _dbContext.Quizzes.FirstOrDefaultAsync(q => q.Id == quizGuid);
                return (byId, null);
            }

            var byTitle = includeQuestions
                ? await _dbContext.Quizzes.Include(q => q.Questions).Where(q => q.Title == quizId).ToListAsync()
                : await _dbContext.Quizzes.Where(q => q.Title == quizId).ToListAsync();

            if (byTitle.Count > 1)
                return (null, $"Tồn tại nhiều quiz trùng tiêu đề '{quizId}' — hãy dùng ID để phân biệt.");

            return (byTitle.FirstOrDefault(), null);
        }

        // QZ-001/QZ-002: xác định DbUpdateException do vi phạm unique (UserId, QuizKey) — không nuốt lỗi khác.
        private static bool IsXpGrantConflict(DbUpdateException ex)
            => ex.Entries.Any(e => e.Entity is VisualizationDSA.Domain.Entities.QuizXpGrant);

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
