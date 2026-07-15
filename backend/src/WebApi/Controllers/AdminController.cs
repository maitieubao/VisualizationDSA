using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.Json;
using System.Security.Cryptography;
using VisualizationDSA.Domain.Strategies;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.WebApi.Filters;

namespace VisualizationDSA.WebApi.Controllers
{
    /// <summary>
    /// Admin API — quản lý user, quiz, analytics toàn hệ thống.
    /// Yêu cầu role Admin trong JWT token.
    /// Route: /api/v1/concepts/admin
    /// </summary>
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/concepts/admin")]
    [RequireJwtRole("Admin")]  // ✅ PB-705: Centralized JWT guard — tất cả endpoints yêu cầu Admin role
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly StatelessAuthStrategy _authStrategy;
        private readonly QuizBankStrategy _quizBank;

        public AdminController(
            ApplicationDbContext dbContext,
            StatelessAuthStrategy authStrategy,
            QuizBankStrategy quizBank)
        {
            _dbContext = dbContext;
            _authStrategy = authStrategy;
            _quizBank = quizBank;
        }



        // ── Dashboard Analytics ──────────────────────────────────────────────

        /// <summary>
        /// Thống kê tổng quan hệ thống từ DB thực.
        /// GET /api/v1/concepts/admin/dashboard
        /// </summary>
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            try
            {
                var totalUsers   = await _dbContext.Users.CountAsync();
                var totalStudents = await _dbContext.Users.CountAsync(u => u.Role == "Student");
                var totalTeachers = await _dbContext.Users.CountAsync(u => u.Role == "Teacher");
                var totalAdmins  = await _dbContext.Users.CountAsync(u => u.Role == "Admin");
                var premiumUsers = await _dbContext.Users.CountAsync(u => u.IsPremium);
                var totalQuizzes = await _dbContext.Quizzes.CountAsync();
                var totalOrders  = await _dbContext.Orders.CountAsync();
                var paidOrders   = await _dbContext.Orders.CountAsync(o => o.Status == "Completed" || o.Status == "paid");

                // Top 5 active users by XP
                var topUsers = await _dbContext.Users
                    .OrderByDescending(u => u.TotalXP)
                    .Take(5)
                    .Select(u => new { u.Email, u.Username, u.TotalXP, u.CurrentLevel, u.Role })
                    .ToListAsync();

                // Lịch sử đăng ký trong 7 ngày gần nhất
                var sevenDaysAgo = DateTime.UtcNow.Date.AddDays(-6);
                var registrationList = await _dbContext.Users
                    .Where(u => u.CreatedAt >= sevenDaysAgo)
                    .GroupBy(u => u.CreatedAt.Date)
                    .Select(g => new { Date = g.Key, Count = g.Count() })
                    .ToListAsync();

                var registrationsLast7Days = Enumerable.Range(0, 7)
                    .Select(i => DateTime.UtcNow.Date.AddDays(-6 + i))
                    .Select(date => new
                    {
                        date = date.ToString("yyyy-MM-dd"),
                        count = registrationList.FirstOrDefault(r => r.Date == date)?.Count ?? 0
                    })
                    .ToList();

                // Top 3 khóa học phổ biến nhất
                var popularCourses = await _dbContext.UserLessonProgresses
                    .Include(p => p.Lesson)
                    .ThenInclude(l => l.Course)
                    .Where(p => p.Lesson != null && p.Lesson.Course != null)
                    .GroupBy(p => p.Lesson.CourseId)
                    .Select(g => new
                    {
                        courseId = g.Key,
                        title = g.First().Lesson.Course.Title,
                        enrollmentsCount = g.Select(p => p.UserId).Distinct().Count()
                    })
                    .OrderByDescending(c => c.enrollmentsCount)
                    .Take(3)
                    .ToListAsync();

                return Ok(new
                {
                    users = new { total = totalUsers, students = totalStudents, teachers = totalTeachers, admins = totalAdmins, premium = premiumUsers },
                    quizzes = new { total = totalQuizzes },
                    orders  = new { total = totalOrders, paid = paidOrders },
                    topUsers,
                    registrationsLast7Days,
                    popularCourses
                });
            }
            catch (Exception ex)
            {
                Serilog.Log.Warning(ex, "Không thể kết nối cơ sở dữ liệu để lấy dashboard. Fallback sang dữ liệu in-memory.");
                var inMemoryUsers = _authStrategy.GetAllUsers();
                var totalUsers = inMemoryUsers.Count;
                var totalStudents = inMemoryUsers.Count(u => u.Role == "Student");
                var totalTeachers = inMemoryUsers.Count(u => u.Role == "Teacher");
                var totalAdmins = inMemoryUsers.Count(u => u.Role == "Admin");
                var premiumUsers = inMemoryUsers.Count(u => u.IsPremium);

                var topUsers = inMemoryUsers
                    .OrderByDescending(u => u.TotalXP)
                    .Take(5)
                    .Select(u => new { u.Email, u.Username, u.TotalXP, u.CurrentLevel, u.Role })
                    .ToList();

                var registrationsLast7Days = Enumerable.Range(0, 7)
                    .Select(i => DateTime.UtcNow.Date.AddDays(-6 + i))
                    .Select(date => new
                    {
                        date = date.ToString("yyyy-MM-dd"),
                        count = new Random().Next(0, 3)
                    })
                    .ToList();

                var popularCourses = new[]
                {
                    new { courseId = Guid.NewGuid(), title = "Thuật toán Sắp xếp Cơ bản (Simulated)", enrollmentsCount = 15 },
                    new { courseId = Guid.NewGuid(), title = "Cấu trúc dữ liệu Đồ thị (Simulated)", enrollmentsCount = 10 },
                    new { courseId = Guid.NewGuid(), title = "Nguyên lý Thiết kế SOLID (Simulated)", enrollmentsCount = 6 }
                };

                return Ok(new
                {
                    users = new { total = totalUsers, students = totalStudents, teachers = totalTeachers, admins = totalAdmins, premium = premiumUsers },
                    quizzes = new { total = _quizBank.GetAllQuizzes().Count },
                    orders  = new { total = 0, paid = 0 },
                    topUsers,
                    registrationsLast7Days,
                    popularCourses
                });
            }
        }

        // ── User Management ──────────────────────────────────────────────────

        /// <summary>
        /// Danh sách tất cả người dùng (phân trang).
        /// GET /api/v1/concepts/admin/users?page=1&amp;pageSize=20&amp;search=
        /// </summary>
        [HttpGet("users")]
        [RequireJwtRole("Teacher,Admin")]  // ✅ PB-705: Teacher cũng được xem danh sách user
        public async Task<IActionResult> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null)
        {

            try
            {
                var query = _dbContext.Users.AsQueryable();

                if (!string.IsNullOrWhiteSpace(search))
                    query = query.Where(u => u.Email.Contains(search) || u.Username.Contains(search));

                var total = await query.CountAsync();
                var users = await query
                    .OrderByDescending(u => u.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(u => new
                    {
                        id        = u.Id.ToString(),
                        u.Email,
                        u.Username,
                        u.Role,
                        u.IsPremium,
                        u.TotalXP,
                        u.CurrentLevel,
                        u.StreakDays,
                        isActive  = u.IsActive,
                        createdAt = u.CreatedAt,
                        lastLogin = u.LastLoginAt
                    })
                    .ToListAsync();

                return Ok(new { total, page, pageSize, users });
            }
            catch (Exception ex)
            {
                Serilog.Log.Warning(ex, "Không thể kết nối cơ sở dữ liệu để lấy danh sách users. Fallback sang dữ liệu in-memory.");
                var inMemoryUsers = _authStrategy.GetAllUsers();

                if (!string.IsNullOrWhiteSpace(search))
                {
                    inMemoryUsers = inMemoryUsers
                        .Where(u => u.Email.Contains(search, StringComparison.OrdinalIgnoreCase) || 
                                    u.Username.Contains(search, StringComparison.OrdinalIgnoreCase))
                        .ToList();
                }

                var total = inMemoryUsers.Count;
                var users = inMemoryUsers
                    .OrderByDescending(u => u.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(u => new
                    {
                        id        = u.Id,
                        u.Email,
                        u.Username,
                        u.Role,
                        u.IsPremium,
                        u.TotalXP,
                        u.CurrentLevel,
                        u.StreakDays,
                        isActive  = true,
                        createdAt = u.CreatedAt,
                        lastLogin = DateTime.UtcNow
                    })
                    .ToList();

                return Ok(new { total, page, pageSize, users });
            }
        }

        /// <summary>
        /// Đổi role của user.
        /// PUT /api/v1/concepts/admin/users/{id}/role
        /// </summary>
        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> UpdateUserRole(string id, [FromBody] UpdateRoleRequest request)
        {

            if (request.Role != "Student" && request.Role != "Teacher" && request.Role != "Admin")
                return BadRequest(new { error = "INVALID_ROLE", message = "Role phải là Student, Teacher hoặc Admin." });

            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id.ToString() == id);
            if (user == null)
                return NotFound(new { error = "USER_NOT_FOUND" });

            var oldRole = user.Role;
            user.SetRole(request.Role);
            await _dbContext.SaveChangesAsync();
            
            // Đồng bộ sang in-memory cache
            _authStrategy.UpdateUserRole(id, request.Role);

            // Log Audit
            if (Guid.TryParse(id, out var targetGuid))
            {
                await LogAdminAction("UpdateUserRole", targetGuid, $"Đổi vai trò của {user.Username} từ {oldRole} sang {request.Role}.");
            }

            return Ok(new { message = $"Đã đổi role của {user.Email} thành {request.Role}.", userId = id, newRole = request.Role });
        }

        /// <summary>
        /// Bật/tắt trạng thái Premium của user.
        /// PUT /api/v1/concepts/admin/users/{id}/premium
        /// </summary>
        [HttpPut("users/{id}/premium")]
        public async Task<IActionResult> TogglePremium(string id, [FromBody] TogglePremiumRequest request)
        {

            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id.ToString() == id);
            if (user == null)
                return NotFound(new { error = "USER_NOT_FOUND" });

            var oldStatus = user.IsPremium;
            user.SetPremiumStatus(request.IsPremium);
            await _dbContext.SaveChangesAsync();

            // Đồng bộ sang in-memory cache
            _authStrategy.SetUserPremium(id, request.IsPremium);

            // Log Audit
            if (Guid.TryParse(id, out var targetGuid))
            {
                await LogAdminAction("TogglePremium", targetGuid, $"Thay đổi trạng thái Premium của {user.Username} từ {oldStatus} sang {request.IsPremium}.");
            }

            return Ok(new { message = $"Đã {(request.IsPremium ? "bật" : "tắt")} Premium cho {user.Email}.", userId = id, isPremium = request.IsPremium });
        }

        /// <summary>
        /// Tạo người dùng mới.
        /// POST /api/v1/concepts/admin/users
        /// </summary>
        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { error = "INVALID_INPUT", message = "Email, username và mật khẩu không được để trống." });
            }

            // Check if user already exists in DB
            var existingUser = await _dbContext.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower() || u.Username.ToLower() == request.Username.ToLower());
            if (existingUser)
            {
                return BadRequest(new { error = "USER_EXISTS", message = "Email hoặc Username đã được sử dụng." });
            }

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, workFactor: 12);
            var newUser = new User(request.Email, request.Username, passwordHash);
            
            newUser.SetRole(request.Role);
            newUser.SetPremiumStatus(request.IsPremium);

            _dbContext.Users.Add(newUser);
            await _dbContext.SaveChangesAsync();

            // Sync to stateless in-memory cache
            _authStrategy.AddUser(
                newUser.Id.ToString(),
                newUser.Email,
                newUser.Username,
                newUser.PasswordHash,
                newUser.Role,
                newUser.IsPremium
            );

            // Log Audit
            await LogAdminAction("CreateUser", newUser.Id, $"Tạo người dùng mới: {newUser.Username} ({newUser.Email}), vai trò: {newUser.Role}, Premium: {newUser.IsPremium}.");

            return Ok(new
            {
                message = "Tạo người dùng mới thành công.",
                user = new
                {
                    id = newUser.Id.ToString(),
                    newUser.Email,
                    newUser.Username,
                    newUser.Role,
                    newUser.IsPremium,
                    newUser.CurrentLevel,
                    newUser.TotalXP,
                    newUser.StreakDays,
                    newUser.CreatedAt
                }
            });
        }

        /// <summary>
        /// Xóa người dùng.
        /// DELETE /api/v1/concepts/admin/users/{id}
        /// </summary>
        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id.ToString() == id);
            if (user == null)
            {
                return NotFound(new { error = "USER_NOT_FOUND", message = "Không tìm thấy người dùng." });
            }

            _dbContext.Users.Remove(user);
            await _dbContext.SaveChangesAsync();

            // Sync to stateless in-memory cache
            _authStrategy.RemoveUser(id);

            // Log Audit
            if (Guid.TryParse(id, out var targetGuid))
            {
                await LogAdminAction("DeleteUser", targetGuid, $"Xóa người dùng {user.Username} ({user.Email}) khỏi hệ thống.");
            }

            return Ok(new { message = $"Đã xóa người dùng {user.Username} ({user.Email}) thành công." });
        }

        /// <summary>
        /// Đặt lại mật khẩu cho người dùng.
        /// PUT /api/v1/concepts/admin/users/{id}/reset-password
        /// </summary>
        [HttpPut("users/{id}/reset-password")]
        public async Task<IActionResult> ResetPassword(string id, [FromBody] ResetPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 8)
            {
                return BadRequest(new { error = "INVALID_PASSWORD", message = "Mật khẩu mới phải có tối thiểu 8 ký tự." });
            }

            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id.ToString() == id);
            if (user == null)
            {
                return NotFound(new { error = "USER_NOT_FOUND", message = "Không tìm thấy người dùng." });
            }

            var newHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword, workFactor: 12);
            user.ChangePassword(newHash);
            await _dbContext.SaveChangesAsync();

            // Sync to stateless in-memory cache
            _authStrategy.UpdateUserPassword(id, newHash);

            // Log Audit
            if (Guid.TryParse(id, out var targetGuid))
            {
                await LogAdminAction("ResetPassword", targetGuid, $"Đặt lại mật khẩu của người dùng {user.Username}.");
            }

            return Ok(new { message = $"Đã đặt lại mật khẩu cho người dùng {user.Username} thành công." });
        }

        // ── Quiz Management ──────────────────────────────────────────────────

        /// <summary>
        /// Danh sách quiz với số liệu thực từ DB.
        /// GET /api/v1/concepts/admin/quizzes
        /// </summary>
        [HttpGet("quizzes")]
        [RequireJwtRole("Teacher,Admin")]  // ✅ PB-705: Teacher cũng được xem quiz list
        public async Task<IActionResult> GetQuizzes()
        {

            try
            {
                var quizzes = await _dbContext.Quizzes
                    .OrderBy(q => q.Title)
                    .Select(q => new
                    {
                        id            = q.Id.ToString(),
                        title         = q.Title,
                        topic         = q.Topic,
                        difficulty    = q.Difficulty == 1 ? "easy" : q.Difficulty == 5 ? "hard" : "medium",
                        xpReward      = q.XPReward,
                        questionCount = q.Questions.Count,
                        createdAt     = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
                    })
                    .ToListAsync();

                return Ok(quizzes);
            }
            catch (Exception ex)
            {
                Serilog.Log.Warning(ex, "Không thể kết nối cơ sở dữ liệu để lấy danh sách quizzes. Fallback sang dữ liệu in-memory.");
                var inMemoryQuizzes = _quizBank.GetAllQuizzes();

                var quizzes = inMemoryQuizzes
                    .OrderBy(q => q.Title)
                    .Select(q => new
                    {
                        id            = q.Id,
                        title         = q.Title,
                        topic         = q.Topic,
                        difficulty    = q.Difficulty,
                        xpReward      = q.XpReward,
                        questionCount = q.Questions.Count,
                        createdAt     = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
                    })
                    .ToList();

                return Ok(quizzes);
            }
        }

        /// <summary>
        /// Xóa quiz theo ID.
        /// DELETE /api/v1/concepts/admin/quizzes/{id}
        /// </summary>
        [HttpDelete("quizzes/{id}")]
        [RequireJwtRole("Teacher,Admin")]  // ✅ PB-705
        public async Task<IActionResult> DeleteQuiz(string id)
        {

            var quiz = await _dbContext.Quizzes.FirstOrDefaultAsync(q => q.Id.ToString() == id);
            if (quiz == null)
                return NotFound(new { error = "QUIZ_NOT_FOUND" });

            _dbContext.Quizzes.Remove(quiz);
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = $"Đã xóa quiz \"{quiz.Title}\"." });
        }

        /// <summary>
        /// Analytics quiz từ DB: top quizzes, pass rate.
        /// GET /api/v1/concepts/admin/analytics/quiz
        /// </summary>
        [HttpGet("analytics/quiz")]
        [RequireJwtRole("Teacher,Admin")]  // ✅ PB-705
        public async Task<IActionResult> GetQuizAnalytics()
        {

            var quizAttempts = await _dbContext.Quizzes
                .OrderBy(q => q.Title)
                .Select(q => new
                {
                    id            = q.Id.ToString(),
                    title         = q.Title,
                    topic         = q.Topic,
                    difficulty    = q.Difficulty == 1 ? "easy" : q.Difficulty == 5 ? "hard" : "medium",
                    questionCount = q.Questions.Count,
                    xpReward      = q.XPReward
                })
                .ToListAsync();

            var totalUsers   = await _dbContext.Users.CountAsync();
            var premiumCount = await _dbContext.Users.CountAsync(u => u.IsPremium);

            return Ok(new
            {
                totalQuizzes  = quizAttempts.Count,
                totalUsers,
                premiumCount,
                quizzes       = quizAttempts
            });
        }

        /// <summary>
        /// Khóa hoặc Mở khóa tài khoản người dùng.
        /// PUT /api/v1/concepts/admin/users/{id}/ban
        /// </summary>
        [HttpPut("users/{id}/ban")]
        public async Task<IActionResult> BanUser(string id, [FromBody] BanUserRequest request)
        {

            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id.ToString() == id);
            if (user == null)
                return NotFound(new { error = "USER_NOT_FOUND" });

            user.SetActiveStatus(request.IsActive);
            await _dbContext.SaveChangesAsync();

            var action = request.IsActive ? "mở khóa" : "khóa";
            return Ok(new { message = $"Đã {action} tài khoản {user.Email}.", userId = id, isActive = request.IsActive });
        }

        /// <summary>
        /// Đóng vai (Impersonate) một user bất kỳ.
        /// POST /api/v1/concepts/admin/users/{id}/impersonate
        /// </summary>
        [HttpPost("users/{id}/impersonate")]
        public async Task<IActionResult> ImpersonateUser(string id)
        {

            var adminId = JwtHelper.ExtractSubFromToken(Request) ?? "unknown-admin";

            string email, username, role;
            int level;
            bool isPremium;

            // Tìm trong DB
            var dbUser = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id.ToString() == id);
            if (dbUser != null)
            {
                // Đồng bộ sang in-memory
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
                email = dbUser.Email;
                username = dbUser.Username;
                role = dbUser.Role;
                level = dbUser.CurrentLevel;
                isPremium = dbUser.IsPremium;
            }
            else
            {
                // Tìm trong in-memory
                try
                {
                    var memoryProfile = _authStrategy.GetProfile(id);
                    email = memoryProfile.Email;
                    username = memoryProfile.Username;
                    role = memoryProfile.Role;
                    level = memoryProfile.CurrentLevel;
                    isPremium = memoryProfile.IsPremium;
                }
                catch (KeyNotFoundException)
                {
                    return NotFound(new { error = "USER_NOT_FOUND", message = "Không tìm thấy người dùng để đóng vai." });
                }
            }

            // Sinh Impersonated Token
            var impersonatedToken = GenerateImpersonatedJwt(id, email, username, role, level, adminId);
            var impersonatedRefreshToken = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
            _authStrategy.ForceAddRefreshToken(impersonatedRefreshToken, id);

            // Log Audit
            if (Guid.TryParse(id, out var targetGuid))
            {
                await LogAdminAction("ImpersonateUser", targetGuid, $"Đóng vai (Impersonate) tài khoản học viên {username} ({email}).");
            }

            return Ok(new
            {
                accessToken = impersonatedToken,
                refreshToken = impersonatedRefreshToken,
                expiresIn = 900, // 15 minutes
                user = new
                {
                    id,
                    email,
                    username,
                    role,
                    level,
                    isPremium
                }
            });
        }

        private static string GenerateImpersonatedJwt(string userId, string email, string username, string role, int level, string adminId)
        {
            var header = Convert.ToBase64String(Encoding.UTF8.GetBytes("{\"alg\":\"HS256\",\"typ\":\"JWT\"}"));
            var payload = Convert.ToBase64String(Encoding.UTF8.GetBytes(
                $"{{\"sub\":\"{userId}\",\"email\":\"{email}\",\"name\":\"{username}\"," +
                $"\"role\":\"{role}\"," +
                $"\"level\":{level},\"exp\":{DateTimeOffset.UtcNow.AddMinutes(15).ToUnixTimeSeconds()}," +
                $"\"jti\":\"{Guid.NewGuid()}\",\"isImpersonated\":true,\"originalAdminId\":\"{adminId}\"}}"
            ));
            var key = Encoding.UTF8.GetBytes("VisualizationDSA-Stateless-Dev-Secret-Key-2024-Phase6-256bit!");
            var signature = Convert.ToBase64String(
                HMACSHA256.HashData(key, Encoding.UTF8.GetBytes($"{header}.{payload}"))
            );
            return $"{header}.{payload}.{signature}";
        }

        /// <summary>
        /// Lấy danh sách nhật ký quản trị (Audit Logs).
        /// GET /api/v1/concepts/admin/audit-logs
        /// </summary>
        [HttpGet("audit-logs")]
        public async Task<IActionResult> GetAuditLogs([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var query = _dbContext.AuditLogs.AsQueryable();
            var total = await query.CountAsync();
            var logs = await query
                .OrderByDescending(l => l.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new { total, page, pageSize, logs });
        }

        private async Task LogAdminAction(string action, Guid? targetId, string details)
        {
            var adminIdStr = JwtHelper.ExtractSubFromToken(Request);
            var adminName = "SystemAdmin";
            Guid adminId = Guid.Empty;
            if (adminIdStr != null && Guid.TryParse(adminIdStr, out var parsedId))
            {
                adminId = parsedId;
                var adminUser = await _dbContext.Users.FindAsync(adminId);
                if (adminUser != null)
                {
                    adminName = adminUser.Username;
                }
            }

            var log = new AuditLog(action, adminId, adminName, targetId, details);
            _dbContext.AuditLogs.Add(log);
            await _dbContext.SaveChangesAsync();
        }
    }

    // ── DTOs ─────────────────────────────────────────────────────────────────

    public record UpdateRoleRequest(string Role);
    public record TogglePremiumRequest(bool IsPremium);
    public record BanUserRequest(bool IsActive);
    public record CreateUserRequest(string Email, string Username, string Password, string Role, bool IsPremium);
    public record ResetPasswordRequest(string NewPassword);
}
