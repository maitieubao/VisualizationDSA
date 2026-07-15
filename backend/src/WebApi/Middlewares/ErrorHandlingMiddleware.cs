using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;

namespace VisualizationDSA.WebApi.Middlewares;

/// <summary>
/// Middleware xử lý lỗi tập trung (Enterprise-grade).
/// Bắt mọi Exception chưa được xử lý, ghi log và trả về JSON chuẩn hóa.
/// Response format: { success, message, errorType, statusCode, traceId, detail? }
/// </summary>
public sealed class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ErrorHandlingMiddleware(
        RequestDelegate next,
        ILogger<ErrorHandlingMiddleware> logger,
        IHostEnvironment env)
    {
        _next    = next;
        _logger  = logger;
        _env     = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception at {Path}", context.Request.Path);
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, errorType, message) = exception switch
        {
            ArgumentException ex            => (HttpStatusCode.BadRequest,           "VALIDATION_ERROR",        ex.Message),
            KeyNotFoundException ex         => (HttpStatusCode.NotFound,             "RESOURCE_NOT_FOUND",      ex.Message),
            UnauthorizedAccessException ex  => (HttpStatusCode.Unauthorized,         "AUTHENTICATION_REQUIRED", ex.Message),
            InvalidOperationException ex    => (HttpStatusCode.Conflict,             "OPERATION_CONFLICT",      ex.Message),
            OperationCanceledException      => (HttpStatusCode.RequestTimeout,        "REQUEST_TIMEOUT",         "Yêu cầu đã bị hủy hoặc hết thời gian chờ."),
            DbUpdateConcurrencyException    => (HttpStatusCode.Conflict,              "CONCURRENCY_CONFLICT",    "Dữ liệu đã bị thay đổi bởi người khác. Vui lòng thử lại."),
            NotImplementedException         => (HttpStatusCode.NotImplemented,        "NOT_IMPLEMENTED",         "Tính năng này chưa được triển khai."),
            _                               => (HttpStatusCode.InternalServerError,  "INTERNAL_SERVER_ERROR",   "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.")
        };

        context.Response.ContentType = "application/json; charset=utf-8";
        context.Response.StatusCode  = (int)statusCode;

        var responseBody = new Dictionary<string, object?>
        {
            ["success"]    = false,
            ["message"]    = _env.IsDevelopment() ? message : GetSafeMessage(statusCode),
            ["errorType"]  = errorType,
            ["statusCode"] = (int)statusCode,
            ["traceId"]    = context.TraceIdentifier,
            ["path"]       = context.Request.Path.Value,
            ["timestamp"]  = DateTime.UtcNow.ToString("O"),
        };

        if (_env.IsDevelopment())
        {
            responseBody["detail"]    = exception.Message;
            responseBody["exception"] = exception.GetType().Name;
            responseBody["stackTrace"] = exception.StackTrace?.Split('\n', 5).Take(4).ToArray();
        }

        var json = JsonSerializer.Serialize(responseBody, new JsonSerializerOptions
        {
            PropertyNamingPolicy   = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
            WriteIndented          = false
        });

        await context.Response.WriteAsync(json);
    }

    private static string GetSafeMessage(HttpStatusCode statusCode) => statusCode switch
    {
        HttpStatusCode.BadRequest           => "Dữ liệu yêu cầu không hợp lệ.",
        HttpStatusCode.Unauthorized         => "Bạn cần đăng nhập để thực hiện thao tác này.",
        HttpStatusCode.NotFound             => "Không tìm thấy tài nguyên yêu cầu.",
        HttpStatusCode.Conflict             => "Thao tác bị xung đột. Vui lòng thử lại.",
        HttpStatusCode.RequestTimeout       => "Yêu cầu đã hết thời gian chờ.",
        HttpStatusCode.NotImplemented       => "Tính năng này chưa được triển khai.",
        _                                   => "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau."
    };
}

/// <summary>Extension method để đăng ký middleware gọn hơn trong Program.cs</summary>
public static class ErrorHandlingMiddlewareExtensions
{
    public static IApplicationBuilder UseGlobalErrorHandling(this IApplicationBuilder app)
        => app.UseMiddleware<ErrorHandlingMiddleware>();
}
