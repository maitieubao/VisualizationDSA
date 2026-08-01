using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.WebApi.Filters;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public NotificationsController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <summary>
        /// Lấy danh sách thông báo của người dùng hiện tại.
        /// GET /api/v1/concepts/notifications
        /// </summary>
        [HttpGet]
        [RequireJwtRole]
        public async Task<IActionResult> GetNotifications()
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (userIdStr == null || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var notifications = await _dbContext.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new
                {
                    n.Id,
                    n.Content,
                    n.IsRead,
                    n.LinkUrl,
                    n.CreatedAt
                })
                .ToListAsync();

            return Ok(notifications);
        }

        /// <summary>
        /// Đánh dấu một thông báo là đã đọc.
        /// PUT /api/v1/concepts/notifications/{id}/read
        /// </summary>
        [HttpPut("{id}/read")]
        [RequireJwtRole]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (userIdStr == null || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var notification = await _dbContext.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

            if (notification == null)
                return NotFound(new { error = "NOTIFICATION_NOT_FOUND", message = "Không tìm thấy thông báo." });

            notification.MarkAsRead();
            await _dbContext.SaveChangesAsync();

            return Ok(new { success = true, message = "Đã đánh dấu đã đọc." });
        }

        /// <summary>
        /// Đánh dấu tất cả thông báo là đã đọc.
        /// PUT /api/v1/concepts/notifications/read-all
        /// </summary>
        [HttpPut("read-all")]
        [RequireJwtRole]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (userIdStr == null || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var unreadNotifications = await _dbContext.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            foreach (var notification in unreadNotifications)
            {
                notification.MarkAsRead();
            }

            await _dbContext.SaveChangesAsync();

            return Ok(new { success = true, message = "Đã đánh dấu đã đọc tất cả thông báo." });
        }
    }
}
