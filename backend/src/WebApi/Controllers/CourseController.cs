using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.WebApi.Filters;
using MediatR;
using VisualizationDSA.Application.Features.Courses.Commands.CreateCourse;
using VisualizationDSA.Application.Features.Courses.Commands.AddModule;
using VisualizationDSA.Application.Features.Courses.Commands.AddModuleItem;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/concepts")]
    public class CourseController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IMediator _mediator;

        public CourseController(ApplicationDbContext dbContext, IMediator mediator)
        {
            _dbContext = dbContext;
            _mediator = mediator;
        }

        private bool IsOwnerOrAdmin(Course course, Guid currentUserId)
        {
            if (JwtHelper.IsAdmin(Request)) return true;
            return course.TeacherId == currentUserId;
        }

        [HttpGet("courses")]
        public async Task<IActionResult> GetCourses([FromQuery] string? category, [FromQuery] string? difficulty, [FromQuery] string? userId)
        {
            var query = _dbContext.Courses.AsQueryable();

            if (!string.IsNullOrWhiteSpace(category) && Enum.TryParse<CourseCategory>(category, true, out var catEnum))
            {
                query = query.Where(c => c.Category == catEnum);
            }

            if (!string.IsNullOrWhiteSpace(difficulty) && Enum.TryParse<CourseDifficulty>(difficulty, true, out var diffEnum))
            {
                query = query.Where(c => c.Difficulty == diffEnum);
            }

            var courses = await query
                .Include(c => c.Modules).ThenInclude(m => m.Items).ThenInclude(i => i.Lesson)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();

            var currentUserIdStr = JwtHelper.ExtractSubFromToken(Request);
            Guid? targetUserId = null;

            if (!string.IsNullOrWhiteSpace(userId))
            {
                if (userId != currentUserIdStr && !JwtHelper.IsTeacherOrAdmin(Request))
                {
                    return StatusCode(403, new { error = "FORBIDDEN", message = "Bạn không có quyền truy cập dữ liệu tiến độ của người khác." });
                }
                if (Guid.TryParse(userId, out var parsedId))
                {
                    targetUserId = parsedId;
                }
            }
            else if (currentUserIdStr != null && Guid.TryParse(currentUserIdStr, out var parsedId))
            {
                targetUserId = parsedId;
            }

            var result = new List<object>();
            foreach (var c in courses)
            {
                int totalLessons = c.Modules.SelectMany(m => m.Items).Count(i => i.ItemType == ModuleItemType.Lesson);
                int completedLessons = 0;
                double progressPercent = 0;

                if (targetUserId.HasValue && totalLessons > 0)
                {
                    var lessonIds = c.Modules.SelectMany(m => m.Items).Where(i => i.ItemType == ModuleItemType.Lesson && i.LessonId.HasValue).Select(i => i.LessonId!.Value).ToList();
                    completedLessons = await _dbContext.UserLessonProgresses
                        .CountAsync(p => p.UserId == targetUserId.Value && lessonIds.Contains(p.LessonId) && p.Status == "Completed");
                    progressPercent = Math.Round(((double)completedLessons / totalLessons) * 100, 1);
                }

                result.Add(new
                {
                    c.Id,
                    c.Title,
                    c.Description,
                    Category = c.Category.ToString(),
                    Difficulty = c.Difficulty.ToString(),
                    c.IsPremium,
                    c.CoverImageUrl,
                    c.IsPublished,
                    c.CreatedAt,
                    totalLessons,
                    completedLessons,
                    progressPercent
                });
            }

            return Ok(result);
        }

        [HttpGet("courses/{id}")]
        public async Task<IActionResult> GetCourseById(Guid id, [FromQuery] string? userId)
        {
            var course = await _dbContext.Courses
                .Include(c => c.Modules).ThenInclude(m => m.Items).ThenInclude(i => i.Lesson)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (course == null)
            {
                return NotFound(new { error = "COURSE_NOT_FOUND", message = "Không tìm thấy khóa học." });
            }

            var currentUserIdStr = JwtHelper.ExtractSubFromToken(Request);
            Guid? targetUserId = null;

            if (!string.IsNullOrWhiteSpace(userId))
            {
                if (userId != currentUserIdStr && !JwtHelper.IsTeacherOrAdmin(Request))
                {
                    return StatusCode(403, new { error = "FORBIDDEN", message = "Bạn không có quyền truy cập dữ liệu tiến độ của người khác." });
                }
                if (Guid.TryParse(userId, out var parsedId))
                {
                    targetUserId = parsedId;
                }
            }
            else if (currentUserIdStr != null && Guid.TryParse(currentUserIdStr, out var parsedId))
            {
                targetUserId = parsedId;
            }

            var lessonsList = new List<object>();
            foreach (var item in course.Modules.SelectMany(m => m.Items).Where(i => i.ItemType == ModuleItemType.Lesson).OrderBy(i => i.OrderIndex))
            {
                var l = item.Lesson;
                var status = "NotStarted";
                if (targetUserId.HasValue)
                {
                    var progress = await _dbContext.UserLessonProgresses
                        .FirstOrDefaultAsync(p => p.UserId == targetUserId.Value && p.LessonId == l.Id);
                    if (progress != null)
                    {
                        status = progress.Status;
                    }
                }

                lessonsList.Add(new
                {
                    l.Id,
                    l.Title,
                    l.ContentMd,
                    l.SandboxType,
                    l.SandboxConfig,
                    item.QuizId,
                    l.XPReward,
                    OrderIndex = item.OrderIndex,
                    status
                });
            }

            return Ok(new
            {
                course.Id,
                course.Title,
                course.Description,
                Category = course.Category.ToString(),
                Difficulty = course.Difficulty.ToString(),
                course.IsPremium,
                course.CoverImageUrl,
                course.IsPublished,
                lessons = lessonsList
            });
        }

        [HttpPost("courses")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> CreateCourse([FromBody] CreateCourseRequestDto dto)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (userIdStr == null || !Guid.TryParse(userIdStr, out var teacherId)) return Unauthorized();

            var command = new CreateCourseCommand(
                teacherId,
                dto.Title,
                dto.Description,
                dto.Thumbnail,
                dto.ExpectedTime,
                dto.Category,
                dto.Difficulty,
                dto.IsPremium,
                dto.IsPublished
            );
            var resultId = await _mediator.Send(command);

            return Ok(new { message = "Tạo khóa học thành công!", courseId = resultId });
        }

        [HttpPost("courses/{courseId}/modules")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> AddModule(Guid courseId, [FromBody] AddModuleDto dto)
        {
            var command = new AddModuleCommand(courseId, dto.Title, dto.Description, dto.OrderIndex);
            var resultId = await _mediator.Send(command);
            return Ok(new { message = "Thêm module thành công!", moduleId = resultId });
        }

        [HttpPost("modules/{moduleId}/items")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> AddModuleItem(Guid moduleId, [FromBody] AddModuleItemDto dto)
        {
            var command = new AddModuleItemCommand(
                moduleId, 
                Enum.Parse<ModuleItemType>(dto.ItemType), 
                dto.LessonId, 
                dto.QuizId, 
                dto.CodelabId, 
                dto.OverrideTitle, 
                dto.OrderIndex, 
                dto.IsRequired);
            var resultId = await _mediator.Send(command);
            return Ok(new { message = "Thêm item thành công!", moduleItemId = resultId });
        }

        [HttpPut("courses/{id}")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> UpdateCourse(Guid id, [FromBody] CreateCourseDto dto)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (userIdStr == null || !Guid.TryParse(userIdStr, out var currentUserId)) return Unauthorized();

            var course = await _dbContext.Courses.FindAsync(id);
            if (course == null) return NotFound(new { error = "COURSE_NOT_FOUND", message = "Không tìm thấy khóa học." });

            if (!IsOwnerOrAdmin(course, currentUserId)) return StatusCode(403, new { error = "FORBIDDEN", message = "Bạn không có quyền chỉnh sửa khóa học này." });

            if (!Enum.TryParse<CourseCategory>(dto.Category, true, out var catEnum)) catEnum = course.Category;
            if (!Enum.TryParse<CourseDifficulty>(dto.Difficulty, true, out var diffEnum)) diffEnum = course.Difficulty;

            course.UpdateMetadata(dto.Title, dto.Description, dto.CoverImageUrl);
            course.ChangeCategory(catEnum);
            course.ChangeDifficulty(diffEnum);
            course.SetPremium(dto.IsPremium);
            if (dto.IsPublished) course.Publish();
            else course.Unpublish();
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Cập nhật khóa học thành công!", course });
        }

        [HttpDelete("courses/{id}")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> DeleteCourse(Guid id)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (userIdStr == null || !Guid.TryParse(userIdStr, out var currentUserId)) return Unauthorized();

            var course = await _dbContext.Courses.FindAsync(id);
            if (course == null) return NotFound(new { error = "COURSE_NOT_FOUND", message = "Không tìm thấy khóa học." });

            if (!IsOwnerOrAdmin(course, currentUserId)) return StatusCode(403, new { error = "FORBIDDEN", message = "Bạn không có quyền xóa khóa học này." });

            _dbContext.Courses.Remove(course);
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Xóa khóa học thành công!" });
        }

        [HttpPost("courses/{courseId}/lessons")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> CreateLesson(Guid courseId, [FromBody] CreateLessonDto dto)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (userIdStr == null || !Guid.TryParse(userIdStr, out var currentUserId)) return Unauthorized();

            var command = new VisualizationDSA.Application.Features.Lessons.Commands.CreateDraftLesson.CreateDraftLessonCommand
            {
                TeacherId = currentUserId,
                CourseId = courseId,
                Title = dto.Title,
                ContentMd = dto.ContentMd,
                SandboxType = dto.SandboxType,
                SandboxConfig = dto.SandboxConfig,
                XPReward = dto.XPReward,
                OrderIndex = dto.OrderIndex
            };

            var lessonId = await _mediator.Send(command);
            return Ok(new { message = "Thêm bài học thành công!", lessonId });
        }

        [HttpPut("lessons/{id}")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> UpdateLesson(Guid id, [FromBody] CreateLessonDto dto)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (userIdStr == null || !Guid.TryParse(userIdStr, out var currentUserId)) return Unauthorized();

            var command = new VisualizationDSA.Application.Features.Lessons.Commands.UpdateLesson.UpdateLessonCommand
            {
                TeacherId = currentUserId,
                LessonId = id,
                Title = dto.Title,
                ContentMd = dto.ContentMd,
                SandboxType = dto.SandboxType,
                SandboxConfig = dto.SandboxConfig,
                XPReward = dto.XPReward
            };

            await _mediator.Send(command);
            return Ok(new { message = "Cập nhật bài giảng thành công!" });
        }

        [HttpDelete("lessons/{id}")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> DeleteLesson(Guid id)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (userIdStr == null || !Guid.TryParse(userIdStr, out var currentUserId)) return Unauthorized();

            var command = new VisualizationDSA.Application.Features.Lessons.Commands.DeleteLesson.DeleteLessonCommand
            {
                TeacherId = currentUserId,
                LessonId = id
            };

            await _mediator.Send(command);
            return Ok(new { message = "Xóa bài giảng thành công!" });
        }

        [HttpGet("teacher/courses/{courseId}/analytics")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> GetCourseAnalytics(Guid courseId)
        {
            var course = await _dbContext.Courses
                .Include(c => c.Modules).ThenInclude(m => m.Items).ThenInclude(i => i.Lesson)
                .FirstOrDefaultAsync(c => c.Id == courseId);

            if (course == null) return NotFound(new { error = "COURSE_NOT_FOUND", message = "Không tìm thấy khóa học." });

            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (userIdStr == null || !Guid.TryParse(userIdStr, out var currentUserId)) return Unauthorized();

            if (!IsOwnerOrAdmin(course, currentUserId)) return StatusCode(403, new { error = "FORBIDDEN", message = "Bạn không có quyền xem báo cáo của khóa học này." });

            var totalLessons = course.Modules.SelectMany(m => m.Items).Count(i => i.ItemType == ModuleItemType.Lesson);
            if (totalLessons == 0)
            {
                return Ok(new
                {
                    totalStudents = 0,
                    averageCompletionRate = 0.0,
                    averageQuizScore = 0.0,
                    lessonDistribution = new List<object>()
                });
            }

            var lessonIds = course.Modules.SelectMany(m => m.Items).Where(i => i.ItemType == ModuleItemType.Lesson && i.LessonId.HasValue).Select(i => i.LessonId!.Value).ToList();
            var activeUserIds = await _dbContext.UserLessonProgresses
                .Where(p => lessonIds.Contains(p.LessonId))
                .Select(p => p.UserId)
                .Distinct()
                .ToListAsync();

            var totalStudents = activeUserIds.Count;
            var averageCompletionRate = 0.0;
            var averageQuizScore = 0.0;
            var lessonDistribution = new List<object>();

            if (totalStudents > 0)
            {
                var completedCounts = await _dbContext.UserLessonProgresses
                    .Where(p => lessonIds.Contains(p.LessonId) && p.Status == "Completed" && activeUserIds.Contains(p.UserId))
                    .GroupBy(p => p.UserId)
                    .Select(g => new { UserId = g.Key, Count = g.Count() })
                    .ToListAsync();

                var sumPercent = completedCounts.Sum(c => ((double)c.Count / totalLessons) * 100);
                averageCompletionRate = Math.Round(sumPercent / totalStudents, 1);

                var quizIds = course.Modules.SelectMany(m => m.Items)
                    .Where(i => i.ItemType == ModuleItemType.Quiz && i.QuizId.HasValue)
                    .Select(i => i.QuizId!.Value)
                    .Distinct()
                    .ToList();

                if (quizIds.Count > 0)
                {
                    var quizAttempts = await _dbContext.QuizAttempts
                        .Where(a => quizIds.Contains(a.QuizId) && activeUserIds.Contains(a.UserId))
                        .Select(a => a.Score)
                        .ToListAsync();

                    if (quizAttempts.Count > 0)
                    {
                        averageQuizScore = Math.Round(quizAttempts.Average(), 1);
                    }
                }

                foreach (var item in course.Modules.SelectMany(m => m.Items).Where(i => i.ItemType == ModuleItemType.Lesson).OrderBy(i => i.OrderIndex))
                {
                    var lesson = item.Lesson;
                    var startedCount = await _dbContext.UserLessonProgresses
                        .CountAsync(p => p.LessonId == lesson.Id && p.Status == "InProgress");
                    var completedCount = await _dbContext.UserLessonProgresses
                        .CountAsync(p => p.LessonId == lesson.Id && p.Status == "Completed");

                    lessonDistribution.Add(new
                    {
                        lessonId = lesson.Id,
                        title = lesson.Title,
                        orderIndex = item.OrderIndex,
                        started = startedCount,
                        completed = completedCount
                    });
                }
            }

            return Ok(new
            {
                totalStudents,
                averageCompletionRate,
                averageQuizScore,
                lessonDistribution
            });
        }
    }

    public class CreateCourseRequestDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Thumbnail { get; set; } = string.Empty;
        public int ExpectedTime { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Difficulty { get; set; } = "Medium";
        public bool IsPremium { get; set; }
        public bool IsPublished { get; set; } = true;
    }

    public class CreateCourseDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Difficulty { get; set; } = "Medium";
        public bool IsPremium { get; set; }
        public string CoverImageUrl { get; set; } = string.Empty;
        public bool IsPublished { get; set; } = true;
    }

    public class CreateLessonDto
    {
        public string Title { get; set; } = string.Empty;
        public string ContentMd { get; set; } = string.Empty;
        public string SandboxType { get; set; } = string.Empty;
        public string SandboxConfig { get; set; } = "{}";
        public Guid? QuizId { get; set; }
        public int XPReward { get; set; } = 20;
        public int OrderIndex { get; set; }
    }
    public class AddModuleDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
    }

    public class AddModuleItemDto
    {
        public string ItemType { get; set; } = "Lesson";
        public Guid? LessonId { get; set; }
        public Guid? QuizId { get; set; }
        public Guid? CodelabId { get; set; }
        public string OverrideTitle { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public bool IsRequired { get; set; }
    }

    public class UpdateProgressDto
    {
        public int LastActiveFrameIndex { get; set; }
        public double LastScrollPercent { get; set; }
    }

    public class CreateCommentDto
    {
        public string Content { get; set; } = string.Empty;
        public Guid? ParentId { get; set; }
    }
}
