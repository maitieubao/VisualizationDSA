using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.WebApi.Filters;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/concepts")]
    public class CourseController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public CourseController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // ── Public APIs ──────────────────────────────────────────────────────

        /// <summary>
        /// Xem danh sách khóa học (lọc theo danh mục/độ khó).
        /// GET /api/v1/concepts/courses
        /// </summary>
        [HttpGet("courses")]
        public async Task<IActionResult> GetCourses([FromQuery] string? category, [FromQuery] string? difficulty, [FromQuery] string? userId)
        {
            var query = _dbContext.Courses.AsQueryable();

            if (!string.IsNullOrWhiteSpace(category))
            {
                query = query.Where(c => c.Category.ToLower() == category.ToLower());
            }

            if (!string.IsNullOrWhiteSpace(difficulty))
            {
                query = query.Where(c => c.Difficulty.ToLower() == difficulty.ToLower());
            }

            var courses = await query
                .Include(c => c.Lessons)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();

            // Nếu người dùng đã đăng nhập, tính tiến độ học tập (%)
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
                int totalLessons = c.Lessons.Count;
                int completedLessons = 0;
                double progressPercent = 0;

                if (targetUserId.HasValue && totalLessons > 0)
                {
                    var lessonIds = c.Lessons.Select(l => l.Id).ToList();
                    completedLessons = await _dbContext.UserLessonProgresses
                        .CountAsync(p => p.UserId == targetUserId.Value && lessonIds.Contains(p.LessonId) && p.Status == "Completed");
                    progressPercent = Math.Round(((double)completedLessons / totalLessons) * 100, 1);
                }

                result.Add(new
                {
                    c.Id,
                    c.Title,
                    c.Description,
                    c.Category,
                    c.Difficulty,
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

        /// <summary>
        /// Chi tiết khóa học và danh mục bài học.
        /// GET /api/v1/concepts/courses/{id}
        /// </summary>
        [HttpGet("courses/{id}")]
        public async Task<IActionResult> GetCourseById(Guid id, [FromQuery] string? userId)
        {
            var course = await _dbContext.Courses
                .Include(c => c.Lessons)
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
            foreach (var l in course.Lessons.OrderBy(l => l.OrderIndex))
            {
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
                    l.QuizId,
                    l.XPReward,
                    l.OrderIndex,
                    status
                });
            }

            return Ok(new
            {
                course.Id,
                course.Title,
                course.Description,
                course.Category,
                course.Difficulty,
                course.IsPremium,
                course.CoverImageUrl,
                course.IsPublished,
                lessons = lessonsList
            });
        }

        /// <summary>
        /// Lấy chi tiết bài học để học viên học.
        /// GET /api/v1/concepts/lessons/{id}
        /// </summary>
        [HttpGet("lessons/{id}")]
        [RequireJwtRole]
        public async Task<IActionResult> GetLessonById(Guid id)
        {
            var lesson = await _dbContext.Lessons
                .Include(l => l.Course)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (lesson == null)
            {
                return NotFound(new { error = "LESSON_NOT_FOUND", message = "Không tìm thấy bài học." });
            }

            // Kiểm tra quyền Premium
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (lesson.Course.IsPremium && userIdStr != null && Guid.TryParse(userIdStr, out var parsedId))
            {
                var user = await _dbContext.Users.FindAsync(parsedId);
                if (user != null && !user.IsPremium && user.Role == "Student")
                {
                    return StatusCode(403, new { error = "PREMIUM_REQUIRED", message = "Khóa học này yêu cầu tài khoản Premium để truy cập." });
                }
            }

            var status = "NotStarted";
            var lastActiveFrameIndex = 0;
            var lastScrollPercent = 0.0;

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
                lesson.CourseId,
                courseTitle = lesson.Course.Title,
                lesson.Title,
                lesson.ContentMd,
                lesson.SandboxType,
                lesson.SandboxConfig,
                lesson.QuizId,
                lesson.XPReward,
                lesson.OrderIndex,
                status,
                lastActiveFrameIndex,
                lastScrollPercent
            });
        }

        /// <summary>
        /// Đánh dấu hoàn thành bài học, nhận XP.
        /// POST /api/v1/concepts/lessons/{lessonId}/complete
        /// </summary>
        [HttpPost("lessons/{lessonId}/complete")]
        [RequireJwtRole]
        public async Task<IActionResult> CompleteLesson(Guid lessonId)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (userIdStr == null || !Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized();
            }

            var lesson = await _dbContext.Lessons.FindAsync(lessonId);
            if (lesson == null)
            {
                return NotFound(new { error = "LESSON_NOT_FOUND", message = "Không tìm thấy bài học." });
            }

            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { error = "USER_NOT_FOUND" });
            }

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

            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                message = "Đã hoàn thành bài học thành công!",
                xpAwarded = firstTime ? lesson.XPReward : 0,
                totalXp = user.TotalXP,
                currentLevel = user.CurrentLevel
            });
        }

        // ── Teacher/Admin APIs (CRUD) ─────────────────────────────────────────

        /// <summary>
        /// Kiểm tra xem user hiện tại có phải là chủ sở hữu khóa học hoặc Admin.
        /// </summary>
        private bool IsOwnerOrAdmin(Course course, Guid currentUserId)
        {
            if (JwtHelper.IsAdmin(Request)) return true;
            return course.TeacherId == currentUserId;
        }

        /// <summary>
        /// Tạo khóa học mới.
        /// POST /api/v1/concepts/courses
        /// </summary>
        [HttpPost("courses")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> CreateCourse([FromBody] CreateCourseDto dto)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (userIdStr == null || !Guid.TryParse(userIdStr, out var teacherId))
            {
                return Unauthorized();
            }

            var course = new Course(teacherId, dto.Title, dto.Description, dto.Category, dto.Difficulty, dto.IsPremium, dto.CoverImageUrl);
            _dbContext.Courses.Add(course);
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Tạo khóa học thành công!", course });
        }

        /// <summary>
        /// Cập nhật khóa học.
        /// PUT /api/v1/concepts/courses/{id}
        /// </summary>
        [HttpPut("courses/{id}")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> UpdateCourse(Guid id, [FromBody] CreateCourseDto dto)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (userIdStr == null || !Guid.TryParse(userIdStr, out var currentUserId))
                return Unauthorized();

            var course = await _dbContext.Courses.FindAsync(id);
            if (course == null)
            {
                return NotFound(new { error = "COURSE_NOT_FOUND", message = "Không tìm thấy khóa học." });
            }

            if (!IsOwnerOrAdmin(course, currentUserId))
            {
                return StatusCode(403, new { error = "FORBIDDEN", message = "Bạn không có quyền chỉnh sửa khóa học này. Chỉ chủ sở hữu hoặc Admin mới được phép." });
            }

            course.Update(dto.Title, dto.Description, dto.Category, dto.Difficulty, dto.IsPremium, dto.CoverImageUrl, dto.IsPublished);
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Cập nhật khóa học thành công!", course });
        }

        /// <summary>
        /// Xóa khóa học.
        /// DELETE /api/v1/concepts/courses/{id}
        /// </summary>
        [HttpDelete("courses/{id}")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> DeleteCourse(Guid id)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (userIdStr == null || !Guid.TryParse(userIdStr, out var currentUserId))
                return Unauthorized();

            var course = await _dbContext.Courses.FindAsync(id);
            if (course == null)
            {
                return NotFound(new { error = "COURSE_NOT_FOUND", message = "Không tìm thấy khóa học." });
            }

            if (!IsOwnerOrAdmin(course, currentUserId))
            {
                return StatusCode(403, new { error = "FORBIDDEN", message = "Bạn không có quyền xóa khóa học này. Chỉ chủ sở hữu hoặc Admin mới được phép." });
            }

            _dbContext.Courses.Remove(course);
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Xóa khóa học thành công!" });
        }

        /// <summary>
        /// Thêm bài học mới vào khóa.
        /// POST /api/v1/concepts/courses/{courseId}/lessons
        /// </summary>
        [HttpPost("courses/{courseId}/lessons")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> CreateLesson(Guid courseId, [FromBody] CreateLessonDto dto)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (userIdStr == null || !Guid.TryParse(userIdStr, out var currentUserId))
                return Unauthorized();

            var course = await _dbContext.Courses.Include(c => c.Lessons).FirstOrDefaultAsync(c => c.Id == courseId);
            if (course == null)
            {
                return NotFound(new { error = "COURSE_NOT_FOUND", message = "Không tìm thấy khóa học." });
            }

            if (!IsOwnerOrAdmin(course, currentUserId))
            {
                return StatusCode(403, new { error = "FORBIDDEN", message = "Bạn không có quyền thêm bài học vào khóa này. Chỉ chủ sở hữu hoặc Admin mới được phép." });
            }

            var orderIndex = dto.OrderIndex > 0 ? dto.OrderIndex : course.Lessons.Count + 1;
            var lesson = new Lesson(courseId, dto.Title, dto.ContentMd, dto.SandboxType, dto.SandboxConfig, dto.QuizId, dto.XPReward, orderIndex);
            _dbContext.Lessons.Add(lesson);
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Thêm bài học thành công!", lesson });
        }

        /// <summary>
        /// Cập nhật bài học.
        /// PUT /api/v1/concepts/lessons/{lessonId}
        /// </summary>
        [HttpPut("lessons/{lessonId}")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> UpdateLesson(Guid lessonId, [FromBody] CreateLessonDto dto)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (userIdStr == null || !Guid.TryParse(userIdStr, out var currentUserId))
                return Unauthorized();

            var lesson = await _dbContext.Lessons.Include(l => l.Course).FirstOrDefaultAsync(l => l.Id == lessonId);
            if (lesson == null)
            {
                return NotFound(new { error = "LESSON_NOT_FOUND", message = "Không tìm thấy bài học." });
            }

            if (!IsOwnerOrAdmin(lesson.Course, currentUserId))
            {
                return StatusCode(403, new { error = "FORBIDDEN", message = "Bạn không có quyền chỉnh sửa bài học này. Chỉ chủ sở hữu khóa học hoặc Admin mới được phép." });
            }

            lesson.Update(dto.Title, dto.ContentMd, dto.SandboxType, dto.SandboxConfig, dto.QuizId, dto.XPReward, dto.OrderIndex);
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Cập nhật bài học thành công!", lesson });
        }

        /// <summary>
        /// Xóa bài học.
        /// DELETE /api/v1/concepts/lessons/{lessonId}
        /// </summary>
        [HttpDelete("lessons/{lessonId}")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> DeleteLesson(Guid lessonId)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (userIdStr == null || !Guid.TryParse(userIdStr, out var currentUserId))
                return Unauthorized();

            var lesson = await _dbContext.Lessons.Include(l => l.Course).FirstOrDefaultAsync(l => l.Id == lessonId);
            if (lesson == null)
            {
                return NotFound(new { error = "LESSON_NOT_FOUND", message = "Không tìm thấy bài học." });
            }

            if (!IsOwnerOrAdmin(lesson.Course, currentUserId))
            {
                return StatusCode(403, new { error = "FORBIDDEN", message = "Bạn không có quyền xóa bài học này. Chỉ chủ sở hữu khóa học hoặc Admin mới được phép." });
            }

            _dbContext.Lessons.Remove(lesson);
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Xóa bài học thành công!" });
        }

        // ── Sprint F Added APIs: Discussion, Progress, and Teacher Analytics ──

        /// <summary>
        /// Cập nhật tiến trình học dở (InProgress) của bài học (Frame Index, Scroll Percent).
        /// POST /api/v1/concepts/lessons/{lessonId}/progress
        /// </summary>
        [HttpPost("lessons/{lessonId}/progress")]
        [RequireJwtRole]
        public async Task<IActionResult> UpdateLessonProgress(Guid lessonId, [FromBody] UpdateProgressDto dto)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (userIdStr == null || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

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

        /// <summary>
        /// Lấy danh sách thảo luận/bình luận của bài học.
        /// GET /api/v1/concepts/lessons/{lessonId}/comments
        /// </summary>
        [HttpGet("lessons/{lessonId}/comments")]
        [RequireJwtRole]
        public async Task<IActionResult> GetLessonComments(Guid lessonId, [FromQuery] string? search = null)
        {
            var query = _dbContext.LessonComments.Where(c => c.LessonId == lessonId);

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
                    c.ParentId
                })
                .ToListAsync();

            return Ok(comments);
        }

        /// <summary>
        /// Tạo bình luận mới hoặc phản hồi bình luận cũ.
        /// POST /api/v1/concepts/lessons/{lessonId}/comments
        /// </summary>
        [HttpPost("lessons/{lessonId}/comments")]
        [RequireJwtRole]
        public async Task<IActionResult> CreateLessonComment(Guid lessonId, [FromBody] CreateCommentDto dto)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (userIdStr == null || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            if (string.IsNullOrWhiteSpace(dto.Content) || dto.Content.Length > 2000)
                return BadRequest(new { error = "INVALID_CONTENT", message = "Nội dung bình luận không được để trống và tối đa 2000 ký tự." });

            if (dto.ParentId.HasValue)
            {
                var parentExists = await _dbContext.LessonComments.AnyAsync(c => c.Id == dto.ParentId.Value);
                if (!parentExists)
                    return NotFound(new { error = "PARENT_COMMENT_NOT_FOUND", message = "Không tìm thấy bình luận gốc để trả lời." });
            }

            var comment = new LessonComment(lessonId, userId, dto.Content, dto.ParentId);
            _dbContext.LessonComments.Add(comment);
            await _dbContext.SaveChangesAsync();

            // Gửi thông báo đến tác giả của bình luận cha (nếu đây là phản hồi)
            if (dto.ParentId.HasValue)
            {
                var parentComment = await _dbContext.LessonComments.FindAsync(dto.ParentId.Value);
                if (parentComment != null && parentComment.UserId != userId)
                {
                    var lesson = await _dbContext.Lessons.FindAsync(lessonId);
                    var sender = await _dbContext.Users.FindAsync(userId);
                    var senderName = sender?.Username ?? "Ai đó";
                    var lessonTitle = lesson?.Title ?? "bài học";

                    var notificationContent = $"{senderName} đã trả lời bình luận của bạn trong bài học '{lessonTitle}'.";
                    var linkUrl = $"/lessons/{lessonId}?tab=discussion";

                    var notification = new Notification(parentComment.UserId, notificationContent, linkUrl);
                    _dbContext.Notifications.Add(notification);
                    await _dbContext.SaveChangesAsync();
                }
            }

            // Load user info for return
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
                    comment.ParentId
                }
            });
        }

        /// <summary>
        /// Lấy báo cáo thống kê tiến trình học viên đăng ký của một khóa học.
        /// GET /api/v1/concepts/teacher/courses/{courseId}/analytics
        /// </summary>
        [HttpGet("teacher/courses/{courseId}/analytics")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> GetCourseAnalytics(Guid courseId)
        {
            var course = await _dbContext.Courses
                .Include(c => c.Lessons)
                .FirstOrDefaultAsync(c => c.Id == courseId);

            if (course == null)
                return NotFound(new { error = "COURSE_NOT_FOUND", message = "Không tìm thấy khóa học." });

            // Quyền sở hữu
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (userIdStr == null || !Guid.TryParse(userIdStr, out var currentUserId))
                return Unauthorized();

            if (!IsOwnerOrAdmin(course, currentUserId))
                return StatusCode(403, new { error = "FORBIDDEN", message = "Bạn không có quyền xem báo cáo của khóa học này." });

            var totalLessons = course.Lessons.Count;
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

            var lessonIds = course.Lessons.Select(l => l.Id).ToList();

            // Số học viên có tương tác với khóa học (đã started/completed ít nhất 1 lesson)
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
                // Tính toán tỷ lệ hoàn thành trung bình
                var completedCounts = await _dbContext.UserLessonProgresses
                    .Where(p => lessonIds.Contains(p.LessonId) && p.Status == "Completed" && activeUserIds.Contains(p.UserId))
                    .GroupBy(p => p.UserId)
                    .Select(g => new { UserId = g.Key, Count = g.Count() })
                    .ToListAsync();

                var sumPercent = completedCounts.Sum(c => ((double)c.Count / totalLessons) * 100);
                averageCompletionRate = Math.Round(sumPercent / totalStudents, 1);

                // Điểm trung bình của các quiz liên kết với bài học trong khóa học
                var quizIds = course.Lessons
                    .Where(l => l.QuizId.HasValue)
                    .Select(l => l.QuizId!.Value)
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

                // Thống kê phân bố học viên trên từng bài học
                foreach (var lesson in course.Lessons.OrderBy(l => l.OrderIndex))
                {
                    var startedCount = await _dbContext.UserLessonProgresses
                        .CountAsync(p => p.LessonId == lesson.Id && p.Status == "InProgress");
                    var completedCount = await _dbContext.UserLessonProgresses
                        .CountAsync(p => p.LessonId == lesson.Id && p.Status == "Completed");

                    lessonDistribution.Add(new
                    {
                        lessonId = lesson.Id,
                        title = lesson.Title,
                        orderIndex = lesson.OrderIndex,
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

    // ── DTOs ──────────────────────────────────────────────────────────────────

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
