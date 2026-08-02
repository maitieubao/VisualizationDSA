using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;

namespace VisualizationDSA.Application.Services
{
    public interface ITeacherApplicationService
    {
        Task<TeacherApplicationDto> SubmitApplicationAsync(Guid userId, SubmitTeacherApplicationDto dto);
        Task<TeacherApplicationDto?> GetMyApplicationAsync(Guid userId);
        Task<IEnumerable<TeacherApplicationDto>> GetPendingApplicationsAsync(string? status = null);
        Task<TeacherApplicationDto> ApproveApplicationAsync(Guid applicationId, Guid adminId);
        Task<TeacherApplicationDto> RejectApplicationAsync(Guid applicationId, Guid adminId, string rejectReason);
    }
}
