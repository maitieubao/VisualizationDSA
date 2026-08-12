using System;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using VisualizationDSA.Domain;

namespace VisualizationDSA.UnitTests.Common;

/// <summary>
/// Helper tạo JWT giống hệt StatelessAuthStrategy/AdminController (dùng JwtSigningConfig) để
/// test vòng đời token thật: signature + iss/aud khớp fail-closed của JwtHelper.RequireToken.
/// </summary>
public static class TestJwtBuilder
{
    public static void EnsureConfigured()
    {
        // Cấu hình global cho JwtSigningConfig (idempotent) — bắt buộc trước khi sinh/validate token.
        JwtSigningConfig.Configure(
            "test-admin-secret-key-0123456789-0123456789-0123456789",
            "TestIssuer",
            "TestAudience");
    }

    public static string BuildToken(string sub, string role, bool isImpersonated = false, string? originalAdminId = null)
    {
        var header = JwtSigningConfig.Base64UrlEncode(Encoding.UTF8.GetBytes("{\"alg\":\"HS256\",\"typ\":\"JWT\"}"));
        var payloadJson = JsonSerializer.Serialize(new
        {
            sub,
            role,
            iss = JwtSigningConfig.Issuer ?? "TestIssuer",
            aud = JwtSigningConfig.Audience ?? "TestAudience",
            exp = DateTimeOffset.UtcNow.AddMinutes(15).ToUnixTimeSeconds(),
            jti = Guid.NewGuid(),
            isImpersonated = isImpersonated ? true : (bool?)null,
            originalAdminId
        });
        var payload = JwtSigningConfig.Base64UrlEncode(Encoding.UTF8.GetBytes(payloadJson));
        var signature = JwtSigningConfig.Base64UrlEncode(
            HMACSHA256.HashData(JwtSigningConfig.Key, Encoding.UTF8.GetBytes($"{header}.{payload}")));
        return $"{header}.{payload}.{signature}";
    }
}
