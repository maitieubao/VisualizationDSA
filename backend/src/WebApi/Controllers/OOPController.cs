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
/// API Controller cho mô-đun OOP Concepts Visualizer.
/// Cung cấp endpoint sinh chuỗi frame hoạt ảnh cho 4 trụ cột OOP:
/// Encapsulation, Inheritance, Polymorphism, Abstraction.
/// </summary>
[ApiVersion("1.0")]
[ApiController]
[Route("api/v{version:apiVersion}/concepts/oop")]
[EnableRateLimiting("heavy")]
public class OOPController : ControllerBase
{
    private readonly OOPConceptsStrategy _strategy;
    private readonly IMemoryCache _cache;

    public OOPController(OOPConceptsStrategy strategy, IMemoryCache cache)
    {
        _strategy = strategy;
        _cache = cache;
    }

    /// <summary>
    /// Lấy danh sách kịch bản OOP được hỗ trợ.
    /// GET /api/v1/concepts/oop/scenarios
    /// </summary>
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

    /// <summary>
    /// Thực thi kịch bản OOP và trả về chuỗi frames hoạt ảnh.
    /// POST /api/v1/concepts/oop/execute
    /// Body: { "scenarioId": "encapsulation" }
    /// </summary>
    [HttpPost("execute")]
    public ActionResult<List<OOPFrameDto>> Execute([FromBody] OOPScenarioRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.ScenarioId))
        {
            return BadRequest(new
            {
                status = 400,
                title = "Bad Request",
                errorType = "EMPTY_SCENARIO_ID",
                message = "Mã kịch bản OOP không được rỗng."
            });
        }

        var scenarioId = request.ScenarioId.ToLowerInvariant();
        if (!_strategy.SupportedScenarios.Contains(scenarioId))
        {
            return NotFound(new
            {
                status = 404,
                title = "Not Found",
                errorType = "SCENARIO_NOT_FOUND",
                message = $"Kịch bản OOP '{request.ScenarioId}' không được hỗ trợ.",
                supportedScenarios = _strategy.SupportedScenarios
            });
        }

        try
        {
            var cacheKey = $"OOP_Frames_{scenarioId}";
            if (!_cache.TryGetValue(cacheKey, out List<OOPFrameDto>? frames))
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
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                status = 400,
                title = "Bad Request",
                errorType = "VALIDATION_ERROR",
                message = ex.Message
            });
        }
    }

    /// <summary>
    /// Lấy frames cho kịch bản cụ thể (GET shorthand).
    /// GET /api/v1/concepts/oop/scenarios/{scenarioId}/frames
    /// </summary>
    [HttpGet("scenarios/{scenarioId}/frames")]
    public ActionResult<List<OOPFrameDto>> GetScenarioFrames(string scenarioId)
    {
        var normalizedScenarioId = scenarioId.ToLowerInvariant();
        if (!_strategy.SupportedScenarios.Contains(normalizedScenarioId))
        {
            return NotFound(new
            {
                status = 404,
                title = "Not Found",
                errorType = "SCENARIO_NOT_FOUND",
                message = $"Kịch bản OOP '{scenarioId}' không được hỗ trợ.",
                supportedScenarios = _strategy.SupportedScenarios
            });
        }

        try
        {
            var cacheKey = $"OOP_Frames_{normalizedScenarioId}";
            if (!_cache.TryGetValue(cacheKey, out List<OOPFrameDto>? frames))
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
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                status = 400,
                title = "Bad Request",
                errorType = "VALIDATION_ERROR",
                message = ex.Message
            });
        }
    }
}
