using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Asp.Versioning;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using VisualizationDSA.Application.Services;

namespace VisualizationDSA.WebApi.Controllers
{
    /// <summary>
    /// Leaderboard Controller — Bảng xếp hạng người dùng theo XP.
    /// Route: api/v{version:apiVersion}/leaderboard
    /// </summary>
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [EnableRateLimiting("api")]
    public class LeaderboardController : ControllerBase
    {
        private readonly ILeaderboardService _leaderboard;

        public LeaderboardController(ILeaderboardService leaderboard)
        {
            _leaderboard = leaderboard;
        }

        /// <summary>
        /// Lấy top 20 người dùng theo XP — public (không cần đăng nhập).
        /// GET /api/v1/leaderboard/top?limit=20
        /// </summary>
        [HttpGet("top")]
        public async Task<ActionResult<IEnumerable<LeaderboardEntryDto>>> GetTop(
            [FromQuery] int limit = 20)
        {
            var entries = await _leaderboard.GetTopUsersAsync(limit);
            return Ok(entries);
        }

        /// <summary>
        /// Xếp hạng của user hiện tại — yêu cầu đăng nhập.
        /// GET /api/v1/leaderboard/me/rank
        /// </summary>
        [HttpGet("me/rank")]
        [Authorize]
        public async Task<ActionResult<UserRankDto>> GetMyRank()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                         ?? User.FindFirstValue("sub");

            if (!Guid.TryParse(userId, out var id))
                return Unauthorized();

            var rank = await _leaderboard.GetUserRankAsync(id);
            return Ok(rank);
        }
    }
}
