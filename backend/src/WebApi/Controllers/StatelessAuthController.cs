using Asp.Versioning;
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

namespace VisualizationDSA.WebApi.Controllers
{
    /// <summary>
    /// Auth Controller — xử lý đăng ký, đăng nhập, profile.
    /// Kết hợp in-memory cache (StatelessAuthStrategy) + PostgreSQL persistence (ApplicationDbContext).
    /// Route: api/v{version:apiVersion}/concepts/auth
    /// </summary>
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/concepts/auth")]
    public class StatelessAuthController : ControllerBase
    {
        private readonly StatelessAuthStrategy _authStrategy;
        private readonly ApplicationDbContext _dbContext;

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

        public StatelessAuthController(StatelessAuthStrategy authStrategy, ApplicationDbContext dbContext)
        {
            _authStrategy = authStrategy;
            _dbContext = dbContext;
        }

        private static string HashPasswordSHA256(string password)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password + "visualizationdsa-salt"));
            return Convert.ToHexString(bytes).ToLowerInvariant();
        }

        /// <summary>
        /// Đăng ký tài khoản mới — lưu vào cả in-memory cache và PostgreSQL.
        /// POST /api/v1/concepts/auth/register
        /// </summary>
        [HttpPost("register")]
        public async Task<ActionResult<StatelessAuthResponse>> Register([FromBody] StatelessRegisterRequest request)
        {
            try
            {
                // ✅ FIX: Bọc DB call trong try-catch để fallback sang in-memory khi DB không khả dụng
                string dbUserId = Guid.NewGuid().ToString();
                try
                {
                    var existingUser = await _dbContext.Users
                        .FirstOrDefaultAsync(u => u.Email == request.Email);
                    if (existingUser == null)
                    {
                        var passwordHash = HashPasswordSHA256(request.Password);
                        var dbUser = new User(request.Email, request.Username, passwordHash);
                        _dbContext.Users.Add(dbUser);
                        await _dbContext.SaveChangesAsync();
                        dbUserId = dbUser.Id.ToString();
                    }
                    else
                    {
                        dbUserId = existingUser.Id.ToString();
                    }
                }
                catch (Exception dbEx)
                {
                    Serilog.Log.Warning(dbEx, "Không thể kết nối DB khi đăng ký. Tiếp tục bằng in-memory auth.");
                }

                var response = _authStrategy.Register(request, dbUserId);
                response.User.Role = "Student";
                return Ok(response);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = "REGISTRATION_FAILED", message = ex.Message });
            }
        }

        /// <summary>
        /// Đăng nhập — xác thực in-memory + cập nhật LastLoginAt trong PostgreSQL.
        /// POST /api/v1/concepts/auth/login
        /// </summary>
        [HttpPost("login")]
        public async Task<ActionResult<StatelessAuthResponse>> Login([FromBody] StatelessLoginRequest request)
        {
            try
            {
                User dbUser = null;
                try
                {
                    // Sync from PostgreSQL — update LastLoginAt + override role/premium from DB
                    dbUser = await _dbContext.Users
                        .FirstOrDefaultAsync(u => u.Email == request.Email);
                    if (dbUser != null)
                    {
                        // ✅ Task 4.2: Kiểm tra tài khoản có bị khóa không
                        if (!dbUser.IsActive)
                            return StatusCode(403, new { error = "ACCOUNT_BANNED", message = "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên." });

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

                        dbUser.RecordLogin();
                        await _dbContext.SaveChangesAsync();
                    }
                }
                catch (Exception ex)
                {
                    Serilog.Log.Warning(ex, "Không thể kết nối cơ sở dữ liệu để đồng bộ tài khoản trong Stateless Mode. Tiếp tục bằng in-memory auth.");
                }

                var response = _authStrategy.Login(request);

                if (dbUser != null)
                {
                    // Override in-memory fields with DB truth
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

        /// <summary>
        /// Lấy Access Token mới từ Refresh Token.
        /// POST /api/v1/concepts/auth/refresh
        /// </summary>
        [HttpPost("refresh")]
        public async Task<ActionResult<StatelessAuthResponse>> Refresh([FromBody] StatelessRefreshRequest request)
        {
            try
            {
                // If the user's refresh token isn't in memory (e.g. server restart), but they provided their UserId, re-hydrate from DB
                if (!string.IsNullOrEmpty(request.UserId))
                {
                    if (Guid.TryParse(request.UserId, out var dbUserId))
                    {
                        try
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
                                _authStrategy.ForceAddRefreshToken(request.RefreshToken, dbUser.Id.ToString());
                            }
                        }
                        catch (Exception ex)
                        {
                            Serilog.Log.Warning(ex, "Không thể kết nối cơ sở dữ liệu để re-hydrate tài khoản trong Refresh. Tiếp tục bằng in-memory.");
                        }
                    }
                }

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

        /// <summary>
        /// Đăng xuất — thu hồi Refresh Token khỏi bộ nhớ.
        /// POST /api/v1/concepts/auth/logout
        /// </summary>
        [HttpPost("logout")]
        public IActionResult Logout([FromBody] StatelessRefreshRequest request)
        {
            _authStrategy.Logout(request.RefreshToken);
            return NoContent();
        }

        /// <summary>
        /// Lấy thông tin profile từ userId.
        /// GET /api/v1/concepts/auth/me?userId=...
        /// </summary>
        [HttpGet("me")]
        public async Task<ActionResult<StatelessUserDto>> GetMe([FromQuery] string? userId)
        {
            try
            {
                var id = userId ?? "demo-user-001";
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

        /// <summary>
        /// Lấy tiến trình học tập của user.
        /// GET /api/v1/concepts/auth/progress?userId=...
        /// </summary>
        [HttpGet("progress")]
        public async Task<ActionResult<StatelessUserProgressDto>> GetProgress([FromQuery] string? userId)
        {
            try
            {
                var id = userId ?? "demo-user-001";
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

        /// <summary>
        /// Cập nhật profile (username).
        /// PUT /api/v1/concepts/auth/profile
        /// </summary>
        [HttpPut("profile")]
        public async Task<ActionResult<StatelessUserDto>> UpdateProfile([FromBody] StatelessUpdateProfileRequest request)
        {
            try
            {
                var id = request.UserId ?? "demo-user-001";
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

        /// <summary>
        /// Đổi mật khẩu của user — in-memory + PostgreSQL persistence.
        /// PUT /api/v1/concepts/auth/change-password
        /// </summary>
        [HttpPut("change-password")]
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

            var id = request.UserId ?? "demo-user-001";
            
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

        /// <summary>
        /// Cộng XP cho user — in-memory + PostgreSQL persistence.
        /// POST /api/v1/concepts/auth/award-xp
        /// </summary>
        [HttpPost("award-xp")]
        public async Task<ActionResult<StatelessUserDto>> AwardXP([FromBody] StatelessXpAwardRequest request)
        {
            try
            {
                var id = request.UserId ?? "demo-user-001";
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

                // Persist XP to PostgreSQL — find by email (in-memory ID is string, DB ID is Guid)
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

        /// <summary>
        /// Demo credentials info.
        /// GET /api/v1/concepts/auth/demo-credentials
        /// </summary>
        [HttpGet("demo-credentials")]
        public ActionResult<object> GetDemoCredentials()
        {
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
