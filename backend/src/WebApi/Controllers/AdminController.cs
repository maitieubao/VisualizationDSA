using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using System.Collections.Concurrent;
using System.Text;
using System.Text.Json;
using System.Security.Cryptography;
using VisualizationDSA.Domain.Strategies;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
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

        // A2-GUARD: Rate limit impersonation để tránh lạm dụng (5 lần/phút/admin).
        // AD-031: toàn bộ read-modify-write được bọc lock — không còn race giữa các request;
        // entry hết window được reset ngay (không tích lũy Count sai).
        private static readonly ConcurrentDictionary<string, (DateTime WindowStart, int Count)> _impersonationRateLimiter = new();
        private static readonly object _impersonationRateLock = new();
        private const int IMPERSONATION_RATE_LIMIT = 5;
        private const int IMPERSONATION_RATE_WINDOW_MINUTES = 1;

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
            // AD-006: chỉ fallback khi DB down XÁC NHẬN (CanConnectAsync) — không che giấu
            // lỗi logic khác. Mọi fallback đều gắn cờ isFallback=true để UI cảnh báo dữ liệu tạm.
            if (!await IsDatabaseAvailableAsync())
            {
                return BuildFallbackDashboard();
            }

            try
            {
                var totalUsers   = await _dbContext.Users.CountAsync();
                var totalStudents = await _dbContext.Users.CountAsync(u => u.Role == "Student");
                var totalTeachers = await _dbContext.Users.CountAsync(u => u.Role == "Teacher");
                var totalAdmins  = await _dbContext.Users.CountAsync(u => u.Role == "Admin");
                var premiumUsers = await _dbContext.Users.CountAsync(u => u.IsPremium);
                var totalQuizzes = await _dbContext.Quizzes.CountAsync();
                var totalOrders  = await _dbContext.Orders.CountAsync();
                var paidOrders   = await _dbContext.Orders.CountAsync(o => o.Status == "Completed");

                
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
                    popularCourses,
                    isFallback = false
                });
            }
            catch (Exception ex) when (IsDatabaseUnavailable(ex))
            {
                Serilog.Log.Warning(ex, "Không thể kết nối cơ sở dữ liệu để lấy dashboard. Fallback sang dữ liệu in-memory.");
                return BuildFallbackDashboard();
            }
        }

        private async Task<bool> IsDatabaseAvailableAsync()
        {
            try
            {
                return await _dbContext.Database.CanConnectAsync();
            }
            catch
            {
                return false;
            }
        }

        /// <summary>AD-006: chỉ nhận diện lỗi kết nối CSDL (không nuốt lỗi logic khác).</summary>
        private static bool IsDatabaseUnavailable(Exception ex)
            => ex is System.Data.Common.DbException;

        /// <summary>
        /// AD-006: dữ liệu fallback DETERMINISTIC (bỏ Random/Guid mới) — mọi chỉ số 0/chủng loại
        /// từ memory, kèm cờ isFallback=true để frontend hiển thị cảnh báo "dữ liệu tạm thời".
        /// </summary>
        private IActionResult BuildFallbackDashboard()
        {
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
                .Select(i => new
                {
                    date = DateTime.UtcNow.Date.AddDays(-6 + i).ToString("yyyy-MM-dd"),
                    count = 0
                })
                .ToList();

            return Ok(new
            {
                users = new { total = totalUsers, students = totalStudents, teachers = totalTeachers, admins = totalAdmins, premium = premiumUsers },
                quizzes = new { total = _quizBank.GetAllQuizzes().Count },
                orders  = new { total = 0, paid = 0 },
                topUsers,
                registrationsLast7Days,
                popularCourses = Array.Empty<object>(),
                isFallback = true
            });
        }

        

        
        
        
        

        
        
        
        
        // F3 (FR-1.8): liệt kê user theo role (ví dụ ?role=PendingTeacher) để AdminUsersTab
        // duyệt/từ chối tài khoản giảng viên đang chờ. Không có role → trả toàn bộ user.
        // Route "users/by-role" (không phải "users") vì TeacherController đã chiếm GET /admin/users.
        [HttpGet("users/by-role")]
        public async Task<IActionResult> GetUsers([FromQuery] string? role = null)
        {
            var query = _dbContext.Users.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(role))
            {
                var cleanRole = role.Trim();
                query = query.Where(u => u.Role == cleanRole);
            }

            var users = await query
                .OrderByDescending(u => u.CreatedAt)
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

            return Ok(users);
        }

        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> UpdateUserRole(string id, [FromBody] UpdateRoleRequest request)
        {

            if (request.Role != "Student" && request.Role != "Teacher" && request.Role != "Admin")
                return BadRequest(new { error = "INVALID_ROLE", message = "Role phải là Student, Teacher hoặc Admin." });

            var user = await _dbContext.Users.FirstOrDefaultAsync(
        u => u.Id.ToString().ToLower() == id.ToLowerInvariant());
            if (user == null)
                return NotFound(new { error = "USER_NOT_FOUND" });

            var oldRole = user.Role;

            // AD-003: chặn admin tự đổi vai trò của chính mình — không cho tự "hồi phục" quyền
            // sau khi bị admin khác demote (role giờ đối chiếu DB nên demote là vĩnh viễn).
            var actorSub = JwtHelper.ExtractSubFromToken(Request);
            if (actorSub != null && Guid.TryParse(actorSub, out var actorGuid) && actorGuid == user.Id)
            {
                return BadRequest(new { error = "SELF_ROLE_CHANGE_FORBIDDEN", message = "Không thể tự thay đổi vai trò của chính mình." });
            }

            // A1-GUARD: Ngăn self-demotion của admin cuối cùng — tránh mất quyền quản lý hệ thống.
            if (oldRole == "Admin" && request.Role != "Admin")
            {
                var totalAdmins = await _dbContext.Users.CountAsync(u => u.Role == "Admin" && u.Id != user.Id && u.IsActive);
                if (totalAdmins <= 0)
                    return Conflict(new { error = "LAST_ADMIN_PROTECTED", message = "Không thể thay đổi vai trò của admin cuối cùng trong hệ thống." });
            }

            // F3 (FR-1.8): duyệt/từ chối tài khoản PendingTeacher qua endpoint sẵn có.
            // Duyệt = "Teacher", từ chối = "Student". SetRole KHÔNG nhận PendingTeacher nên
            // admin không thể đặt nhầm tài khoản về trạng thái chờ (an toàn 1 chiều).
            user.SetRole(request.Role);
            await _dbContext.SaveChangesAsync();
            
            
            _authStrategy.UpdateUserRole(id, request.Role);

            
            if (Guid.TryParse(id, out var targetGuid))
            {
                // F3: ghi rõ khi hành động là duyệt/từ chối giảng viên để audit dễ truy vết.
                var action = oldRole == "PendingTeacher" && request.Role == "Teacher" ? "ApproveTeacher"
                    : oldRole == "PendingTeacher" && request.Role == "Student" ? "RejectTeacher"
                    : "UpdateUserRole";
                await LogAdminAction(action, targetGuid, $"Đổi vai trò của {user.Username} từ {oldRole} sang {request.Role}.");
            }

            return Ok(new { message = $"Đã đổi role của {user.Email} thành {request.Role}.", userId = id, newRole = request.Role });
        }

        
        
        
        
        [HttpPut("users/{id}/premium")]
        public async Task<IActionResult> TogglePremium(string id, [FromBody] TogglePremiumRequest request)
        {

            var user = await _dbContext.Users.FirstOrDefaultAsync(
        u => u.Id.ToString().ToLower() == id.ToLowerInvariant());
            if (user == null)
                return NotFound(new { error = "USER_NOT_FOUND" });

            var oldStatus = user.IsPremium;

            // AD-032: không thu hồi Premium khi user còn order Pending chưa hết hạn —
            // webhook thanh toán sau đó sẽ bật lại, tạo trạng thái kẹt (split-brain).
            if (!request.IsPremium)
            {
                var hasPendingOrder = await _dbContext.Orders.AnyAsync(o =>
                    o.UserId == user.Id &&
                    o.Status == OrderStatus.Pending.ToString() &&
                    o.ExpiresAt > DateTime.UtcNow);
                if (hasPendingOrder)
                {
                    return Conflict(new
                    {
                        error = "PENDING_ORDER_EXISTS",
                        message = "Người dùng còn đơn hàng chờ thanh toán chưa hết hạn — không thể thu hồi Premium."
                    });
                }
            }

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

            // AD-033: validate role trước khi tạo — role lạ không được "âm thầm" thành Student.
            if (request.Role != "Student" && request.Role != "Teacher" && request.Role != "Admin")
            {
                return BadRequest(new { error = "INVALID_ROLE", message = "Role phải là Student, Teacher hoặc Admin." });
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

            // A6-GUARD: Atomic create — catch race condition giữa check-and-insert (unique index violation).
            try
            {
                await _dbContext.SaveChangesAsync();
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException ex)
                   when (ex.InnerException?.Message.Contains("UNIQUE constraint") == true
                      || ex.InnerException?.Message.Contains("duplicate key") == true)
            {
                return Conflict(new { error = "USER_EXISTS", message = "Email hoặc Username đã được sử dụng." });
            }

            
            _authStrategy.AddUser(
                newUser.Id.ToString(),
                newUser.Email,
                newUser.Username,
                newUser.PasswordHash,
                newUser.Role,
                newUser.IsPremium
            );

            
            await LogAdminAction("CreateUser", newUser.Id, $"Tạo người dùng mới: {newUser.Username} ({newUser.Email}), vai trò: {newUser.Role}, Premium: {newUser.IsPremium}.");

            // AD-033: tạo mới tài nguyên → 201 Created (trước đây 200 trả như update).
            return StatusCode(StatusCodes.Status201Created, new
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
            var user = await _dbContext.Users.FirstOrDefaultAsync(
        u => u.Id.ToString().ToLower() == id.ToLowerInvariant());
            if (user == null)
            {
                return NotFound(new { error = "USER_NOT_FOUND", message = "Không tìm thấy người dùng." });
            }

            // AD-023: admin cuối cùng không được xóa — tránh hệ thống mất quyền quản lý.
            if (user.Role == "Admin")
            {
                var totalAdmins = await _dbContext.Users.CountAsync(u => u.Role == "Admin" && u.Id != user.Id && u.IsActive);
                if (totalAdmins <= 0)
                    return Conflict(new { error = "LAST_ADMIN_PROTECTED", message = "Không thể xóa admin cuối cùng trong hệ thống." });
            }

            // AD-005: kiểm tra FK Restrict TRƯỚC khi xóa — trả Conflict rõ ràng thay vì 500
            // khi user còn nội dung do chính họ sở hữu (TheoryArticle/ClassroomAnnouncement/Course).
            var articleCount = await _dbContext.TheoryArticles.IgnoreQueryFilters().CountAsync(a => a.AuthorId == user.Id);
            var announcementCount = await _dbContext.ClassroomAnnouncements.CountAsync(c => c.AuthorId == user.Id);
            var courseCount = await _dbContext.Courses.CountAsync(c => c.TeacherId == user.Id);
            if (articleCount > 0 || announcementCount > 0 || courseCount > 0)
            {
                return Conflict(new
                {
                    error = "USER_HAS_CONTENT",
                    message = $"Người dùng còn {articleCount} bài viết lý thuyết, {announcementCount} thông báo lớp học và {courseCount} khóa học. Hãy chuyển quyền sở hữu hoặc xóa nội dung trước khi xóa tài khoản."
                });
            }

            // A3-GUARD: Cascade delete orphaned data trước khi xóa User để tránh FK violation.
            await _dbContext.UserLessonProgresses
                .Where(p => p.UserId == user.Id)
                .ExecuteDeleteAsync();
            await _dbContext.UserModuleItemProgresses
                .Where(p => p.UserId == user.Id)
                .ExecuteDeleteAsync();
            await _dbContext.QuizAttempts
                .Where(q => q.UserId == user.Id)
                .ExecuteDeleteAsync();
            await _dbContext.LessonComments
                .Where(c => c.UserId == user.Id)
                .ExecuteDeleteAsync();
            await _dbContext.ClassroomEnrollments
                .Where(e => e.StudentId == user.Id)
                .ExecuteDeleteAsync();
            await _dbContext.RefreshTokens
                .Where(t => t.UserId == user.Id)
                .ExecuteDeleteAsync();
            await _dbContext.Notifications
                .Where(n => n.UserId == user.Id)
                .ExecuteDeleteAsync();
            await _dbContext.UserBadges
                .Where(ub => ub.UserId == user.Id)
                .ExecuteDeleteAsync();

            _dbContext.Users.Remove(user);
            await _dbContext.SaveChangesAsync();

            
            _authStrategy.RemoveUser(id);

            
            if (Guid.TryParse(id, out var targetGuid))
            {
                await LogAdminAction("DeleteUser", targetGuid, $"Xóa người dùng {user.Username} ({user.Email}) khỏi hệ thống, kèm cascade xóa dữ liệu liên quan.");
            }

            return Ok(new { message = $"Đã xóa người dùng {user.Username} ({user.Email}) thành công." });
        }

        
        
        
        
        [HttpPut("users/{id}/reset-password")]
        [EnableRateLimiting("heavy")]
        public async Task<IActionResult> ResetPassword(string id, [FromBody] ResetPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 8)
            {
                return BadRequest(new { error = "INVALID_PASSWORD", message = "Mật khẩu mới phải có tối thiểu 8 ký tự." });
            }

            var user = await _dbContext.Users.FirstOrDefaultAsync(
        u => u.Id.ToString().ToLower() == id.ToLowerInvariant());
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
        public async Task<IActionResult> DeleteQuiz(string id)
        {

            var quiz = await _dbContext.Quizzes.FirstOrDefaultAsync(
        q => q.Id.ToString().ToLower() == id.ToLowerInvariant());
            if (quiz == null)
                return NotFound(new { error = "QUIZ_NOT_FOUND" });

            // A4-GUARD: Ngăn xóa quiz nếu đang được tham chiếu trong ModuleItems (cả Course và Classroom).
            var referencingCourseItems = await _dbContext.ModuleItems
                .Where(m => m.QuizId.ToString().ToLower() == id.ToLowerInvariant() && !m.IsDeleted)
                .Select(m => m.Module.Course.Title)
                .Distinct()
                .ToListAsync();

            if (referencingCourseItems.Any())
            {
                return Conflict(new
                {
                    error = "QUIZ_REFERENCED",
                    message = $"Quiz \"{quiz.Title}\" đang được sử dụng trong khóa học: {string.Join(", ", referencingCourseItems)}. Vui lòng gỡ liên kết trước khi xóa.",
                    referencedByCourses = referencingCourseItems
                });
            }

            _dbContext.Quizzes.Remove(quiz);
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = $"Đã xóa quiz \"{quiz.Title}\"." });
        }
        
        [HttpGet("analytics/quiz")]
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

        // D4: analytics học tập — chứng minh hiệu quả (xem visualizer → làm quiz).
        [HttpGet("analytics/learning")]
        public async Task<IActionResult> GetLearningAnalytics()
        {
            // Per-lesson: số user học, % xem viz, % làm quiz, % pass quiz, % pass codelab, avg best score.
            var lessons = await _dbContext.Lessons
                .Where(l => !l.IsDeleted)
                .OrderBy(l => l.Title)
                .Select(l => new
                {
                    l.Id,
                    l.Title,
                    progresses = l.Progresses.Select(p => new
                    {
                        p.HasWatchedVisualizer,
                        p.BestScore,
                        p.CodelabCompleted,
                        p.Status
                    })
                })
                .ToListAsync();

            var lessonStats = lessons
                .Select(l =>
                {
                    var list = l.progresses.ToList();
                    var learners = list.Count;
                    var watchers = list.Count(p => p.HasWatchedVisualizer);
                    var quizTaken = list.Count(p => p.BestScore > 0);
                    var quizPassed = list.Count(p => p.BestScore >= 60); // 60/100 = đạt
                    var codelabDone = list.Count(p => p.CodelabCompleted);
                    var completed = list.Count(p => p.Status == "Completed");
                    return new
                    {
                        lessonId = l.Id.ToString(),
                        lessonTitle = l.Title,
                        learners,
                        visualizerWatchRate = learners == 0 ? 0.0 : Math.Round((double)watchers / learners * 100, 1),
                        quizTakenRate = learners == 0 ? 0.0 : Math.Round((double)quizTaken / learners * 100, 1),
                        quizPassRate = learners == 0 ? 0.0 : Math.Round((double)quizPassed / learners * 100, 1),
                        codelabCompletionRate = learners == 0 ? 0.0 : Math.Round((double)codelabDone / learners * 100, 1),
                        completionRate = learners == 0 ? 0.0 : Math.Round((double)completed / learners * 100, 1),
                        avgBestScore = quizTaken == 0 ? 0.0 : Math.Round(list.Where(p => p.BestScore > 0).Average(p => p.BestScore), 1),
                        // D4: tương quan "xem viz → pass quiz" — trên bài có ≥ 1 user xem viz.
                        passRateWithVisualizer = watchers == 0 ? 0.0 : Math.Round((double)list.Count(p => p.HasWatchedVisualizer && p.BestScore >= 60) / watchers * 100, 1),
                        passRateWithoutVisualizer = (learners - watchers) == 0 ? 0.0 : Math.Round((double)list.Count(p => !p.HasWatchedVisualizer && p.BestScore >= 60) / (learners - watchers) * 100, 1)
                    };
                })
                .ToList();

            var totalProgress = await _dbContext.UserLessonProgresses.CountAsync();
            var overall = new
            {
                totalLearners = await _dbContext.UserLessonProgresses.Select(p => p.UserId).Distinct().CountAsync(),
                totalProgressRecords = totalProgress,
                avgVisualizerWatchRate = lessons.Count == 0 ? 0.0 : Math.Round(lessonStats.Average(l => l.visualizerWatchRate), 1),
                avgQuizPassRate = lessons.Count == 0 ? 0.0 : Math.Round(lessonStats.Average(l => l.quizPassRate), 1),
                // Tỷ lệ pass quiz TRUNG BÌNH có xem viz vs không xem (chỉ trên bài có dữ liệu cả 2 nhóm).
                avgPassRateWithVisualizer = lessonStats.Count(l => l.passRateWithVisualizer > 0) == 0 ? 0.0
                    : Math.Round(lessonStats.Where(l => l.passRateWithVisualizer > 0).Average(l => l.passRateWithVisualizer), 1),
                avgPassRateWithoutVisualizer = lessonStats.Count(l => l.passRateWithoutVisualizer > 0) == 0 ? 0.0
                    : Math.Round(lessonStats.Where(l => l.passRateWithoutVisualizer > 0).Average(l => l.passRateWithoutVisualizer), 1)
            };

            return Ok(new { overall, lessons = lessonStats });
        }

        
        
        
        
        [HttpPut("users/{id}/ban")]
        public async Task<IActionResult> BanUser(string id, [FromBody] BanUserRequest request)
        {

            var user = await _dbContext.Users.FirstOrDefaultAsync(
        u => u.Id.ToString().ToLower() == id.ToLowerInvariant());
            if (user == null)
                return NotFound(new { error = "USER_NOT_FOUND" });

            // AD-023: admin cuối cùng không được khóa — tránh mất quyền quản lý hệ thống.
            if (!request.IsActive && user.Role == "Admin")
            {
                var totalAdmins = await _dbContext.Users.CountAsync(u => u.Role == "Admin" && u.Id != user.Id && u.IsActive);
                if (totalAdmins <= 0)
                    return Conflict(new { error = "LAST_ADMIN_PROTECTED", message = "Không thể khóa admin cuối cùng trong hệ thống." });
            }

            user.SetActiveStatus(request.IsActive);

            // A5-GUARD: Khi khóa tài khoản, thu hẹp refresh tokens để buộc logout thiết bị.
            if (!request.IsActive)
            {
                _authStrategy.RevokeAllRefreshTokens(id);
            }

            await _dbContext.SaveChangesAsync();

            // Đồng bộ trạng thái ban vào stateless memory — chặn login ngay cả khi DB down.
            _authStrategy.SetUserActive(user.Id.ToString(), request.IsActive);

            // AD-004: Ban/Unban là hành động nhạy cảm nhất — bắt buộc ghi audit.
            if (Guid.TryParse(id, out var targetGuid))
            {
                var action = request.IsActive ? "UnbanUser" : "BanUser";
                var verb = request.IsActive ? "Mở khóa" : "Khóa";
                await LogAdminAction(action, targetGuid, $"{verb} tài khoản {user.Username} ({user.Email}).");
            }

            var actionText = request.IsActive ? "mở khóa" : "khóa";
            return Ok(new { message = $"Đã {actionText} tài khoản {user.Email}.", userId = id, isActive = request.IsActive });
        }

        
        
        
        
        [HttpPost("users/{id}/impersonate")]
        public async Task<IActionResult> ImpersonateUser(string id)
        {
            var adminId = JwtHelper.ExtractSubFromToken(Request) ?? "unknown-admin";

            // A2-GUARD: Rate limit impersonation — max 5 lần/phút cho mỗi admin.
            // AD-031: read-modify-write được bọc lock (atomic) — không còn race khi
            // nhiều request song song cùng admin; entry hết window tự reset.
            var rateKey = adminId;
            lock (_impersonationRateLock)
            {
                var now = DateTime.UtcNow;
                if (!_impersonationRateLimiter.TryGetValue(rateKey, out var rateEntry) ||
                    (now - rateEntry.WindowStart).TotalMinutes > IMPERSONATION_RATE_WINDOW_MINUTES)
                {
                    _impersonationRateLimiter[rateKey] = (now, 1);
                }
                else if (rateEntry.Count >= IMPERSONATION_RATE_LIMIT)
                {
                    return StatusCode(429, new { error = "RATE_LIMITED", message = "Quá nhiều yêu cầu đóng vai. Vui lòng thử lại sau 1 phút." });
                }
                else
                {
                    _impersonationRateLimiter[rateKey] = (rateEntry.WindowStart, rateEntry.Count + 1);
                }
            }

            string email, username, role;
            int level;
            bool isPremium;

            
            // ERR-216 pattern: SQLite stores Guids as BLOBs — u.Id.ToString() never matches
            // the hex string from the client. Parse the Guid and compare strongly-typed.
            var dbUser = await _dbContext.Users.FirstOrDefaultAsync(
                u => u.Id.ToString().ToLower() == id.ToLowerInvariant());
            if (dbUser != null)
            {
                // Canonical id (lowercase Guid) — the in-memory strategy keys users by it;
                // the raw route id may be uppercase (SQLite TEXT) and miss the dictionary.
                id = dbUser.Id.ToString();
                
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

            // AD-002: CHỈ được đóng vai học viên (Student) — impersonate Admin/Teacher cho phép
            // leo quyền dưới danh tính khác (claim isImpersonated không được validate ở tầng filter).
            if (role != "Student")
            {
                return Conflict(new
                {
                    error = "IMPERSONATE_TARGET_NOT_STUDENT",
                    message = "Chỉ có thể đóng vai tài khoản học viên (Student)."
                });
            }

            
            var impersonatedToken = GenerateImpersonatedJwt(id, email, username, role, level, adminId);
            var impersonatedRefreshToken = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
            // AD-043: refresh token đóng vai mang marker impersonatedBy — khi xoay token qua
            // /refresh, marker isImpersonated được GIỮ (không biến thành token thật).
            _authStrategy.ForceAddRefreshToken(impersonatedRefreshToken, id, impersonatedBy: adminId);

            
            if (Guid.TryParse(id, out var targetGuid))
            {
                await LogAdminAction("ImpersonateUser", targetGuid, $"Đóng vai (Impersonate) tài khoản học viên {username} ({email}).");
            }

            // AD-013: trả profile CHUNG StatelessUserDto (currentLevel/totalXP/streakDays/createdAt/badges)
            // — frontend đọc currentLevel từ user.
            var profile = _authStrategy.GetProfile(id);

            return Ok(new
            {
                accessToken = impersonatedToken,
                refreshToken = impersonatedRefreshToken,
                expiresIn = 900, 
                user = profile
            });
        }

        private static string GenerateImpersonatedJwt(string userId, string email, string username, string role, int level, string adminId)
        {
            var header = JwtSigningConfig.Base64UrlEncode(Encoding.UTF8.GetBytes("{\"alg\":\"HS256\",\"typ\":\"JWT\"}"));
            // JsonSerializer — username/email chứa ký tự đặc biệt không làm vỡ payload.
            // AD-001: claim iss/aud từ JwtSigningConfig — khớp fail-closed của JwtHelper.RequireToken
            // (trước đây thiếu 2 claim này → mọi token impersonate bị 401).
            var payloadJson = System.Text.Json.JsonSerializer.Serialize(new
            {
                sub = userId,
                email,
                name = username,
                role,
                level,
                iss = JwtSigningConfig.Issuer ?? "VisualizationDSA",
                aud = JwtSigningConfig.Audience ?? "VisualizationDSA-Client",
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
