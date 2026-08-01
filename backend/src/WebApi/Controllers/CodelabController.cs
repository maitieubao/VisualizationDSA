using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MediatR;
using System;
using System.Threading.Tasks;
using VisualizationDSA.Application.Features.Codelabs.Commands;
using VisualizationDSA.Application.Features.Codelabs.Queries;
using VisualizationDSA.WebApi.Filters;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiController]
    [Route("api/v1/codelabs")]
    [Authorize]
    public class CodelabController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CodelabController(IMediator mediator)
        {
            _mediator = mediator;
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
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> CreateCodelab([FromBody] CreateCodelabCommand command)
        {
            var id = await _mediator.Send(command);
            return Ok(new { id });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> UpdateCodelab(Guid id, [FromBody] UpdateCodelabCommand command)
        {
            command.CodelabId = id;
            await _mediator.Send(command);
            return Ok(new { id });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> DeleteCodelab(Guid id)
        {
            await _mediator.Send(new DeleteCodelabCommand { CodelabId = id });
            return Ok(new { success = true });
        }

        [HttpPost("{id}/testcases")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> AddTestCase(Guid id, [FromBody] AddTestCaseCommand command)
        {
            command.CodelabId = id;
            var testCaseId = await _mediator.Send(command);
            return Ok(new { id = testCaseId });
        }

        [HttpPut("{id}/testcases/{testCaseId}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> UpdateTestCase(Guid id, Guid testCaseId, [FromBody] UpdateTestCaseCommand command)
        {
            command.TestCaseId = testCaseId;
            await _mediator.Send(command);
            return Ok(new { id = testCaseId });
        }

        [HttpDelete("{id}/testcases/{testCaseId}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> DeleteTestCase(Guid id, Guid testCaseId)
        {
            await _mediator.Send(new DeleteTestCaseCommand { CodelabId = id, TestCaseId = testCaseId });
            return Ok(new { success = true });
        }

        [HttpPost("{id}/templates")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> AddTemplate(Guid id, [FromBody] AddTemplateCommand command)
        {
            command.CodelabId = id;
            var templateId = await _mediator.Send(command);
            return Ok(new { id = templateId });
        }

        [HttpPut("{id}/templates/{templateId}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> UpdateTemplate(Guid id, Guid templateId, [FromBody] UpdateTemplateCommand command)
        {
            command.TemplateId = templateId;
            await _mediator.Send(command);
            return Ok(new { id = templateId });
        }

        [HttpDelete("{id}/templates/{templateId}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> DeleteTemplate(Guid id, Guid templateId)
        {
            await _mediator.Send(new DeleteTemplateCommand { CodelabId = id, TemplateId = templateId });
            return Ok(new { success = true });
        }

        [HttpPost("{id}/hints")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> AddHint(Guid id, [FromBody] AddHintCommand command)
        {
            command.CodelabId = id;
            var hintId = await _mediator.Send(command);
            return Ok(new { id = hintId });
        }

        [HttpPut("{id}/hints/{hintId}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> UpdateHint(Guid id, Guid hintId, [FromBody] UpdateHintCommand command)
        {
            command.HintId = hintId;
            await _mediator.Send(command);
            return Ok(new { id = hintId });
        }

        [HttpDelete("{id}/hints/{hintId}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> DeleteHint(Guid id, Guid hintId)
        {
            await _mediator.Send(new DeleteHintCommand { CodelabId = id, HintId = hintId });
            return Ok(new { success = true });
        }
    }
}
