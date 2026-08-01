namespace VisualizationDSA.WebApi.Middlewares;





public sealed class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public SecurityHeadersMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var headers = context.Response.Headers;

        
        headers["X-Content-Type-Options"] = "nosniff";

        
        headers["X-Frame-Options"] = "DENY";

        
        headers["X-XSS-Protection"] = "1; mode=block";

        
        headers["Server"] = "VisualizationDSA";

        
        headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

        
        headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";

        
        
        headers["Content-Security-Policy"] =
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob:; " +  
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
            "font-src 'self' https://fonts.gstatic.com data:; " +
            "img-src 'self' data: blob:; " +
            "connect-src 'self' http://localhost:* ws://localhost:*; " +
            "worker-src 'self' blob:";                                    

        await _next(context);
    }
}


public static class SecurityHeadersMiddlewareExtensions
{
    public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app)
        => app.UseMiddleware<SecurityHeadersMiddleware>();
}
