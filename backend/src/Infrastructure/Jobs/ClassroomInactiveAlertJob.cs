using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using VisualizationDSA.Application.Common.Interfaces;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.Infrastructure.Jobs
{
    public class ClassroomInactiveAlertJob : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<ClassroomInactiveAlertJob> _logger;

        public ClassroomInactiveAlertJob(IServiceProvider serviceProvider, ILogger<ClassroomInactiveAlertJob> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CheckInactiveStudentsAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred executing ClassroomInactiveAlertJob.");
                }

                // Run daily
                await Task.Delay(TimeSpan.FromDays(1), stoppingToken);
            }
        }

        private async Task CheckInactiveStudentsAsync()
        {
            _logger.LogInformation("ClassroomInactiveAlertJob: Starting inactive students check...");

            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

            // Find all classrooms
            var classrooms = await context.Classrooms
                .Include(c => c.Members)
                    .ThenInclude(m => m.Student)
                .ToListAsync();

            foreach (var classroom in classrooms)
            {
                var inactiveStudents = classroom.Members
                    .Where(m => m.Student.LastActivityDate == null || m.Student.LastActivityDate < thirtyDaysAgo)
                    .ToList();

                if (inactiveStudents.Any())
                {
                    var title = $"Cảnh báo Lớp {classroom.Name}";
                    var message = $"Có {inactiveStudents.Count} học viên không hoạt động trong 30 ngày qua.";
                    
                    await notificationService.SendNotificationAsync(
                        classroom.TeacherId, 
                        title, 
                        message, 
                        "CLASSROOM_ALERT"
                    );
                }
            }
            
            _logger.LogInformation("ClassroomInactiveAlertJob: Completed check.");
        }
    }
}
