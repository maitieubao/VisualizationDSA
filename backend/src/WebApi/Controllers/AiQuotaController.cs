using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VisualizationDSA.Application.Common.Interfaces;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiController]
    [Route("api/v1/ai/quota")]
    [Authorize]
    public class AiQuotaController : ControllerBase
    {
        private readonly IAiQuotaService _aiQuotaService;

        public AiQuotaController(IAiQuotaService aiQuotaService)
        {
            _aiQuotaService = aiQuotaService;
        }

        private Guid GetCurrentUserId()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                throw new UnauthorizedAccessException("User not found or invalid token.");
            return userId;
        }

        [HttpGet]
        public async Task<IActionResult> GetQuotaStatus()
        {
            var userId = GetCurrentUserId();
            var status = await _aiQuotaService.GetQuotaStatusAsync(userId);

            return Ok(new
            {
                globalUsed = status.globalUsed,
                globalMax = status.globalMax,
                lessonUsed = status.lessonUsed,
                lessonMax = status.lessonMax
            });
        }
    }
}
