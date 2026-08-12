using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Application.Services
{
    public interface INotificationService
    {
        Task NotifyUserAsync(Guid userId, string content, string linkUrl = "");
        Task NotifyAdminsAsync(string content, string linkUrl = "");

        // NT-026: controller không query DbContext trực tiếp — toàn bộ truy xuất thông báo đi qua service.
        Task<IReadOnlyList<Notification>> GetUserNotificationsAsync(Guid userId, int limit);
        Task<int> GetUnreadCountAsync(Guid userId);
        Task<bool> MarkAsReadAsync(Guid userId, Guid notificationId);
        Task<int> MarkAllAsReadAsync(Guid userId);

        // NT-002: push real-time badge/level-up (không tạo dòng DB — hiện toast ngay cho user).
        Task NotifyBadgeAwardedAsync(Guid userId, string username, string badgeName, string badgeDescription);
        Task NotifyLevelUpAsync(Guid userId, string username, int oldLevel, int newLevel, int totalXp);
    }

    /// <summary>
    /// Loại sự kiện push real-time — tên enum khớp với event name client lắng nghe:
    /// "NewNotification" (thông báo bell), "BadgeAwarded"/"LevelUp" (toast gamification).
    /// </summary>
    public enum NotificationEventType
    {
        NewNotification,
        BadgeAwarded,
        LevelUp
    }

    /// <summary>
    /// Payload trung gian giữa service (publish) và hub (dispatch) — NT-002:
    /// các trường dùng chung, hub dựng payload cuối theo EventType (không dùng dynamic).
    /// </summary>
    public sealed class NotificationBroadcastMessage
    {
        public Guid UserId { get; set; }
        public NotificationEventType EventType { get; set; }
        public string Username { get; set; } = string.Empty;

        // NewNotification
        public Guid? NotificationId { get; set; }
        public string? Content { get; set; }
        public string? LinkUrl { get; set; }
        public DateTime? CreatedAt { get; set; }

        // BadgeAwarded
        public string? BadgeName { get; set; }
        public string? BadgeDescription { get; set; }
        public DateTime AwardedAt { get; set; }

        // LevelUp
        public int OldLevel { get; set; }
        public int NewLevel { get; set; }
        public int TotalXp { get; set; }
    }

    /// <summary>
    /// NT-002/NT-003: broker push notification real-time — NotificationService publish SAU khi commit;
    /// NotificationHub (WebApi) subscribe (khi có ≥1 client kết nối) và đẩy đúng Clients.User(userId).
    /// Không client đang kết nối → no-op. Hub không còn method public client-invokable → không spoof được.
    /// </summary>
    public static class NotificationBroadcastBroker
    {
        public static event Func<NotificationBroadcastMessage, Task>? Broadcast;

        public static Task PublishAsync(NotificationBroadcastMessage message)
        {
            var handler = Broadcast;
            return handler == null ? Task.CompletedTask : handler(message);
        }
    }
}
