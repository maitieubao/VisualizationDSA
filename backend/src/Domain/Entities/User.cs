using System;
using System.Collections.Generic;

namespace VisualizationDSA.Domain.Entities
{
    public class User
    {
        public Guid      Id             { get; private set; }
        public string    Email          { get; private set; } = string.Empty;
        public string    Username       { get; private set; } = string.Empty;
        public string    PasswordHash   { get; private set; } = string.Empty;
        public DateTime  CreatedAt      { get; private set; }
        public DateTime? LastLoginAt    { get; private set; }

        // ── Gamification & v4.0 Features ─────────────────────────────────────
        public int       TotalXP            { get; private set; }
        public int       CurrentLevel       { get; private set; }
        public int       StreakDays         { get; private set; }
        public bool      IsPremium          { get; private set; }
        public string    Role               { get; private set; } = "Student";
        public bool      IsActive           { get; private set; } = true;
        public DateTime? LastActivityDate   { get; private set; }

        // ── Hearts System (v4.0 Epic 2) ──────────────────────────────────────
        public int       Hearts             { get; private set; } = 10;
        public int       MaxHearts          { get; private set; } = 10;
        public DateTime? LastHeartUsedAt    { get; private set; }

        // ── Gems & Shop (v4.0 Epic 9) ─────────────────────────────────────────
        public int       GemsCount          { get; private set; } = 0;
        public int       StreakFreezeCount  { get; private set; } = 0;
        public string?   AvatarUrl          { get; private set; }
        public string?   AvatarFrameType    { get; private set; }

        // ── Teacher Application (v4.0 Epic 1) ─────────────────────────────────
        public string    TeacherAppStatus   { get; private set; } = "None"; // None/Pending/Approved/Rejected

        // ── Premium Expiration ────────────────────────────────────────────────
        public DateTime? PremiumExpiresAt   { get; private set; }

        // ── Ad Watch Tracking (v4.0 Epic 2) ──────────────────────────────────
        public int       AdWatchCount       { get; private set; } = 0;
        public DateTime? FirstAdAt          { get; private set; }  // sliding window 24h start

        // ── AI Quota & Hint Tracking (v4.0 Decisions D1 & Epic 3) ────────────
        public DateTime? AiQuotaResetAt     { get; private set; }  // rolling 24h window start
        public int       AiGlobalUsed       { get; private set; } = 0;  // max 50/day (Premium)
        public int       AiLessonUsed       { get; private set; } = 0;  // max 30/day (Premium, subset of global)
        public DateTime? LastHintAt         { get; private set; }  // cooldown 10s giữa 2 hint requests

        // ── XP Boost (v4.0 Epic 9) ────────────────────────────────────────────
        public DateTime? XpBoostExpiresAt   { get; private set; }

        // ── Navigation properties ──────────────────────────────────────────
        public virtual ICollection<UserBadge>           UserBadges           { get; private set; }
        public virtual ICollection<QuizAttempt>         QuizAttempts         { get; private set; }
        public virtual ICollection<LearningProgress>    LearningProgresses   { get; private set; }
        public virtual ICollection<LearningSession>     LearningSessions     { get; private set; } = new List<LearningSession>();
        public virtual ICollection<UserLessonProgress>   UserLessonProgresses { get; private set; }

        private User() { } // EF Core protected constructor

        public User(string email, string username, string passwordHash)
        {
            Id           = Guid.NewGuid();
            Email        = email;
            Username     = username;
            PasswordHash = passwordHash;
            CreatedAt    = DateTime.UtcNow;
            TotalXP      = 0;
            CurrentLevel = 1;
            StreakDays   = 0;
            IsPremium    = false;
            Role         = "Student";
            IsActive     = true;

            Hearts            = 10;
            MaxHearts         = 10;
            GemsCount         = 0;
            StreakFreezeCount = 0;
            TeacherAppStatus  = "None";

            UserBadges           = new List<UserBadge>();
            QuizAttempts         = new List<QuizAttempt>();
            LearningProgresses   = new List<LearningProgress>();
            UserLessonProgresses = new List<UserLessonProgress>();
        }

        public void AwardXP(int amount)
        {
            if (amount <= 0) return;
            TotalXP += amount;
            _checkLevelUp();
        }

        public bool DeductXP(int amount)
        {
            if (amount <= 0) return true;
            if (TotalXP < amount) return false;
            TotalXP -= amount;
            _checkLevelUp();
            return true;
        }

        public void CompleteModule(string moduleId)
        {
            var progress = new LearningProgress(Id, moduleId);
            LearningProgresses.Add(progress);
        }

        public void RecordLogin()
        {
            LastLoginAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Ghi nhận hoạt động học tập — cập nhật streak tự động.
        /// Gọi khi user: hoàn thành quiz, xem hết lecture, đạt badge.
        /// </summary>
        public void RecordActivity()
        {
            _updateStreak();
            LastActivityDate = DateTime.UtcNow;
        }

        [Obsolete("Use SetPremium(expiresAt) or DowngradeFromPremium() instead.")]
        public void SetPremiumStatus(bool isPremium)
        {
            IsPremium = isPremium;
        }

        public void SetPremium(DateTime? expiresAt)
        {
            IsPremium = true;
            PremiumExpiresAt = expiresAt;
            MaxHearts = 30;
            Hearts = 30; // Nâng lên 30 tim khi kích hoạt Premium
        }

        public void DowngradeFromPremium()
        {
            IsPremium = false;
            PremiumExpiresAt = null;
            MaxHearts = 10;
            // KHÔNG clamp Hearts — giữ nguyên Hearts hiện tại, tim không hồi cho đến khi xuống < MaxHearts (Decision D5)
        }

        public void SetXpBoostExpiry(DateTime? expiresAt) => XpBoostExpiresAt = expiresAt;
        public void SetAvatarFrameType(string? frameType) => AvatarFrameType = frameType;
        public void SetAvatarUrl(string? avatarUrl) => AvatarUrl = avatarUrl;

        public void RecordHintUsed() => LastHintAt = DateTime.UtcNow;

        public void RecordAdWatch()
        {
            if (FirstAdAt == null || (DateTime.UtcNow - FirstAdAt.Value).TotalSeconds > 86400)
            {
                FirstAdAt = DateTime.UtcNow;
                AdWatchCount = 1;
            }
            else
            {
                AdWatchCount++;
            }
        }

        public void SetTeacherAppStatus(string status) => TeacherAppStatus = status;

        public void AddGems(int amount)
        {
            if (amount > 0) GemsCount += amount;
        }

        public void DeductGems(int amount)
        {
            if (amount > 0 && GemsCount >= amount) GemsCount -= amount;
        }

        public void AddStreakFreeze(int amount)
        {
            if (amount > 0) StreakFreezeCount += amount;
        }

        public bool UseStreakFreeze()
        {
            if (StreakFreezeCount > 0)
            {
                StreakFreezeCount--;
                return true;
            }
            return false;
        }

        public void SetRole(string role)
        {
            if (role == "Student" || role == "Teacher" || role == "Admin")
            {
                Role = role;
                
                // Teacher & Admin automatically get Premium privileges
                if (role == "Teacher" || role == "Admin")
                {
                    IsPremium = true;
                    MaxHearts = 30;
                    if (Hearts < 30) Hearts = 30;
                }
            }
        }

        /// <summary>
        /// Khóa hoặc mở khóa tài khoản người dùng.
        /// Khi IsActive = false, user bị từ chối JWT khi đăng nhập.
        /// ✅ Task 4.2
        /// </summary>
        public void SetActiveStatus(bool isActive)
        {
            IsActive = isActive;
        }

        public void ChangePassword(string newPasswordHash)
        {
            if (!string.IsNullOrWhiteSpace(newPasswordHash))
                PasswordHash = newPasswordHash;
        }

        public void ResetStreak()
        {
            StreakDays = 0;
        }

        public void ResetAiQuota()
        {
            AiGlobalUsed = 0;
            AiLessonUsed = 0;
            AiQuotaResetAt = DateTime.UtcNow;
        }

        public void IncrementAiGlobal()
        {
            AiGlobalUsed++;
        }

        public void IncrementAiLesson()
        {
            AiLessonUsed++;
        }

        // ── Private ───────────────────────────────────────────────────────────

        private void _checkLevelUp()
        {
            // ✅ A2 FIX: Đồng bộ với XPEngine.ts LEVELS lookup table (8 levels)
            // Frontend: [0, 100, 300, 600, 1000, 1500, 2200, 3000]
            // Mỗi giá trị là tổng XP cần để ĐẠT level đó (không phải XP trong level)
            var levelThresholds = new[] { 0, 100, 300, 600, 1000, 1500, 2200, 3000 };

            // Tìm level cao nhất mà user đủ XP để đạt
            var newLevel = 1;
            for (var i = levelThresholds.Length - 1; i >= 0; i--)
            {
                if (TotalXP >= levelThresholds[i])
                {
                    newLevel = i + 1; // level 1-indexed
                    break;
                }
            }

            if (newLevel > CurrentLevel)
            {
                CurrentLevel = newLevel;
            }
        }

        private void _updateStreak()
        {
            var today = DateTime.UtcNow.Date;

            if (LastActivityDate == null)
            {
                // Ngày đầu tiên có hoạt động
                StreakDays = 1;
                return;
            }

            var lastDate = LastActivityDate.Value.Date;

            if (lastDate == today)
            {
                // Đã có hoạt động hôm nay rồi — không tăng streak
                return;
            }
            else if (lastDate == today.AddDays(-1))
            {
                // Hôm qua cũng có hoạt động → tăng streak
                StreakDays++;
            }
            else
            {
                // Bỏ lỡ ít nhất 1 ngày → reset streak
                StreakDays = 1;
            }
        }
    }
}
