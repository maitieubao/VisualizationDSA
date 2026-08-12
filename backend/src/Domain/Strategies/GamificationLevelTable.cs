using System;
using System.Linq;

namespace VisualizationDSA.Domain.Strategies
{
    /// <summary>
    /// GM-019: Bảng cấp độ XP — NGUỒN DUY NHẤT (single source of truth) dùng chung cho
    /// GamificationStrategy (Domain), GamificationService (Infrastructure) và
    /// GamificationController/StatelessGamificationController (WebApi).
    /// Trước đây mỗi lớp tự khai báo 1 bảng riêng → drift chắc chắn khi thay đổi.
    /// </summary>
    public static class GamificationLevelTable
    {
        public static readonly (int Level, string Name, int XpRequired, string Color)[] Levels =
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

        /// <summary>Ngưỡng XP tối thiểu của 1 level; ngoài bảng → int.MaxValue (level cuối).</summary>
        public static int XpThresholdForLevel(int level)
        {
            var entry = Levels.FirstOrDefault(l => l.Level == level);
            return entry.Level == level ? entry.XpRequired : int.MaxValue;
        }

        public static string GetLevelName(int level) =>
            Levels.FirstOrDefault(l => l.Level == level).Name ?? "Novice";

        /// <summary>Tính level từ tổng XP — quét từ bậc cao nhất xuống (cùng luật User._checkLevelUp).</summary>
        public static int CalculateLevel(int totalXp)
        {
            for (var i = Levels.Length - 1; i >= 0; i--)
                if (totalXp >= Levels[i].XpRequired)
                    return Levels[i].Level;
            return 1;
        }
    }
}
