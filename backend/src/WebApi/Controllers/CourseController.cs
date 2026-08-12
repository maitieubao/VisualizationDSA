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
            var currentUserIdStr = JwtHelper.ExtractSubFromToken(Request);
            var isTeacherOrAdmin = JwtHelper.IsTeacherOrAdmin(Request);
            Guid? currentUserId = null;
            if (currentUserIdStr != null && Guid.TryParse(currentUserIdStr, out var parsedCurrentId))
                currentUserId = parsedCurrentId;

            // LM-008 + LM-059: Server filter publish — học viên KHÔNG thấy khóa Draft
            // (trước đây client tự lọc). Teacher chỉ thấy draft CỦA MÌNH; Admin thấy tất cả.
            var query = _dbContext.Courses
                .Where(c => !c.IsDeleted)
                .AsQueryable();

            if (!JwtHelper.IsAdmin(Request))
            {
                if (isTeacherOrAdmin && currentUserId.HasValue)
                    query = query.Where(c => c.IsPublished || c.TeacherId == currentUserId.Value);
                else
                    query = query.Where(c => c.IsPublished);
            }

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

            // Gom toàn bộ lessonId của mọi khóa → 1 query progress (khử N+1).
            var allLessonIds = courses
                .SelectMany(c => c.Modules)
                .SelectMany(m => m.Items)
                .Where(i => i.ItemType == ModuleItemType.Lesson && i.LessonId.HasValue && !i.IsDeleted)
                .Select(i => i.LessonId!.Value)
                .Distinct()
                .ToList();

            HashSet<Guid> completedLessonIds = new();
            if (targetUserId.HasValue && allLessonIds.Count > 0)
            {
                var completed = await _dbContext.UserLessonProgresses
                    .Where(p => p.UserId == targetUserId.Value
                             && p.Status == "Completed"
                             && allLessonIds.Contains(p.LessonId))
                    .Select(p => p.LessonId)
                    .ToListAsync();
                completedLessonIds = completed.ToHashSet();
            }

            var result = new List<object>();
            foreach (var c in courses)
            {
                int totalLessons = c.Modules.SelectMany(m => m.Items).Count(i => i.ItemType == ModuleItemType.Lesson && !i.IsDeleted);
                int completedLessons = totalLessons == 0
                    ? 0
                    : c.Modules.SelectMany(m => m.Items)
                        .Where(i => i.ItemType == ModuleItemType.Lesson && i.LessonId.HasValue && !i.IsDeleted)
                        .Count(i => completedLessonIds.Contains(i.LessonId!.Value));
                double progressPercent = totalLessons > 0
                    ? Math.Round(((double)completedLessons / totalLessons) * 100, 1)
                    : 0;

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

            // GATE publish + premium cho GetCourseById — trước đây student đoán GUID nhận đủ
            // ContentMd/SandboxConfig của mọi lesson (kể cả bài Draft trong course Premium).
            // LM-059: khóa chưa publish chỉ CHỦ SỞ HỮU hoặc Admin xem được — teacher khác
            // không bypass toàn bộ (trước đây isTeacherOrAdmin mở cho mọi teacher).
            var isTeacherOrAdmin = JwtHelper.IsTeacherOrAdmin(Request);
            var userIdStrForGate = JwtHelper.ExtractSubFromToken(Request);
            var isOwner = userIdStrForGate != null
                          && Guid.TryParse(userIdStrForGate, out var ownerCheckId)
                          && course.TeacherId == ownerCheckId;

            if (!course.IsPublished && !isOwner && !JwtHelper.IsAdmin(Request))
            {
                return NotFound(new { error = "COURSE_NOT_FOUND", message = "Không tìm thấy khóa học." });
            }

            // GATE PREMIUM: khóa trả phí chỉ owner/Teacher/Admin/Student đã mua Premium xem được.
            if (course.IsPremium && !isTeacherOrAdmin && !isOwner)
            {
                User? gateUser = null;
                if (userIdStrForGate != null && Guid.TryParse(userIdStrForGate, out var gateUserId))
                    gateUser = await _dbContext.Users.FindAsync(gateUserId);

                if (gateUser == null || !gateUser.IsPremium)
                {
                    return StatusCode(403, new { error = "PREMIUM_REQUIRED", message = "Khóa học này yêu cầu tài khoản Premium để truy cập." });
                }
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
            // Quiz liên kết nằm trên ModuleItem riêng (ItemType=Quiz) cùng module với lesson.
            // LM-028: heuristic "quiz ngay sau lesson" — quiz chỉ gắn cho lesson N khi không có
            // lesson item nào chen giữa (order quiz nằm giữa lesson N và lesson N+1).
            var quizItemsByModule = course.Modules
                .SelectMany(m => m.Items)
                .Where(i => i.ItemType == ModuleItemType.Quiz && i.QuizId.HasValue && !i.IsDeleted)
                .GroupBy(i => i.ModuleId)
                .ToDictionary(
                    g => g.Key,
                    g => g.OrderBy(i => i.OrderIndex).Select(i => (Id: i.QuizId, Order: i.OrderIndex)).ToList());
            // Ranh giới "lesson kế tiếp" theo module — chặn quiz của lesson sau dính vào lesson trước.
            var lessonOrdersByModule = course.Modules
                .SelectMany(m => m.Items)
                .Where(i => i.ItemType == ModuleItemType.Lesson && !i.IsDeleted)
                .Select(i => new { i.ModuleId, i.OrderIndex })
                .ToList();
            // Sắp theo (module OrderIndex, item OrderIndex) — mỗi chặng đếm OrderIndex lại từ 1000
            // nên sort toàn cục theo OrderIndex sẽ trộn thứ tự giữa các chặng.
            var orderedLessonItems = course.Modules
                .SelectMany(m => m.Items.Select(i => new { Item = i, ModuleOrder = m.OrderIndex }))
                .Where(x => x.Item.ItemType == ModuleItemType.Lesson && !x.Item.IsDeleted)
                .OrderBy(x => x.ModuleOrder)
                .ThenBy(x => x.Item.OrderIndex)
                .Select(x => x.Item)
                .ToList();
            // Gom toàn bộ progress trong 1 query (khử N+1 — trước đây 1 query/lesson).
            Dictionary<Guid, string> lessonStatusMap = new();
            if (targetUserId.HasValue)
            {
                var lessonIds = orderedLessonItems
                    .Where(i => i.Lesson != null)
                    .Select(i => i.Lesson!.Id)
                    .Distinct()
                    .ToList();
                if (lessonIds.Count > 0)
                {
                    lessonStatusMap = await _dbContext.UserLessonProgresses
                        .Where(p => p.UserId == targetUserId.Value && lessonIds.Contains(p.LessonId))
                        .GroupBy(p => p.LessonId)
                        .Select(g => new { LessonId = g.Key, Status = g.First().Status })
                        .ToDictionaryAsync(x => x.LessonId, x => x.Status);
                }
            }

            foreach (var item in orderedLessonItems)
            {
                var l = item.Lesson;
                // Lọc bài chưa Published cho user không phải Admin/chủ sở hữu
                // (LM-059: teacher khác không xem draft của khóa người khác).
                if (l.PublishStatus != VisualizationDSA.Domain.Enums.LessonPublishStatus.Published
                    && !isOwner && !JwtHelper.IsAdmin(Request))
                {
                    continue;
                }

                var status = lessonStatusMap.TryGetValue(l.Id, out var s) ? s : "NotStarted";

                Guid? linkedQuizId = null;
                if (quizItemsByModule.TryGetValue(item.ModuleId, out var quizCandidates))
                {
                    var nextLessonOrder = lessonOrdersByModule
                        .Where(x => x.ModuleId == item.ModuleId && x.OrderIndex > item.OrderIndex)
                        .Select(x => (int?)x.OrderIndex)
                        .DefaultIfEmpty(null)
                        .Min();
                    var upperBound = nextLessonOrder ?? int.MaxValue;
                    linkedQuizId = quizCandidates
                        .FirstOrDefault(q => q.Order > item.OrderIndex && q.Order < upperBound)
                        .Id;
                }

                lessonsList.Add(new
                {
                    l.Id,
                    l.Title,
                    l.ContentMd,
                    l.SandboxType,
                    l.SandboxConfig,
                    QuizId = linkedQuizId,
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

            // Enum rỗng/lạ → 400 thay vì FormatException 500.
            if (!Enum.TryParse<CourseCategory>(dto.Category, true, out var category))
                return BadRequest(new { error = "INVALID_CATEGORY", message = "Danh mục khóa học không hợp lệ." });
            if (!Enum.TryParse<CourseDifficulty>(dto.Difficulty, true, out var difficulty))
                return BadRequest(new { error = "INVALID_DIFFICULTY", message = "Độ khó không hợp lệ." });

            var command = new CreateCourseCommand(
                teacherId,
                dto.Title,
                dto.Description,
                dto.Thumbnail,
                dto.ExpectedTime,
                category.ToString(),
                difficulty.ToString(),
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
            // Chống IDOR: teacher chỉ được sửa khóa học do chính mình tạo (Admin được phép).
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (userIdStr == null || !Guid.TryParse(userIdStr, out var currentUserId)) return Unauthorized();

            var course = await _dbContext.Courses.FindAsync(courseId);
            if (course == null) return NotFound(new { error = "COURSE_NOT_FOUND", message = "Không tìm thấy khóa học." });
            if (!IsOwnerOrAdmin(course, currentUserId)) return StatusCode(403, new { error = "FORBIDDEN", message = "Bạn không có quyền chỉnh sửa khóa học này." });

            var command = new AddModuleCommand(courseId, dto.Title, dto.Description, dto.OrderIndex);
            Guid resultId;
            try
            {
                resultId = await _mediator.Send(command);
            }
            catch (DbUpdateException)
            {
                // LM-033: trùng (CourseId, OrderIndex) — index unique → 409 thay vì 500.
                return Conflict(new { error = "ORDER_INDEX_CONFLICT", message = "OrderIndex đã tồn tại trong khóa học này." });
            }
            return Ok(new { message = "Thêm module thành công!", moduleId = resultId });
        }

        [HttpPost("modules/{moduleId}/items")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> AddModuleItem(Guid moduleId, [FromBody] AddModuleItemDto dto)
        {
            // Chống IDOR: kiểm tra quyền sở hữu khóa học chứa module trước khi thêm item.
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (userIdStr == null || !Guid.TryParse(userIdStr, out var currentUserId)) return Unauthorized();

            var module = await _dbContext.CourseModules.FindAsync(moduleId);
            if (module == null) return NotFound(new { error = "MODULE_NOT_FOUND", message = "Không tìm thấy module." });
            var course = await _dbContext.Courses.FindAsync(module.CourseId);
            if (course == null) return NotFound(new { error = "COURSE_NOT_FOUND", message = "Không tìm thấy khóa học." });
            if (!IsOwnerOrAdmin(course, currentUserId)) return StatusCode(403, new { error = "FORBIDDEN", message = "Bạn không có quyền chỉnh sửa khóa học này." });

            if (!Enum.TryParse<ModuleItemType>(dto.ItemType, true, out var itemType))
                return BadRequest(new { error = "INVALID_ITEM_TYPE", message = "Loại item không hợp lệ." });

            // LM-011: validate nội dung tham chiếu thuộc chủ sở hữu khóa học — chống teacher
            // gắn lesson/codelab của teacher khác (cross-course leak). Quiz không có trường
            // chủ sở hữu nên chỉ validate tồn tại + chưa xóa.
            var isAdmin = JwtHelper.IsAdmin(Request);
            if (itemType == ModuleItemType.Lesson && dto.LessonId.HasValue)
            {
                var refLesson = await _dbContext.Lessons.FindAsync(dto.LessonId.Value);
                if (refLesson == null || refLesson.IsDeleted)
                    return NotFound(new { error = "LESSON_NOT_FOUND", message = "Không tìm thấy bài học cần gắn." });
                if (!isAdmin && refLesson.CreatedByTeacherId != course.TeacherId)
                    return StatusCode(403, new { error = "FORBIDDEN", message = "Bài học này không thuộc khóa học của bạn." });
            }
            else if (itemType == ModuleItemType.Codelab && dto.CodelabId.HasValue)
            {
                var refCodelab = await _dbContext.Codelabs.FindAsync(dto.CodelabId.Value);
                if (refCodelab == null || refCodelab.IsDeleted)
                    return NotFound(new { error = "CODELAB_NOT_FOUND", message = "Không tìm thấy codelab cần gắn." });
                if (!isAdmin && refCodelab.OwnerId != course.TeacherId)
                    return StatusCode(403, new { error = "FORBIDDEN", message = "Codelab này không thuộc khóa học của bạn." });
            }
            else if (itemType == ModuleItemType.Quiz && dto.QuizId.HasValue)
            {
                var refQuiz = await _dbContext.Quizzes.FindAsync(dto.QuizId.Value);
                if (refQuiz == null || refQuiz.IsDeleted)
                    return NotFound(new { error = "QUIZ_NOT_FOUND", message = "Không tìm thấy quiz cần gắn." });
            }

            var command = new AddModuleItemCommand(
                moduleId, 
                itemType, 
                dto.LessonId, 
                dto.QuizId, 
                dto.CodelabId, 
                dto.OverrideTitle, 
                dto.OrderIndex, 
                dto.IsRequired);
            Guid resultId;
            try
            {
                resultId = await _mediator.Send(command);
            }
            catch (DbUpdateException)
            {
                // LM-033: trùng (ModuleId, OrderIndex) — index unique → 409 thay vì 500.
                return Conflict(new { error = "ORDER_INDEX_CONFLICT", message = "OrderIndex đã tồn tại trong module này." });
            }
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

            var course = await _dbContext.Courses
                .Include(c => c.Modules)
                    .ThenInclude(m => m.Items)
                        .ThenInclude(i => i.Lesson)
                .FirstOrDefaultAsync(c => c.Id == id);
            if (course == null) return NotFound(new { error = "COURSE_NOT_FOUND", message = "Không tìm thấy khóa học." });

            if (!IsOwnerOrAdmin(course, currentUserId)) return StatusCode(403, new { error = "FORBIDDEN", message = "Bạn không có quyền xóa khóa học này." });

            // T1-GUARD: Cascade delete theo thứ tự FK đảo để tránh orphan data.
            // 1. Xóa Lessons liên quan qua ModuleItems (Lesson.Id → UserLessonProgress cascade)
            var lessonIds = course.Modules.SelectMany(m => m.Items)
                .Where(i => i.ItemType == ModuleItemType.Lesson && i.LessonId.HasValue)
                .Select(i => i.LessonId!.Value)
                .ToList();
            if (lessonIds.Any())
            {
                await _dbContext.UserLessonProgresses
                    .Where(p => lessonIds.Contains(p.LessonId))
                    .ExecuteDeleteAsync();
                await _dbContext.Lessons
                    .Where(l => lessonIds.Contains(l.Id))
                    .ExecuteDeleteAsync();
            }

            // 2. Xóa ClassroomLesson references (nếu classroom đã import)
            await _dbContext.ClassroomLessons
                .Where(cl => lessonIds.Contains(cl.LessonId))
                .ExecuteDeleteAsync();

            // 3. Xóa ModuleItems + ClassroomModuleItems liên quan
            var moduleItemIds = course.Modules.SelectMany(m => m.Items).Select(i => i.Id).ToList();
            if (moduleItemIds.Any())
            {
                await _dbContext.ClassroomModuleItemOverrides
                    .Where(o => moduleItemIds.Contains(o.ModuleItemId))
                    .ExecuteDeleteAsync();
                await _dbContext.UserModuleItemProgresses
                    .Where(p => moduleItemIds.Contains(p.ModuleItemId))
                    .ExecuteDeleteAsync();
            }

            // 4. Xóa CourseModules (cascade sẽ xóa ModuleItems)
            var moduleIds = course.Modules.Select(m => m.Id).ToList();
            if (moduleIds.Any())
            {
                await _dbContext.ClassroomModules
                    .Where(cm => moduleIds.Contains(cm.Id))
                    .ExecuteDeleteAsync();
            }

            // 5. Xóa khóa học
            _dbContext.Courses.Remove(course);
            await _dbContext.SaveChangesAsync();

            var lessonCount = lessonIds.Count;
            return Ok(new { message = $"Xóa khóa học thành công! Đã xóa {lessonCount} bài giảng và dữ liệu liên quan." });
        }

        [HttpPost("courses/{courseId}/lessons")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> CreateLesson(Guid courseId, [FromBody] CreateLessonDto dto)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (userIdStr == null || !Guid.TryParse(userIdStr, out var currentUserId)) return Unauthorized();

            // Admin (không phải chủ sở hữu) được phép tạo bài — handler chỉ chấp nhận owner id.
            var course = await _dbContext.Courses.FindAsync(courseId);
            if (course == null) return NotFound(new { error = "COURSE_NOT_FOUND", message = "Không tìm thấy khóa học." });
            if (!IsOwnerOrAdmin(course, currentUserId)) return StatusCode(403, new { error = "FORBIDDEN", message = "Bạn không có quyền chỉnh sửa khóa học này." });

            var command = new VisualizationDSA.Application.Features.Lessons.Commands.CreateDraftLesson.CreateDraftLessonCommand
            {
                TeacherId = course.TeacherId,
                CourseId = courseId,
                ModuleId = dto.ModuleId,
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

        // LM-001 (P0): PUT/DELETE /lessons/{id} CHỈ tồn tại ở LessonController
        // (/api/v1/concepts/lessons/{id}) — bản trùng tại CourseController bị XÓA để hết
        // AmbiguousMatchException 500. Nội dung cập nhật/xóa lesson do LessonController đảm nhiệm.

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

            // LM-029: chỉ đếm lesson còn tồn tại (Lesson != null && !IsDeleted) — trước đây NRE
            // khi item trỏ lesson đã xóa.
            var totalLessons = course.Modules.SelectMany(m => m.Items).Count(i => i.ItemType == ModuleItemType.Lesson && i.Lesson != null && !i.IsDeleted);
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

            var lessonIds = course.Modules.SelectMany(m => m.Items).Where(i => i.ItemType == ModuleItemType.Lesson && i.LessonId.HasValue && i.Lesson != null && !i.IsDeleted).Select(i => i.LessonId!.Value).ToList();
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
                    .Where(i => i.ItemType == ModuleItemType.Quiz && i.QuizId.HasValue && !i.IsDeleted)
                    .Select(i => i.QuizId!.Value)
                    .Distinct()
                    .ToList();

                if (quizIds.Count > 0)
                {
                    var quizAttempts = await _dbContext.QuizAttempts
                        // PR-002: QuizId nullable — attempt bank quiz (không thuộc course) bị loại.
                        .Where(a => a.QuizId.HasValue && quizIds.Contains(a.QuizId!.Value) && activeUserIds.Contains(a.UserId))
                        .Select(a => a.Score)
                        .ToListAsync();

                    if (quizAttempts.Count > 0)
                    {
                        averageQuizScore = Math.Round(quizAttempts.Average(), 1);
                    }
                }

                // Gom thống kê trạng thái bài học trong 1 query (khử 2N CountAsync — trước đây 2 query/lesson).
                var lessonIdsForStats = course.Modules
                    .SelectMany(m => m.Items)
                    .Where(i => i.ItemType == ModuleItemType.Lesson && i.Lesson != null && !i.IsDeleted)
                    .Select(i => i.Lesson!.Id)
                    .Distinct()
                    .ToList();
                var statusCounts = lessonIdsForStats.Count > 0
                    ? (IEnumerable<dynamic>)await _dbContext.UserLessonProgresses
                        .Where(p => lessonIdsForStats.Contains(p.LessonId))
                        .GroupBy(p => new { p.LessonId, p.Status })
                        .Select(g => new { g.Key.LessonId, g.Key.Status, Count = g.Count() })
                        .ToListAsync()
                    : Array.Empty<dynamic>();

                var statusLookup = statusCounts
                    .Cast<dynamic>()
                    .GroupBy(x => (Guid)x.LessonId)
                    .ToDictionary(g => g.Key, g => g.ToDictionary(x => (string)x.Status, x => (int)x.Count));

                // LM-029: chỉ xếp hạng lesson còn tồn tại (Lesson != null && !IsDeleted) — tránh NRE.
                foreach (var entry in course.Modules.SelectMany(m => m.Items)
                    .Where(i => i.ItemType == ModuleItemType.Lesson && i.Lesson != null && !i.IsDeleted)
                    .Select(i => new { Item = i, ModuleOrder = i.Module != null ? i.Module.OrderIndex : 0 })
                    .OrderBy(x => x.ModuleOrder).ThenBy(x => x.Item.OrderIndex))
                {
                    var item = entry.Item;
                    var lesson = item.Lesson;
                    statusLookup.TryGetValue(lesson.Id, out var perLesson);
                    var startedCount = perLesson != null && perLesson.TryGetValue("InProgress", out var sc) ? sc : 0;
                    var completedCount = perLesson != null && perLesson.TryGetValue("Completed", out var cc) ? cc : 0;

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
        public Guid? ModuleId { get; set; }
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
