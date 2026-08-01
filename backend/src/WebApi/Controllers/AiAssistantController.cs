using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VisualizationDSA.Application.Common.Interfaces;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiController]
    [Route("api/v1/ai/chat")]
    [Authorize]
    public class AiAssistantController : ControllerBase
    {
        private readonly IAiAssistantService _aiAssistantService;
        private readonly IAiQuotaService _aiQuotaService;

        public AiAssistantController(IAiAssistantService aiAssistantService, IAiQuotaService aiQuotaService)
        {
            _aiAssistantService = aiAssistantService;
            _aiQuotaService = aiQuotaService;
        }

        private Guid GetCurrentUserId()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                throw new UnauthorizedAccessException("User not found or invalid token.");
            return userId;
        }

        [HttpPost]
        public async Task<IActionResult> Chat([FromBody] ChatRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Prompt))
            {
                return BadRequest(new { message = "Prompt cannot be empty." });
            }

            var userId = GetCurrentUserId();

            // Kiểm tra Quota
            bool canUse = await _aiQuotaService.CheckAndIncrementGlobalAsync(userId);
            if (!canUse)
            {
                return StatusCode(429, new { message = "Bạn đã dùng hết lượt hỏi AI hôm nay." });
            }

            var responseText = await _aiAssistantService.GenerateContentAsync(request.Prompt);
            return Ok(new { content = responseText });
        }
    }

    public class ChatRequest
    {
        public string Prompt { get; set; } = string.Empty;
    }
}
