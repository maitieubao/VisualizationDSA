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

using VisualizationDSA.WebApi.Filters;

namespace VisualizationDSA.WebApi.Controllers
{
    
    
    
    
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

        
        
        
        
        
        [HttpGet("overview")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<ActionResult<SystemOverviewDto>> GetOverview()
        {
            const string cacheKey = "Analytics_Overview";
            if (!_cache.TryGetValue(cacheKey, out SystemOverviewDto? overview))
            {
                overview = await _analytics.GetSystemOverviewAsync();
                // Không cache null (MemoryCache.Set(null) là no-op → miss cache mỗi request).
                if (overview != null)
                {
                    var cacheEntryOptions = new MemoryCacheEntryOptions()
                        .SetAbsoluteExpiration(TimeSpan.FromMinutes(2));
                    _cache.Set(cacheKey, overview, cacheEntryOptions);
                }
            }
            return Ok(overview);
        }

        
        
        
        
        [HttpGet("me")]
        [RequireJwtRole]
        public async Task<ActionResult<UserAnalyticsDto>> GetMyAnalytics()
        {
            var userId = JwtHelper.ExtractSubFromToken(Request);

            if (!Guid.TryParse(userId, out var id))
                return Unauthorized();

            var analytics = await _analytics.GetUserAnalyticsAsync(id);
            return Ok(analytics);
        }

        
        
        
        
        [HttpGet("modules/popular")]
        [RequireJwtRole("Teacher,Admin")]
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

        [HttpGet("quizzes")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> GetQuizAnalytics([FromServices] MediatR.IMediator mediator)
        {
            var result = await mediator.Send(new VisualizationDSA.Application.Features.Analytics.Queries.GetQuizAnalytics.GetQuizAnalyticsQuery());
            return Ok(result);
        }
    }
}
