using System;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;

namespace VisualizationDSA.Application.Services
{
    public interface ISessionService
    {
        Task<EnterNodeResponseDto> EnterNodeAsync(Guid userId, string nodeId);
        Task<LearningSessionDto?> GetCurrentSessionAsync(Guid userId);
        Task<UpdateStepResponseDto> UpdateSessionStepAsync(Guid userId, Guid sessionId, string step);
    }
}
