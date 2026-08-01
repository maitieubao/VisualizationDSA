using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VisualizationDSA.Application.Features.Codelabs.Commands;
using VisualizationDSA.Application.Features.Codelabs.Queries;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CodelabsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CodelabsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCodelab(Guid id)
        {
            var result = await _mediator.Send(new GetCodelabDetailsQuery { CodelabId = id });
            return Ok(result);
        }

        [HttpPost("{id}/submit")]
        public async Task<IActionResult> SubmitCodelab(Guid id, [FromBody] SubmitCodelabRequestDto request)
        {
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized();
            }

            var command = new SubmitCodelabCommand
            {
                UserId = userId,
                CodelabId = id,
                Code = request.Code,
                Language = request.Language
            };

            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPost("{id}/run")]
        public async Task<IActionResult> RunCodelab(Guid id, [FromBody] SubmitCodelabRequestDto request)
        {
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized();
            }

            var command = new RunCodelabCommand
            {
                UserId = userId,
                CodelabId = id,
                Code = request.Code,
                Language = request.Language
            };

            var result = await _mediator.Send(command);
            return Ok(result);
        }
    }

    public class SubmitCodelabRequestDto
    {
        public string Code { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
    }
}
