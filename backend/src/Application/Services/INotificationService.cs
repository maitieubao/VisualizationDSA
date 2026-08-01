using System;
using System.Threading.Tasks;

namespace VisualizationDSA.Application.Services
{
    public interface INotificationService
    {
        Task NotifyUserAsync(Guid userId, string content, string linkUrl = "");
        Task NotifyAdminsAsync(string content, string linkUrl = "");
    }
}
