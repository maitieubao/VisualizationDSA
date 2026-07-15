using System;

namespace VisualizationDSA.Domain.Entities
{
    /// <summary>
    /// Refresh Token — dùng để lấy Access Token mới khi hết hạn mà không cần login lại.
    /// Mỗi refresh tạo một token mới (Rotation Strategy) → token cũ bị thu hồi.
    /// Thời gian sống: 30 ngày.
    /// </summary>
    public class RefreshToken
    {
        public Guid     Id        { get; private set; }
        public string   Token     { get; private set; }  // 64-char GUID ngẫu nhiên
        public Guid     UserId    { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime ExpiresAt { get; private set; }
        public bool     IsRevoked { get; private set; }

        // Navigation property
        public virtual User User { get; private set; } = null!;

        private RefreshToken() { } // EF Core

        public RefreshToken(Guid userId, string token, DateTime expiresAt)
        {
            Id        = Guid.NewGuid();
            UserId    = userId;
            Token     = token;
            CreatedAt = DateTime.UtcNow;
            ExpiresAt = expiresAt;
            IsRevoked = false;
        }

        /// <summary>Thu hồi token — gọi khi logout hoặc refresh để rotation.</summary>
        public void Revoke() => IsRevoked = true;

        /// <summary>Kiểm tra token còn hợp lệ (chưa bị revoke và chưa hết hạn).</summary>
        public bool IsActive => !IsRevoked && ExpiresAt > DateTime.UtcNow;
    }
}
