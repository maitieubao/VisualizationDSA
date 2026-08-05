using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using VisualizationDSA.Application.DTOs;
using MediatR;
using VisualizationDSA.Application.Features.Lessons.Commands.ProcessReview;
using VisualizationDSA.WebApi.Filters;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiController]
    [Route("api/v{version:apiVersion}/admin/reviews")]
    [RequireJwtRole("Admin")]
    public class LessonReviewController : ControllerBase
    {
        private readonly IMediator _mediator;

        public LessonReviewController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("{id}/process")]
        public async Task<IActionResult> ProcessReview(Guid id, [FromBody] ReviewDecisionDto dto)
        {
            // AdminId lấy từ token stateless (thống nhất với toàn bộ hệ thống).
            var adminIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (!Guid.TryParse(adminIdStr, out var adminId))
            {
                return Unauthorized();
            }

            try
            {
                var command = new ProcessReviewCommand
                {
                    AdminId = adminId,
                    ReviewId = id,
                    IsApproved = dto.IsApproved,
                    Feedback = dto.Feedback
                };
                await _mediator.Send(command);
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { Message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { Message = ex.Message });
            }
        }
    }
}
