using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VisualizationDSA.Application.DTOs;
using MediatR;
using VisualizationDSA.Application.Features.Lessons.Commands.ProcessReview;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiController]
    [Route("api/admin/reviews")]
    [Authorize(Roles = "Admin")]
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
            var adminIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
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
