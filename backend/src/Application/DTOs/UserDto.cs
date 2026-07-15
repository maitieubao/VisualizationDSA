using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Application.DTOs
{
    public class UserDto
    {
        public Guid             Id           { get; set; }
        public string           Email        { get; set; } = string.Empty;
        public string           Username     { get; set; } = string.Empty;
        public int              TotalXP      { get; set; }
        public int              CurrentLevel { get; set; }
        public int              StreakDays   { get; set; }
        public DateTime         CreatedAt    { get; set; }
        public List<BadgeDto>   Badges       { get; set; } = new();
        public bool             IsPremium    { get; set; }
    }

    public class BadgeDto
    {
        public Guid     Id          { get; set; }
        public string   Name        { get; set; } = string.Empty;
        public string   Description { get; set; } = string.Empty;
        public string   Icon        { get; set; } = string.Empty;
        public string   Color       { get; set; } = string.Empty;
        public DateTime EarnedAt    { get; set; }
    }

    public class RegisterRequest
    {
        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email    { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        [MinLength(3)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [MinLength(8)]
        public string Password { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        [Required]
        [EmailAddress]
        public string Email    { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    /// <summary>
    /// Cập nhật AuthResponse để hỗ trợ Access Token ngắn hạn + Refresh Token dài hạn.
    /// </summary>
    public class AuthResponse
    {
        /// <summary>JWT Access Token — hết hạn sau 15 phút</summary>
        public string  AccessToken  { get; set; } = string.Empty;

        /// <summary>Refresh Token — hết hạn sau 30 ngày, dùng để lấy Access Token mới</summary>
        public string  RefreshToken { get; set; } = string.Empty;

        /// <summary>Thời gian sống của Access Token (giây)</summary>
        public int     ExpiresIn    { get; set; }

        public UserDto User         { get; set; } = null!;

        // Backward compat — sẽ loại bỏ sau migration Frontend hoàn tất
        [Obsolete("Sử dụng AccessToken thay thế. Sẽ bị loại bỏ trong v2.")]
        public string Token => AccessToken;
    }

    public class RefreshTokenRequest
    {
        [Required]
        public string RefreshToken { get; set; } = string.Empty;
    }

    public class XPAwardRequest
    {
        [Required]
        [Range(1, 10000)]
        public int    Amount { get; set; }

        [MaxLength(200)]
        public string Reason { get; set; } = string.Empty;
    }

    public class UserProgressDto
    {
        public int              TotalXP             { get; set; }
        public int              CurrentLevel        { get; set; }
        public int              XpToNextLevel       { get; set; }
        public int              LevelProgressPercent { get; set; }
        public int              BadgesEarned        { get; set; }
        public int              ModulesCompleted    { get; set; }
        public int              CurrentStreak       { get; set; }
        public List<string>     CompletedModuleIds  { get; set; } = new();
        public List<BadgeDto>   Badges              { get; set; } = new();
        public bool             IsPremium           { get; set; }
    }
}
