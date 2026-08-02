using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Asp.Versioning;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Services;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [Authorize]
    public class DailyQuestsController : ControllerBase
    {
        private readonly IDailyQuestService _dailyQuestService;

        public DailyQuestsController(IDailyQuestService dailyQuestService)
        {
            _dailyQuestService = dailyQuestService;
        }

        [HttpGet("me")]
        public async Task<ActionResult<IEnumerable<DailyQuestDto>>> GetMyDailyQuests([FromQuery] int tzOffset = 0)
        {
            var userId = GetCurrentUserId();
            var quests = await _dailyQuestService.GetDailyQuestsAsync(userId, tzOffset);
            return Ok(quests);
        }

        [HttpPost("{questId}/claim")]
        public async Task<ActionResult<DailyQuestDto>> ClaimQuestReward(Guid questId, [FromQuery] int tzOffset = 0)
        {
            var userId = GetCurrentUserId();
            var result = await _dailyQuestService.ClaimQuestRewardAsync(userId, questId, tzOffset);
            
            if (result == null)
            {
                return BadRequest(new { error = "CLAIM_FAILED", message = "Nhiệm vụ không tồn tại, chưa hoàn thành, hoặc đã nhận thưởng rồi." });
            }

            return Ok(result);
        }

        private Guid GetCurrentUserId()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                        ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)
                        ?? User.FindFirstValue("sub");

            if (string.IsNullOrEmpty(claim) || !Guid.TryParse(claim, out var userId))
            {
                throw new UnauthorizedAccessException("User identity claim không hợp lệ hoặc bị thiếu.");
            }
            return userId;
        }
    }
}
