using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Domain.Engine;
using VisualizationDSA.Domain.Input;
using VisualizationDSA.Domain.Strategies;

namespace VisualizationDSA.WebApi.Controllers;

[ApiVersion("1.0")]
[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[EnableRateLimiting("heavy")]
public class AlgorithmsController : ControllerBase
{
    private readonly IEnumerable<IAlgorithmStrategy> _strategies;

    public AlgorithmsController(IEnumerable<IAlgorithmStrategy> strategies)
    {
        _strategies = strategies;
    }

    /// <summary>
    /// Lấy danh sách tất cả thuật toán có trong thư viện.
    /// GET /api/v1/algorithms
    /// </summary>
    [HttpGet]
    public ActionResult<IEnumerable<object>> GetAll()
    {
        var list = _strategies.Select(s => new
        {
            id = s.AlgorithmId,
            name = s.Name,
            category = s.Category,
            difficulty = GetDifficulty(s.AlgorithmId),
            timeComplexity = s.GetMetadata().TimeComplexity,
            spaceComplexity = s.GetMetadata().SpaceComplexity
        });

        return Ok(list);
    }

    /// <summary>
    /// Lấy siêu dữ liệu lý thuyết của thuật toán.
    /// GET /api/v1/algorithms/{algorithmId}/metadata
    /// </summary>
    [HttpGet("{algorithmId}/metadata")]
    public ActionResult<AlgorithmMetadata> GetMetadata(string algorithmId)
    {
        var strategy = _strategies.FirstOrDefault(s =>
            s.AlgorithmId.Equals(algorithmId, StringComparison.OrdinalIgnoreCase));

        if (strategy == null)
        {
            return NotFound(new
            {
                status = 404,
                title = "Not Found",
                errorType = "ALGORITHM_NOT_FOUND",
                message = $"Không tìm thấy thuật toán tương ứng với ID: '{algorithmId}' trong thư viện hệ thống."
            });
        }

        return Ok(strategy.GetMetadata());
    }

    /// <summary>
    /// Thực thi thuật toán và trả về danh sách frames hoạt họa.
    /// POST /api/v1/algorithms/execute
    /// </summary>
    [HttpPost("execute")]
    public async Task<ActionResult<AlgorithmResult>> Execute([FromBody] AlgorithmRequestDto request)
    {
        if (request.InputData.Length == 0)
        {
            return BadRequest(new
            {
                status = 400,
                title = "Bad Request",
                errorType = "EMPTY_INPUT",
                message = "Mảng dữ liệu đầu vào không được rỗng."
            });
        }

        // ✅ Validate input size limit to prevent resource exhaustion / spam
        if (!ConstraintResolver.ValidateSize(request.AlgorithmId, request.InputData.Length, out int allowedLimit))
        {
            return UnprocessableEntity(new
            {
                status = 422,
                title = "Unprocessable Entity",
                errorType = "SIZE_LIMIT_EXCEEDED",
                message = $"Kích thước mảng ({request.InputData.Length}) vượt quá giới hạn an toàn {allowedLimit} của thuật toán '{request.AlgorithmId}'."
            });
        }

        var strategy = _strategies.FirstOrDefault(s =>
            s.AlgorithmId.Equals(request.AlgorithmId, StringComparison.OrdinalIgnoreCase));

        if (strategy == null)
        {
            return BadRequest(new
            {
                status = 400,
                title = "Bad Request",
                errorType = "UNSUPPORTED_ALGORITHM",
                message = $"Thuật toán '{request.AlgorithmId}' chưa được hỗ trợ."
            });
        }

        using var timeoutSource = new CancellationTokenSource(TimeSpan.FromSeconds(2));
        using var linkedSource = CancellationTokenSource.CreateLinkedTokenSource(
            timeoutSource.Token, HttpContext.RequestAborted);

        try
        {
            var frames = await Task.Run(() => strategy.Execute(request.InputData, linkedSource.Token), linkedSource.Token);
            var result = new AlgorithmResult
            {
                AlgorithmId = strategy.AlgorithmId,
                PseudoCode = strategy.GetMetadata().PseudoCode,
                Frames = frames
            };
            return Ok(result);
        }
        catch (OperationCanceledException)
        {
            return StatusCode(StatusCodes.Status504GatewayTimeout, new
            {
                status = 504,
                title = "Gateway Timeout",
                errorType = "TIMEOUT_EXCEEDED",
                message = "Thời gian xử lý giải thuật vượt quá giới hạn an toàn cho phép (2 giây)."
            });
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
    /// Thực thi thuật toán từ chuỗi thô nhập bởi người dùng.
    /// POST /api/v1/algorithms/custom-execute
    /// </summary>
    [HttpPost("custom-execute")]
    public async Task<ActionResult<AlgorithmResult>> CustomExecute(
        [FromBody] CustomInputRequestDto request,
        CancellationToken clientCancelToken)
    {
        int[] parsedArray;
        try
        {
            parsedArray = InputParser.ParseArray(request.RawInput);
        }
        catch (Exception ex) when (ex is ArgumentException or FormatException or OverflowException)
        {
            return BadRequest(new
            {
                status = 400,
                title = "Bad Request",
                errorType = "INVALID_FORMAT",
                message = ex.Message
            });
        }

        if (!ConstraintResolver.ValidateSize(request.AlgorithmId, parsedArray.Length, out int allowedLimit))
        {
            return UnprocessableEntity(new
            {
                status = 422,
                title = "Unprocessable Entity",
                errorType = "SIZE_LIMIT_EXCEEDED",
                message = $"Kích thước mảng vượt quá giới hạn an toàn quy định của giải thuật {request.AlgorithmId}.",
                details = new
                {
                    maxAllowedLimit = allowedLimit,
                    currentInputSize = parsedArray.Length
                }
            });
        }

        var strategy = _strategies.FirstOrDefault(s =>
            s.AlgorithmId.Equals(request.AlgorithmId, StringComparison.OrdinalIgnoreCase));

        if (strategy == null)
        {
            return BadRequest(new
            {
                status = 400,
                title = "Bad Request",
                errorType = "UNSUPPORTED_ALGORITHM",
                message = $"Thuật toán '{request.AlgorithmId}' chưa được hỗ trợ."
            });
        }

        using var timeoutSource = new CancellationTokenSource(TimeSpan.FromSeconds(2));
        using var linkedSource = CancellationTokenSource.CreateLinkedTokenSource(
            timeoutSource.Token, clientCancelToken);

        try
        {
            var result = await Task.Run(() =>
            {
                var frames = strategy.Execute(parsedArray, linkedSource.Token);
                return new AlgorithmResult
                {
                    AlgorithmId = strategy.AlgorithmId,
                    PseudoCode = strategy.GetMetadata().PseudoCode,
                    Frames = frames
                };
            }, linkedSource.Token);

            return Ok(result);
        }
        catch (OperationCanceledException)
        {
            return StatusCode(StatusCodes.Status504GatewayTimeout, new
            {
                status = 504,
                title = "Gateway Timeout",
                errorType = "TIMEOUT_EXCEEDED",
                message = "Thời gian xử lý giải thuật vượt quá giới hạn an toàn cho phép (2 giây)."
            });
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

    private static string GetDifficulty(string algorithmId)
    {
        return algorithmId switch
        {
            "bubble-sort" or "selection-sort" or "insertion-sort" or "linear-search" or "stack" or "queue" => "Easy",
            "quick-sort" or "merge-sort" or "binary-search" or "bst" => "Medium",
            _ => "Medium"
        };
    }

    /// <summary>
    /// So sánh nhiều thuật toán cùng một input — trả về frames + server-side timing.
    /// POST /api/v1/algorithms/compare
    /// ✅ B1: Batch execute thay vì N requests riêng lẻ từ frontend.
    /// </summary>
    [HttpPost("compare")]
    public async Task<ActionResult<IEnumerable<CompareResultDto>>> Compare([FromBody] CompareRequestDto request)
    {
        if (request.AlgorithmIds == null || request.AlgorithmIds.Length == 0)
            return BadRequest(new { errorType = "EMPTY_ALGORITHMS", message = "Danh sách thuật toán không được rỗng." });

        if (request.InputData == null || request.InputData.Length == 0)
            return BadRequest(new { errorType = "EMPTY_INPUT", message = "Dữ liệu đầu vào không được rỗng." });

        if (request.AlgorithmIds.Length > 4)
            return BadRequest(new { errorType = "TOO_MANY_ALGORITHMS", message = "Tối đa 4 thuật toán mỗi lần so sánh." });

        // ✅ Validate input size limit for each compared algorithm to prevent resource exhaustion / spam
        foreach (var algorithmId in request.AlgorithmIds)
        {
            if (!ConstraintResolver.ValidateSize(algorithmId, request.InputData.Length, out int allowedLimit))
            {
                return UnprocessableEntity(new
                {
                    status = 422,
                    title = "Unprocessable Entity",
                    errorType = "SIZE_LIMIT_EXCEEDED",
                    message = $"Kích thước mảng ({request.InputData.Length}) vượt quá giới hạn an toàn {allowedLimit} của thuật toán '{algorithmId}'."
                });
            }
        }

        var results = new List<CompareResultDto>();

        using var timeoutSource = new CancellationTokenSource(TimeSpan.FromSeconds(2));
        using var linkedSource = CancellationTokenSource.CreateLinkedTokenSource(
            timeoutSource.Token, HttpContext.RequestAborted);

        try
        {
            foreach (var algorithmId in request.AlgorithmIds)
            {
                var strategy = _strategies.FirstOrDefault(s =>
                    s.AlgorithmId.Equals(algorithmId, StringComparison.OrdinalIgnoreCase));

                if (strategy == null)
                {
                    results.Add(new CompareResultDto
                    {
                        AlgorithmId = algorithmId,
                        Error       = $"Thuật toán '{algorithmId}' không tồn tại."
                    });
                    continue;
                }

                var sw = System.Diagnostics.Stopwatch.StartNew();
                try
                {
                    var frames = await Task.Run(() => strategy.Execute(request.InputData, linkedSource.Token), linkedSource.Token);
                    sw.Stop();

                    results.Add(new CompareResultDto
                    {
                        AlgorithmId     = strategy.AlgorithmId,
                        Name            = strategy.Name,
                        ElapsedMs       = sw.Elapsed.TotalMilliseconds,
                        FrameCount      = frames.Count,
                        TimeComplexity  = strategy.GetMetadata().TimeComplexity,
                        SpaceComplexity = strategy.GetMetadata().SpaceComplexity,
                        Frames          = frames
                    });
                }
                catch (OperationCanceledException)
                {
                    throw;
                }
                catch (Exception ex)
                {
                    sw.Stop();
                    results.Add(new CompareResultDto
                    {
                        AlgorithmId = algorithmId,
                        Error       = ex.Message
                    });
                }
            }

            return Ok(results);
        }
        catch (OperationCanceledException)
        {
            return StatusCode(StatusCodes.Status504GatewayTimeout, new
            {
                status = 504,
                title = "Gateway Timeout",
                errorType = "TIMEOUT_EXCEEDED",
                message = "Thời gian xử lý so sánh giải thuật vượt quá giới hạn an toàn cho phép (2 giây)."
            });
        }
    }
}

/// <summary>Request DTO cho /compare endpoint.</summary>
public record CompareRequestDto(string[] AlgorithmIds, int[] InputData);

/// <summary>Result DTO cho từng thuật toán trong /compare response.</summary>
public class CompareResultDto
{
    public string  AlgorithmId     { get; set; } = string.Empty;
    public string? Name            { get; set; }
    public double  ElapsedMs       { get; set; }
    public int     FrameCount      { get; set; }
    public string? TimeComplexity  { get; set; }
    public string? SpaceComplexity { get; set; }
    public System.Collections.Generic.List<VisualizationDSA.Domain.Engine.FrameDTO>? Frames { get; set; }
    public string? Error           { get; set; }
}
