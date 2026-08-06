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

using VisualizationDSA.Domain;

namespace VisualizationDSA.WebApi.Controllers
{
    
    
    
    
    
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/concepts/admin")]
    [RequireJwtRole("Admin")]  
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

                
                var topUsers = await _dbContext.Users.AsNoTracking()
                    .OrderByDescending(u => u.TotalXP)
                    .Take(5)
                    .Select(u => new { u.Email, u.Username, u.TotalXP, u.CurrentLevel, u.Role })
                    .ToListAsync();

                
                var sevenDaysAgo = DateTime.UtcNow.Date.AddDays(-6);
                var registrationList = await _dbContext.Users.AsNoTracking()
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

                
                var popularCourses = await _dbContext.UserLessonProgresses
                    .Join(_dbContext.ModuleItems, p => p.LessonId, m => m.LessonId, (p, m) => new { Progress = p, ModuleItem = m })
                    .Join(_dbContext.CourseModules, pm => pm.ModuleItem.ModuleId, cm => cm.Id, (pm, cm) => new { pm.Progress, cm.Course })
                    .Where(x => x.Course != null)
                    .GroupBy(x => x.Course!.Id)
                    .Select(g => new
                    {
                        courseId = g.Key,
                        title = g.First().Course!.Title,
                        enrollmentsCount = g.Select(x => x.Progress.UserId).Distinct().Count()
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
            
            
            _authStrategy.UpdateUserRole(id, request.Role);

            
            if (Guid.TryParse(id, out var targetGuid))
            {
                await LogAdminAction("UpdateUserRole", targetGuid, $"Đổi vai trò của {user.Username} từ {oldRole} sang {request.Role}.");
            }

            return Ok(new { message = $"Đã đổi role của {user.Email} thành {request.Role}.", userId = id, newRole = request.Role });
        }

        
        
        
        
        [HttpPut("users/{id}/premium")]
        public async Task<IActionResult> TogglePremium(string id, [FromBody] TogglePremiumRequest request)
        {

            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id.ToString() == id);
            if (user == null)
                return NotFound(new { error = "USER_NOT_FOUND" });

            var oldStatus = user.IsPremium;
            user.SetPremiumStatus(request.IsPremium);
            await _dbContext.SaveChangesAsync();

            
            _authStrategy.SetUserPremium(id, request.IsPremium);

            
            if (Guid.TryParse(id, out var targetGuid))
            {
                await LogAdminAction("TogglePremium", targetGuid, $"Thay đổi trạng thái Premium của {user.Username} từ {oldStatus} sang {request.IsPremium}.");
            }

            return Ok(new { message = $"Đã {(request.IsPremium ? "bật" : "tắt")} Premium cho {user.Email}.", userId = id, isPremium = request.IsPremium });
        }

        
        
        
        
        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { error = "INVALID_INPUT", message = "Email, username và mật khẩu không được để trống." });
            }

            
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

            
            _authStrategy.AddUser(
                newUser.Id.ToString(),
                newUser.Email,
                newUser.Username,
                newUser.PasswordHash,
                newUser.Role,
                newUser.IsPremium
            );

            
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

            
            _authStrategy.RemoveUser(id);

            
            if (Guid.TryParse(id, out var targetGuid))
            {
                await LogAdminAction("DeleteUser", targetGuid, $"Xóa người dùng {user.Username} ({user.Email}) khỏi hệ thống.");
            }

            return Ok(new { message = $"Đã xóa người dùng {user.Username} ({user.Email}) thành công." });
        }

        
        
        
        
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

            
            _authStrategy.UpdateUserPassword(id, newHash);

            
            if (Guid.TryParse(id, out var targetGuid))
            {
                await LogAdminAction("ResetPassword", targetGuid, $"Đặt lại mật khẩu của người dùng {user.Username}.");
            }

            return Ok(new { message = $"Đã đặt lại mật khẩu cho người dùng {user.Username} thành công." });
        }

        

        
        
        
        
        [HttpGet("quizzes")]
        [RequireJwtRole("Teacher,Admin")]  
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

        
        
        
        
        [HttpDelete("quizzes/{id}")]
        [RequireJwtRole("Teacher,Admin")]  
        public async Task<IActionResult> DeleteQuiz(string id)
        {

            var quiz = await _dbContext.Quizzes.FirstOrDefaultAsync(q => q.Id.ToString() == id);
            if (quiz == null)
                return NotFound(new { error = "QUIZ_NOT_FOUND" });

            _dbContext.Quizzes.Remove(quiz);
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = $"Đã xóa quiz \"{quiz.Title}\"." });
        }

        
        
        
        
        [HttpGet("analytics/quiz")]
        [RequireJwtRole("Teacher,Admin")]  
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

        
        
        
        
        [HttpPut("users/{id}/ban")]
        public async Task<IActionResult> BanUser(string id, [FromBody] BanUserRequest request)
        {

            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id.ToString() == id);
            if (user == null)
                return NotFound(new { error = "USER_NOT_FOUND" });

            user.SetActiveStatus(request.IsActive);
            await _dbContext.SaveChangesAsync();

            // Đồng bộ trạng thái ban vào stateless memory — chặn login ngay cả khi DB down.
            _authStrategy.SetUserActive(user.Id.ToString(), request.IsActive);

            var action = request.IsActive ? "mở khóa" : "khóa";
            return Ok(new { message = $"Đã {action} tài khoản {user.Email}.", userId = id, isActive = request.IsActive });
        }

        
        
        
        
        [HttpPost("users/{id}/impersonate")]
        public async Task<IActionResult> ImpersonateUser(string id)
        {

            var adminId = JwtHelper.ExtractSubFromToken(Request) ?? "unknown-admin";

            string email, username, role;
            int level;
            bool isPremium;

            
            var dbUser = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id.ToString() == id);
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
                email = dbUser.Email;
                username = dbUser.Username;
                role = dbUser.Role;
                level = dbUser.CurrentLevel;
                isPremium = dbUser.IsPremium;
            }
            else
            {
                
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

            
            var impersonatedToken = GenerateImpersonatedJwt(id, email, username, role, level, adminId);
            var impersonatedRefreshToken = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
            _authStrategy.ForceAddRefreshToken(impersonatedRefreshToken, id);

            
            if (Guid.TryParse(id, out var targetGuid))
            {
                await LogAdminAction("ImpersonateUser", targetGuid, $"Đóng vai (Impersonate) tài khoản học viên {username} ({email}).");
            }

            return Ok(new
            {
                accessToken = impersonatedToken,
                refreshToken = impersonatedRefreshToken,
                expiresIn = 900, 
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
            var header = JwtSigningConfig.Base64UrlEncode(Encoding.UTF8.GetBytes("{\"alg\":\"HS256\",\"typ\":\"JWT\"}"));
            // JsonSerializer — username/email chứa ký tự đặc biệt không làm vỡ payload.
            var payloadJson = System.Text.Json.JsonSerializer.Serialize(new
            {
                sub = userId,
                email,
                name = username,
                role,
                level,
                exp = DateTimeOffset.UtcNow.AddMinutes(15).ToUnixTimeSeconds(),
                jti = Guid.NewGuid(),
                isImpersonated = true,
                originalAdminId = adminId
            });
            var payload = JwtSigningConfig.Base64UrlEncode(Encoding.UTF8.GetBytes(payloadJson));
            var signature = JwtSigningConfig.Base64UrlEncode(
                HMACSHA256.HashData(JwtSigningConfig.Key, Encoding.UTF8.GetBytes($"{header}.{payload}"))
            );
            return $"{header}.{payload}.{signature}";
        }

        
        
        
        
        [HttpGet("audit-logs")]
        public async Task<IActionResult> GetAuditLogs([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);
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
            try
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
            // Audit không được làm hỏng action đã thành công (trước đây lỗi log → 500).
            try { await _dbContext.SaveChangesAsync(); }
            catch (Exception ex) { Serilog.Log.Warning(ex, "Không ghi được audit log."); }
            }
            catch (Exception ex) { Serilog.Log.Warning(ex, "LogAdminAction tong the loi."); }
        }
    }

    

    public record UpdateRoleRequest(string Role);
    public record TogglePremiumRequest(bool IsPremium);
    public record BanUserRequest(bool IsActive);
    public record CreateUserRequest(string Email, string Username, string Password, string Role, bool IsPremium);
    public record ResetPasswordRequest(string NewPassword);
}
