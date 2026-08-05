using Asp.Versioning;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
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

                // Ghi DB sau khi validate OK. DB lỗi → xóa user khỏi memory + 503 rõ ràng.
                Guid dbUserId;
                try
                {
                    var dbUser = new User(request.Email, request.Username, HashPasswordSHA256(request.Password));
                    _dbContext.Users.Add(dbUser);
                    await _dbContext.SaveChangesAsync();
                    dbUserId = dbUser.Id;
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
                    return Unauthorized(new { error = "LOGIN_FAILED", message = "Email hoặc mật khẩu không đúng." });

                if (dbUser != null)
                {
                    
                    response.User.Role = dbUser.Role;
                    response.User.IsPremium = dbUser.IsPremium;
                    response.User.TotalXP = dbUser.TotalXP;
                    response.User.CurrentLevel = dbUser.CurrentLevel;
                }

                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { error = "LOGIN_FAILED", message = ex.Message });
            }
        }

        
        
        
        
        [HttpPost("refresh")]
        public ActionResult<StatelessAuthResponse> Refresh([FromBody] StatelessRefreshRequest request)
        {
            try
            {
                // Chỉ chấp nhận refresh token do server sinh ra (GenerateAuthResponse).
                // KHÔNG cho phép client tự dựng/ép buộc token — tránh account takeover.
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

            // KHÔNG cấp XP ở đây: XP chỉ đi qua endpoint /award-xp (có cap 1-500 + auth).
            // Trước đây client gửi XpAwarded tùy ý → farm XP vô hạn + double-award với lesson flow.
            if (request.CodelabCompleted || (quizScore.HasValue && quizScore.Value >= 1))
            {
                if (progress.Status == "NotStarted" || progress.Status == "InProgress")
                {
                    progress.MarkAsCompleted(progress.XPRewarded);
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
                    var profile = _authStrategy.GetProfile(id);
                    if (request.CurrentPassword != "Demo@2024")
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
                var user = _authStrategy.AwardXP(id, request.Amount, request.Reason);

                
                var dbUserXp = await _dbContext.Users
                    .FirstOrDefaultAsync(u => u.Email == user.Email);
                if (dbUserXp != null)
                {
                    dbUserXp.AwardXP(request.Amount);
                    dbUserXp.RecordActivity();
                    await _dbContext.SaveChangesAsync();
                }

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
        public bool CodelabCompleted { get; set; }
        public int XpAwarded { get; set; }
    }