using Asp.Versioning;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using VisualizationDSA.Domain.Engine;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Domain.Strategies;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.WebApi.Filters;

namespace VisualizationDSA.WebApi.Controllers
{
    
    
    
    
    
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/concepts/auth")]
    public class StatelessAuthController : ControllerBase
    {
        private readonly StatelessAuthStrategy _authStrategy;
        private readonly ApplicationDbContext _dbContext;
        private readonly IWebHostEnvironment _env;

        public StatelessAuthController(StatelessAuthStrategy authStrategy, ApplicationDbContext dbContext, IWebHostEnvironment env)
        {
            _authStrategy = authStrategy;
            _dbContext = dbContext;
            _env = env;
        }

        // ===== LM-005/LM-006: gate truy cập bài học + chống XP farm =====

        /// <summary>
        /// LM-005: gate thống nhất cho /auth/progress/{lessonId} (giống CompleteLesson):
        /// 1) Bài chưa Published hoặc course chưa publish → chỉ Admin/chủ sở hữu.
        /// 2) Bài thuộc khóa Premium → mọi user không premium đều bị chặn.
        /// </summary>
        private async Task<IActionResult?> CheckLessonAccessAsync(Lesson lesson, Course? course)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            User? user = null;
            if (userIdStr != null && Guid.TryParse(userIdStr, out var parsedUserId))
                user = await _dbContext.Users.FindAsync(parsedUserId);

            var isTeacherOrAdmin = JwtHelper.IsTeacherOrAdmin(Request);
            var isOwner = course != null && user != null && course.TeacherId == user.Id;

            var isPublished = lesson.PublishStatus == LessonPublishStatus.Published
                              && (course == null || course.IsPublished);
            if (!isPublished && !isTeacherOrAdmin && !isOwner)
            {
                return NotFound(new { error = "LESSON_NOT_FOUND", message = "Không tìm thấy bài học." });
            }

            if (course != null && course.IsPremium && !isTeacherOrAdmin && !isOwner && (user == null || !user.IsPremium))
            {
                return StatusCode(403, new { error = "PREMIUM_REQUIRED", message = "Khóa học này yêu cầu tài khoản Premium để truy cập." });
            }

            return null;
        }

        // LM-006: chống XP farm — hạn mức XP/ngày/user + reason whitelist + rate limit "auth".
        private const int XpAwardMinPerRequest = 1;
        private const int XpAwardMaxPerRequest = 500;
        private const int XpAwardDailyCap = 500;
        private static readonly ConcurrentDictionary<string, XpDailyCounter> XpAwardCounters = new();

        private sealed class XpDailyCounter
        {
            public string Day = string.Empty;
            public int Total;
        }

        private static bool IsAllowedXpReason(string? reason)
        {
            if (string.IsNullOrWhiteSpace(reason)) return false;
            var r = reason.Trim();
            if (r == "Hoàn thành nhiệm vụ bài học") return true;
            if (r.StartsWith("Hoàn thành Quiz:", StringComparison.Ordinal)) return true;
            if (r.StartsWith("Hoàn thành CodeLab:", StringComparison.Ordinal)) return true;
            return false;
        }

        // AU-033: VerifyPasswordDelegate giữ default (helper chung BCrypt→SHA256 trong strategy)
        // — bỏ static ctor gán delegate trùng logic cũ.

        private static string HashPassword(string password)
        {
            // BCrypt workFactor 12 — đồng bộ với AuthService chuẩn (AU-034: tên đúng nghĩa).
            return BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
        }

        // AU-037: chuẩn hóa email trước mọi check/insert.
        private static string NormalizeEmail(string email)
            => (email ?? string.Empty).Trim().ToLowerInvariant();

        
        
        
        
        [HttpPost("register")]
        [EnableRateLimiting("auth")]
        public async Task<ActionResult<StatelessAuthResponse>> Register([FromBody] StatelessRegisterRequest? request)
        {
            if (request == null)
                return BadRequest(new { error = "INVALID_INPUT", message = "Dữ liệu đăng ký không hợp lệ." });

            try
            {
                // AU-037: normalize email trước mọi check/insert — "User@x.com" ≡ "user@x.com".
                request.Email = NormalizeEmail(request.Email);

                // Chống identity confusion: email đã tồn tại trong DB (dù chưa vào memory sau restart)
                // → từ chối ngay, KHÔNG cho "đăng ký lại" email của người khác.
                var emailExists = await _dbContext.Users.AnyAsync(u => u.Email.ToLower() == request.Email);
                if (emailExists)
                    return BadRequest(new { error = "REGISTRATION_FAILED", message = "Đăng ký không thành công. Vui lòng kiểm tra lại thông tin." });

                // VALIDATE TRƯỚC (in-memory strategy ném ArgumentException khi trùng/không hợp lệ)
                // — KHÔNG ghi DB trước khi validate.
                var tempId = Guid.NewGuid().ToString();
                var response = _authStrategy.Register(request, tempId);
                response.User.Role = "Student";
                // Token refresh đầu trỏ tempId sẽ bị bỏ — revoke ngay để không dangle 30 ngày.
                _authStrategy.Logout(response.RefreshToken);

                // Ghi DB sau khi validate OK. DB lỗi → xóa user khỏi memory + 503 rõ ràng.
                Guid dbUserId;
                try
                {
                    var dbUser = new User(request.Email, request.Username, HashPassword(request.Password));
                    _dbContext.Users.Add(dbUser);
                    await _dbContext.SaveChangesAsync();
                    dbUserId = dbUser.Id;
                }
                catch (Microsoft.EntityFrameworkCore.DbUpdateException)
                {
                    // Trùng username/email (race hoặc user chỉ tồn tại ở DB) → 400, không phải 503.
                    _authStrategy.RemoveUser(tempId);
                    return BadRequest(new { error = "REGISTRATION_FAILED", message = "Đăng ký không thành công. Vui lòng kiểm tra lại thông tin." });
                }
                catch (Exception dbEx)
                {
                    _authStrategy.RemoveUser(tempId);
                    Serilog.Log.Error(dbEx, "Đăng ký in-memory thành công nhưng KHÔNG lưu được vào DB.");
                    return StatusCode(StatusCodes.Status503ServiceUnavailable, new
                    {
                        error = "DB_UNAVAILABLE",
                        message = "Đăng ký chưa được lưu vĩnh viễn do máy chủ dữ liệu gặp sự cố. Vui lòng thử lại sau."
                    });
                }

                // Đồng bộ id in-memory với id DB rồi phát hành lại token — sub phải khớp DB
                // (trước đây token sub = id tạm → lesson progress/XP bị orphan).
                if (_authStrategy.ChangeUserId(tempId, dbUserId.ToString()))
                {
                    response = _authStrategy.Login(new VisualizationDSA.Domain.Engine.StatelessLoginRequest
                    {
                        Email = request.Email,
                        Password = request.Password
                    });
                    response.User.Role = "Student";
                }
                else
                {
                    response.User.Id = dbUserId.ToString();
                }

                return Ok(response);
            }
            catch (ArgumentException)
            {
                // AU-013: message generic cho CẢ 2 nhánh (DB + in-memory) — không lộ email/username
                // tồn tại qua ex.Message (hết user enumeration).
                return BadRequest(new { error = "REGISTRATION_FAILED", message = "Đăng ký không thành công. Vui lòng kiểm tra lại thông tin." });
            }
        }

        
        
        
        
        [HttpPost("login")]
        [EnableRateLimiting("auth")]
        public async Task<ActionResult<StatelessAuthResponse>> Login([FromBody] StatelessLoginRequest request)
        {
            try
            {
                // AU-037: normalize email trước khi tra cứu DB + memory.
                request.Email = NormalizeEmail(request.Email);

                User dbUser = null;
                try
                {
                    
                    dbUser = await _dbContext.Users
                        .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email);
                    if (dbUser != null)
                    {
                        _authStrategy.EnsureUserInMemory(
                            dbUser.Id.ToString(),
                            dbUser.Email,
                            dbUser.Username,
                            dbUser.PasswordHash,
                            dbUser.IsPremium,
                            dbUser.Role,
                            dbUser.TotalXP,
                            dbUser.CurrentLevel,
                            dbUser.StreakDays
                        );
                    }
                }
                catch (Exception ex)
                {
                    // AU-039: fail-closed — không xác minh được trạng thái tài khoản (ban/premium)
                    // thì TỪ CHỐI đăng nhập, không lặng lẽ chuyển sang in-memory auth.
                    Serilog.Log.Error(ex, "Không thể kiểm tra trạng thái tài khoản khi đăng nhập — từ chối để an toàn (fail-closed).");
                    return StatusCode(StatusCodes.Status503ServiceUnavailable, new
                    {
                        error = "DB_UNAVAILABLE",
                        message = "Hệ thống đang bảo trì, vui lòng thử lại sau."
                    });
                }

                var response = _authStrategy.Login(request);

                // Check ban SAU khi verify mật khẩu — trả 401 chung chống enumeration
                // (trước đây trả 403 ACCOUNT_BANNED trước verify → phân biệt được email tồn tại).
                if (dbUser != null && !dbUser.IsActive)
                {
                    // Revoke refresh token vừa sinh — tránh mồ côi trong dictionary.
                    _authStrategy.Logout(response.RefreshToken);
                    return Unauthorized(new { error = "LOGIN_FAILED", message = "Email hoặc mật khẩu không đúng." });
                }

                if (dbUser != null)
                {
                    
                    response.User.Role = dbUser.Role;
                    response.User.IsPremium = dbUser.IsPremium;
                    response.User.TotalXP = dbUser.TotalXP;
                    response.User.CurrentLevel = dbUser.CurrentLevel;

                    // Cập nhật LastLoginAt (trước đây bị mất khi refactor).
                    dbUser.RecordLogin();
                    await _dbContext.SaveChangesAsync();
                }

                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { error = "LOGIN_FAILED", message = ex.Message });
            }
        }

        
        
        
        
        [HttpPost("refresh")]
        [EnableRateLimiting("auth")]
        public async Task<ActionResult<StatelessAuthResponse>> Refresh([FromBody] StatelessRefreshRequest request)
        {
            try
            {
                // Chặn user BỊ BAN trước khi rotation — không để token mới sinh thừa (trước đây
                // xoay token rồi mới check ban → token mới mồ côi trong dictionary).
                var ownerId = _authStrategy.GetRefreshTokenOwner(request.RefreshToken);
                if (ownerId != null && Guid.TryParse(ownerId, out var ownerGuid))
                {
                    try
                    {
                        var ownerUser = await _dbContext.Users.FindAsync(ownerGuid);
                        if (ownerUser != null && !ownerUser.IsActive)
                        {
                            _authStrategy.Logout(request.RefreshToken);
                            return Unauthorized(new { error = "REFRESH_FAILED", message = "Phiên đăng nhập không còn hiệu lực." });
                        }
                    }
                    catch (Exception ex)
                    {
                        // AU-039: fail-closed — không xác minh được trạng thái tài khoản thì
                        // TỪ CHỐI refresh (trước đây bỏ qua ban check → user bị ban refresh vô hạn).
                        Serilog.Log.Error(ex, "Không thể kiểm tra trạng thái tài khoản khi refresh — từ chối để an toàn (fail-closed).");
                        return StatusCode(StatusCodes.Status503ServiceUnavailable, new
                        {
                            error = "DB_UNAVAILABLE",
                            message = "Hệ thống đang bảo trì, vui lòng thử lại sau."
                        });
                    }
                }

                // Chỉ chấp nhận refresh token do server sinh ra (GenerateAuthResponse).
                // AU-030: user đã xóa → strategy ném UnauthorizedAccessException (401) — không lộ 404.
                var response = _authStrategy.RefreshToken(request.RefreshToken);

                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { error = "REFRESH_FAILED", message = ex.Message });
            }
        }

        
        
        
        
        [HttpPost("logout")]
        [EnableRateLimiting("auth")]
        public IActionResult Logout([FromBody] StatelessRefreshRequest request)
        {
            _authStrategy.Logout(request.RefreshToken);
            return NoContent();
        }

        
        
        
        
        [HttpGet("me")]
        [RequireJwtRole]
        public async Task<ActionResult<StatelessUserDto>> GetMe()
        {
            var id = JwtHelper.ExtractSubFromToken(Request);
            if (string.IsNullOrEmpty(id))
                return Unauthorized(new { error = "UNAUTHORIZED", message = "Không xác định được người dùng." });


            // demo-user-001 chỉ tồn tại khi EnableDemoAccounts — sau restart (production) token cũ
            // sub=demo không còn hợp lệ → 401 để frontend dọn session (thay vì 404 → profile stale).
            if (id == "demo-user-001" && !VisualizationDSA.Domain.Strategies.StatelessAuthStrategy.EnableDemoAccounts)
                return Unauthorized(new { error = "UNAUTHORIZED", message = "Phiên đăng nhập không còn hiệu lực." });
            try
            {
                if (id != "demo-user-001" && Guid.TryParse(id, out var dbUserId))
                {
                    var dbUser = await _dbContext.Users.FindAsync(dbUserId);
                    if (dbUser != null)
                    {
                        _authStrategy.EnsureUserInMemory(
                            dbUser.Id.ToString(),
                            dbUser.Email,
                            dbUser.Username,
                            dbUser.PasswordHash,
                            dbUser.IsPremium,
                            dbUser.Role,
                            dbUser.TotalXP,
                            dbUser.CurrentLevel,
                            dbUser.StreakDays
                        );
                    }
                }
                var user = _authStrategy.GetProfile(id);
                return Ok(user);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = "USER_NOT_FOUND", message = ex.Message });
            }
        }

        
        
        
        
        [HttpGet("progress")]
        [RequireJwtRole]
        public async Task<ActionResult<StatelessUserProgressDto>> GetProgress()
        {
            var id = JwtHelper.ExtractSubFromToken(Request);
            if (string.IsNullOrEmpty(id))
                return Unauthorized(new { error = "UNAUTHORIZED", message = "Không xác định được người dùng." });

            // PR-009: lastActiveDate phải THẬT từ DB (GM-008 — streak là trách nhiệm server),
            // không lấy từ cache in-memory có thể stale sau restart/EvictIdleUsers.
            DateTime? lastActiveDate = null;
            try
            {
                if (id != "demo-user-001" && Guid.TryParse(id, out var dbUserId))
                {
                    var dbUser = await _dbContext.Users.FindAsync(dbUserId);
                    if (dbUser != null)
                    {
                        lastActiveDate = dbUser.LastActivityDate;
                        _authStrategy.EnsureUserInMemory(
                            dbUser.Id.ToString(),
                            dbUser.Email,
                            dbUser.Username,
                            dbUser.PasswordHash,
                            dbUser.IsPremium,
                            dbUser.Role,
                            dbUser.TotalXP,
                            dbUser.CurrentLevel,
                            dbUser.StreakDays
                        );
                    }
                }
                var progress = _authStrategy.GetUserProgress(id);
                // PR-009: lastActiveDate/streak THẬT từ DB (GM-008 — server là source of truth),
                // không dùng giá trị cache in-memory có thể stale sau restart/EvictIdleUsers.
                progress.LastActiveDate = lastActiveDate;
                if (id != "demo-user-001" && Guid.TryParse(id, out var progressUserId))
                {
                    var dbUserProgress = await _dbContext.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == progressUserId);
                    if (dbUserProgress != null)
                        progress.CurrentStreak = dbUserProgress.StreakDays;
                }
                return Ok(progress);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = "USER_NOT_FOUND", message = ex.Message });
            }
        }

        
        
        
        
        /// <summary>Tiến độ chi tiết của 1 bài học (lesson flow sync server-side).</summary>
        [HttpGet("progress/{lessonId}")]
        [RequireJwtRole]
        public async Task<IActionResult> GetLessonProgress(Guid lessonId)
        {
            var id = JwtHelper.ExtractSubFromToken(Request);
            if (string.IsNullOrEmpty(id) || !Guid.TryParse(id, out var userId))
                return Unauthorized(new { error = "UNAUTHORIZED", message = "Không xác định được người dùng." });

            // LM-005: gate publish + premium — học viên đoán GUID bài Draft/premium
            // không được đọc/ghi progress (trước đây bỏ qua gate hoàn toàn).
            var moduleItem = await _dbContext.ModuleItems
                .Include(m => m.Module).ThenInclude(m => m.Course)
                .Include(m => m.Lesson)
                .FirstOrDefaultAsync(i => i.LessonId == lessonId);
            if (moduleItem == null || moduleItem.Lesson == null)
                return NotFound(new { error = "LESSON_NOT_FOUND", message = "Không tìm thấy bài học." });
            var accessBlock = await CheckLessonAccessAsync(moduleItem.Lesson, moduleItem.Module?.Course);
            if (accessBlock != null) return accessBlock;

            var progress = await _dbContext.UserLessonProgresses
                .FirstOrDefaultAsync(p => p.UserId == userId && p.LessonId == lessonId);

            if (progress == null)
                return Ok(new { });

            return Ok(new
            {
                hasWatchedVisualizer = progress.HasWatchedVisualizer,
                quizScore = progress.QuizScore,
                bestScore = progress.BestScore,
                codelabCompleted = progress.CodelabCompleted,
                xpAwarded = progress.XPRewarded
            });
        }

        /// <summary>Upsert tiến độ bài học — bestScore luôn giữ giá trị cao nhất.</summary>
        [HttpPost("progress/{lessonId}")]
        [RequireJwtRole]
        public async Task<IActionResult> SaveLessonProgress(Guid lessonId, [FromBody] SaveLessonProgressRequest request)
        {
            var id = JwtHelper.ExtractSubFromToken(Request);
            if (string.IsNullOrEmpty(id) || !Guid.TryParse(id, out var userId))
                return Unauthorized(new { error = "UNAUTHORIZED", message = "Không xác định được người dùng." });

            // LM-005: gate publish + premium trước khi ghi progress (dùng chung với GET).
            var moduleItem = await _dbContext.ModuleItems
                .Include(m => m.Module).ThenInclude(m => m.Course)
                .Include(m => m.Lesson)
                .FirstOrDefaultAsync(i => i.LessonId == lessonId);
            if (moduleItem == null || moduleItem.Lesson == null)
                return NotFound(new { error = "LESSON_NOT_FOUND", message = "Không tìm thấy bài học." });
            var accessBlock = await CheckLessonAccessAsync(moduleItem.Lesson, moduleItem.Module?.Course);
            if (accessBlock != null) return accessBlock;

            // LM-021: chốt thang điểm quizScore = percent 0..100 — validate thay vì clamp hiểu nhầm
            // (trước đây im lặng kẹp 4 → 4% khi frontend gửi sai thang đo).
            if (request.QuizScore.HasValue && (request.QuizScore.Value < 0 || request.QuizScore.Value > 100))
                return BadRequest(new { error = "INVALID_QUIZ_SCORE", message = "Điểm quiz phải nằm trong khoảng 0–100 (%)." });

            var progress = await _dbContext.UserLessonProgresses
                .FirstOrDefaultAsync(p => p.UserId == userId && p.LessonId == lessonId);

            if (progress == null)
            {
                progress = new UserLessonProgress(userId, lessonId);
                _dbContext.UserLessonProgresses.Add(progress);
            }

            if (request.HasWatchedVisualizer) progress.RecordVisualizerWatched();
            if (request.QuizScore.HasValue) progress.RecordQuizAttempt(request.QuizScore.Value);
            // LM-056: BestScore từ client chỉ là best-effort — giữ giá trị cao nhất, không bao giờ giảm.
            if (request.BestScore > progress.BestScore) progress.RecordBestScore(request.BestScore);
            if (request.CodelabCompleted) progress.RecordCodelabCompleted();

            // Rule "Completed" khớp frontend: quiz pass (≥70% theo client) HOẶC hoàn thành codelab.
            // KHÔNG mark Completed chỉ vì quizScore >= 1 (trước đây làm sai % hoàn thành khóa học).
            var quizPassed = request.QuizPassed ?? (request.QuizScore.HasValue && request.QuizScore.Value >= 70);
            if (request.CodelabCompleted || quizPassed)
            {
                if (progress.Status == "NotStarted" || progress.Status == "InProgress")
                {
                    // LM-006: XPRewarded KHÔNG tin client khai (XpAwarded) — lấy từ server-side
                    // (lesson.XPReward trong DB). XP thật cộng qua CompleteLesson/award-xp có cap.
                    progress.MarkAsCompleted(moduleItem.Lesson.XPReward);
                }
            }

            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                hasWatchedVisualizer = progress.HasWatchedVisualizer,
                quizScore = progress.QuizScore,
                bestScore = progress.BestScore,
                codelabCompleted = progress.CodelabCompleted,
                xpAwarded = progress.XPRewarded
            });
        }

        // PR-001: UpdateProfile persist DB (giống change-password) — trước đây chỉ sửa in-memory,
        // username/bio mất sạch sau restart/EvictIdleUsers.
        // PR-015: trùng username check qua DB (không chỉ in-memory — user chưa active vào memory
        // vẫn bị chặn) + validate độ dài 3..100 + username rỗng-whitespace → 400 rõ ràng.
        [HttpPut("profile")]
        [RequireJwtRole]
        public async Task<ActionResult<StatelessUserDto>> UpdateProfile([FromBody] StatelessUpdateProfileRequest? request)
        {
            if (request == null)
                return BadRequest(new { error = "INVALID_INPUT", message = "Dữ liệu cập nhật hồ sơ trống." });

            var id = JwtHelper.ExtractSubFromToken(Request);
            if (string.IsNullOrEmpty(id))
                return Unauthorized(new { error = "UNAUTHORIZED", message = "Không xác định được người dùng." });

            var dbUser = (User?)null;
            try
            {
                // PR-015: client GỬI username rỗng/whitespace (≠ null — null là không đổi) → 400
                // rõ ràng, validate TRƯỚC khi chạm DB.
                if (request.Username != null && string.IsNullOrWhiteSpace(request.Username))
                    return BadRequest(new { error = "UPDATE_FAILED", message = "Username không được để trống." });

                if (id != "demo-user-001")
                {
                    if (!Guid.TryParse(id, out var dbUserId))
                        return BadRequest(new { error = "INVALID_USER_ID", message = "ID người dùng không hợp lệ." });

                    dbUser = await _dbContext.Users.FindAsync(dbUserId);
                    if (dbUser == null)
                        return NotFound(new { error = "USER_NOT_FOUND", message = "Không tìm thấy người dùng." });

                    // PR-015: username rỗng/whitespace → 400 rõ ràng (không lặng lẽ bỏ qua).
                    var usernameProvided = !string.IsNullOrWhiteSpace(request.Username);
                    if (usernameProvided)
                    {
                        var trimmed = request.Username.Trim();
                        if (trimmed.Length < 3 || trimmed.Length > 100)
                            return BadRequest(new { error = "UPDATE_FAILED", message = "Username phải có từ 3 đến 100 ký tự." });

                        // PR-015: check trùng qua DB — user chưa vào in-memory (restart/evict) vẫn bị chặn.
                        var usernameTaken = await _dbContext.Users
                            .AnyAsync(u => u.Username == trimmed && u.Id != dbUser.Id);
                        if (usernameTaken)
                            return BadRequest(new { error = "UPDATE_FAILED", message = "Username này đã được sử dụng." });
                    }

                    // PR-001: ghi VÀO DB trước — dữ liệu sống sót qua restart.
                    dbUser.UpdateProfile(request.Username, request.Nickname, request.Bio, request.University, request.AvatarUrl);
                    await _dbContext.SaveChangesAsync();
                }

                // Đồng bộ in-memory với DB (demo user chỉ tồn tại ở memory).
                var user = _authStrategy.UpdateProfile(
                    id, request.Username, request.Nickname, request.Bio, request.University, request.AvatarUrl);
                return Ok(user);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = "USER_NOT_FOUND", message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = "UPDATE_FAILED", message = ex.Message });
            }
        }

        
        
        
        
        [HttpPut("change-password")]
        [EnableRateLimiting("auth")]     // AU-015: chống brute-force CurrentPassword.
        [RequireJwtRole]
        public async Task<IActionResult> ChangePassword([FromBody] StatelessChangePasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
            {
                return BadRequest(new { error = "INVALID_INPUT", message = "Mật khẩu hiện tại và mật khẩu mới không được để trống." });
            }

            if (request.NewPassword.Length < 8)
            {
                return BadRequest(new { error = "INVALID_INPUT", message = "Mật khẩu mới phải có ít nhất 8 ký tự." });
            }

            // Id người dùng luôn lấy từ token — KHÔNG tin userId do client gửi (chống IDOR).
            var id = JwtHelper.ExtractSubFromToken(Request);
            if (string.IsNullOrEmpty(id))
                return Unauthorized(new { error = "UNAUTHORIZED", message = "Không xác định được người dùng." });

            if (id != "demo-user-001" && Guid.TryParse(id, out var dbUserId))
            {
                var dbUser = await _dbContext.Users.FindAsync(dbUserId);
                if (dbUser == null)
                {
                    return NotFound(new { error = "USER_NOT_FOUND", message = "Không tìm thấy người dùng." });
                }

                if (!StatelessAuthStrategy.VerifyPassword(request.CurrentPassword, dbUser.PasswordHash))
                {
                    return BadRequest(new { error = "INCORRECT_PASSWORD", message = "Mật khẩu hiện tại không chính xác." });
                }

                var newHash = HashPassword(request.NewPassword);
                dbUser.ChangePassword(newHash);
                dbUser.RecordActivity();
                await _dbContext.SaveChangesAsync();

                _authStrategy.EnsureUserInMemory(
                    dbUser.Id.ToString(),
                    dbUser.Email,
                    dbUser.Username,
                    dbUser.PasswordHash,
                    dbUser.IsPremium,
                    dbUser.Role,
                    dbUser.TotalXP,
                    dbUser.CurrentLevel,
                    dbUser.StreakDays
                );
                _authStrategy.UpdateUserPassword(id, newHash);
            }
            else if (id == "demo-user-001")
            {
                try
                {
                    // Verify theo HASH hiện tại (không so chuỗi cứng "Demo@2024" —
                    // trước đây sau lần đổi đầu tiên không đổi lại được).
                    var currentHash = _authStrategy.GetUserPasswordHash(id);
                    if (currentHash == null || !StatelessAuthStrategy.VerifyPassword(request.CurrentPassword, currentHash))
                    {
                        return BadRequest(new { error = "INCORRECT_PASSWORD", message = "Mật khẩu hiện tại không chính xác." });
                    }
                    var newHash = HashPassword(request.NewPassword);
                    _authStrategy.UpdateUserPassword(id, newHash);
                }
                catch (KeyNotFoundException ex)
                {
                    return NotFound(new { error = "USER_NOT_FOUND", message = ex.Message });
                }
            }
            else
            {
                return BadRequest(new { error = "INVALID_USER_ID", message = "ID người dùng không hợp lệ." });
            }

            // AU-022: đổi mật khẩu → thu hồi TOÀN BỘ refresh token của user (thiết bị khác giữ
            // phiên bằng mật khẩu cũ phải đăng nhập lại). Phiên hiện tại giữ access token
            // (15 phút) rồi phải refresh lại → vẫn an toàn vì refresh token cũ đã chết.
            _authStrategy.RevokeAllRefreshTokens(id);

            return Ok(new { message = "Đổi mật khẩu thành công!" });
        }

        
        
        
        
        [HttpPost("award-xp")]
        [RequireJwtRole]
        [EnableRateLimiting("auth")]
        public async Task<ActionResult<StatelessUserDto>> AwardXP([FromBody] StatelessXpAwardRequest request)
        {
            // LM-006: 3 lớp chống XP farm — range/request, reason whitelist, cap/ngày/user (+ rate limit "auth").
            if (request.Amount < XpAwardMinPerRequest || request.Amount > XpAwardMaxPerRequest)
                return BadRequest(new { error = "INVALID_AMOUNT", message = "Số XP cấp phải nằm trong khoảng 1–500." });

            if (!IsAllowedXpReason(request.Reason))
                return BadRequest(new { error = "INVALID_REASON", message = "Lý do cấp XP không hợp lệ." });

            // Chỉ cấp XP cho chính user của token — không tin userId từ client.
            var id = JwtHelper.ExtractSubFromToken(Request);
            if (string.IsNullOrEmpty(id))
                return Unauthorized(new { error = "UNAUTHORIZED", message = "Không xác định được người dùng." });

            // SEC-2026-08-14: server VERIFY bằng chứng hoàn thành cho reason Quiz/CodeLab —
            // chặn tự cộng XP bằng cách đoán reason (lesson flow đã lưu progress TRƯỚC khi award).
            if (Guid.TryParse(id, out var verifyUid) && verifyUid != Guid.Empty)
            {
                var reasonTrim = request.Reason.Trim();
                if (reasonTrim.StartsWith("Hoàn thành Quiz:", StringComparison.Ordinal))
                {
                    var quizTitle = reasonTrim["Hoàn thành Quiz:".Length..].Trim();
                    var hasQuizEvidence = await _dbContext.QuizAttempts.AnyAsync(a =>
                        a.UserId == verifyUid && a.QuizTitle == quizTitle);
                    var hasLessonQuizEvidence = await _dbContext.UserLessonProgresses.AnyAsync(p =>
                        p.UserId == verifyUid && p.Lesson.Title == quizTitle && p.BestScore >= 60);
                    if (!hasQuizEvidence && !hasLessonQuizEvidence)
                        return BadRequest(new { error = "XP_NOT_VERIFIED", message = "Chưa có bằng chứng hoàn thành quiz — không thể cộng XP." });
                }
                else if (reasonTrim.StartsWith("Hoàn thành CodeLab:", StringComparison.Ordinal))
                {
                    var lessonTitle = reasonTrim["Hoàn thành CodeLab:".Length..].Trim();
                    var hasCodelabEvidence = await _dbContext.UserLessonProgresses.AnyAsync(p =>
                        p.UserId == verifyUid && p.Lesson.Title == lessonTitle && p.CodelabCompleted);
                    if (!hasCodelabEvidence)
                        return BadRequest(new { error = "XP_NOT_VERIFIED", message = "Chưa có bằng chứng hoàn thành codelab — không thể cộng XP." });
                }
            }

            try
            {
                // Kiểm tra user tồn tại TRƯỚC khi đếm hạn mức — không trừ quota cho award thất bại.
                // Đồng thời sync user vào in-memory (restart server → tránh KeyNotFoundException).
                if (id != "demo-user-001" && Guid.TryParse(id, out var dbUserId))
                {
                    var dbUser = await _dbContext.Users.FindAsync(dbUserId);
                    if (dbUser == null)
                        return NotFound(new { error = "USER_NOT_FOUND", message = "Người dùng không tồn tại." });
                    _authStrategy.EnsureUserInMemory(
                        dbUser.Id.ToString(),
                        dbUser.Email,
                        dbUser.Username,
                        dbUser.PasswordHash,
                        dbUser.IsPremium,
                        dbUser.Role,
                        dbUser.TotalXP,
                        dbUser.CurrentLevel,
                        dbUser.StreakDays
                    );
                }

                // Cap/ngày/user — gọi lặp award-xp vô hạn bị chặn dù amount nhỏ.
                var today = DateTime.UtcNow.ToString("yyyy-MM-dd");
                var counter = XpAwardCounters.GetOrAdd(id, _ => new XpDailyCounter());
                lock (counter)
                {
                    if (counter.Day != today) { counter.Day = today; counter.Total = 0; }
                    if (counter.Total + request.Amount > XpAwardDailyCap)
                        return StatusCode(StatusCodes.Status429TooManyRequests, new
                        {
                            error = "XP_DAILY_LIMIT",
                            message = $"Bạn đã đạt hạn mức XP hôm nay (tối đa {XpAwardDailyCap} XP)."
                        });
                    counter.Total += request.Amount;
                }

                if (id != "demo-user-001" && Guid.TryParse(id, out var xpGuid))
                {
                    try
                    {
                        var dbUserXp = await _dbContext.Users.FindAsync(xpGuid);
                        if (dbUserXp != null)
                        {
                            dbUserXp.AwardXP(request.Amount);
                            dbUserXp.RecordActivity();
                            await _dbContext.SaveChangesAsync();
                        }
                    }
                    catch (Exception ex)
                    {
                        Serilog.Log.Warning(ex, "Không ghi XP vào DB — chỉ cấp XP in-memory.");
                    }
                }

                var user = _authStrategy.AwardXP(id, request.Amount, request.Reason);

                return Ok(user);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = "USER_NOT_FOUND", message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = "INVALID_AMOUNT", message = ex.Message });
            }
        }

        
        
        
        
        [HttpGet("demo-credentials")]
        public ActionResult<object> GetDemoCredentials()
        {
            // Không lộ thông tin đăng nhập demo ra môi trường production.
            if (!_env.IsDevelopment())
            {
                return NotFound();
            }

            return Ok(new
            {
                message = "Tài khoản demo để kiểm thử",
                email = "demo@visualizationdsa.dev",
                password = "Demo@2024",
                note = "Dữ liệu đăng ký được lưu vĩnh viễn vào PostgreSQL. In-memory cache tự khởi tạo lại khi restart."
            });
        }
    }
}
    public class SaveLessonProgressRequest
    {
        public bool HasWatchedVisualizer { get; set; }
        public int? QuizScore { get; set; }
        public int BestScore { get; set; }
        public bool? QuizPassed { get; set; }
        public bool CodelabCompleted { get; set; }
        public int XpAwarded { get; set; }
    }
