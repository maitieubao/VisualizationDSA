using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VisualizationDSA.Application.DTOs.PracticeLadder;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Application.Common.Interfaces;
using VisualizationDSA.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/nodes")]
    [Authorize]
    public class NodesController : ControllerBase
    {
        private readonly IPracticeLadderService _practiceLadderService;
        private readonly IContentModerationService _moderationService;
        private readonly ApplicationDbContext _dbContext;

        public NodesController(
            IPracticeLadderService practiceLadderService,
            IContentModerationService moderationService,
            ApplicationDbContext dbContext)
        {
            _practiceLadderService = practiceLadderService;
            _moderationService = moderationService;
            _dbContext = dbContext;
        }

        private Guid GetCurrentUserId()
        {
            var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(idClaim) || !Guid.TryParse(idClaim, out Guid userId))
            {
                throw new UnauthorizedAccessException("Không thể xác định User ID từ token.");
            }
            return userId;
        }

        [HttpGet("{nodeId}/practice-status")]
        public async Task<ActionResult<PracticeStatusDto>> GetPracticeStatus(string nodeId)
        {
            var userId = GetCurrentUserId();
            var status = await _practiceLadderService.GetPracticeStatusAsync(userId, nodeId);
            return Ok(status);
        }

        [HttpPost("{nodeId}/quiz/submit")]
        public async Task<ActionResult<QuizSubmitResponseDto>> SubmitQuiz(string nodeId, [FromBody] QuizSubmitRequestDto request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _practiceLadderService.SubmitQuizAsync(userId, nodeId, request);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { error = ex.Message });
            }
        }

        [HttpPost("{nodeId}/lab/submit")]
        public async Task<ActionResult<LabSubmitResponseDto>> SubmitLab(string nodeId, [FromBody] LabSubmitRequestDto request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _practiceLadderService.SubmitLabAsync(userId, nodeId, request);
                return Ok(result);
            }
            catch (InvalidOperationException ex) when (ex.Message == "QUIZ_NOT_PASSED")
            {
                return StatusCode(403, new { error = "QUIZ_NOT_PASSED" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { error = ex.Message });
            }
        }

        [HttpPost("{nodeId}/leetcode/submit")]
        public async Task<ActionResult<LeetCodeSubmitResponseDto>> SubmitLeetCode(string nodeId, [FromBody] LeetCodeSubmitRequestDto request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _practiceLadderService.SubmitLeetCodeAsync(userId, nodeId, request);
                return Ok(result);
            }
            catch (InvalidOperationException ex) when (ex.Message == "LAB_NOT_PASSED")
            {
                return StatusCode(403, new { error = "LAB_NOT_PASSED" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { error = ex.Message });
            }
        }

        [HttpPost("{nodeId}/hints")]
        public async Task<ActionResult<HintResponseDto>> GetHint(string nodeId, [FromBody] HintRequestDto request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _practiceLadderService.GetHintAsync(userId, nodeId, request);
                return Ok(result);
            }
            catch (InvalidOperationException ex) when (ex.Message == "COOLDOWN_ACTIVE")
            {
                return StatusCode(429, new { remainingCooldownSeconds = 10 }); // Simplified
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { error = ex.Message });
            }
        }

        // ── D6: Report Node ──────────────────────────────────────────────────

        [HttpPost("{nodeId}/report")]
        public async Task<IActionResult> ReportNode(Guid nodeId, [FromBody] ReportNodeRequestDto request)
        {
            if (string.IsNullOrEmpty(request?.Reason)) return BadRequest("Reason is required");

            var userId = GetCurrentUserId();
            var report = await _moderationService.CreateReportAsync(nodeId, userId, request.Reason, request.Detail);
            
            return Ok(new { message = "Báo cáo thành công", reportId = report.Id });
        }

        // ── D7: Official Approach ────────────────────────────────────────────

        [HttpGet("{nodeId}/approach")]
        public async Task<IActionResult> GetOfficialApproach(Guid nodeId)
        {
            var node = await _dbContext.CustomNodes.FindAsync(nodeId);
            if (node == null) return NotFound("Node not found");

            var userId = GetCurrentUserId();
            var status = await _practiceLadderService.GetPracticeStatusAsync(userId, nodeId.ToString());

            // 3 stars = LeetCode Passed in v4.0 design
            bool hasThreeStars = status.LeetcodePassed;

            return Ok(new {
                approach = node.OfficialApproach,
                complexityNote = node.ComplexityNote,
                solution = hasThreeStars ? node.OfficialSolution : null, // Gating full code
                locked = !hasThreeStars
            });
        }
    }
}
