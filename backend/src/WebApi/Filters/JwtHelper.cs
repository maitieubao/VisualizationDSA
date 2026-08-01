using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace VisualizationDSA.WebApi.Filters
{
    public static class JwtHelper
    {
        private static readonly byte[] SecretKey = Encoding.UTF8.GetBytes("VisualizationDSA-Stateless-Dev-Secret-Key-2024-Phase6-256bit!");

        /// <summary>
        /// Validates authorization header token.
        /// Returns UnauthorizedObjectResult if validation fails, otherwise returns null.
        /// </summary>
        public static IActionResult? RequireToken(HttpRequest request)
        {
            var header = request.Headers["Authorization"].FirstOrDefault();
            if (string.IsNullOrWhiteSpace(header) || !header.StartsWith("Bearer "))
                return new UnauthorizedObjectResult(new { error = "UNAUTHORIZED", message = "Yêu cầu đăng nhập để truy cập tài nguyên này." });

            var token = header["Bearer ".Length..].Trim();
            var parts = token.Split('.');
            if (parts.Length != 3)
                return new UnauthorizedObjectResult(new { error = "UNAUTHORIZED", message = "Mã xác thực không hợp lệ." });

            try
            {
                var jwtHeader = parts[0];
                var jwtPayload = parts[1];
                var jwtSignature = parts[2];

                // Verify Signature using Dev Secret Key
                var expectedSignature = Convert.ToBase64String(
                    HMACSHA256.HashData(SecretKey, Encoding.UTF8.GetBytes($"{jwtHeader}.{jwtPayload}"))
                );

                if (jwtSignature != expectedSignature)
                {
                    // Cho phép các token đã được ASP.NET Core JwtBearer xác thực (Real Auth)
                    if (request.HttpContext.User?.Identity?.IsAuthenticated != true)
                    {
                        return new UnauthorizedObjectResult(new { error = "UNAUTHORIZED", message = "Chữ ký xác thực không hợp lệ." });
                    }
                }

                // Verify Expiration
                var padding = (4 - jwtPayload.Length % 4) % 4;
                var paddedPayload = jwtPayload + new string('=', padding);
                paddedPayload = paddedPayload.Replace('-', '+').Replace('_', '/');
                var json = Encoding.UTF8.GetString(Convert.FromBase64String(paddedPayload));

                using var doc = JsonDocument.Parse(json);
                if (doc.RootElement.TryGetProperty("exp", out var expEl))
                {
                    var expUnix = expEl.GetInt64();
                    var expTime = DateTimeOffset.FromUnixTimeSeconds(expUnix);
                    if (expTime < DateTimeOffset.UtcNow)
                        return new UnauthorizedObjectResult(new { error = "UNAUTHORIZED", message = "Phiên đăng nhập đã hết hạn." });
                }
            }
            catch
            {
                return new UnauthorizedObjectResult(new { error = "UNAUTHORIZED", message = "Không thể xác thực token." });
            }

            return null;
        }

        public static string? ExtractRoleFromToken(HttpRequest request)
        {
            var header = request.Headers["Authorization"].FirstOrDefault();
            return ExtractRoleFromTokenHeader(header);
        }

        public static string? ExtractRoleFromTokenHeader(string? authHeader)
        {
            if (string.IsNullOrWhiteSpace(authHeader) || !authHeader.StartsWith("Bearer "))
                return null;

            var token = authHeader["Bearer ".Length..].Trim();
            var parts = token.Split('.');
            if (parts.Length != 3) return null;

            try
            {
                var payloadBase64 = parts[1];
                var padding = (4 - payloadBase64.Length % 4) % 4;
                payloadBase64 += new string('=', padding);
                payloadBase64 = payloadBase64.Replace('-', '+').Replace('_', '/');

                var json = Encoding.UTF8.GetString(Convert.FromBase64String(payloadBase64));
                using var doc = JsonDocument.Parse(json);
                if (doc.RootElement.TryGetProperty("role", out var roleEl))
                    return roleEl.GetString();
            }
            catch { }

            return null;
        }

        public static string? ExtractSubFromToken(HttpRequest request)
        {
            var header = request.Headers["Authorization"].FirstOrDefault();
            return ExtractSubFromTokenHeader(header);
        }

        public static string? ExtractSubFromTokenHeader(string? authHeader)
        {
            if (string.IsNullOrWhiteSpace(authHeader) || !authHeader.StartsWith("Bearer "))
                return null;

            var token = authHeader["Bearer ".Length..].Trim();
            var parts = token.Split('.');
            if (parts.Length != 3) return null;

            try
            {
                var payloadBase64 = parts[1];
                var padding = (4 - payloadBase64.Length % 4) % 4;
                payloadBase64 += new string('=', padding);
                payloadBase64 = payloadBase64.Replace('-', '+').Replace('_', '/');

                var json = Encoding.UTF8.GetString(Convert.FromBase64String(payloadBase64));
                using var doc = JsonDocument.Parse(json);
                if (doc.RootElement.TryGetProperty("sub", out var subEl))
                    return subEl.GetString();
            }
            catch { }

            return null;
        }

        public static bool IsTeacherOrAdmin(HttpRequest request)
        {
            var role = ExtractRoleFromToken(request);
            return role == "Teacher" || role == "Admin";
        }

        public static bool IsAdmin(HttpRequest request)
        {
            var role = ExtractRoleFromToken(request);
            return role == "Admin";
        }
    }
}
