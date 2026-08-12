using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VisualizationDSA.Application.Interfaces;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.WebApi.Filters;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiController]
    [Route("api/v{version:apiVersion}/classrooms")]
    [RequireJwtRole]
    public class ClassroomProgressController : ControllerBase
    {
        private readonly IClassroomProgressService _progressService;
        private readonly IClassroomUnlockRuleEngine _unlockRuleEngine;
        private readonly IApplicationDbContext _context;

        public ClassroomProgressController(
            IClassroomProgressService progressService,
            IClassroomUnlockRuleEngine unlockRuleEngine,
            IApplicationDbContext context)
        {
            _progressService = progressService;
            _unlockRuleEngine = unlockRuleEngine;
            _context = context;
        }

        // CR-017: /my-progress KHÔNG enroll → 403 (trước đây service ném UnauthorizedAccessException
        // → 500). Đồng nhất với unlocked-items (403) thay vì middleware 401.
        [HttpGet("{classroomId:guid}/my-progress")]
        public async Task<IActionResult> GetMyProgress(Guid classroomId)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (!Guid.TryParse(userIdStr, out var studentId))
                return Unauthorized();

            try
            {
                var summary = await _progressService.GetProgressSummaryAsync(classroomId, studentId);
                return Ok(summary);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { error = "FORBIDDEN", message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { error = "CLASSROOM_NOT_FOUND", message = ex.Message });
            }
        }

        [HttpGet("{classroomId:guid}/unlocked-items")]
        public async Task<IActionResult> GetUnlockedItems(Guid classroomId)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (!Guid.TryParse(userIdStr, out var studentId))
                return Unauthorized();

            // LM-007: IDOR — kiểm tra enrollment TRƯỚC khi trả unlock của classroom
            // (trước đây đọc được unlock của classroom bất kỳ chỉ cần token hợp lệ).
            var classroomExists = await _context.Classrooms.AnyAsync(c => c.Id == classroomId);
            if (!classroomExists)
                return NotFound(new { error = "CLASSROOM_NOT_FOUND", message = "Không tìm thấy lớp học." });

            var enrolled = await _context.ClassroomEnrollments.AnyAsync(e =>
                e.ClassroomId == classroomId
                && e.StudentId == studentId
                && e.Status == VisualizationDSA.Domain.Enums.EnrollmentStatus.Active);
            if (!enrolled)
                return StatusCode(403, new { error = "FORBIDDEN", message = "Bạn không đăng ký lớp học này." });

            var itemIds = await _progressService.GetUnlockedItemIdsAsync(classroomId, studentId);
            return Ok(new { unlockedItemIds = itemIds });
        }

        [HttpPost("module-items/{moduleItemId}/start")]
        public async Task<IActionResult> StartModuleItem(Guid moduleItemId)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (!Guid.TryParse(userIdStr, out var studentId))
                return Unauthorized();

            var classroomId = await GetClassroomIdForItem(moduleItemId);
            if (classroomId == null)
                return NotFound(new { error = "MODULE_ITEM_NOT_FOUND", message = "Không tìm thấy bài học." });

            try
            {
                var result = await _progressService.StartItemAsync(classroomId.Value, moduleItemId, studentId);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { error = "FORBIDDEN", message = ex.Message });
            }
        }

        [HttpPut("module-items/{moduleItemId}/progress")]
        public async Task<IActionResult> UpdateProgress(Guid moduleItemId, [FromBody] UpdateProgressRequest request)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (!Guid.TryParse(userIdStr, out var studentId))
                return Unauthorized();

            var classroomId = await GetClassroomIdForItem(moduleItemId);
            if (classroomId == null)
                return NotFound(new { error = "MODULE_ITEM_NOT_FOUND", message = "Không tìm thấy bài học." });

            try
            {
                var result = await _progressService.UpdateProgressAsync(classroomId.Value, moduleItemId, studentId, request.ActiveFrame, request.ScrollPercent);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { error = "FORBIDDEN", message = ex.Message });
            }
        }

        [HttpPost("module-items/{moduleItemId}/complete")]
        public async Task<IActionResult> CompleteModuleItem(Guid moduleItemId, [FromBody] CompleteItemRequest request)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (!Guid.TryParse(userIdStr, out var studentId))
                return Unauthorized();

            var classroomId = await GetClassroomIdForItem(moduleItemId);
            if (classroomId == null)
                return NotFound(new { error = "MODULE_ITEM_NOT_FOUND", message = "Không tìm thấy bài học." });

            // CR-020: KHÔNG tin điểm client tự khai.
            //  - Lesson: chặn score client (Lesson không có điểm — luôn null/0).
            //  - Quiz/Codelab: lấy score từ dữ liệu nội bộ (attempt/submission tốt nhất).
            var score = await ResolveScoreFromServerAsync(moduleItemId, classroomId.Value, studentId, request.Score);

            try
            {
                var result = await _progressService.CompleteItemAsync(classroomId.Value, moduleItemId, studentId, score);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { error = "FORBIDDEN", message = ex.Message });
            }
        }

        [HttpGet("module-items/{moduleItemId}/unlock-status")]
        public async Task<IActionResult> GetUnlockStatus(Guid moduleItemId)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (!Guid.TryParse(userIdStr, out var studentId))
                return Unauthorized();

            var moduleItem = await GetModuleItemWithClassroom(moduleItemId);
            if (moduleItem == null)
                return NotFound(new { error = "MODULE_ITEM_NOT_FOUND" });

            var classroomId = moduleItem.Module?.ClassroomId;
            if (classroomId == null)
                return NotFound(new { error = "MODULE_ITEM_NOT_FOUND" });

            // CR-016: chỉ học viên enrollment ACTIVE nhận unlock-status — học viên bị kick
            // trước đây vẫn nhận isUnlocked=true (engine chỉ check tồn tại enrollment).
            var enrolled = await _context.ClassroomEnrollments.AnyAsync(e =>
                e.ClassroomId == classroomId
                && e.StudentId == studentId
                && e.Status == VisualizationDSA.Domain.Enums.EnrollmentStatus.Active);
            if (!enrolled)
                return StatusCode(403, new { error = "FORBIDDEN", message = "Bạn không đăng ký lớp học này." });

            var isUnlocked = await _unlockRuleEngine.IsItemUnlockedAsync(classroomId.Value, moduleItemId, studentId);
            var reason = await _unlockRuleEngine.GetUnlockReasonAsync(classroomId.Value, moduleItemId, studentId);

            return Ok(new { isUnlocked, reason });
        }

        /// <summary>
        /// CR-020: xác định điểm hoàn thành từ phía SERVER.
        /// - Lesson: bỏ qua score client (không có điểm).
        /// - Quiz: lấy điểm % của ClassroomQuizAttempt tốt nhất của học viên.
        /// - Codelab: lấy điểm CodelabSubmission tốt nhất của học viên.
        /// </summary>
        private async Task<int?> ResolveScoreFromServerAsync(Guid moduleItemId, Guid classroomId, Guid studentId, int? clientScore)
        {
            var item = await _context.ClassroomModuleItems
                .FirstOrDefaultAsync(i => i.Id == moduleItemId && !i.IsDeleted);

            if (item == null) return null;

            if (item.ItemType == ModuleItemType.Lesson)
            {
                // Lesson không chấm điểm — client tự khai bị bỏ qua hoàn toàn.
                return null;
            }

            if (item.ItemType == ModuleItemType.Quiz && item.QuizId.HasValue)
            {
                // Map ClassroomModuleItem.QuizId → ClassroomQuiz (cùng classroom) → attempt tốt nhất.
                var bestPct = await _context.Set<ClassroomQuizAttempt>()
                    .Where(a => a.ClassroomQuiz.ClassroomId == classroomId
                        && a.ClassroomQuiz.QuizId == item.QuizId.Value
                        && a.StudentId == studentId)
                    .OrderByDescending(a => a.Score)
                    .Select(a => a.MaxScore > 0 ? (int?)((int)(a.Score * 100.0 / a.MaxScore)) : (int?)a.Score)
                    .FirstOrDefaultAsync();

                return bestPct;
            }

            if (item.ItemType == ModuleItemType.Codelab && item.CodelabId.HasValue)
            {
                var bestScore = await _context.CodelabSubmissions
                    .Where(s => s.CodelabId == item.CodelabId.Value && s.UserId == studentId)
                    .OrderByDescending(s => s.Score)
                    .Select(s => (int?)s.Score)
                    .FirstOrDefaultAsync();

                return bestScore;
            }

            // Loại không xác định — không tin client.
            return null;
        }

        private async Task<Guid?> GetClassroomIdForItem(Guid moduleItemId)
        {
            var item = await _context.ClassroomModuleItems
                .Include(i => i.Module)
                .FirstOrDefaultAsync(i => i.Id == moduleItemId && !i.IsDeleted);

            if (item?.Module == null) return null;

            var classroom = await _context.Classrooms
                .FirstOrDefaultAsync(c => c.Modules.Any(m => m.Id == item.ModuleId));

            return classroom?.Id;
        }

        private async Task<ClassroomModuleItem?> GetModuleItemWithClassroom(Guid moduleItemId)
        {
            return await _context.ClassroomModuleItems
                .Include(i => i.Module)
                .FirstOrDefaultAsync(i => i.Id == moduleItemId && !i.IsDeleted);
        }
    }

    public class UpdateProgressRequest
    {
        public int ActiveFrame { get; set; }
        public double ScrollPercent { get; set; }
    }

    public class CompleteItemRequest
    {
        // CR-020: score client KHÔNG còn được tin cậy cho Lesson; Quiz/Codelab được
        // tính lại từ server. Giữ field để tương thích contract cũ.
        public int? Score { get; set; }
    }
}
