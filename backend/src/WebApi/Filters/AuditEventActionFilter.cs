using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;
using VisualizationDSA.Application.Services;

namespace VisualizationDSA.WebApi.Filters
{
    /// <summary>
    /// Action filter ghi (append) mỗi tương tác API vào Event Sourcing Ledger một cách
    /// reactively sau khi action thực thi. Audit không bao giờ làm hỏng request gốc:
    /// mọi lỗi ghi log đều được nuốt và chỉ log cảnh báo.
    /// </summary>
    public sealed class AuditEventActionFilter : IAsyncActionFilter
    {
        private readonly IAuditEventService _audit;
        private readonly ILogger<AuditEventActionFilter> _logger;

        public AuditEventActionFilter(IAuditEventService audit, ILogger<AuditEventActionFilter> logger)
        {
            _audit = audit;
            _logger = logger;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            // Chụp lại payload route/query TRƯỚC khi action chạy.
            var payload = BuildPayload(context);

            // Thực thi action (và các filter phía sau) — reactive: ghi audit SAU khi hoàn tất.
            var executed = await next();

            try
            {
                var http = executed.HttpContext;
                var userIdRaw = http.User?.FindFirstValue(ClaimTypes.NameIdentifier)
                                ?? http.User?.FindFirstValue("sub");
                Guid? userId = Guid.TryParse(userIdRaw, out var parsed) ? parsed : null;

                var input = new AuditEventInput
                {
                    EventType     = ResolveEventType(context),
                    UserId        = userId,
                    CorrelationId = http.TraceIdentifier,
                    HttpMethod    = http.Request.Method,
                    Path          = http.Request.Path.Value,
                    StatusCode    = http.Response?.StatusCode,
                    Payload       = payload,
                };

                await _audit.AppendAsync(input, http.RequestAborted);
            }
            catch (Exception ex)
            {
                // Audit là best-effort — không bao giờ ném lỗi ra request gốc.
                _logger.LogWarning(ex, "Không thể ghi audit event frame cho {Path}", context.HttpContext.Request.Path);
            }
        }

        private static string ResolveEventType(ActionExecutingContext context)
        {
            var controller = context.RouteData.Values.TryGetValue("controller", out var c) ? c?.ToString() : "Unknown";
            var action = context.RouteData.Values.TryGetValue("action", out var a) ? a?.ToString() : "Unknown";
            return $"ApiInteraction:{controller}.{action}";
        }

        private static string BuildPayload(ActionExecutingContext context)
        {
            var data = new Dictionary<string, object?>
            {
                ["route"] = context.RouteData.Values,
                ["query"] = context.HttpContext.Request.QueryString.Value,
            };

            try
            {
                return JsonSerializer.Serialize(data);
            }
            catch
            {
                return "{}";
            }
        }
    }
}
