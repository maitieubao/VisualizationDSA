using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Services;

namespace VisualizationDSA.WebApi.Controllers
{
    /// <summary>
    /// Hearts Controller — Quản lý hệ thống Tim (Hearts), Hồi tim và Xem quảng cáo cộng tim.
    /// Route: api/v{version:apiVersion}/hearts
    /// </summary>
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [Authorize]
    public class HeartsController : ControllerBase
    {
        private readonly IHeartService _heartService;

        public HeartsController(IHeartService heartService)
        {
            _heartService = heartService;
        }

        /// <summary>
        /// Lấy trạng thái Tim hiện tại của người dùng (số tim, thời gian hồi tim tiếp theo, số ad đã xem).
        /// GET /api/v1/hearts/status
        /// </summary>
        [HttpGet("status")]
        public async Task<ActionResult<HeartStatusDto>> GetStatus()
        {
            var userId = GetCurrentUserId();
            try
            {
                var status = await _heartService.GetHeartStatusAsync(userId);
                return Ok(status);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = "USER_NOT_FOUND", message = ex.Message });
            }
        }

        /// <summary>
        /// Xem quảng cáo để cộng +2 tim (giới hạn 5 lần / 24 giờ sliding window).
        /// POST /api/v1/hearts/watch-ad
        /// </summary>
        [HttpPost("watch-ad")]
        public async Task<ActionResult<WatchAdResponseDto>> WatchAd()
        {
            var userId = GetCurrentUserId();
            try
            {
                var result = await _heartService.WatchAdAsync(userId);
                return Ok(result);
            }
            catch (InvalidOperationException ex) when (ex.Message.StartsWith("AD_LIMIT_REACHED"))
            {
                var parts = ex.Message.Split(':', 2);
                var message = parts.Length > 1 ? parts[1] : ex.Message;
                return StatusCode(StatusCodes.Status429TooManyRequests, new
                {
                    error = "AD_LIMIT_REACHED",
                    message
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = "USER_NOT_FOUND", message = ex.Message });
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
