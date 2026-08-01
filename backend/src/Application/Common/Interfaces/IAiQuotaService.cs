using System;
using System.Threading.Tasks;

namespace VisualizationDSA.Application.Common.Interfaces
{
    public interface IAiQuotaService
    {
        Task<bool> CheckAndIncrementGlobalAsync(Guid userId);
        Task<bool> CheckAndIncrementLessonAsync(Guid userId);
        Task<(int globalUsed, int globalMax, int lessonUsed, int lessonMax)> GetQuotaStatusAsync(Guid userId);
    }
}
