using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Serilog.Context;
using System.Security.Claims;
using System.Threading.Tasks;

namespace VisualizationDSA.WebApi.Middlewares
{
    public sealed class UserLoggingMiddleware
    {
        private readonly RequestDelegate _next;

        public UserLoggingMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var userId = context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                         ?? context.User?.FindFirst("sub")?.Value;

            if (!string.IsNullOrEmpty(userId))
            {
                using (LogContext.PushProperty("UserId", userId))
                {
                    await _next(context);
                }
            }
            else
            {
                await _next(context);
            }
        }
    }

    public static class UserLoggingMiddlewareExtensions
    {
        public static IApplicationBuilder UseUserLogging(this IApplicationBuilder app)
            => app.UseMiddleware<UserLoggingMiddleware>();
    }
}
