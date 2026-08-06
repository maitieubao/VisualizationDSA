using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MediatR;
using System;
using System.Threading.Tasks;
using VisualizationDSA.Application.Features.Codelabs.Commands;
using VisualizationDSA.Application.Features.Codelabs.Queries;
using VisualizationDSA.WebApi.Filters;
using VisualizationDSA.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiController]
    [Route("api/v1/codelabs")]
    [RequireJwtRole]
    public class CodelabController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ApplicationDbContext _dbContext;

        public CodelabController(IMediator mediator, ApplicationDbContext dbContext)
        {
            _mediator = mediator;
            _dbContext = dbContext;
        }

        /// <summary>Chống IDOR: chỉ owner (hoặc Admin) được sửa codelab; dữ liệu cũ (OwnerId null) chỉ Admin.</summary>
        private async Task<IActionResult?> RequireCodelabOwnershipAsync(Guid codelabId, Guid currentUserId)
        {
            var codelab = await _dbContext.Codelabs
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == codelabId);
            if (codelab == null)
                return NotFound(new { error = "CODELAB_NOT_FOUND", message = "Không tìm thấy bài lập trình." });

            var isAdmin = JwtHelper.IsAdmin(Request);
            if (codelab.OwnerId == null)
                return isAdmin ? null : StatusCode(403, new { error = "FORBIDDEN", message = "Bạn không có quyền chỉnh sửa bài lập trình này." });
            if (codelab.OwnerId != currentUserId && !isAdmin)
                return StatusCode(403, new { error = "FORBIDDEN", message = "Bạn không có quyền chỉnh sửa bài lập trình này." });
            return null;
        }

        private async Task<(IActionResult? Block, Guid UserId)> GetCurrentUserAndCheckAsync(Guid id)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            // Admin memory (admin-user-001/002) không phải GUID — cho qua để bypass IsAdmin.
            if (JwtHelper.IsAdmin(Request))
                return (null, Guid.Empty);
            // demo-user-001 (dev) không phải GUID — map sang GUID cố định để demo vẫn sửa được codelab.
            var resolved = userIdStr == "demo-user-001"
                ? Guid.Parse("00000000-0000-0000-0000-000000000001")
                : Guid.TryParse(userIdStr, out var g) ? g : Guid.Empty;
            if (resolved == Guid.Empty)
                return (Unauthorized(), Guid.Empty);
            return (await RequireCodelabOwnershipAsync(id, resolved), resolved);
        }

        [HttpGet]
        public async Task<IActionResult> GetCodelabs(
            [FromQuery] string? tag,
            [FromQuery] int? difficulty,
            [FromQuery] string? search,
            [FromQuery] string? language,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            var items = await _mediator.Send(new GetCodelabsQuery
            {
                Tag = tag,
                Difficulty = difficulty,
                Search = search,
                Language = language,
                Page = page,
                PageSize = pageSize
            });
            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCodelab(Guid id)
        {
            var result = await _mediator.Send(new GetCodelabByIdQuery { CodelabId = id });
            return Ok(result);
        }

        [HttpPost]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> CreateCodelab([FromBody] CreateCodelabCommand command)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            // Admin: KHÔNG tin OwnerId client gửi — cố định null (admin-owned, chỉ Admin sửa).
            // Trước đây admin (sub không GUID) giữ nguyên OwnerId client → gán codelab cho học viên.
            if (JwtHelper.IsAdmin(Request))
            {
                command.OwnerId = null;
            }
            // demo-user-001 (dev) không phải GUID — map sang GUID cố định.
            else if (userIdStr == "demo-user-001")
            {
                command.OwnerId = Guid.Parse("00000000-0000-0000-0000-000000000001");
            }
            else if (Guid.TryParse(userIdStr, out var ownerId))
            {
                command.OwnerId = ownerId;
            }
            else
            {
                // Fail-closed: sub không phải GUID (không admin/demo) → KHÔNG tin OwnerId client.
                command.OwnerId = null;
            }
            var id = await _mediator.Send(command);
            return Ok(new { id });
        }

        [HttpPut("{id}")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> UpdateCodelab(Guid id, [FromBody] UpdateCodelabCommand command)
        {
            var (block, _) = await GetCurrentUserAndCheckAsync(id);
            if (block != null) return block;
            command.CodelabId = id;
            await _mediator.Send(command);
            return Ok(new { id });
        }

        [HttpDelete("{id}")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> DeleteCodelab(Guid id)
        {
            var (block, _) = await GetCurrentUserAndCheckAsync(id);
            if (block != null) return block;
            await _mediator.Send(new DeleteCodelabCommand { CodelabId = id });
            return Ok(new { success = true });
        }

        [HttpPost("{id}/testcases")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> AddTestCase(Guid id, [FromBody] AddTestCaseCommand command)
        {
            var (block, _) = await GetCurrentUserAndCheckAsync(id);
            if (block != null) return block;
            command.CodelabId = id;
            var testCaseId = await _mediator.Send(command);
            return Ok(new { id = testCaseId });
        }

        [HttpPut("{id}/testcases/{testCaseId}")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> UpdateTestCase(Guid id, Guid testCaseId, [FromBody] UpdateTestCaseCommand command)
        {
            var (block, _) = await GetCurrentUserAndCheckAsync(id);
            if (block != null) return block;
            command.TestCaseId = testCaseId;
            await _mediator.Send(command);
            return Ok(new { id = testCaseId });
        }

        [HttpDelete("{id}/testcases/{testCaseId}")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> DeleteTestCase(Guid id, Guid testCaseId)
        {
            var (block, _) = await GetCurrentUserAndCheckAsync(id);
            if (block != null) return block;
            await _mediator.Send(new DeleteTestCaseCommand { CodelabId = id, TestCaseId = testCaseId });
            return Ok(new { success = true });
        }

        [HttpPost("{id}/templates")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> AddTemplate(Guid id, [FromBody] AddTemplateCommand command)
        {
            var (block, _) = await GetCurrentUserAndCheckAsync(id);
            if (block != null) return block;
            command.CodelabId = id;
            var templateId = await _mediator.Send(command);
            return Ok(new { id = templateId });
        }

        [HttpPut("{id}/templates/{templateId}")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> UpdateTemplate(Guid id, Guid templateId, [FromBody] UpdateTemplateCommand command)
        {
            var (block, _) = await GetCurrentUserAndCheckAsync(id);
            if (block != null) return block;
            command.TemplateId = templateId;
            await _mediator.Send(command);
            return Ok(new { id = templateId });
        }

        [HttpDelete("{id}/templates/{templateId}")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> DeleteTemplate(Guid id, Guid templateId)
        {
            var (block, _) = await GetCurrentUserAndCheckAsync(id);
            if (block != null) return block;
            await _mediator.Send(new DeleteTemplateCommand { CodelabId = id, TemplateId = templateId });
            return Ok(new { success = true });
        }

        [HttpPost("{id}/hints")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> AddHint(Guid id, [FromBody] AddHintCommand command)
        {
            var (block, _) = await GetCurrentUserAndCheckAsync(id);
            if (block != null) return block;
            command.CodelabId = id;
            var hintId = await _mediator.Send(command);
            return Ok(new { id = hintId });
        }

        [HttpPut("{id}/hints/{hintId}")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> UpdateHint(Guid id, Guid hintId, [FromBody] UpdateHintCommand command)
        {
            var (block, _) = await GetCurrentUserAndCheckAsync(id);
            if (block != null) return block;
            command.HintId = hintId;
            await _mediator.Send(command);
            return Ok(new { id = hintId });
        }

        [HttpDelete("{id}/hints/{hintId}")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> DeleteHint(Guid id, Guid hintId)
        {
            var (block, _) = await GetCurrentUserAndCheckAsync(id);
            if (block != null) return block;
            await _mediator.Send(new DeleteHintCommand { CodelabId = id, HintId = hintId });
            return Ok(new { success = true });
        }
    }
}
