using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Domain.Strategies;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.WebApi.Filters;

namespace VisualizationDSA.WebApi.Controllers
{
    // Tách khỏi AdminController (class-level RequireJwtRole("Admin") chặn Teacher):
    // TeacherStudentTab gọi GET /admin/users bằng token Teacher → 403 vĩnh viễn.
    // Route giữ nguyên để frontend không đổi; gate chính xác ngay trên method.
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/concepts/admin")]
    public class TeacherController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly StatelessAuthStrategy _authStrategy;

        public TeacherController(
            ApplicationDbContext dbContext,
            StatelessAuthStrategy authStrategy)
        {
            _dbContext = dbContext;
            _authStrategy = authStrategy;
        }

        [HttpGet("users")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null)
        {
            // Clamp phân trang tránh Skip âm (500) và pageSize khổng lồ (DoS).
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);
            var isAdmin = JwtHelper.IsAdmin(Request);

            try
            {
                var query = _dbContext.Users.AsQueryable();

                // Teacher chỉ nên thấy học viên — không phơi email/lastLogin của Admin/Teacher khác.
                if (!isAdmin)
                    query = query.Where(u => u.Role == "Student");

                if (!string.IsNullOrWhiteSpace(search))
                {
                    // TC-026: đồng bộ 2 chế độ DB + in-memory — lower cả 2 vế (SQLite LOWER translate
                    // ổn định; trước đây DB dùng Contains nhạy hoa thường, kết quả lệch nhau).
                    var cleanSearch = search.Trim().ToLower();
                    query = query.Where(u => u.Email.ToLower().Contains(cleanSearch) || u.Username.ToLower().Contains(cleanSearch));
                }

                var total = await query.CountAsync();
                var users = await query
                    .AsNoTracking()
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

                // Giữ nguyên ràng buộc: teacher chỉ thấy Student kể cả khi fallback.
                if (!isAdmin)
                    inMemoryUsers = inMemoryUsers.Where(u => u.Role == "Student").ToList();

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
    }
}
