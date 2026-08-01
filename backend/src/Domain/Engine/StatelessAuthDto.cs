using System;
using System.Collections.Generic;

namespace VisualizationDSA.Domain.Engine
{
    /// <summary>
    /// Stateless Auth DTOs — dùng cho StatelessAuthStrategy (in-memory, không cần PostgreSQL).
    /// Tách biệt khỏi Application.DTOs để Domain layer không phụ thuộc Application.
    /// </summary>

    public class StatelessAuthResponse
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public int ExpiresIn { get; set; }
        public StatelessUserDto User { get; set; } = null!;
    }

    public class StatelessUserDto
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public int TotalXP { get; set; }
        public int CurrentLevel { get; set; }
        public int StreakDays { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<StatelessBadgeInfoDto> Badges { get; set; } = new();
        public bool IsPremium { get; set; }
        public string Role { get; set; } = "Student";
        public string? Nickname { get; set; }
        public string? Bio { get; set; }
        public string? University { get; set; }
        public int Hearts { get; set; }
        public int MaxHearts { get; set; }
        public int GemsCount { get; set; }
        public string TeacherAppStatus { get; set; } = "None";
    }

    public class StatelessBadgeInfoDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public DateTime EarnedAt { get; set; }
    }

    public class StatelessRegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class StatelessLoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class StatelessRefreshRequest
    {
        public string RefreshToken { get; set; } = string.Empty;
        public string? UserId { get; set; }
    }

    public class StatelessUserProgressDto
    {
        public int TotalXP { get; set; }
        public int CurrentLevel { get; set; }
        public int XpToNextLevel { get; set; }
        public int LevelProgressPercent { get; set; }
        public int BadgesEarned { get; set; }
        public int ModulesCompleted { get; set; }
        public int CurrentStreak { get; set; }
        public List<string> CompletedModuleIds { get; set; } = new();
        public List<StatelessBadgeInfoDto> Badges { get; set; } = new();
        public bool IsPremium { get; set; }
    }

    public class StatelessUpdateProfileRequest
    {
        public string? UserId { get; set; }
        public string? Username { get; set; }
        public string? Nickname { get; set; }
        public string? Bio { get; set; }
        public string? University { get; set; }
    }

    public class StatelessXpAwardRequest
    {
        public string? UserId { get; set; }
        public int Amount { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    public class StatelessChangePasswordRequest
    {
        public string? UserId { get; set; }
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
