using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.Infrastructure.Services
{
    public class NotificationService : INotificationService
    {
        // NT-016: role dùng hằng số — không string literal rải rác trong truy vấn.
        private const string AdminRole = "Admin";

        private readonly ApplicationDbContext _context;

        public NotificationService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task NotifyUserAsync(Guid userId, string content, string linkUrl = "")
        {
            var notification = new Notification(userId, content, linkUrl);
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            // NT-002: push real-time SAU khi commit — hub (đã subscribe) đẩy "NewNotification" cho user.
            await PublishSafelyAsync(new NotificationBroadcastMessage
            {
                UserId = userId,
                EventType = NotificationEventType.NewNotification,
                NotificationId = notification.Id,
                Content = content,
                LinkUrl = linkUrl,
                CreatedAt = notification.CreatedAt
            });
        }

        // NT-016: batch insert toàn bộ admin trong 1 lệnh; nếu 1 admin lỗi (vd ràng buộc FK/race)
        // → fallback thêm từng cái và BỎ QUA cái lỗi, không kéo sập cả batch.
        public async Task NotifyAdminsAsync(string content, string linkUrl = "")
        {
            var adminIds = await _context.Users
                .Where(u => u.Role == AdminRole)
                .Select(u => u.Id)
                .ToListAsync();

            var notifications = adminIds.Select(id => new Notification(id, content, linkUrl)).ToList();
            if (notifications.Count == 0)
                return;

            _context.Notifications.AddRange(notifications);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                _context.ChangeTracker.Clear();
                foreach (var original in notifications)
                {
                    // Tạo instance MỚI: instance cũ còn giữ navigation User (relationship fixup) —
                    // tái dùng sau Clear() khiến EF insert lại User → UNIQUE violation.
                    var fresh = new Notification(original.UserId, content, linkUrl);
                    _context.Notifications.Add(fresh);
                    try
                    {
                        await _context.SaveChangesAsync();
                    }
                    catch (DbUpdateException ex)
                    {
                        _context.ChangeTracker.Clear();
                        Serilog.Log.Warning(ex, "NotifyAdminsAsync: bỏ qua admin {AdminId} do lỗi insert.", original.UserId);
                    }
                }
            }
        }

        public async Task<IReadOnlyList<Notification>> GetUserNotificationsAsync(Guid userId, int limit)
        {
            return await _context.Notifications
                .AsNoTracking()
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Take(limit)
                .ToListAsync();
        }

        // NT-011: đếm unread trên SERVER (WHERE IsRead=false) — không phụ thuộc danh sách Take(100),
        // badge >100 unread vẫn đúng.
        public async Task<int> GetUnreadCountAsync(Guid userId)
        {
            return await _context.Notifications
                .CountAsync(n => n.UserId == userId && !n.IsRead);
        }

        public async Task<bool> MarkAsReadAsync(Guid userId, Guid notificationId)
        {
            // Kiểm tra quyền sở hữu trước — thông báo của user khác trả false → controller 404 (chống IDOR).
            var owned = await _context.Notifications
                .AnyAsync(n => n.Id == notificationId && n.UserId == userId);
            if (!owned)
                return false;

            // NT-010: 1 câu UPDATE atomic (không load toàn bộ + loop set + race check-then-set).
            await _context.Notifications
                .Where(n => n.Id == notificationId && n.UserId == userId && !n.IsRead)
                .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));
            return true;
        }

        // NT-010: mark-all = 1 UPDATE atomic idempotent (không unread → 0 dòng, không lỗi).
        public async Task<int> MarkAllAsReadAsync(Guid userId)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));
        }

        public async Task NotifyBadgeAwardedAsync(Guid userId, string username, string badgeName, string badgeDescription)
        {
            await PublishSafelyAsync(new NotificationBroadcastMessage
            {
                UserId = userId,
                EventType = NotificationEventType.BadgeAwarded,
                Username = username,
                BadgeName = badgeName,
                BadgeDescription = badgeDescription,
                AwardedAt = DateTime.UtcNow
            });
        }

        public async Task NotifyLevelUpAsync(Guid userId, string username, int oldLevel, int newLevel, int totalXp)
        {
            await PublishSafelyAsync(new NotificationBroadcastMessage
            {
                UserId = userId,
                EventType = NotificationEventType.LevelUp,
                Username = username,
                OldLevel = oldLevel,
                NewLevel = newLevel,
                TotalXp = totalXp
            });
        }

        /// <summary>Push lỗi (hub chết/không subscribe) không được làm hỏng request đã commit DB.</summary>
        private static async Task PublishSafelyAsync(NotificationBroadcastMessage message)
        {
            try
            {
                await NotificationBroadcastBroker.PublishAsync(message);
            }
            catch (Exception ex)
            {
                Serilog.Log.Warning(ex, "Không push được notification real-time (dữ liệu đã lưu DB).");
            }
        }
    }
}
