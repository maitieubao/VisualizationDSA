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
/// API Controller cho mô-đun System Design Visualizer.
/// Cung cấp endpoint sinh topology, chuỗi frame mô phỏng kiến trúc phân tán:
/// Round-Robin LB, Server Failover, DB Replication Lag.
/// </summary>
[ApiVersion("1.0")]
[ApiController]
[Route("api/v{version:apiVersion}/concepts/system-design")]
[EnableRateLimiting("heavy")]
public class SystemDesignController : ControllerBase
{
    private readonly SystemDesignStrategy _strategy;
    private readonly IMemoryCache _cache;

    public SystemDesignController(SystemDesignStrategy strategy, IMemoryCache cache)
    {
        _strategy = strategy;
        _cache = cache;
    }

    /// <summary>
    /// Lấy danh sách kịch bản System Design được hỗ trợ.
    /// GET /api/v1/concepts/system-design/scenarios
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
    /// Lấy topology khởi tạo mặc định (dựng cảnh ban đầu cho frontend).
    /// GET /api/v1/concepts/system-design/topology
    /// </summary>
    [HttpGet("topology")]
    public ActionResult<SystemDesignFrameDto> GetInitialTopology()
    {
        return Ok(_strategy.GenerateInitialTopology());
    }

    /// <summary>
    /// Thực thi kịch bản System Design và trả về chuỗi frames mô phỏng.
    /// POST /api/v1/concepts/system-design/execute
    /// Body: { "scenarioId": "round-robin-lb", "replicationLagMs": 1000 }
    /// </summary>
    [HttpPost("execute")]
    public ActionResult<List<SystemDesignFrameDto>> Execute([FromBody] SystemDesignRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.ScenarioId))
        {
            return BadRequest(new
            {
                status = 400,
                title = "Bad Request",
                errorType = "EMPTY_SCENARIO_ID",
                message = "Mã kịch bản System Design không được rỗng."
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
                message = $"Kịch bản System Design '{request.ScenarioId}' không được hỗ trợ.",
                supportedScenarios = _strategy.SupportedScenarios
            });
        }

        try
        {
            var cacheKey = $"SD_Frames_{scenarioId}";
            if (!_cache.TryGetValue(cacheKey, out List<SystemDesignFrameDto>? frames))
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
    /// GET /api/v1/concepts/system-design/scenarios/{scenarioId}/frames
    /// </summary>
    [HttpGet("scenarios/{scenarioId}/frames")]
    public ActionResult<List<SystemDesignFrameDto>> GetScenarioFrames(string scenarioId)
    {
        var normalizedScenarioId = scenarioId.ToLowerInvariant();
        if (!_strategy.SupportedScenarios.Contains(normalizedScenarioId))
        {
            return NotFound(new
            {
                status = 404,
                title = "Not Found",
                errorType = "SCENARIO_NOT_FOUND",
                message = $"Kịch bản System Design '{scenarioId}' không được hỗ trợ.",
                supportedScenarios = _strategy.SupportedScenarios
            });
        }

        try
        {
            var cacheKey = $"SD_Frames_{normalizedScenarioId}";
            if (!_cache.TryGetValue(cacheKey, out List<SystemDesignFrameDto>? frames))
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
