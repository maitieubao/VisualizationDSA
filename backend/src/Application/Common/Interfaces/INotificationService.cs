using System;
using System.Threading.Tasks;

namespace VisualizationDSA.Application.Common.Interfaces
{
    public interface INotificationService
    {
        Task SendNotificationAsync(Guid userId, string title, string message, string type, string linkUrl = "", Guid? refId = null);
    }
}
