using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Asp.Versioning;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using VisualizationDSA.Application.Services;
using Microsoft.Extensions.Caching.Memory;

namespace VisualizationDSA.WebApi.Controllers
{
    /// <summary>
    /// Analytics Controller — thống kê hệ thống và cá nhân.
    /// Route: api/v{version:apiVersion}/analytics
    /// </summary>
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [EnableRateLimiting("api")]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analytics;
        private readonly IMemoryCache _cache;

        public AnalyticsController(IAnalyticsService analytics, IMemoryCache cache)
        {
            _analytics = analytics;
            _cache = cache;
        }

        /// <summary>
        /// Tổng quan hệ thống — public (không cần đăng nhập).
        /// Thông tin: total users, active today, total XP, average level.
        /// GET /api/v1/analytics/overview
        /// </summary>
        [HttpGet("overview")]
        public async Task<ActionResult<SystemOverviewDto>> GetOverview()
        {
            const string cacheKey = "Analytics_Overview";
            if (!_cache.TryGetValue(cacheKey, out SystemOverviewDto? overview))
            {
                overview = await _analytics.GetSystemOverviewAsync();
                var cacheEntryOptions = new MemoryCacheEntryOptions()
                    .SetAbsoluteExpiration(TimeSpan.FromMinutes(2));
                _cache.Set(cacheKey, overview, cacheEntryOptions);
            }
            return Ok(overview);
        }

        /// <summary>
        /// Thống kê cá nhân user đang đăng nhập.
        /// GET /api/v1/analytics/me
        /// </summary>
        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<UserAnalyticsDto>> GetMyAnalytics()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                         ?? User.FindFirstValue("sub");

            if (!Guid.TryParse(userId, out var id))
                return Unauthorized();

            var analytics = await _analytics.GetUserAnalyticsAsync(id);
            return Ok(analytics);
        }

        /// <summary>
        /// Top các module được hoàn thành nhiều nhất — public.
        /// GET /api/v1/analytics/modules/popular?limit=10
        /// </summary>
        [HttpGet("modules/popular")]
        public async Task<ActionResult<IEnumerable<ModulePopularityDto>>> GetPopularModules(
            [FromQuery] int limit = 10)
        {
            limit = Math.Clamp(limit, 1, 50);

            string cacheKey = $"Analytics_PopularModules_{limit}";
            if (!_cache.TryGetValue(cacheKey, out IEnumerable<ModulePopularityDto>? popularity))
            {
                popularity = await _analytics.GetModulePopularityAsync(limit);
                var cacheEntryOptions = new MemoryCacheEntryOptions()
                    .SetAbsoluteExpiration(TimeSpan.FromMinutes(10));
                _cache.Set(cacheKey, popularity, cacheEntryOptions);
            }
            return Ok(popularity);
        }
    }
}
