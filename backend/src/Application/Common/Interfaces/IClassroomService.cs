using System;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs.Classroom;

namespace VisualizationDSA.Application.Common.Interfaces
{
    public interface IClassroomService
    {
        Task<ClassroomDto> CreateClassroomAsync(CreateClassroomDto dto, Guid teacherId);
        Task<ClassroomDto> JoinClassroomAsync(JoinClassroomDto dto, Guid studentId);
        Task<ClassroomAnalyticsDto> GetClassroomAnalyticsAsync(string classroomId, Guid teacherId);
        Task<byte[]> ExportClassroomAnalyticsToExcelAsync(string classroomId, Guid teacherId);

        Task<System.Collections.Generic.IEnumerable<ClassroomDto>> GetMyClassroomsAsync(Guid userId, string role);
        Task<ClassroomDto> GetClassroomDetailsAsync(string classroomId, Guid userId);
        Task DeleteClassroomAsync(string classroomId, Guid teacherId);
        Task KickStudentAsync(string classroomId, Guid studentIdToKick, Guid teacherId);
        Task<string> RegenerateJoinCodeAsync(string classroomId, Guid teacherId);
    }
}
