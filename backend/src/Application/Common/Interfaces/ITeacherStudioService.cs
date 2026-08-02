using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs.TeacherStudio;

namespace VisualizationDSA.Application.Common.Interfaces
{
    public interface ITeacherStudioService
    {
        // Roadmap
        Task<CustomRoadmapDto> CreateRoadmapAsync(Guid teacherId, CreateRoadmapDto dto);
        Task<CustomRoadmapDto> GetRoadmapAsync(Guid id);
        Task<List<CustomRoadmapDto>> GetMyRoadmapsAsync(Guid teacherId);
        Task<List<CustomRoadmapDto>> GetPendingRoadmapsAsync();
        Task<CustomRoadmapDto> UpdateRoadmapAsync(Guid id, Guid teacherId, UpdateRoadmapDto dto);
        Task DeleteRoadmapAsync(Guid id, Guid teacherId);
        Task<CustomRoadmapDto> CloneRoadmapAsync(Guid sourceId, Guid teacherId);
        
        // Node
        Task<CustomNodeDto> AddNodeAsync(Guid roadmapId, Guid teacherId, CreateNodeDto dto);
        Task<CustomNodeDto> UpdateNodeContentAsync(Guid roadmapId, Guid nodeId, Guid teacherId, UpdateNodeContentDto dto);
        Task<CustomNodeDto> UpdateNodePracticeAsync(Guid roadmapId, Guid nodeId, Guid teacherId, UpdateNodePracticeDto dto);
        Task DeleteNodeAsync(Guid roadmapId, Guid nodeId, Guid teacherId);
        
        // Publish & Admin
        Task<CustomRoadmapDto> PublishRoadmapAsync(Guid id, Guid teacherId, PublishRoadmapDto dto);
        Task<CustomRoadmapDto> ApproveRoadmapAsync(Guid id, Guid adminId);
        Task<CustomRoadmapDto> RejectRoadmapAsync(Guid id, Guid adminId, RejectRoadmapDto dto);
    }
}
