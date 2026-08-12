using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Threading.Tasks;
using VisualizationDSA.Application.Services;
using VisualizationDSA.WebApi.Filters;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationsController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        // NT-026: trích JWT 1 lần dùng chung cho mọi action (trước đây lặp 3 lần).
        private bool TryGetCurrentUserId(out Guid userId)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            return Guid.TryParse(userIdStr, out userId);
        }

        [HttpGet]
        [RequireJwtRole]
        public async Task<IActionResult> GetNotifications()
        {
            if (!TryGetCurrentUserId(out var userId))
                return Unauthorized();

            var notifications = await _notificationService.GetUserNotificationsAsync(userId, limit: 100);

            // NT-011: badge đếm unread trên SERVER (WHERE IsRead=false) — không phụ thuộc danh sách
            // Take(100), nên >100 unread vẫn hiển thị đúng trên bell.
            var totalUnread = await _notificationService.GetUnreadCountAsync(userId);

            return Ok(new
            {
                totalUnread,
                notifications = notifications.Select(n => new
                {
                    n.Id,
                    n.Content,
                    n.IsRead,
                    n.LinkUrl,
                    n.CreatedAt
                })
            });
        }

        // NT-011: endpoint riêng cho badge — frontend gọi sau khi mark-all / mỗi lần mở dropdown.
        [HttpGet("unread-count")]
        [RequireJwtRole]
        public async Task<IActionResult> GetUnreadCount()
        {
            if (!TryGetCurrentUserId(out var userId))
                return Unauthorized();

            var totalUnread = await _notificationService.GetUnreadCountAsync(userId);
            return Ok(new { totalUnread });
        }

        [HttpPut("{id}/read")]
        [RequireJwtRole]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            if (!TryGetCurrentUserId(out var userId))
                return Unauthorized();

            // NT-007: IDOR chéo user — thông báo không thuộc user → false → 404, không lộ dữ liệu.
            var marked = await _notificationService.MarkAsReadAsync(userId, id);
            if (!marked)
                return NotFound(new { error = "NOTIFICATION_NOT_FOUND", message = "Không tìm thấy thông báo." });

            return Ok(new { success = true, message = "Đã đánh dấu đã đọc." });
        }

        // NT-010: mark-all = 1 UPDATE atomic trong service (ExecuteUpdateAsync) — idempotent.
        [HttpPut("read-all")]
        [RequireJwtRole]
        public async Task<IActionResult> MarkAllAsRead()
        {
            if (!TryGetCurrentUserId(out var userId))
                return Unauthorized();

            var updated = await _notificationService.MarkAllAsReadAsync(userId);
            return Ok(new
            {
                success = true,
                updated,
                message = updated > 0
                    ? "Đã đánh dấu đã đọc tất cả thông báo."
                    : "Không có thông báo chưa đọc."
            });
        }
    }
}
