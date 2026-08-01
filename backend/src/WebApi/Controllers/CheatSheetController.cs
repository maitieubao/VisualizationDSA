using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using VisualizationDSA.Application.Common.Interfaces;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class CheatSheetController : ControllerBase
    {
        private readonly ICheatSheetService _cheatSheetService;

        public CheatSheetController(ICheatSheetService cheatSheetService)
        {
            _cheatSheetService = cheatSheetService;
        }

        [HttpGet]
        public async Task<IActionResult> GetSnippet([FromQuery] string lang, [FromQuery] string structure)
        {
            if (string.IsNullOrWhiteSpace(lang) || string.IsNullOrWhiteSpace(structure))
            {
                return BadRequest(new { message = "Yêu cầu cung cấp lang và structure." });
            }

            var snippet = await _cheatSheetService.GetSnippetAsync(lang, structure);
            
            if (snippet == null)
            {
                // Fallback nếu không có trong DB
                return NotFound(new { message = "Không tìm thấy CheatSheet phù hợp." });
            }

            return Ok(snippet);
        }
    }
}
