using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VisualizationDSA.Domain;

namespace VisualizationDSA.WebApi.Filters
{
    public static class JwtHelper
    {
        // Key được cấu hình từ appsettings (Jwt:Key) tại Program.cs — KHÔNG hardcode trong source.
        public static byte[] SecretKey => JwtSigningConfig.Key;

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

                // Chữ ký chuẩn base64url (RFC 7515); so sánh bằng bytes với FixedTimeEquals
                // (chấp nhận cả token base64 chuẩn cũ nhờ DecodeBase64Url normalize cả 2 vế).
                var expectedSignature = JwtSigningConfig.Base64UrlEncode(
                    HMACSHA256.HashData(SecretKey, Encoding.UTF8.GetBytes($"{jwtHeader}.{jwtPayload}"))
                );

                var expectedBytes = JwtSigningConfig.DecodeBase64Url(expectedSignature);
                var actualBytes = JwtSigningConfig.DecodeBase64Url(jwtSignature);

                if (!CryptographicOperations.FixedTimeEquals(expectedBytes, actualBytes))
                    return new UnauthorizedObjectResult(new { error = "UNAUTHORIZED", message = "Chữ ký xác thực không hợp lệ." });

                var json = Encoding.UTF8.GetString(JwtSigningConfig.DecodeBase64Url(jwtPayload));

                using var doc = JsonDocument.Parse(json);
                // Bắt buộc claim exp — token không có thời hạn bị từ chối (fail-closed).
                if (!doc.RootElement.TryGetProperty("exp", out var expEl))
                    return new UnauthorizedObjectResult(new { error = "UNAUTHORIZED", message = "Mã xác thực không hợp lệ." });

                var expUnix = expEl.GetInt64();
                var expTime = DateTimeOffset.FromUnixTimeSeconds(expUnix);
                if (expTime < DateTimeOffset.UtcNow)
                    return new UnauthorizedObjectResult(new { error = "UNAUTHORIZED", message = "Phiên đăng nhập đã hết hạn." });
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
                var json = Encoding.UTF8.GetString(JwtSigningConfig.DecodeBase64Url(payloadBase64));
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
                var json = Encoding.UTF8.GetString(JwtSigningConfig.DecodeBase64Url(payloadBase64));
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
