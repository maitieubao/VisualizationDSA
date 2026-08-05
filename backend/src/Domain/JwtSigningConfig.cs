using System;
using System.Text;

namespace VisualizationDSA.Domain
{
    /// <summary>
    /// Cấu hình chữ ký JWT dùng chung cho hệ stateless (JwtHelper, StatelessAuthStrategy, AdminController).
    /// Key được cấp từ appsettings (Jwt:Key) tại Program.cs — KHÔNG hardcode trong source.
    /// </summary>
    public static class JwtSigningConfig
    {
        // Fallback chỉ cho môi trường dev; Program.cs sẽ ghi đè bằng Jwt:Key từ cấu hình.
        private static byte[] _key = Encoding.UTF8.GetBytes("VisualizationDSA-Stateless-Dev-Secret-Key-2024-Phase6-256bit!");

        public static byte[] Key => _key;

        public static void Configure(string? key)
        {
            if (!string.IsNullOrWhiteSpace(key))
                _key = Encoding.UTF8.GetBytes(key);
        }

        /// <summary>Base64Url không padding theo chuẩn RFC 7515.</summary>
        public static string Base64UrlEncode(byte[] bytes)
            => Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');

        /// <summary>Giải mã chuỗi base64url (không padding) hoặc base64 chuẩn thành bytes.</summary>
        public static byte[] DecodeBase64Url(string value)
        {
            var s = value.Replace('-', '+').Replace('_', '/');
            var padding = (4 - s.Length % 4) % 4;
            if (padding > 0) s += new string('=', padding);
            return Convert.FromBase64String(s);
        }
    }
}
