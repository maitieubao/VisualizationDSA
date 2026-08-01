using System;
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
        }

        public async Task NotifyAdminsAsync(string content, string linkUrl = "")
        {
            var adminUsers = await _context.Users.Where(u => u.Role == "Admin").ToListAsync();
            foreach (var admin in adminUsers)
            {
                var notification = new Notification(admin.Id, content, linkUrl);
                _context.Notifications.Add(notification);
            }
            await _context.SaveChangesAsync();
        }
    }
}
