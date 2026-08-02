using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Asp.Versioning;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [Authorize]
    public class GamificationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public GamificationController(ApplicationDbContext context)
        {
            _context = context;
        }

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

        [HttpGet("config")]
        [AllowAnonymous]
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

        private Guid GetCurrentUserId()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                throw new UnauthorizedAccessException("User not found or invalid token.");
            return userId;
        }

        [HttpGet("quests")]
        public async Task<IActionResult> GetDailyQuests()
        {
            var userId = GetCurrentUserId();
            var today = DateTime.UtcNow.Date;
            
            var quests = await _context.UserDailyQuests
                .Where(q => q.UserId == userId && q.Date == today)
                .Select(q => new {
                    id = q.Id,
                    type = q.QuestType,
                    difficulty = q.Difficulty,
                    description = q.Description,
                    current = q.CurrentValue,
                    target = q.TargetValue,
                    completed = q.IsCompleted,
                    claimed = q.IsClaimed,
                    reward = q.GemsReward
                })
                .ToListAsync();
                
            // If empty, generate some fake ones for the first time
            if (!quests.Any())
            {
                var newQuests = new[] {
                    new Domain.Entities.UserDailyQuest(userId, today, "COMPLETE_QUIZ", "Easy", "Hoàn thành 1 bài tập Sorting", 1, 10),
                    new Domain.Entities.UserDailyQuest(userId, today, "EARN_XP", "Medium", "Kiếm 150 XP", 150, 20),
                    new Domain.Entities.UserDailyQuest(userId, today, "PERFECT_QUIZ", "Hard", "Đạt điểm tối đa 1 bài test OOP", 1, 50)
                };
                _context.UserDailyQuests.AddRange(newQuests);
                await _context.SaveChangesAsync();
                
                quests = newQuests.Select(q => new {
                    id = q.Id,
                    type = q.QuestType,
                    difficulty = q.Difficulty,
                    description = q.Description,
                    current = q.CurrentValue,
                    target = q.TargetValue,
                    completed = q.IsCompleted,
                    claimed = q.IsClaimed,
                    reward = q.GemsReward
                }).ToList();
            }

            return Ok(quests);
        }

        [HttpGet("skills")]
        public async Task<IActionResult> GetSkillStats()
        {
            var userId = GetCurrentUserId();
            var progresses = await _context.UserLessonProgresses
                .Where(p => p.UserId == userId && p.Status == "Completed")
                .ToListAsync();

            int completedCount = progresses.Count;
            
            // Baseline 20, max 100 based on completed lessons + user id hash
            int hash = Math.Abs(userId.GetHashCode());
            
            int dsa = Math.Min(100, 20 + completedCount * 2 + (hash % 20));
            int oop = Math.Min(100, 20 + completedCount * 2 + ((hash / 2) % 20));
            int sys = Math.Min(100, 20 + completedCount * 1 + ((hash / 3) % 20));
            int logic = Math.Min(100, 30 + completedCount * 3 + ((hash / 4) % 15));
            int cleanCode = Math.Min(100, 25 + completedCount * 2 + ((hash / 5) % 15));

            return Ok(new[]
            {
                new { subject = "Cấu trúc & Giải thuật", value = dsa },
                new { subject = "OOP", value = oop },
                new { subject = "System Design", value = sys },
                new { subject = "Tư duy Logic", value = logic },
                new { subject = "Clean Code", value = cleanCode }
            });
        }
    }
}

