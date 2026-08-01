using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using VisualizationDSA.Application.Common.Interfaces;
using VisualizationDSA.Application.DTOs.Language;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [Authorize]
    public class RoadmapsController : ControllerBase
    {
        private readonly IRoadmapLanguageService _roadmapLanguageService;

        public RoadmapsController(IRoadmapLanguageService roadmapLanguageService)
        {
            _roadmapLanguageService = roadmapLanguageService;
        }

        [HttpGet("{roadmapId}/language")]
        public async Task<IActionResult> GetLanguage(string roadmapId)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized(new { message = "Không xác định được user." });

            var lang = await _roadmapLanguageService.GetLanguageAsync(userId, roadmapId);
            return Ok(new { language = lang });
        }

        [HttpPut("{roadmapId}/language")]
        public async Task<IActionResult> SetLanguage(string roadmapId, [FromBody] LanguageSelectionDto request)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized(new { message = "Không xác định được user." });

            await _roadmapLanguageService.SetLanguageAsync(userId, roadmapId, request.Language);
            return Ok(new { message = "Lưu ngôn ngữ thành công", language = request.Language });
        }
    }
}
