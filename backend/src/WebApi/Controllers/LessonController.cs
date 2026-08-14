using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Serilog;
using System;
using System.Linq;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Services;
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
        private readonly VisualizationDSA.Application.Services.INotificationService? _notificationService;

        public LessonController(ApplicationDbContext dbContext, VisualizationDSA.Application.Services.IProgressRuleEngine progressRuleEngine, VisualizationDSA.Application.Services.INotificationService? notificationService = null)
        {
            _dbContext = dbContext;
            _progressRuleEngine = progressRuleEngine;
            _notificationService = notificationService;
        }

        private bool IsOwnerOrAdmin(Course course, Guid currentUserId)
        {
            if (JwtHelper.IsAdmin(Request)) return true;
            return course?.TeacherId == currentUserId;
        }

        /// <summary>
        /// Gate truy cập dùng chung cho GET và CompleteLesson:
        /// 1) Bài chưa Published (Draft/PendingReview/...) hoặc course chưa publish chỉ Teacher sở hữu
        ///    (chủ sở hữu course) hoặc Admin — LM-059: teacher khác KHÔNG xem draft bài của khóa người khác.
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
            if (!isPublished && !isOwner && !JwtHelper.IsAdmin(Request))
            {
                return NotFound(new { error = "LESSON_NOT_FOUND", message = "Không tìm thấy bài học." });
            }

            // Premium: chặn MỌI user không premium (user null — bị xóa — cũng bị chặn);
            // teacher/admin (bất kỳ) được xem bài premium như chế độ duyệt nội dung.
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
            // LM-028: heuristic "quiz ngay sau lesson" — quiz chỉ gắn cho lesson khi KHÔNG
            // có lesson item nào chen giữa (order quiz nằm giữa lesson này và lesson kế tiếp).
            var nextLessonOrder = await _dbContext.ModuleItems
                .Where(i => i.ModuleId == moduleItem.ModuleId
                    && i.ItemType == ModuleItemType.Lesson
                    && !i.IsDeleted
                    && i.OrderIndex > moduleItem.OrderIndex)
                .OrderBy(i => i.OrderIndex)
                .Select(i => (int?)i.OrderIndex)
                .FirstOrDefaultAsync() ?? int.MaxValue;

            var linkedQuizId = await _dbContext.ModuleItems
                .Where(i => i.ModuleId == moduleItem.ModuleId
                    && i.ItemType == ModuleItemType.Quiz
                    && i.QuizId != null
                    && !i.IsDeleted
                    && i.OrderIndex > moduleItem.OrderIndex
                    && i.OrderIndex < nextLessonOrder)
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

            // A1.2: nhúng payload codelab gắn vào bài (bước 4 Lesson Study) — đủ dữ liệu để FE
            // render editor: đề bài, code khởi tạo, test case, template, gợi ý. Test ẩn giữ bí mật
            // đáp án (ExpectedOutput rỗng) để học viên không đọc được kết quả mong đợi.
            Codelab? codelab = null;
            if (lesson.CodelabId.HasValue)
            {
                codelab = await _dbContext.Codelabs
                    .Include(c => c.TestCases)
                    .Include(c => c.Templates)
                    .Include(c => c.Hints)
                    .FirstOrDefaultAsync(c => c.Id == lesson.CodelabId.Value);
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
                // A1.1: codelab gắn vào bài (null = bài không có codelab).
                lesson.CodelabId,
                // A1.2: trạng thái xuất bản — FE authoring hiển thị đúng trạng thái form khi mở bài.
                publishStatus = lesson.PublishStatus.ToString(),
                // A1.2: payload codelab chi tiết cho bước 4 — null khi không gắn codelab.
                codelab = codelab == null ? null : new
                {
                    codelabId = codelab.Id,
                    codelab.Title,
                    codelab.Description,
                    codelab.InitialCode,
                    // Backend chưa có field entry function riêng — FE fallback về "solution".
                    entryFunction = (string?)null,
                    timeLimitMs = codelab.MaxRuntimeMs,
                    codelab.Difficulty,
                    testCases = codelab.TestCases
                        .OrderBy(tc => tc.OrderIndex)
                        .Select(tc => new
                        {
                            tc.Input,
                            // Test ẩn (IsHidden) không lộ ExpectedOutput — chống gian lận đáp án.
                            ExpectedOutput = tc.IsHidden ? string.Empty : tc.ExpectedOutput,
                            tc.IsHidden
                        }),
                    templates = codelab.Templates.Select(t => new
                    {
                        language = t.Language,
                        starterCode = t.BoilerplateCode
                    }),
                    // Gợi ý trả phí không lộ nội dung (phải trả XP để mở) — nhất quán với GET codelab.
                    hints = codelab.Hints
                        .OrderBy(h => h.OrderIndex)
                        .Select(h => new
                        {
                            content = h.XpCost > 0 ? string.Empty : h.Content,
                            h.IsTiered,
                            h.XpCost
                        })
                },
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

            // LM-009: upsert ATOMIC — 2 request song song cùng bài không được tạo 2 dòng
            // UserLessonProgress (duplicate key → 500) hay cộng XP 2 lần. Nếu SaveChanges
            // văng DbUpdateException (race), retry 1 lần với dữ liệu mới từ DB.
            for (var attempt = 0; attempt < 2; attempt++)
            {
                if (attempt > 0) _dbContext.ChangeTracker.Clear();

                var user = await _dbContext.Users.FindAsync(userId);
                if (user == null) return NotFound(new { error = "USER_NOT_FOUND" });

                var progress = await _dbContext.UserLessonProgresses
                    .FirstOrDefaultAsync(p => p.UserId == userId && p.LessonId == lessonId);

                bool firstTime = false;
                int oldLevel = 0;
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
                    // C2: ghi nhận level TRƯỚC khi cộng XP — phát hiện level-up sau commit.
                    oldLevel = user.CurrentLevel;
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

                try
                {
                    await _dbContext.SaveChangesAsync();

                    // C2: thông báo level-up SAU khi XP đã COMMIT thành công (không gửi nếu
                    // SaveChanges thất bại/race retry — tránh toast giả khi XP chưa được lưu).
                    if (firstTime && _notificationService != null && user.CurrentLevel > oldLevel)
                    {
                        try
                        {
                            await _notificationService.NotifyLevelUpAsync(
                                userId, user.Username, oldLevel, user.CurrentLevel, user.TotalXP);
                        }
                        catch (Exception ex)
                        {
                            Serilog.Log.Warning(ex, "Không gửi được notification level-up khi hoàn thành bài {LessonId}.", lessonId);
                        }
                    }

                    return Ok(new
                    {
                        message = "Đã hoàn thành bài học thành công!",
                        xpAwarded = firstTime ? lesson.XPReward : 0,
                        totalXp = user.TotalXP,
                        currentLevel = user.CurrentLevel
                    });
                }
                catch (DbUpdateException)
                {
                    // Race: request song song đã commit trước — retry đọc lại sẽ thấy Completed
                    // → firstTime=false → không cộng XP lần 2 (idempotent).
                }
            }

            var fallbackUser = await _dbContext.Users.FindAsync(userId);
            return Ok(new
            {
                message = "Đã hoàn thành bài học thành công!",
                xpAwarded = 0,
                totalXp = fallbackUser?.TotalXP ?? 0,
                currentLevel = fallbackUser?.CurrentLevel ?? 1
            });
        }

        [HttpPut("{lessonId}")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> UpdateLesson(Guid lessonId, [FromBody] SaveDraftLessonDto dto)
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

            // A1.2: chuỗi trạng thái xuất bản không hợp lệ → 400 (thay vì lưu sai dữ liệu).
            LessonPublishStatus? publishStatus = null;
            if (!string.IsNullOrWhiteSpace(dto.PublishStatus))
            {
                if (!Lesson.TryParseAuthorPublishStatus(dto.PublishStatus, out var parsedStatus))
                    return BadRequest(new { error = "INVALID_PUBLISH_STATUS", message = "PublishStatus chỉ nhận một trong: Draft, Private, Published." });
                publishStatus = parsedStatus;
            }

            // A1.1: codelab gắn mới phải thuộc teacher sở hữu hoặc dùng chung (OwnerId null).
            if (dto.CodelabId.HasValue)
            {
                var codelab = await _dbContext.Codelabs.FirstOrDefaultAsync(c => c.Id == dto.CodelabId.Value);
                if (codelab == null)
                    return BadRequest(new { error = "CODELAB_NOT_FOUND", message = "Không tìm thấy codelab." });
                if (codelab.OwnerId != null && codelab.OwnerId != currentUserId && !JwtHelper.IsAdmin(Request))
                    return StatusCode(403, new { error = "FORBIDDEN", message = "Bạn không thể gắn codelab của teacher khác vào bài học." });
            }

            lesson.Update(dto.Title, dto.ContentMd, dto.SandboxType, dto.SandboxConfig, dto.XPReward, dto.CodelabId, publishStatus);
            // A1.1: DTO luôn mang trạng thái đầy đủ — CodelabId null nghĩa là gỡ codelab khỏi bài.
            if (!dto.CodelabId.HasValue)
                lesson.DetachCodelab();
            moduleItem.UpdateQuizId(dto.QuizId);
            // TC-023: cùng thang đo với CreateDraftLesson (OrderIndex * 1000) — trước đây update
            // giữ giá trị thô làm module item mới tạo (1000, 2000...) trộn thứ tự với item sửa (1, 2...).
            var normalizedOrder = dto.OrderIndex > 0 ? dto.OrderIndex * 1000 : moduleItem.OrderIndex;
            moduleItem.Update(moduleItem.OverrideTitle, normalizedOrder, moduleItem.IsRequired);
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

            // T2-GUARD: Cascade delete progress data trước khi xóa Lesson + ModuleItem.
            // Xóa UserLessonProgress liên quan đến lesson này.
            await _dbContext.UserLessonProgresses
                .Where(p => p.LessonId == lessonId)
                .ExecuteDeleteAsync();

            // Xóa UserModuleItemProgress liên quan đến ModuleItem này.
            await _dbContext.UserModuleItemProgresses
                .Where(p => p.ModuleItemId == moduleItem.Id)
                .ExecuteDeleteAsync();

            // Xóa ClassroomLesson references nếu lesson được import vào classroom.
            await _dbContext.ClassroomLessons
                .Where(cl => cl.LessonId == lessonId)
                .ExecuteDeleteAsync();

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

            // LM-060: validate range dữ liệu tiến độ — chặn frame âm / scroll > 100%.
            if (dto.LastActiveFrameIndex < 0 || dto.LastScrollPercent < 0 || dto.LastScrollPercent > 100)
                return BadRequest(new { error = "INVALID_PROGRESS", message = "Dữ liệu tiến độ không hợp lệ (frame không âm, scroll 0–100%)." });

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
                    var linkUrl = $"/lessons/{lessonId}?tab=discussion";

                    // NT-002: tạo notification qua service (gom code path) + push real-time qua
                    // broker → NotificationHub đẩy "NewNotification" đúng Clients.User(parent.UserId).
                    if (_notificationService != null)
                    {
                        await _notificationService.NotifyUserAsync(parentComment.UserId, notificationContent, linkUrl);
                    }
                    else
                    {
                        // Fallback an toàn khi service không được inject (unit test gọi controller trực tiếp).
                        var notification = new Notification(parentComment.UserId, notificationContent, linkUrl);
                        _dbContext.Notifications.Add(notification);
                        await _dbContext.SaveChangesAsync();
                    }
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
