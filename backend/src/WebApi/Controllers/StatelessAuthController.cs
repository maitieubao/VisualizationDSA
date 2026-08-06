using Asp.Versioning;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using VisualizationDSA.Domain.Engine;
using VisualizationDSA.Domain.Entities;
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

        static StatelessAuthController()
        {
            StatelessAuthStrategy.VerifyPasswordDelegate = (password, hash) =>
            {
                if (hash.StartsWith("$2a$") || hash.StartsWith("$2b$") || hash.StartsWith("$2y$"))
                {
                    try
                    {
                        return BCrypt.Net.BCrypt.Verify(password, hash);
                    }
                    catch
                    {
                        return false;
                    }
                }
                var bytes = System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(password + "visualizationdsa-salt"));
                var sha256Hash = Convert.ToHexString(bytes).ToLowerInvariant();
                return sha256Hash == hash;
            };
        }

        public StatelessAuthController(StatelessAuthStrategy authStrategy, ApplicationDbContext dbContext, IWebHostEnvironment env)
        {
            _authStrategy = authStrategy;
            _dbContext = dbContext;
            _env = env;
        }

        private static string HashPasswordSHA256(string password)
        {
            // BCrypt workFactor 12 — đồng bộ với AuthService chuẩn; tên giữ cũ để ít thay đổi.
            return BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
        }

        
        
        
        
        [HttpPost("register")]
        [EnableRateLimiting("auth")]
        public async Task<ActionResult<StatelessAuthResponse>> Register([FromBody] StatelessRegisterRequest? request)
        {
            if (request == null)
                return BadRequest(new { error = "INVALID_INPUT", message = "Dữ liệu đăng ký không hợp lệ." });

            try
            {
                // Chống identity confusion: email đã tồn tại trong DB (dù chưa vào memory sau restart)
                // → từ chối ngay, KHÔNG cho "đăng ký lại" email của người khác.
                var emailExists = await _dbContext.Users.AnyAsync(u => u.Email == request.Email);
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
                    var dbUser = new User(request.Email, request.Username, HashPasswordSHA256(request.Password));
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
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = "REGISTRATION_FAILED", message = ex.Message });
            }
        }

        
        
        
        
        [HttpPost("login")]
        [EnableRateLimiting("auth")]
        public async Task<ActionResult<StatelessAuthResponse>> Login([FromBody] StatelessLoginRequest request)
        {
            try
            {
                User dbUser = null;
                try
                {
                    
                    dbUser = await _dbContext.Users
                        .FirstOrDefaultAsync(u => u.Email == request.Email);
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
                    Serilog.Log.Warning(ex, "Không thể kết nối cơ sở dữ liệu để đồng bộ tài khoản trong Stateless Mode. Tiếp tục bằng in-memory auth.");
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
                        // DB lỗi → bỏ qua ban check (giữ phiên) — không đăng xuất hàng loạt.
                        Serilog.Log.Warning(ex, "Không thể kiểm tra trạng thái tài khoản khi refresh — tiếp tục giữ phiên.");
                    }
                }

                // Chỉ chấp nhận refresh token do server sinh ra (GenerateAuthResponse).
                var response = _authStrategy.RefreshToken(request.RefreshToken);

                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { error = "REFRESH_FAILED", message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = "USER_NOT_FOUND", message = ex.Message });
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
                var progress = _authStrategy.GetUserProgress(id);
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

            var lessonExists = await _dbContext.Lessons.AnyAsync(l => l.Id == lessonId);
            if (!lessonExists)
                return NotFound(new { error = "LESSON_NOT_FOUND", message = "Không tìm thấy bài học." });

            var progress = await _dbContext.UserLessonProgresses
                .FirstOrDefaultAsync(p => p.UserId == userId && p.LessonId == lessonId);

            if (progress == null)
            {
                progress = new UserLessonProgress(userId, lessonId);
                _dbContext.UserLessonProgresses.Add(progress);
            }

            if (request.HasWatchedVisualizer) progress.RecordVisualizerWatched();
            // Clamp QuizScore hợp lệ (0..100) — chống client gửi điểm ảo.
            var quizScore = request.QuizScore.HasValue
                ? Math.Clamp(request.QuizScore.Value, 0, 100)
                : (int?)null;
            if (quizScore.HasValue) progress.RecordQuizAttempt(quizScore.Value);
            if (request.CodelabCompleted) progress.RecordCodelabCompleted();

            // Rule "Completed" khớp frontend: quiz pass (≥70% theo client) HOẶC hoàn thành codelab.
            // KHÔNG mark Completed chỉ vì quizScore >= 1 (trước đây làm sai % hoàn thành khóa học).
            var quizPassed = request.QuizPassed ?? (quizScore.HasValue && quizScore.Value >= 70);
            if (request.CodelabCompleted || quizPassed)
            {
                if (progress.Status == "NotStarted" || progress.Status == "InProgress")
                {
                    // Lưu XP đã nhận qua /award-xp (client gửi lên — server chỉ ghi nhận để chống
                    // farm khi đổi thiết bị; XP THẬT chỉ cộng qua award-xp có cap).
                    progress.MarkAsCompleted(Math.Max(progress.XPRewarded, Math.Clamp(request.XpAwarded, 0, 10000)));
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

        [HttpPut("profile")]
        [RequireJwtRole]
        public async Task<ActionResult<StatelessUserDto>> UpdateProfile([FromBody] StatelessUpdateProfileRequest request)        {
            var id = JwtHelper.ExtractSubFromToken(Request);
            if (string.IsNullOrEmpty(id))
                return Unauthorized(new { error = "UNAUTHORIZED", message = "Không xác định được người dùng." });

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
                var user = _authStrategy.UpdateProfile(id, request.Username, request.Nickname, request.Bio, request.University);
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

                if (!StatelessAuthStrategy.VerifyPasswordDelegate(request.CurrentPassword, dbUser.PasswordHash))
                {
                    return BadRequest(new { error = "INCORRECT_PASSWORD", message = "Mật khẩu hiện tại không chính xác." });
                }

                var newHash = HashPasswordSHA256(request.NewPassword);
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
                    if (currentHash == null || !StatelessAuthStrategy.VerifyPasswordDelegate(request.CurrentPassword, currentHash))
                    {
                        return BadRequest(new { error = "INCORRECT_PASSWORD", message = "Mật khẩu hiện tại không chính xác." });
                    }
                    var newHash = HashPasswordSHA256(request.NewPassword);
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

            return Ok(new { message = "Đổi mật khẩu thành công!" });
        }

        
        
        
        
        [HttpPost("award-xp")]
        [RequireJwtRole]
        public async Task<ActionResult<StatelessUserDto>> AwardXP([FromBody] StatelessXpAwardRequest request)
        {
            // Giới hạn XP mỗi lần cấp để chống spam (khớp chính sách gamification).
            if (request.Amount < 1 || request.Amount > 500)
                return BadRequest(new { error = "INVALID_AMOUNT", message = "Số XP cấp phải nằm trong khoảng 1–500." });

            // Chỉ cấp XP cho chính user của token — không tin userId từ client.
            var id = JwtHelper.ExtractSubFromToken(Request);
            if (string.IsNullOrEmpty(id))
                return Unauthorized(new { error = "UNAUTHORIZED", message = "Không xác định được người dùng." });

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
                // DB GHI TRƯỚC, memory sau — trước đây ngược lại: DB lỗi → memory đã +XP → lệch vĩnh viễn.
                // DB lỗi → log + vẫn cấp XP memory (không 500 chặn trải nghiệm).
                if (Guid.TryParse(id, out var xpGuid))
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
        public bool? QuizPassed { get; set; }
        public bool CodelabCompleted { get; set; }
        public int XpAwarded { get; set; }
    }
