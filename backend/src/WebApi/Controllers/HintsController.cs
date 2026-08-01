using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VisualizationDSA.Application.Common.Interfaces;
using VisualizationDSA.Application.DTOs.GemsShop;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiController]
    [Route("api/v1/hints")]
    [Authorize]
    public class HintsController : ControllerBase
    {
        private readonly IGemsShopService _gemsShopService;

        public HintsController(IGemsShopService gemsShopService)
        {
            _gemsShopService = gemsShopService;
        }

        [HttpPost("consume-token")]
        public async Task<IActionResult> ConsumeToken([FromBody] ConsumeHintTokenRequest request)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var response = await _gemsShopService.ConsumeHintTokenAsync(userId, request);
            if (response == null)
            {
                return BadRequest(new { error = "NO_HINT_TOKENS", message = "Bạn không còn AI Hint Token nào. Vui lòng mua thêm trong cửa hàng." });
            }

            return Ok(response);
        }
    }
}
