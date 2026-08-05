using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VisualizationDSA.Application.Features.Codelabs.Commands;
using VisualizationDSA.Application.Features.Codelabs.Queries;

using VisualizationDSA.WebApi.Filters;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [RequireJwtRole]
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
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
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
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
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

        [HttpPost("{id}/reveal-hint")]
        public async Task<IActionResult> RevealHint(Guid id, [FromBody] RevealHintRequestDto request)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized();
            }

            var result = await _mediator.Send(new RevealHintCommand
            {
                UserId = userId,
                CodelabId = id,
                HintIndex = request.HintIndex
            });

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
    }

    public class RevealHintRequestDto
    {
        public int HintIndex { get; set; }
    }

    public class SubmitCodelabRequestDto
    {
        public string Code { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
    }
}
