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
        // AU-009: xóa fallback key hardcode — chưa Configure thì Key là rỗng (fail-closed ở các
        // điểm dùng thật: Program.cs luôn gọi Configure trước khi serve request).
        private static byte[] _key = Array.Empty<byte>();
        private static string? _issuer;
        private static string? _audience;

        public static byte[] Key => _key;

        /// <summary>Issuer/audience chuẩn để JwtHelper validate token stateless (AU-035).</summary>
        public static string? Issuer => _issuer;
        public static string? Audience => _audience;

        /// <summary>
        /// Gán khóa bí mật + issuer/audience. KHÔNG có fallback: key null/placeholder → throw
        /// (Program.cs ở Development tự sinh key ngẫu nhiên trước khi gọi hàm này).
        /// </summary>
        public static void Configure(string? key, string? issuer = null, string? audience = null)
        {
            if (string.IsNullOrWhiteSpace(key))
                throw new InvalidOperationException(
                    "Jwt:Key chưa được cấu hình. Đặt biến môi trường Jwt:Key (hoặc để Development tự sinh key ngẫu nhiên).");
            _key = Encoding.UTF8.GetBytes(key);
            _issuer = issuer;
            _audience = audience;
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
