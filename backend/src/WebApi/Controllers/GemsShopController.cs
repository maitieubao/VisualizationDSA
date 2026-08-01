using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VisualizationDSA.Application.Common.Interfaces;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    public class GemsShopController : ControllerBase
    {
        private readonly IGemsShopService _gemsShopService;

        public GemsShopController(IGemsShopService gemsShopService)
        {
            _gemsShopService = gemsShopService;
        }

        [HttpGet("catalog")]
        public IActionResult GetCatalog()
        {
            return Ok(_gemsShopService.GetCatalog());
        }

        [Authorize]
        [HttpGet("my-inventory")]
        public async Task<IActionResult> GetMyInventory()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var inventory = await _gemsShopService.GetMyInventoryAsync(userId);
            return Ok(inventory);
        }

        [Authorize]
        [HttpPost("purchase/{itemId}")]
        public async Task<IActionResult> PurchaseItem(string itemId)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var result = await _gemsShopService.PurchaseItemAsync(userId, itemId);
            if (!result.Success)
            {
                return BadRequest(new { error = result.ErrorCode, message = result.Message });
            }

            return Ok(new { success = true, message = "Mua vật phẩm thành công" });
        }

        [Authorize]
        [HttpPost("equip")]
        public async Task<IActionResult> EquipAvatarFrame([FromBody] EquipAvatarFrameRequest request)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var success = await _gemsShopService.EquipAvatarFrameAsync(userId, request.FrameType);
            if (!success)
            {
                return BadRequest(new { message = "Bạn không sở hữu vật phẩm này hoặc vật phẩm không tồn tại." });
            }

            return Ok(new { success = true, message = "Cập nhật vật phẩm thành công." });
        }
    }

    public class EquipAvatarFrameRequest
    {
        public string? FrameType { get; set; }
    }
}
