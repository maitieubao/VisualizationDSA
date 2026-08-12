using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;
using VisualizationDSA.Application.Services;

namespace VisualizationDSA.WebApi.Filters
{
    
    
    
    
    
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
            
            var payload = BuildPayload(context);

            
            var executed = await next();

            try
            {
                var http = executed.HttpContext;
                // AD-007: hệ dùng RequireJwtRole (không phải JwtBearer middleware) nên
                // HttpContext.User luôn rỗng — phải đọc sub TRỰC TIẾP từ token.
                var userIdRaw = JwtHelper.ExtractSubFromToken(http.Request);
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
