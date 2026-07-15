namespace VisualizationDSA.WebApi.Middlewares;

/// <summary>
/// Middleware thêm các HTTP Security Headers vào mọi response.
/// Bảo vệ chống XSS, Clickjacking, MIME-sniffing và thông tin server leak.
/// </summary>
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

        // Ngăn trình duyệt đoán MIME type → chống MIME-sniffing attack
        headers["X-Content-Type-Options"] = "nosniff";

        // Ngăn nhúng trang trong iframe → chống Clickjacking
        headers["X-Frame-Options"] = "DENY";

        // Bật XSS filter trên trình duyệt cũ (modern browsers tự handle qua CSP)
        headers["X-XSS-Protection"] = "1; mode=block";

        // Ẩn thông tin server (không để lộ "Microsoft-IIS/10.0" hay "Kestrel")
        headers["Server"] = "VisualizationDSA";

        // Referrer policy — chỉ gửi origin khi cross-origin
        headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

        // Permissions policy — tắt các API không cần thiết
        headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";

        // Content Security Policy cơ bản — cho phép self + CDN cần thiết
        // TODO: Tùy chỉnh CSP khi deploy production với domain thật
        headers["Content-Security-Policy"] =
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob:; " +  // unsafe-eval cần cho Monaco Editor
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
            "font-src 'self' https://fonts.gstatic.com data:; " +
            "img-src 'self' data: blob:; " +
            "connect-src 'self' http://localhost:* ws://localhost:*; " +
            "worker-src 'self' blob:";                                    // Web Worker cần cho Code IDE

        await _next(context);
    }
}

/// <summary>Extension method để đăng ký middleware gọn hơn trong Program.cs</summary>
public static class SecurityHeadersMiddlewareExtensions
{
    public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app)
        => app.UseMiddleware<SecurityHeadersMiddleware>();
}
