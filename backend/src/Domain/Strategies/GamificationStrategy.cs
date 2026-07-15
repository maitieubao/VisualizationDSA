using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies
{
    /// <summary>
    /// Stateless gamification engine — manages mock XP, levels, badges, leaderboard.
    /// No database required. Uses in-memory state for demo purposes.
    /// </summary>
    public class GamificationStrategy
    {
        private StatelessUserProfile _demoProfile;
        private readonly List<StatelessLeaderboardEntry> _leaderboard;

        private static readonly (int level, string name, int xpRequired, string color)[] LevelTable =
        {
            (1, "Novice",       0,    "#64748b"),
            (2, "Explorer",     100,  "#22c55e"),
            (3, "Learner",      300,  "#3b82f6"),
            (4, "Practitioner", 600,  "#8b5cf6"),
            (5, "Expert",       1000, "#f59e0b"),
            (6, "Master",       1500, "#ef4444"),
            (7, "Grandmaster",  2200, "#ec4899"),
            (8, "Legend",       3000, "#f97316"),
        };

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
            _demoProfile = BuildDemoProfile();
            _leaderboard = BuildMockLeaderboard();
        }

        public StatelessUserProfile GetUserProfile() => _demoProfile;

        public StatelessUserProfile AwardXp(int amount, string reason)
        {
            _demoProfile.TotalXp += amount;
            _demoProfile.CurrentLevel = CalculateLevel(_demoProfile.TotalXp);
            _demoProfile.LevelName = GetLevelName(_demoProfile.CurrentLevel);
            _demoProfile.RecentActivity.Insert(0, new StatelessXpEvent
            {
                Type = "XP_EARNED",
                Amount = amount,
                Description = reason,
                Timestamp = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
            });
            if (_demoProfile.RecentActivity.Count > 20)
                _demoProfile.RecentActivity.RemoveAt(_demoProfile.RecentActivity.Count - 1);
            CheckAndAwardBadges();
            return _demoProfile;
        }

        public StatelessUserProfile AwardQuizXp(string quizId, int score, int maxScore, int xpReward)
        {
            var reason = $"Quiz '{quizId}' hoàn thành: {score}/{maxScore}";
            return AwardXp(xpReward, reason);
        }

        public List<StatelessBadgeDto> GetAllBadges() =>
            BadgeTemplates.Select(b => new StatelessBadgeDto
            {
                Id = b.Id, Name = b.Name, Description = b.Description,
                Icon = b.Icon, Color = b.Color,
                EarnedAt = _demoProfile.EarnedBadges.FirstOrDefault(eb => eb.Id == b.Id)?.EarnedAt ?? ""
            }).ToList();

        public List<StatelessLeaderboardEntry> GetLeaderboard(int limit = 10) =>
            _leaderboard.Take(Math.Min(limit, _leaderboard.Count)).ToList();

        public object GetConfig() => new
        {
            levels = LevelTable.Select(l => new { l.level, l.name, l.xpRequired, l.color }),
            badges = BadgeTemplates.Select(b => new { b.Id, b.Name, b.Description, b.Icon, b.Color }),
            xpEvents = new[]
            {
                new { type = "QUIZ_COMPLETE",  defaultXp = 50,  description = "Hoàn thành một quiz" },
                new { type = "MODULE_FINISH",  defaultXp = 100, description = "Hoàn thành một module học tập" },
                new { type = "STREAK_BONUS",   defaultXp = 25,  description = "Bonus streak hàng ngày" },
                new { type = "ACHIEVEMENT",    defaultXp = 200, description = "Đạt thành tích đặc biệt" },
            }
        };

        private void CheckAndAwardBadges()
        {
            var earnedIds = _demoProfile.EarnedBadges.Select(b => b.Id).ToHashSet();
            if (_demoProfile.TotalXp >= 50 && !earnedIds.Contains("first-steps"))
                _demoProfile.EarnedBadges.Add(new StatelessBadgeDto { Id = "first-steps", Name = "First Steps", Description = "Hoàn thành bài trắc nghiệm đầu tiên", Icon = "🎯", Color = "#22c55e", EarnedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ") });
            if (_demoProfile.TotalXp >= 300 && !earnedIds.Contains("sorting-wizard"))
                _demoProfile.EarnedBadges.Add(new StatelessBadgeDto { Id = "sorting-wizard", Name = "Sorting Wizard", Description = "Hoàn thành 4 thuật toán sắp xếp", Icon = "⚡", Color = "#3b82f6", EarnedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ") });
            if (_demoProfile.TotalXp >= 500 && !earnedIds.Contains("oop-guru"))
                _demoProfile.EarnedBadges.Add(new StatelessBadgeDto { Id = "oop-guru", Name = "OOP Guru", Description = "Hiểu rõ Encapsulation & Inheritance", Icon = "🔐", Color = "#8b5cf6", EarnedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ") });
            if (_demoProfile.TotalXp >= 1000 && !earnedIds.Contains("solid-master"))
                _demoProfile.EarnedBadges.Add(new StatelessBadgeDto { Id = "solid-master", Name = "SOLID Master", Description = "Áp dụng đúng 5 nguyên lý SOLID", Icon = "🏛️", Color = "#f59e0b", EarnedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ") });
        }

        private static int CalculateLevel(int totalXp)
        {
            for (int i = LevelTable.Length - 1; i >= 0; i--)
                if (totalXp >= LevelTable[i].xpRequired) return LevelTable[i].level;
            return 1;
        }

        private static string GetLevelName(int level) =>
            LevelTable.FirstOrDefault(l => l.level == level).name ?? "Novice";

        private static StatelessUserProfile BuildDemoProfile() => new()
        {
            UserId = "demo-user",
            Username = "VisualizationDSA Student",
            TotalXp = 150,
            CurrentLevel = 2,
            LevelName = "Explorer",
            StreakDays = 3,
            EarnedBadges = new List<StatelessBadgeDto>
            {
                new() { Id = "first-steps", Name = "First Steps", Description = "Hoàn thành bài trắc nghiệm đầu tiên", Icon = "🎯", Color = "#22c55e", EarnedAt = "2026-06-01T10:00:00Z" }
            },
            RecentActivity = new List<StatelessXpEvent>
            {
                new() { Type = "QUIZ_COMPLETE", Amount = 50, Description = "Quiz 'Cơ bản về Sắp xếp' hoàn thành", Timestamp = "2026-06-05T08:30:00Z" },
                new() { Type = "MODULE_FINISH", Amount = 100, Description = "Module OOP Visualization hoàn thành", Timestamp = "2026-06-04T14:20:00Z" },
            }
        };

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
