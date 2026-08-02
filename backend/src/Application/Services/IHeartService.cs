using System;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Application.Services
{
    public interface IHeartService
    {
        Task<HeartStatusDto> GetHeartStatusAsync(Guid userId);
        Task<bool> DeductHeartAtomicAsync(Guid userId);
        Task<WatchAdResponseDto> WatchAdAsync(Guid userId);
        int CalculateRecoveredHearts(User user);
    }
}
