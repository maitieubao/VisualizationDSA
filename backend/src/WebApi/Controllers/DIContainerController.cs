using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Domain.Engine;
using VisualizationDSA.Domain.Strategies;

namespace VisualizationDSA.WebApi.Controllers;

/// <summary>
/// API Controller cho mô-đun DI/IoC Container Visualizer.
/// Cung cấp endpoint sinh chuỗi frame cho lifetime-demo và cycle-detection.
/// </summary>
[ApiVersion("1.0")]
[ApiController]
[Route("api/v{version:apiVersion}/concepts/di-container")]
[EnableRateLimiting("heavy")]
public class DIContainerController : ControllerBase
{
    private readonly DIContainerStrategy _strategy;
    private readonly IMemoryCache _cache;

    public DIContainerController(DIContainerStrategy strategy, IMemoryCache cache)
    {
        _strategy = strategy;
        _cache = cache;
    }

    [HttpGet("scenarios")]
    public ActionResult<object> GetScenarios()
    {
        return Ok(new
        {
            conceptId = _strategy.ConceptId,
            name = _strategy.Name,
            category = _strategy.Category,
            scenarios = _strategy.SupportedScenarios
        });
    }

    [HttpPost("execute")]
    public ActionResult<List<DIContainerFrameDto>> Execute([FromBody] ConceptScenarioRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.ScenarioId))
        {
            return BadRequest(new { status = 400, errorType = "EMPTY_SCENARIO_ID", message = "Mã kịch bản không được rỗng." });
        }

        var scenarioId = request.ScenarioId.ToLowerInvariant();
        if (!_strategy.SupportedScenarios.Contains(scenarioId))
        {
            return NotFound(new { status = 404, errorType = "SCENARIO_NOT_FOUND", message = $"Kịch bản DI Container '{request.ScenarioId}' không được hỗ trợ.", supportedScenarios = _strategy.SupportedScenarios });
        }

        var cacheKey = $"DI_Frames_{scenarioId}";
        if (!_cache.TryGetValue(cacheKey, out List<DIContainerFrameDto>? frames))
        {
            frames = _strategy.ExecuteScenario(scenarioId, HttpContext.RequestAborted);
            var cacheOptions = new MemoryCacheEntryOptions()
                .SetSlidingExpiration(TimeSpan.FromMinutes(5))
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(15))
                .SetSize(1);
            _cache.Set(cacheKey, frames, cacheOptions);
        }

        return Ok(frames);
    }

    [HttpGet("scenarios/{scenarioId}/frames")]
    public ActionResult<List<DIContainerFrameDto>> GetScenarioFrames(string scenarioId)
    {
        var normalizedScenarioId = scenarioId.ToLowerInvariant();
        if (!_strategy.SupportedScenarios.Contains(normalizedScenarioId))
        {
            return NotFound(new { status = 404, errorType = "SCENARIO_NOT_FOUND", message = $"Kịch bản DI Container '{scenarioId}' không được hỗ trợ.", supportedScenarios = _strategy.SupportedScenarios });
        }

        var cacheKey = $"DI_Frames_{normalizedScenarioId}";
        if (!_cache.TryGetValue(cacheKey, out List<DIContainerFrameDto>? frames))
        {
            frames = _strategy.ExecuteScenario(normalizedScenarioId, HttpContext.RequestAborted);
            var cacheOptions = new MemoryCacheEntryOptions()
                .SetSlidingExpiration(TimeSpan.FromMinutes(5))
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(15))
                .SetSize(1);
            _cache.Set(cacheKey, frames, cacheOptions);
        }

        return Ok(frames);
    }
}
