using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies
{
    /// <summary>
    /// GamificationStrategy — trạng thái gamification stateless (in-memory) NHIỀU USER.
    ///
    /// GM-011: trước đây Singleton giữ 1 profile demo DÙNG CHUNG mọi user (XP cộng chồng lẫn nhau),
    /// giờ lưu profile riêng theo userId (ConcurrentDictionary). Khi user tồn tại trong DB, controller
    /// gọi SyncProfileFromDb để nạp giá trị DB làm nguồn (DB-first) — không mất trạng thái khi restart.
    ///
    /// GM-016: AwardXp cập nhật StreakDays theo đúng luật _updateStreak của entity User
    /// (ngày UTC liên tiếp → tăng; gap → reset về 1) — hết streak đóng băng.
    ///
    /// GM-019: bảng level dùng chung GamificationLevelTable (1 nguồn).
    /// </summary>
    public class GamificationStrategy
    {
        private readonly ConcurrentDictionary<string, StatelessUserProfile> _profiles = new();
        private readonly List<StatelessLeaderboardEntry> _leaderboard;

        // GM-009: id huy hiệu CHUẨN của backend (first-steps...) — frontend phải map template theo id này.
        private static readonly StatelessBadgeDto[] BadgeTemplates =
        {
            new() { Id = "first-steps",      Name = "First Steps",      Description = "Hoàn thành bài trắc nghiệm đầu tiên",     Icon = "🎯", Color = "#22c55e" },
            new() { Id = "sorting-wizard",   Name = "Sorting Wizard",   Description = "Hoàn thành 4 thuật toán sắp xếp",         Icon = "⚡", Color = "#3b82f6" },
            new() { Id = "oop-guru",         Name = "OOP Guru",         Description = "Hiểu rõ Encapsulation & Inheritance",      Icon = "🔐", Color = "#8b5cf6" },
            new() { Id = "solid-master",     Name = "SOLID Master",     Description = "Áp dụng đúng 5 nguyên lý SOLID",           Icon = "🏛️", Color = "#f59e0b" },
            new() { Id = "pattern-hunter",   Name = "Pattern Hunter",   Description = "Sử dụng 3 Design Patterns",                Icon = "🎨", Color = "#ec4899" },
            new() { Id = "streak-keeper",    Name = "Streak Keeper",    Description = "Học liên tục 7 ngày",                      Icon = "🔥", Color = "#ef4444" },
            new() { Id = "system-architect", Name = "System Architect", Description = "Thiết kế hệ thống phân tán",               Icon = "🏗️", Color = "#f97316" },
            new() { Id = "dsa-champion",     Name = "DSA Champion",     Description = "Hoàn thành toàn bộ khóa học",              Icon = "👑", Color = "#eab308" },
        };

        public GamificationStrategy()
        {
            _leaderboard = BuildMockLeaderboard();
        }

        /// <summary>Lấy (hoặc tạo mới) profile in-memory của 1 user — KHÔNG dùng chung giữa các user (GM-011).</summary>
        public StatelessUserProfile GetUserProfile(string userId)
        {
            var key = NormalizeKey(userId);
            return _profiles.GetOrAdd(key, _ => new StatelessUserProfile
            {
                UserId = key,
                Username = "Học viên " + key[..Math.Min(8, key.Length)],
                TotalXp = 0,
                CurrentLevel = 1,
                LevelName = "Novice",
                StreakDays = 0,
                LastActiveDate = string.Empty,
                EarnedBadges = new List<StatelessBadgeDto>(),
                RecentActivity = new List<StatelessXpEvent>()
            });
        }

        /// <summary>
        /// DB-first (GM-011): đồng bộ profile in-memory theo giá trị DB — DB là nguồn khi user tồn tại.
        /// Chỉ cập nhật các trường số liệu; không ghi đè badges/activity đã có (tránh mất state giữa 2 request).
        /// </summary>
        public StatelessUserProfile SyncProfileFromDb(
            string userId, string username, int totalXp, int currentLevel, int streakDays, DateTime? lastActiveDate)
        {
            var profile = GetUserProfile(userId);
            profile.Username = string.IsNullOrWhiteSpace(username) ? profile.Username : username;
            profile.TotalXp = totalXp;
            profile.CurrentLevel = currentLevel;
            profile.LevelName = GamificationLevelTable.GetLevelName(currentLevel);
            profile.StreakDays = streakDays;
            if (lastActiveDate != null)
                profile.LastActiveDate = lastActiveDate.Value.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
            return profile;
        }

        /// <summary>Cộng XP cho RIÊNG 1 user + cập nhật streak (GM-016) + tự kiểm tra huy hiệu.</summary>
        public StatelessUserProfile AwardXp(string userId, int amount, string reason)
        {
            var profile = GetUserProfile(userId);
            profile.TotalXp += amount;
            profile.CurrentLevel = GamificationLevelTable.CalculateLevel(profile.TotalXp);
            profile.LevelName = GamificationLevelTable.GetLevelName(profile.CurrentLevel);
            profile.RecentActivity.Insert(0, new StatelessXpEvent
            {
                Type = "XP_EARNED",
                Amount = amount,
                Description = reason,
                Timestamp = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ", CultureInfo.InvariantCulture)
            });
            if (profile.RecentActivity.Count > 20)
                profile.RecentActivity.RemoveAt(profile.RecentActivity.Count - 1);
            UpdateStreak(profile);
            CheckAndAwardBadges(profile);
            return profile;
        }

        public StatelessUserProfile AwardQuizXp(string userId, string quizId, int score, int maxScore, int xpReward)
        {
            var reason = $"Quiz '{quizId}' hoàn thành: {score}/{maxScore}";
            return AwardXp(userId, xpReward, reason);
        }

        /// <summary>Danh sách huy hiệu ĐẦY ĐỦ (mở + khóa) của 1 user — EarnedAt rỗng nếu chưa mở (GM-009).</summary>
        public List<StatelessBadgeDto> GetAllBadges(string userId)
        {
            var profile = GetUserProfile(userId);
            var earned = profile.EarnedBadges.ToDictionary(b => b.Id, b => b.EarnedAt, StringComparer.Ordinal);
            return BadgeTemplates.Select(b => new StatelessBadgeDto
            {
                Id = b.Id, Name = b.Name, Description = b.Description,
                Icon = b.Icon, Color = b.Color,
                EarnedAt = earned.TryGetValue(b.Id, out var earnedAt) ? earnedAt : ""
            }).ToList();
        }

        public List<StatelessLeaderboardEntry> GetLeaderboard(int limit = 10) =>
            _leaderboard.Take(Math.Min(limit, _leaderboard.Count)).ToList();

        public object GetConfig() => new
        {
            levels = GamificationLevelTable.Levels.Select(l => new { level = l.Level, name = l.Name, xpRequired = l.XpRequired, color = l.Color }),
            badges = BadgeTemplates.Select(b => new { b.Id, b.Name, b.Description, b.Icon, b.Color }),
            xpEvents = new[]
            {
                new { type = "QUIZ_COMPLETE",  defaultXp = 50,  description = "Hoàn thành một quiz" },
                new { type = "MODULE_FINISH",  defaultXp = 100, description = "Hoàn thành một module học tập" },
                new { type = "STREAK_BONUS",   defaultXp = 25,  description = "Bonus streak hàng ngày" },
                new { type = "ACHIEVEMENT",    defaultXp = 200, description = "Đạt thành tích đặc biệt" },
            }
        };

        private void CheckAndAwardBadges(StatelessUserProfile profile)
        {
            var earnedIds = profile.EarnedBadges.Select(b => b.Id).ToHashSet(StringComparer.Ordinal);
            if (profile.TotalXp >= 50 && !earnedIds.Contains("first-steps"))
                profile.EarnedBadges.Add(CloneBadge("first-steps"));
            if (profile.TotalXp >= 300 && !earnedIds.Contains("sorting-wizard"))
                profile.EarnedBadges.Add(CloneBadge("sorting-wizard"));
            if (profile.TotalXp >= 500 && !earnedIds.Contains("oop-guru"))
                profile.EarnedBadges.Add(CloneBadge("oop-guru"));
            if (profile.TotalXp >= 1000 && !earnedIds.Contains("solid-master"))
                profile.EarnedBadges.Add(CloneBadge("solid-master"));
        }

        private static StatelessBadgeDto CloneBadge(string id)
        {
            var template = BadgeTemplates.FirstOrDefault(b => b.Id == id);
            return new StatelessBadgeDto
            {
                Id = template.Id, Name = template.Name, Description = template.Description,
                Icon = template.Icon, Color = template.Color,
                EarnedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ", CultureInfo.InvariantCulture)
            };
        }

        /// <summary>
        /// GM-016: cập nhật streak theo đúng luật User._updateStreak (server UTC):
        /// - chưa có ngày hoạt động → streak = 1;
        /// - cùng ngày → giữ nguyên;
        /// - liền hôm trước → +1;
        /// - gap ≥ 2 ngày → reset về 1.
        /// </summary>
        private static void UpdateStreak(StatelessUserProfile profile)
        {
            var today = DateTime.UtcNow.Date;

            if (string.IsNullOrEmpty(profile.LastActiveDate)
                || !DateTime.TryParseExact(
                    profile.LastActiveDate,
                    "yyyy-MM-dd",
                    CultureInfo.InvariantCulture,
                    DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal,
                    out var lastDate))
            {
                profile.StreakDays = 1;
                profile.LastActiveDate = today.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
                return;
            }

            lastDate = lastDate.Date;
            if (lastDate == today)
            {
                return;
            }

            profile.StreakDays = lastDate == today.AddDays(-1) ? profile.StreakDays + 1 : 1;
            profile.LastActiveDate = today.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
        }

        /// <summary>Chuẩn hoá key: rỗng → "anonymous"; cắt khoảng trắng (tránh 2 key lệch nhau cho cùng 1 user).</summary>
        private static string NormalizeKey(string userId)
        {
            var key = (userId ?? string.Empty).Trim();
            return string.IsNullOrEmpty(key) ? "anonymous" : key;
        }

        private static List<StatelessLeaderboardEntry> BuildMockLeaderboard() => new()
        {
            new() { Rank = 1, Username = "NguyenVanA",   TotalXp = 2850, Level = 7, LevelName = "Grandmaster", BadgeCount = 6, StreakDays = 14 },
            new() { Rank = 2, Username = "TranThiB",     TotalXp = 2200, Level = 7, LevelName = "Grandmaster", BadgeCount = 5, StreakDays = 10 },
            new() { Rank = 3, Username = "LeVanC",       TotalXp = 1800, Level = 6, LevelName = "Master",      BadgeCount = 5, StreakDays = 8  },
            new() { Rank = 4, Username = "PhamThiD",     TotalXp = 1500, Level = 6, LevelName = "Master",      BadgeCount = 4, StreakDays = 12 },
            new() { Rank = 5, Username = "HoangVanE",    TotalXp = 1200, Level = 5, LevelName = "Expert",      BadgeCount = 4, StreakDays = 6  },
            new() { Rank = 6, Username = "VuThiF",       TotalXp = 950,  Level = 4, LevelName = "Practitioner",BadgeCount = 3, StreakDays = 5  },
            new() { Rank = 7, Username = "DangVanG",     TotalXp = 700,  Level = 4, LevelName = "Practitioner",BadgeCount = 3, StreakDays = 4  },
            new() { Rank = 8, Username = "BuiThiH",      TotalXp = 450,  Level = 3, LevelName = "Learner",     BadgeCount = 2, StreakDays = 3  },
            new() { Rank = 9, Username = "DoVanI",        TotalXp = 250,  Level = 2, LevelName = "Explorer",    BadgeCount = 1, StreakDays = 2  },
            new() { Rank = 10, Username = "VisualizationDSA Student", TotalXp = 150, Level = 2, LevelName = "Explorer", BadgeCount = 1, StreakDays = 3  },
        };
    }
}
