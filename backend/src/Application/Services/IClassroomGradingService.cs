using System;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;

namespace VisualizationDSA.Application.Services
{
    public interface IClassroomGradingService
    {
        Task<ClassStatsDto> GetClassStatisticsAsync(Guid classroomId, Guid teacherId);
    }
}
