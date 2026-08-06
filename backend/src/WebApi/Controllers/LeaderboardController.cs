using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Asp.Versioning;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using VisualizationDSA.Application.Services;

using VisualizationDSA.WebApi.Filters;

namespace VisualizationDSA.WebApi.Controllers
{
    
    
    
    
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

        
        
        
        
        [HttpGet("top")]
        public async Task<ActionResult<IEnumerable<LeaderboardEntryDto>>> GetTop(
            [FromQuery] int limit = 20)
        {
            limit = Math.Clamp(limit, 1, 20);
            var entries = await _leaderboard.GetTopUsersAsync(limit);
            return Ok(entries);
        }

        
        
        
        
        [HttpGet("me/rank")]
        [RequireJwtRole]
        public async Task<ActionResult<UserRankDto>> GetMyRank()
        {
            var userId = JwtHelper.ExtractSubFromToken(Request);

            if (!Guid.TryParse(userId, out var id))
                return Unauthorized();

            var rank = await _leaderboard.GetUserRankAsync(id);
            return Ok(rank);
        }
    }
}
