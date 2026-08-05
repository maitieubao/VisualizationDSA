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

        [HttpGet("{classroomId:guid}/my-progress")]
        public async Task<IActionResult> GetMyProgress(Guid classroomId)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (!Guid.TryParse(userIdStr, out var studentId))
                return Unauthorized();

            var summary = await _progressService.GetProgressSummaryAsync(classroomId, studentId);
            return Ok(summary);
        }

        [HttpGet("{classroomId:guid}/unlocked-items")]
        public async Task<IActionResult> GetUnlockedItems(Guid classroomId)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (!Guid.TryParse(userIdStr, out var studentId))
                return Unauthorized();

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
                return NotFound(new { error = "MODULE_ITEM_NOT_FOUND" });

            var result = await _progressService.StartItemAsync(classroomId.Value, moduleItemId, studentId);
            return Ok(result);
        }

        [HttpPut("module-items/{moduleItemId}/progress")]
        public async Task<IActionResult> UpdateProgress(Guid moduleItemId, [FromBody] UpdateProgressRequest request)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (!Guid.TryParse(userIdStr, out var studentId))
                return Unauthorized();

            var classroomId = await GetClassroomIdForItem(moduleItemId);
            if (classroomId == null)
                return NotFound(new { error = "MODULE_ITEM_NOT_FOUND" });

            var result = await _progressService.UpdateProgressAsync(classroomId.Value, moduleItemId, studentId, request.ActiveFrame, request.ScrollPercent);
            return Ok(result);
        }

        [HttpPost("module-items/{moduleItemId}/complete")]
        public async Task<IActionResult> CompleteModuleItem(Guid moduleItemId, [FromBody] CompleteItemRequest request)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (!Guid.TryParse(userIdStr, out var studentId))
                return Unauthorized();

            var classroomId = await GetClassroomIdForItem(moduleItemId);
            if (classroomId == null)
                return NotFound(new { error = "MODULE_ITEM_NOT_FOUND" });

            var result = await _progressService.CompleteItemAsync(classroomId.Value, moduleItemId, studentId, request.Score);
            return Ok(result);
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

            var isUnlocked = await _unlockRuleEngine.IsItemUnlockedAsync(classroomId.Value, moduleItemId, studentId);
            var reason = await _unlockRuleEngine.GetUnlockReasonAsync(classroomId.Value, moduleItemId, studentId);

            return Ok(new { isUnlocked, reason });
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
        public int? Score { get; set; }
    }
}