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

        // ── Gamification ─────────────────────────────────────────────────────
        public int       TotalXP        { get; private set; }
        public int       CurrentLevel   { get; private set; }
        public int       StreakDays     { get; private set; }
        public bool      IsPremium      { get; private set; }
        public string    Role           { get; private set; } = "Student";

        /// <summary>
        /// Trạng thái hoạt động của tài khoản. false = bị khóa, không thể đăng nhập.
        /// ✅ Task 4.2 - Ban/Unban feature
        /// </summary>
        public bool      IsActive       { get; private set; } = true;

        /// <summary>
        /// Ngày cuối cùng user có hoạt động học tập (xem lecture, làm quiz, v.v.)
        /// Dùng để tính streak chính xác thay vì chỉ dựa vào LastLoginAt.
        /// ✅ FIX 3.4: Thêm LastActivityDate — tránh streak reset sai khi chỉ login.
        /// </summary>
        public DateTime? LastActivityDate { get; private set; }

        // ── Navigation properties ──────────────────────────────────────────
        public virtual ICollection<UserBadge>         UserBadges         { get; private set; }
        public virtual ICollection<QuizAttempt>       QuizAttempts       { get; private set; }
        public virtual ICollection<LearningProgress>  LearningProgresses { get; private set; }
        public virtual ICollection<UserLessonProgress> UserLessonProgresses { get; private set; }

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

            UserBadges         = new List<UserBadge>();
            QuizAttempts       = new List<QuizAttempt>();
            LearningProgresses = new List<LearningProgress>();
            UserLessonProgresses = new List<UserLessonProgress>();
        }

        public void AwardXP(int amount)
        {
            if (amount <= 0) return;
            TotalXP += amount;
            _checkLevelUp();
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

        public void SetPremiumStatus(bool isPremium)
        {
            IsPremium = isPremium;
        }

        public void SetRole(string role)
        {
            if (role == "Student" || role == "Teacher" || role == "Admin")
                Role = role;
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
