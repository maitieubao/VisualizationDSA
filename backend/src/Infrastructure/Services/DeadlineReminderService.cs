using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.Infrastructure.Services
{
    /// <summary>
    /// C2: nhắc deadline lớp học — mỗi giờ quét các ClassroomModuleItem có DueAt trong
    /// khoảng [giờ hiện tại, +24h] mà học viên CHƯA hoàn thành → gửi notification
    /// (bell + realtime) nhắc nhở. Chống trùng: dedupe (StudentId|ItemId|ngày) trong tiến trình.
    /// Lỗi 1 mục không kéo sập cả chu kỳ.
    /// </summary>
    public class DeadlineReminderService : BackgroundService
    {
        private readonly ILogger<DeadlineReminderService> _logger;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ConcurrentDictionary<string, byte> _sentToday = new();

        public DeadlineReminderService(ILogger<DeadlineReminderService> logger, IServiceScopeFactory scopeFactory)
        {
            _logger = logger;
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Deadline Reminder Service is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await RemindDeadlinesAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred executing Deadline Reminder.");
                }

                // Quét mỗi giờ — đủ nhanh cho nhắc nhở "còn 1 ngày".
                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
            }
        }

        private async Task RemindDeadlinesAsync(CancellationToken stoppingToken)
        {
            using var scope = _scopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var notificationService = scope.ServiceProvider.GetService<INotificationService>();

            var now = DateTime.UtcNow;
            var windowEnd = now.AddHours(24);

            // Item có deadline trong 24h tới, chưa bị xóa/ẩn với học viên.
            var items = await dbContext.ClassroomModuleItems
                .Include(i => i.Module)
                .Where(i => !i.IsDeleted
                    && !i.IsHiddenForStudent
                    && i.DueAt.HasValue
                    && i.DueAt.Value > now
                    && i.DueAt.Value <= windowEnd)
                .ToListAsync(stoppingToken);

            if (items.Count == 0)
            {
                PruneSentToday();
                return;
            }

            foreach (var item in items)
            {
                try
                {
                    // Học viên đang active trong lớp của item.
                    var students = await dbContext.ClassroomEnrollments
                        .Where(e => e.ClassroomId == item.Module.ClassroomId
                            && e.Status == EnrollmentStatus.Active)
                        .ToListAsync(stoppingToken);

                    var completedUserIds = await dbContext.UserModuleItemProgresses
                        .Where(p => p.ModuleItemId == item.Id && p.Status == "Completed")
                        .Select(p => p.UserId)
                        .ToListAsync(stoppingToken);

                    var title = item.OverrideTitle
                        ?? (item.LessonId.HasValue
                            ? (await dbContext.Lessons.FindAsync(new object[] { item.LessonId.Value }, stoppingToken))?.Title
                            : item.QuizId.HasValue
                                ? (await dbContext.Quizzes.FindAsync(new object[] { item.QuizId.Value }, stoppingToken))?.Title
                                : item.CodelabId.HasValue
                                    ? (await dbContext.Codelabs.FindAsync(new object[] { item.CodelabId.Value }, stoppingToken))?.Title
                                    : "Bài tập")
                        ?? "Bài tập";

                    foreach (var student in students)
                    {
                        // Bỏ qua học viên đã hoàn thành.
                        if (completedUserIds.Contains(student.StudentId)) continue;

                        var key = $"{student.StudentId:N}|{item.Id:N}|{now:yyyy-MM-dd}";
                        if (!_sentToday.TryAdd(key, 0)) continue;

                        if (notificationService != null)
                        {
                            try
                            {
                                await notificationService.NotifyUserAsync(
                                    student.StudentId,
                                    $"⏰ Còn dưới 24 giờ để hoàn thành '{title}' trong lớp (hạn {item.DueAt:HH:mm} hôm nay).",
                                    $"/classrooms/{item.Module.ClassroomId}");
                            }
                            catch
                            {
                                // 1 học viên lỗi không dừng các học viên khác.
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Deadline reminder lỗi cho item {ItemId}.", item.Id);
                }
            }

            PruneSentToday();
        }

        /// <summary>Giới hạn bộ nhớ: chỉ giữ dedupe của 2 ngày gần nhất.</summary>
        private void PruneSentToday()
        {
            if (_sentToday.Count <= 20_000) return;
            var today = DateTime.UtcNow.ToString("yyyy-MM-dd");
            foreach (var key in _sentToday.Keys)
            {
                if (!key.Contains(today, StringComparison.Ordinal))
                    _sentToday.TryRemove(key, out _);
            }
        }
    }
}
