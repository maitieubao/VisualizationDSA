using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.WebApi.Filters;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/concepts/lessons")]
    public class LessonController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly VisualizationDSA.Application.Services.IProgressRuleEngine _progressRuleEngine;

        public LessonController(ApplicationDbContext dbContext, VisualizationDSA.Application.Services.IProgressRuleEngine progressRuleEngine)
        {
            _dbContext = dbContext;
            _progressRuleEngine = progressRuleEngine;
        }

        private bool IsOwnerOrAdmin(Course course, Guid currentUserId)
        {
            if (JwtHelper.IsAdmin(Request)) return true;
            return course?.TeacherId == currentUserId;
        }

        /// <summary>
        /// Gate truy cập dùng chung cho GET và CompleteLesson:
        /// 1) Bài chưa Published (Draft/PendingReview/...) hoặc course chưa publish chỉ Teacher/Admin/chủ sở hữu.
        /// 2) Bài thuộc khóa Premium: mọi user không premium đều bị chặn (kể cả user bị xóa khỏi DB → null).
        /// </summary>
        private async Task<IActionResult?> CheckLessonAccessAsync(Lesson lesson, Course? course)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            User? user = null;
            if (userIdStr != null && Guid.TryParse(userIdStr, out var parsedUserId))
                user = await _dbContext.Users.FindAsync(parsedUserId);

            var isTeacherOrAdmin = JwtHelper.IsTeacherOrAdmin(Request);
            var isOwner = course != null && user != null && course.TeacherId == user.Id;

            var isPublished = lesson.PublishStatus == LessonPublishStatus.Published
                              && (course == null || course.IsPublished);
            if (!isPublished && !isTeacherOrAdmin && !isOwner)
            {
                return NotFound(new { error = "LESSON_NOT_FOUND", message = "Không tìm thấy bài học." });
            }

            // Premium: chặn MỌI user không premium (user null — bị xóa — cũng bị chặn).
            if (course != null && course.IsPremium && !isTeacherOrAdmin && !isOwner && (user == null || !user.IsPremium))
            {
                return StatusCode(403, new { error = "PREMIUM_REQUIRED", message = "Khóa học này yêu cầu tài khoản Premium để truy cập." });
            }

            return null;
        }

        [HttpGet("{id}")]
        [RequireJwtRole]
        public async Task<IActionResult> GetLessonById(Guid id)
        {
            var moduleItem = await _dbContext.ModuleItems.Include(m => m.Module).ThenInclude(m => m.Course).Include(m => m.Lesson).FirstOrDefaultAsync(i => i.LessonId == id);
            if (moduleItem == null || moduleItem.Lesson == null) return NotFound(new { error = "LESSON_NOT_FOUND", message = "Không tìm thấy bài học." });
            var lesson = moduleItem.Lesson;
            var course = moduleItem.Module?.Course;

            var accessBlock = await CheckLessonAccessAsync(lesson, course);
            if (accessBlock != null) return accessBlock;

            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            var status = "NotStarted";
            var lastActiveFrameIndex = 0;
            var lastScrollPercent = 0.0;

            // Quiz liên kết nằm trên ModuleItem riêng (ItemType=Quiz) trong CÙNG module
            // với lesson — không nằm trên Lesson item (LessonId item có QuizId=null).
            // Khớp theo OrderIndex: quiz item của lesson N có order nằm ngay sau lesson item N.
            var linkedQuizId = await _dbContext.ModuleItems
                .Where(i => i.ModuleId == moduleItem.ModuleId
                    && i.ItemType == ModuleItemType.Quiz
                    && i.QuizId != null
                    && i.OrderIndex > moduleItem.OrderIndex)
                .OrderBy(i => i.OrderIndex)
                .Select(i => i.QuizId)
                .FirstOrDefaultAsync();

            if (userIdStr != null && Guid.TryParse(userIdStr, out var currentUserId))
            {
                var progress = await _dbContext.UserLessonProgresses
                    .FirstOrDefaultAsync(p => p.UserId == currentUserId && p.LessonId == id);
                if (progress != null)
                {
                    status = progress.Status;
                    lastActiveFrameIndex = progress.LastActiveFrameIndex;
                    lastScrollPercent = progress.LastScrollPercent;
                }
            }

            return Ok(new
            {
                lesson.Id,
                courseId = (course?.Id ?? Guid.Empty),
                courseTitle = course?.Title,
                lesson.Title,
                lesson.ContentMd,
                lesson.SandboxType,
                lesson.SandboxConfig,
                QuizId = linkedQuizId,
                lesson.XPReward,
                moduleItem.OrderIndex,
                status,
                lastActiveFrameIndex,
                lastScrollPercent
            });
        }

        [HttpPost("{lessonId}/complete")]
        [RequireJwtRole]
        public async Task<IActionResult> CompleteLesson(Guid lessonId)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (userIdStr == null || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var moduleItem = await _dbContext.ModuleItems.Include(m => m.Module).ThenInclude(m => m.Course).Include(m => m.Lesson).FirstOrDefaultAsync(i => i.LessonId == lessonId);
            if (moduleItem == null || moduleItem.Lesson == null) return NotFound(new { error = "LESSON_NOT_FOUND", message = "Không tìm thấy bài học." });
            var lesson = moduleItem.Lesson;
            var course = moduleItem.Module?.Course;

            // Gate premium + publish trước khi cho hoàn thành/nhận XP.
            var accessBlock = await CheckLessonAccessAsync(lesson, course);
            if (accessBlock != null) return accessBlock;

            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null) return NotFound(new { error = "USER_NOT_FOUND" });

            var progress = await _dbContext.UserLessonProgresses
                .FirstOrDefaultAsync(p => p.UserId == userId && p.LessonId == lessonId);

            bool firstTime = false;
            if (progress == null)
            {
                progress = new UserLessonProgress(userId, lessonId, "Completed");
                progress.MarkAsCompleted(lesson.XPReward);
                _dbContext.UserLessonProgresses.Add(progress);
                firstTime = true;
            }
            else if (progress.Status != "Completed")
            {
                progress.MarkAsCompleted(lesson.XPReward);
                firstTime = true;
            }

            if (firstTime)
            {
                user.AwardXP(lesson.XPReward);
                user.RecordActivity();
            }

            
            var moduleItems = await _dbContext.ModuleItems
                .Where(m => m.LessonId == lessonId && !m.IsDeleted)
                .ToListAsync();

            // Khử N+1: gom toàn bộ progress trong 1 query.
            var moduleItemIds = moduleItems.Select(m => m.Id).ToList();
            var existingProgress = moduleItemIds.Count > 0
                ? (await _dbContext.UserModuleItemProgresses
                    .Where(p => p.UserId == userId && moduleItemIds.Contains(p.ModuleItemId))
                    .ToListAsync())
                    .ToDictionary(p => p.ModuleItemId)
                : new Dictionary<Guid, UserModuleItemProgress>();

            foreach (var mi in moduleItems)
            {
                existingProgress.TryGetValue(mi.Id, out var itemProgress);

                if (itemProgress == null)
                {
                    itemProgress = new UserModuleItemProgress(userId, mi.Id);
                    _dbContext.UserModuleItemProgresses.Add(itemProgress);
                }
                
                itemProgress.UpdateProgress(activeFrame: 0, scrollPercent: 100, isCompleted: true, score: null);
                await _progressRuleEngine.ProcessCompletionAsync(userId, mi.Id);
            }

            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                message = "Đã hoàn thành bài học thành công!",
                xpAwarded = firstTime ? lesson.XPReward : 0,
                totalXp = user.TotalXP,
                currentLevel = user.CurrentLevel
            });
        }

        [HttpPut("{lessonId}")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> UpdateLesson(Guid lessonId, [FromBody] CreateLessonDto dto)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (userIdStr == null || !Guid.TryParse(userIdStr, out var currentUserId)) return Unauthorized();

            var moduleItem = await _dbContext.ModuleItems.Include(m => m.Module).ThenInclude(m => m.Course).Include(m => m.Lesson).FirstOrDefaultAsync(i => i.LessonId == lessonId);
            if (moduleItem == null || moduleItem.Lesson == null) return NotFound(new { error = "LESSON_NOT_FOUND", message = "Không tìm thấy bài học." });
            var lesson = moduleItem.Lesson;
            var course = moduleItem.Module?.Course;

            if (course != null && !IsOwnerOrAdmin(course, currentUserId))
            {
                return StatusCode(403, new { error = "FORBIDDEN", message = "Bạn không có quyền chỉnh sửa bài học này." });
            }

            lesson.Update(dto.Title, dto.ContentMd, dto.SandboxType, dto.SandboxConfig, dto.XPReward);
            moduleItem.UpdateQuizId(dto.QuizId);
            moduleItem.Update(moduleItem.OverrideTitle, dto.OrderIndex, moduleItem.IsRequired);
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Cập nhật bài học thành công!", lesson });
        }

        [HttpDelete("{lessonId}")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> DeleteLesson(Guid lessonId)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (userIdStr == null || !Guid.TryParse(userIdStr, out var currentUserId)) return Unauthorized();

            var moduleItem = await _dbContext.ModuleItems.Include(m => m.Module).ThenInclude(m => m.Course).Include(m => m.Lesson).FirstOrDefaultAsync(i => i.LessonId == lessonId);
            if (moduleItem == null || moduleItem.Lesson == null) return NotFound(new { error = "LESSON_NOT_FOUND", message = "Không tìm thấy bài học." });
            var lesson = moduleItem.Lesson;
            var course = moduleItem.Module?.Course;

            if (course != null && !IsOwnerOrAdmin(course, currentUserId))
            {
                return StatusCode(403, new { error = "FORBIDDEN", message = "Bạn không có quyền xóa bài học này." });
            }

            _dbContext.Lessons.Remove(lesson);
            _dbContext.ModuleItems.Remove(moduleItem);
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Xóa bài học thành công!" });
        }

        [HttpPost("{lessonId}/progress")]
        [RequireJwtRole]
        public async Task<IActionResult> UpdateLessonProgress(Guid lessonId, [FromBody] UpdateProgressDto dto)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (userIdStr == null || !Guid.TryParse(userIdStr, out var userId)) return Unauthorized();

            // Gate thống nhất: không ghi progress vào bài Draft/premium không được phép.
            var moduleItem = await _dbContext.ModuleItems.Include(m => m.Module).ThenInclude(m => m.Course).Include(m => m.Lesson).FirstOrDefaultAsync(i => i.LessonId == lessonId);
            if (moduleItem?.Lesson == null) return NotFound(new { error = "LESSON_NOT_FOUND", message = "Không tìm thấy bài học." });
            var accessBlock = await CheckLessonAccessAsync(moduleItem.Lesson, moduleItem.Module?.Course);
            if (accessBlock != null) return accessBlock;

            var progress = await _dbContext.UserLessonProgresses
                .FirstOrDefaultAsync(p => p.UserId == userId && p.LessonId == lessonId);

            if (progress == null)
            {
                progress = new UserLessonProgress(userId, lessonId, "InProgress");
                _dbContext.UserLessonProgresses.Add(progress);
            }

            progress.UpdateProgress(dto.LastActiveFrameIndex, dto.LastScrollPercent);
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Cập nhật tiến trình thành công!", progress.Status, progress.LastActiveFrameIndex, progress.LastScrollPercent });
        }

        [HttpGet("{lessonId}/comments")]
        [RequireJwtRole]
        public async Task<IActionResult> GetLessonComments(Guid lessonId, [FromQuery] string? search = null)
        {
            // Gate thống nhất — không xem comment bài Draft/premium không được phép.
            var moduleItem = await _dbContext.ModuleItems.Include(m => m.Module).ThenInclude(m => m.Course).Include(m => m.Lesson).FirstOrDefaultAsync(i => i.LessonId == lessonId);
            if (moduleItem?.Lesson == null) return NotFound(new { error = "LESSON_NOT_FOUND", message = "Không tìm thấy bài học." });
            var accessBlock = await CheckLessonAccessAsync(moduleItem.Lesson, moduleItem.Module?.Course);
            if (accessBlock != null) return accessBlock;

            var query = _dbContext.LessonComments.Where(c => c.LessonId == lessonId && !c.IsDeleted);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var cleanSearch = search.Trim().ToLower();
                query = query.Where(c => c.Content.ToLower().Contains(cleanSearch));
            }

            var comments = await query
                .Include(c => c.User)
                .OrderBy(c => c.CreatedAt)
                .Select(c => new
                {
                    c.Id,
                    c.LessonId,
                    c.UserId,
                    username = c.User.Username,
                    role = c.User.Role,
                    isPremium = c.User.IsPremium,
                    c.Content,
                    c.CreatedAt,
                    c.ParentId,
                    c.IsEdited,
                    c.EditedAt
                })
                .ToListAsync();

            return Ok(comments);
        }

        [HttpPost("{lessonId}/comments")]
        [RequireJwtRole]
        public async Task<IActionResult> CreateLessonComment(Guid lessonId, [FromBody] CreateCommentDto dto)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (userIdStr == null || !Guid.TryParse(userIdStr, out var userId)) return Unauthorized();

            // Gate thống nhất — không comment bài Draft/premium không được phép.
            var moduleItem = await _dbContext.ModuleItems.Include(m => m.Module).ThenInclude(m => m.Course).Include(m => m.Lesson).FirstOrDefaultAsync(i => i.LessonId == lessonId);
            if (moduleItem?.Lesson == null) return NotFound(new { error = "LESSON_NOT_FOUND", message = "Không tìm thấy bài học." });
            var accessBlock = await CheckLessonAccessAsync(moduleItem.Lesson, moduleItem.Module?.Course);
            if (accessBlock != null) return accessBlock;

            if (string.IsNullOrWhiteSpace(dto.Content) || dto.Content.Length > 2000)
                return BadRequest(new { error = "INVALID_CONTENT", message = "Nội dung bình luận không hợp lệ." });

            if (dto.ParentId.HasValue)
            {
                // Reply phải thuộc CÙNG bài học và chưa bị xóa.
                var parentExists = await _dbContext.LessonComments.AnyAsync(c => c.Id == dto.ParentId.Value && c.LessonId == lessonId && !c.IsDeleted);
                if (!parentExists)
                    return NotFound(new { error = "PARENT_COMMENT_NOT_FOUND", message = "Không tìm thấy bình luận gốc." });
            }

            var comment = new LessonComment(lessonId, userId, dto.Content, dto.ParentId);
            _dbContext.LessonComments.Add(comment);
            await _dbContext.SaveChangesAsync();

            if (dto.ParentId.HasValue)
            {
                var parentComment = await _dbContext.LessonComments.FindAsync(dto.ParentId.Value);
                if (parentComment != null && parentComment.UserId != userId)
                {
                    var lesson = await _dbContext.Lessons.FindAsync(lessonId);
                    var sender = await _dbContext.Users.FindAsync(userId);
                    var notificationContent = $"{sender?.Username} đã trả lời bình luận của bạn trong bài học '{lesson?.Title}'.";
                    var notification = new Notification(parentComment.UserId, notificationContent, $"/lessons/{lessonId}?tab=discussion");
                    _dbContext.Notifications.Add(notification);
                    await _dbContext.SaveChangesAsync();
                }
            }

            var user = await _dbContext.Users.FindAsync(userId);
            return Ok(new
            {
                message = "Đăng bình luận thành công!",
                comment = new
                {
                    comment.Id,
                    comment.LessonId,
                    comment.UserId,
                    username = user?.Username ?? "Unknown",
                    role = user?.Role ?? "Student",
                    isPremium = user?.IsPremium ?? false,
                    comment.Content,
                    comment.CreatedAt,
                    comment.ParentId,
                    comment.IsEdited
                }
            });
        }
    }
}
