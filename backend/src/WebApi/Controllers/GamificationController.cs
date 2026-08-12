using Microsoft.AspNetCore.Mvc;
using Asp.Versioning;
using System.Linq;
using VisualizationDSA.Domain.Strategies;

namespace VisualizationDSA.WebApi.Controllers
{
    /// <summary>
    /// Cấu hình gamification — GM-019: bảng level dùng chung GamificationLevelTable (1 nguồn duy nhất
    /// với GamificationService/Strategy), trước đây tự khai báo bảng riêng → drift khi thay đổi.
    /// GM-009: id huy hiệu chuẩn là first-steps... (đồng bộ với GamificationStrategy).
    /// </summary>
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    public class GamificationController : ControllerBase
    {
        // GM-019: map từ bảng dùng chung — giữ nguyên shape JSON cũ (level/name/xpRequired/color).
        private static readonly object[] LevelDefinitions = GamificationLevelTable.Levels
            .Select(l => new { level = l.Level, name = l.Name, xpRequired = l.XpRequired, color = l.Color })
            .Cast<object>()
            .ToArray();

        // GM-009: id huy hiệu chuẩn hoá của backend — frontend map template theo id này.
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
