using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Infrastructure.Services;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/session")]
    [Authorize]
    public class SessionController : ControllerBase
    {
        private readonly ISessionService _sessionService;

        public SessionController(ISessionService sessionService)
        {
            _sessionService = sessionService;
        }

        private Guid GetCurrentUserId()
        {
            var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(idClaim) || !Guid.TryParse(idClaim, out Guid userId))
            {
                throw new UnauthorizedAccessException("Không thể xác định User ID từ token.");
            }
            return userId;
        }

        [HttpPost("enter")]
        public async Task<ActionResult<EnterNodeResponseDto>> EnterNode(string id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _sessionService.EnterNodeAsync(userId, id);
                return Ok(result);
            }
            catch (OutOfHeartsException ex)
            {
                return StatusCode(402, new
                {
                    error = ex.Message,
                    recoveryInfo = ex.RecoveryInfo
                });
            }
        }

        [HttpGet("current")]
        public async Task<ActionResult<LearningSessionDto>> GetCurrentSession()
        {
            var userId = GetCurrentUserId();
            var session = await _sessionService.GetCurrentSessionAsync(userId);
            if (session == null)
            {
                return NotFound(new { message = "Không có phiên học nào đang diễn ra." });
            }
            return Ok(session);
        }

        [HttpPatch("{id}/step")]
        public async Task<ActionResult<UpdateStepResponseDto>> UpdateSessionStep(Guid id, [FromBody] UpdateStepRequestDto request)
        {
            var userId = GetCurrentUserId();
            var result = await _sessionService.UpdateSessionStepAsync(userId, id, request.Step);
            
            if (!result.Success)
            {
                return BadRequest(new { message = "Không thể cập nhật phiên học. Phiên học đã hết hạn hoặc không tồn tại." });
            }
            
            return Ok(result);
        }
    }
}
