using Microsoft.AspNetCore.Mvc;
using Asp.Versioning;

namespace VisualizationDSA.WebApi.Controllers
{
    /// <summary>
    /// Gamification Config Controller — trả về cấu hình level/XP để frontend và backend đồng bộ.
    /// Route: api/v{version:apiVersion}/gamification
    /// </summary>
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    public class GamificationController : ControllerBase
    {
        // ✅ A3: Single Source of Truth cho level thresholds.
        // Frontend XPEngine.ts và Backend User.cs đều phải tuân theo bảng này.
        private static readonly object[] LevelDefinitions = new[]
        {
            new { level = 1, name = "Novice",       xpRequired = 0,    color = "#64748b" },
            new { level = 2, name = "Explorer",     xpRequired = 100,  color = "#22c55e" },
            new { level = 3, name = "Learner",      xpRequired = 300,  color = "#3b82f6" },
            new { level = 4, name = "Practitioner", xpRequired = 600,  color = "#8b5cf6" },
            new { level = 5, name = "Expert",       xpRequired = 1000, color = "#f59e0b" },
            new { level = 6, name = "Master",       xpRequired = 1500, color = "#ef4444" },
            new { level = 7, name = "Grandmaster",  xpRequired = 2200, color = "#ec4899" },
            new { level = 8, name = "Legend",       xpRequired = 3000, color = "#f97316" },
        };

        private static readonly object[] BadgeDefinitions = new[]
        {
            new { id = "first-steps",      name = "First Steps",      description = "Hoàn thành bài trắc nghiệm đầu tiên",     icon = "🎯", color = "#22c55e" },
            new { id = "sorting-wizard",   name = "Sorting Wizard",   description = "Hoàn thành 4 thuật toán sắp xếp",         icon = "⚡", color = "#3b82f6" },
            new { id = "oop-guru",         name = "OOP Guru",         description = "Hiểu rõ Encapsulation & Inheritance",      icon = "🔐", color = "#8b5cf6" },
            new { id = "solid-master",     name = "SOLID Master",     description = "Áp dụng đúng 5 nguyên lý SOLID",           icon = "🏛️", color = "#f59e0b" },
            new { id = "pattern-hunter",   name = "Pattern Hunter",   description = "Sử dụng 3 Design Patterns",                icon = "🎨", color = "#ec4899" },
            new { id = "streak-keeper",    name = "Streak Keeper",    description = "Học liên tục 7 ngày",                      icon = "🔥", color = "#ef4444" },
            new { id = "system-architect", name = "System Architect", description = "Thiết kế hệ thống phân tán",               icon = "🏗️", color = "#f97316" },
            new { id = "dsa-champion",     name = "DSA Champion",     description = "Hoàn thành toàn bộ khóa học",              icon = "👑", color = "#eab308" },
        };

        /// <summary>
        /// Lấy cấu hình gamification: level thresholds + badge definitions.
        /// Đây là Source of Truth để frontend XPEngine.ts và backend đồng bộ.
        /// GET /api/v1/gamification/config
        /// Cache 24 giờ — dữ liệu tĩnh, không thay đổi runtime.
        /// </summary>
        [HttpGet("config")]
        [ResponseCache(Duration = 86400, Location = ResponseCacheLocation.Any)]
        public IActionResult GetConfig()
        {
            return Ok(new
            {
                levels = LevelDefinitions,
                badges = BadgeDefinitions,
                xpEvents = new[]
                {
                    new { type = "QUIZ_COMPLETE",  defaultXp = 50,  description = "Hoàn thành một quiz" },
                    new { type = "MODULE_FINISH",  defaultXp = 100, description = "Hoàn thành một module học tập" },
                    new { type = "STREAK_BONUS",   defaultXp = 25,  description = "Bonus streak hàng ngày" },
                    new { type = "ACHIEVEMENT",    defaultXp = 200, description = "Đạt thành tích đặc biệt" },
                }
            });
        }
    }
}
