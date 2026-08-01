using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VisualizationDSA.Application.Common.Interfaces;
using VisualizationDSA.Application.DTOs.Classroom;
using Asp.Versioning;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiController]
    [Route("api/v{version:apiVersion}/classrooms")]
    [ApiVersion("1.0")]
    [Authorize]
    public class ClassroomController : ControllerBase
    {
        private readonly IClassroomService _classroomService;

        public ClassroomController(IClassroomService classroomService)
        {
            _classroomService = classroomService;
        }

        [HttpPost]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> CreateClassroom([FromBody] CreateClassroomDto dto)
        {
            var userId = GetCurrentUserId();
            var classroom = await _classroomService.CreateClassroomAsync(dto, userId);
            return Ok(classroom);
        }

        [HttpPost("join")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> JoinClassroom([FromBody] JoinClassroomDto dto)
        {
            var userId = GetCurrentUserId();
            var classroom = await _classroomService.JoinClassroomAsync(dto, userId);
            return Ok(classroom);
        }

        [HttpGet("{id}/analytics")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> GetClassroomAnalytics(string id)
        {
            var userId = GetCurrentUserId();
            var analytics = await _classroomService.GetClassroomAnalyticsAsync(id, userId);
            return Ok(analytics);
        }

        [HttpGet("{id}/export")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> ExportClassroomAnalytics(string id)
        {
            var userId = GetCurrentUserId();
            var fileBytes = await _classroomService.ExportClassroomAnalyticsToExcelAsync(id, userId);
            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"Classroom_{id}_Analytics.xlsx");
        }

        [HttpGet]
        public async Task<IActionResult> GetMyClassrooms()
        {
            var userId = GetCurrentUserId();
            var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? "Student";
            var classrooms = await _classroomService.GetMyClassroomsAsync(userId, role);
            return Ok(classrooms);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetClassroomDetails(string id)
        {
            var userId = GetCurrentUserId();
            var classroom = await _classroomService.GetClassroomDetailsAsync(id, userId);
            return Ok(classroom);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> DeleteClassroom(string id)
        {
            var userId = GetCurrentUserId();
            await _classroomService.DeleteClassroomAsync(id, userId);
            return NoContent();
        }

        [HttpDelete("{id}/members/{studentId}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> KickStudent(string id, Guid studentId)
        {
            var userId = GetCurrentUserId();
            await _classroomService.KickStudentAsync(id, studentId, userId);
            return NoContent();
        }

        [HttpPost("{id}/regenerate-code")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> RegenerateJoinCode(string id)
        {
            var userId = GetCurrentUserId();
            var newCode = await _classroomService.RegenerateJoinCodeAsync(id, userId);
            return Ok(new { joinCode = newCode });
        }

        private Guid GetCurrentUserId()
        {
            var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                               ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
            {
                throw new UnauthorizedAccessException("Không thể xác thực người dùng.");
            }
            return userId;
        }
    }
}
