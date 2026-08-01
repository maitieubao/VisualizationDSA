using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using VisualizationDSA.Application.Common.Interfaces;
using VisualizationDSA.Application.DTOs.TeacherStudio;
using VisualizationDSA.WebApi.Filters;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/teacher-studio")]
    public class TeacherStudioController : ControllerBase
    {
        private readonly ITeacherStudioService _service;

        public TeacherStudioController(ITeacherStudioService service)
        {
            _service = service;
        }

        [HttpGet("roadmaps")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<ActionResult<IEnumerable<CustomRoadmapDto>>> GetMyRoadmaps()
        {
            var teacherId = GetCurrentUserId();
            var roadmaps = await _service.GetMyRoadmapsAsync(teacherId);
            return Ok(roadmaps);
        }

        [HttpPost("roadmaps")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<ActionResult<CustomRoadmapDto>> CreateRoadmap([FromBody] CreateRoadmapDto dto)
        {
            var teacherId = GetCurrentUserId();
            var roadmap = await _service.CreateRoadmapAsync(teacherId, dto);
            return Ok(roadmap);
        }

        [HttpPut("roadmaps/{id:guid}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<ActionResult<CustomRoadmapDto>> UpdateRoadmap(Guid id, [FromBody] UpdateRoadmapDto dto)
        {
            try
            {
                var teacherId = GetCurrentUserId();
                var roadmap = await _service.UpdateRoadmapAsync(id, teacherId, dto);
                return Ok(roadmap);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = "NOT_FOUND", message = ex.Message });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }

        [HttpDelete("roadmaps/{id:guid}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<ActionResult> DeleteRoadmap(Guid id)
        {
            try
            {
                var teacherId = GetCurrentUserId();
                await _service.DeleteRoadmapAsync(id, teacherId);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = "NOT_FOUND", message = ex.Message });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = "INVALID_OPERATION", message = ex.Message });
            }
        }

        [HttpPost("roadmaps/{id:guid}/nodes")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<ActionResult<CustomNodeDto>> AddNode(Guid id, [FromBody] CreateNodeDto dto)
        {
            try
            {
                var teacherId = GetCurrentUserId();
                var node = await _service.AddNodeAsync(id, teacherId, dto);
                return Ok(node);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = "NOT_FOUND", message = ex.Message });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }

        [HttpPut("roadmaps/{id:guid}/nodes/{nodeId:guid}/content")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<ActionResult<CustomNodeDto>> UpdateNodeContent(Guid id, Guid nodeId, [FromBody] UpdateNodeContentDto dto)
        {
            try
            {
                var teacherId = GetCurrentUserId();
                var node = await _service.UpdateNodeContentAsync(id, nodeId, teacherId, dto);
                return Ok(node);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = "NOT_FOUND", message = ex.Message });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }

        [HttpPut("roadmaps/{id:guid}/nodes/{nodeId:guid}/practice")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<ActionResult<CustomNodeDto>> UpdateNodePractice(Guid id, Guid nodeId, [FromBody] UpdateNodePracticeDto dto)
        {
            try
            {
                var teacherId = GetCurrentUserId();
                var node = await _service.UpdateNodePracticeAsync(id, nodeId, teacherId, dto);
                return Ok(node);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = "NOT_FOUND", message = ex.Message });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }

        [HttpDelete("roadmaps/{id:guid}/nodes/{nodeId:guid}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<ActionResult> DeleteNode(Guid id, Guid nodeId)
        {
            try
            {
                var teacherId = GetCurrentUserId();
                await _service.DeleteNodeAsync(id, nodeId, teacherId);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = "NOT_FOUND", message = ex.Message });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }

        [HttpPost("roadmaps/{id:guid}/publish")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<ActionResult<CustomRoadmapDto>> PublishRoadmap(Guid id, [FromBody] PublishRoadmapDto dto)
        {
            try
            {
                var teacherId = GetCurrentUserId();
                var roadmap = await _service.PublishRoadmapAsync(id, teacherId, dto);
                return Ok(roadmap);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = "NOT_FOUND", message = ex.Message });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = "INVALID_OPERATION", message = ex.Message });
            }
        }

        [HttpPatch("roadmaps/{id:guid}/approve")]
        [RequireJwtRole("Admin")]
        public async Task<ActionResult<CustomRoadmapDto>> ApproveRoadmap(Guid id)
        {
            try
            {
                var adminId = GetCurrentUserId();
                var roadmap = await _service.ApproveRoadmapAsync(id, adminId);
                return Ok(roadmap);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = "NOT_FOUND", message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = "INVALID_OPERATION", message = ex.Message });
            }
        }

        [HttpPatch("roadmaps/{id:guid}/reject")]
        [RequireJwtRole("Admin")]
        public async Task<ActionResult<CustomRoadmapDto>> RejectRoadmap(Guid id, [FromBody] RejectRoadmapDto dto)
        {
            try
            {
                var adminId = GetCurrentUserId();
                var roadmap = await _service.RejectRoadmapAsync(id, adminId, dto);
                return Ok(roadmap);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = "NOT_FOUND", message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = "INVALID_OPERATION", message = ex.Message });
            }
        }

        [HttpPost("roadmaps/{id:guid}/clone")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<ActionResult<CustomRoadmapDto>> CloneRoadmap(Guid id)
        {
            try
            {
                var teacherId = GetCurrentUserId();
                var roadmap = await _service.CloneRoadmapAsync(id, teacherId);
                return Ok(roadmap);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = "NOT_FOUND", message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = "INVALID_OPERATION", message = ex.Message });
            }
        }

        private Guid GetCurrentUserId()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (string.IsNullOrEmpty(claim) || !Guid.TryParse(claim, out var userId))
            {
                throw new UnauthorizedAccessException("Không thể xác thực người dùng.");
            }
            return userId;
        }
    }
}
