using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.WebApi.Filters;

namespace VisualizationDSA.WebApi.Controllers
{
    /// <summary>
    /// F5 (FR-2.6) — Ghi chú bài học của người dùng hiện tại.
    /// GET/PUT/DELETE /api/v1/lessons/{lessonId}/note (upsert theo bài học).
    /// </summary>
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/lessons/{lessonId}/note")]
    [RequireJwtRole]
    public class LessonNotesController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public LessonNotesController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetNote(Guid lessonId)
        {
            var userIdResult = TryGetCurrentUserId(out var userId);
            if (userIdResult != null) return userIdResult;

            var note = await _dbContext.Set<LessonNote>()
                .AsNoTracking()
                .FirstOrDefaultAsync(n => n.UserId == userId && n.LessonId == lessonId);

            return Ok(new
            {
                note = note == null
                    ? null
                    : new { note.ContentHtml, note.UpdatedAt }
            });
        }

        [HttpPut]
        public async Task<IActionResult> UpsertNote(Guid lessonId, [FromBody] UpsertLessonNoteDto dto)
        {
            var userIdResult = TryGetCurrentUserId(out var userId);
            if (userIdResult != null) return userIdResult;

            if (dto == null)
                return BadRequest(new { error = "INVALID_CONTENT", message = "Nội dung ghi chú không hợp lệ." });

            // F5 review: chặn sớm lesson không tồn tại — nếu không FK violation ném 500 khi SaveChanges.
            var lessonExists = await _dbContext.Lessons.AsNoTracking()
                .AnyAsync(l => l.Id == lessonId && !l.IsDeleted);
            if (!lessonExists)
                return NotFound(new { error = "LESSON_NOT_FOUND", message = "Không tìm thấy bài học." });

            var content = dto.ContentHtml ?? string.Empty;
            if (content.Length > 20000)
                return BadRequest(new { error = "INVALID_CONTENT", message = "Ghi chú quá dài (tối đa 20.000 ký tự)." });

            var note = await _dbContext.Set<LessonNote>()
                .FirstOrDefaultAsync(n => n.UserId == userId && n.LessonId == lessonId);

            if (note == null)
            {
                note = new LessonNote(userId, lessonId, content);
                _dbContext.Set<LessonNote>().Add(note);
            }
            else
            {
                note.UpdateContent(content);
            }

            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                message = "Đã lưu ghi chú.",
                note = new { note.ContentHtml, note.UpdatedAt }
            });
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteNote(Guid lessonId)
        {
            var userIdResult = TryGetCurrentUserId(out var userId);
            if (userIdResult != null) return userIdResult;

            var note = await _dbContext.Set<LessonNote>()
                .FirstOrDefaultAsync(n => n.UserId == userId && n.LessonId == lessonId);

            if (note == null)
                return Ok(new { message = "Không có ghi chú để xóa." });

            _dbContext.Set<LessonNote>().Remove(note);
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Đã xóa ghi chú." });
        }

        private IActionResult? TryGetCurrentUserId(out Guid userId)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (userIdStr == null || !Guid.TryParse(userIdStr, out userId))
            {
                userId = Guid.Empty;
                return Unauthorized(new { error = "UNAUTHORIZED", message = "Yêu cầu đăng nhập." });
            }

            return null;
        }
    }

    public record UpsertLessonNoteDto(string ContentHtml);
}
