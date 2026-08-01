using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Services;
using VisualizationDSA.WebApi.Filters;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiVersion("1.0")]
    [ApiController]
    public class TeacherApplicationsController : ControllerBase
    {
        private readonly ITeacherApplicationService _service;

        public TeacherApplicationsController(ITeacherApplicationService service)
        {
            _service = service;
        }

        [HttpPost("api/v{version:apiVersion}/teacher-applications")]
        [Authorize]
        public async Task<ActionResult<TeacherApplicationDto>> SubmitApplication([FromBody] SubmitTeacherApplicationDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _service.SubmitApplicationAsync(userId, dto);
                return CreatedAtAction(nameof(GetMyApplication), new { version = "1" }, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = "INVALID_OPERATION", message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = "NOT_FOUND", message = ex.Message });
            }
        }

        [HttpGet("api/v{version:apiVersion}/teacher-applications/my")]
        [Authorize]
        public async Task<ActionResult<TeacherApplicationDto>> GetMyApplication()
        {
            var userId = GetCurrentUserId();
            var application = await _service.GetMyApplicationAsync(userId);
            
            if (application == null)
                return NotFound(new { error = "NOT_FOUND", message = "Bạn chưa từng nộp đơn đăng ký Giáo viên." });

            return Ok(application);
        }

        [HttpGet("api/v{version:apiVersion}/admin/teacher-applications")]
        [RequireJwtRole("Admin")]
        public async Task<ActionResult<IEnumerable<TeacherApplicationDto>>> GetApplications([FromQuery] string? status)
        {
            var applications = await _service.GetPendingApplicationsAsync(status);
            return Ok(applications);
        }

        [HttpPatch("api/v{version:apiVersion}/admin/teacher-applications/{id:guid}/approve")]
        [RequireJwtRole("Admin")]
        public async Task<ActionResult<TeacherApplicationDto>> ApproveApplication(Guid id)
        {
            try
            {
                var adminId = GetCurrentUserId();
                var result = await _service.ApproveApplicationAsync(id, adminId);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = "INVALID_OPERATION", message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = "NOT_FOUND", message = ex.Message });
            }
        }

        [HttpPatch("api/v{version:apiVersion}/admin/teacher-applications/{id:guid}/reject")]
        [RequireJwtRole("Admin")]
        public async Task<ActionResult<TeacherApplicationDto>> RejectApplication(Guid id, [FromBody] RejectTeacherApplicationDto dto)
        {
            try
            {
                var adminId = GetCurrentUserId();
                var result = await _service.RejectApplicationAsync(id, adminId, dto.Reason);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = "INVALID_OPERATION", message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = "NOT_FOUND", message = ex.Message });
            }
        }

        private Guid GetCurrentUserId()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                        ?? User.FindFirstValue("sub");
            if (string.IsNullOrEmpty(claim) || !Guid.TryParse(claim, out var userId))
            {
                throw new UnauthorizedAccessException("User identity claim không hợp lệ.");
            }
            return userId;
        }
    }
}
