using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MediatR;
using System;
using System.Threading.Tasks;
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
            [FromQuery] string? difficulty,
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            
            return Ok(new { message = "Get codelabs endpoint - implement query" });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCodelab(Guid id)
        {
            
            return Ok(new { message = "Get codelab endpoint - implement query" });
        }

        [HttpPost]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> CreateCodelab([FromBody] CreateCodelabRequest request)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (!Guid.TryParse(userIdStr, out var teacherId))
                return Unauthorized();

            
            return Ok(new { message = "Create codelab endpoint - implement command" });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> UpdateCodelab(Guid id, [FromBody] UpdateCodelabRequest request)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (!Guid.TryParse(userIdStr, out var teacherId))
                return Unauthorized();

            
            return Ok(new { message = "Update codelab endpoint - implement command" });
        }

        [HttpPost("{id}/testcases")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> AddTestCase(Guid id, [FromBody] AddTestCaseRequest request)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (!Guid.TryParse(userIdStr, out var teacherId))
                return Unauthorized();

            
            return Ok(new { message = "Add test case endpoint - implement command" });
        }

        [HttpPut("{id}/testcases/reorder")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> ReorderTestCases(Guid id, [FromBody] ReorderTestCasesRequest request)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (!Guid.TryParse(userIdStr, out var teacherId))
                return Unauthorized();

            
            return Ok(new { message = "Reorder test cases endpoint - implement command" });
        }

        [HttpPost("{id}/templates")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> AddTemplate(Guid id, [FromBody] AddTemplateRequest request)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (!Guid.TryParse(userIdStr, out var teacherId))
                return Unauthorized();

            
            return Ok(new { message = "Add template endpoint - implement command" });
        }
    }

    public class CreateCodelabRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string InitialCode { get; set; } = string.Empty;
        public int Difficulty { get; set; } = 1;
        public int XPReward { get; set; } = 50;
        public int MaxRuntimeMs { get; set; } = 2000;
        public int MaxMemoryBytes { get; set; } = 128000000;
        public string AllowedLanguages { get; set; } = "csharp,python,java,javascript";
        public string Constraints { get; set; } = string.Empty;
        public string Examples { get; set; } = string.Empty;
        public string Hints { get; set; } = string.Empty;
        public string Tags { get; set; } = string.Empty;
        public List<CreateTestCaseDto> TestCases { get; set; } = new();
        public List<CreateTemplateDto> Templates { get; set; } = new();
    }

    public class CreateTestCaseDto
    {
        public string Input { get; set; } = string.Empty;
        public string ExpectedOutput { get; set; } = string.Empty;
        public bool IsHidden { get; set; }
        public int OrderIndex { get; set; }
    }

    public class CreateTemplateDto
    {
        public string Language { get; set; } = string.Empty;
        public string StarterCode { get; set; } = string.Empty;
        public string SolutionCode { get; set; } = string.Empty;
    }

    public class UpdateCodelabRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string InitialCode { get; set; } = string.Empty;
        public int Difficulty { get; set; }
        public int XPReward { get; set; }
        public int MaxRuntimeMs { get; set; }
        public int MaxMemoryBytes { get; set; }
        public string AllowedLanguages { get; set; } = string.Empty;
        public string Constraints { get; set; } = string.Empty;
        public string Examples { get; set; } = string.Empty;
        public string Hints { get; set; } = string.Empty;
        public string Tags { get; set; } = string.Empty;
    }

    public class AddTestCaseRequest
    {
        public string Input { get; set; } = string.Empty;
        public string ExpectedOutput { get; set; } = string.Empty;
        public bool IsHidden { get; set; }
        public int OrderIndex { get; set; }
    }

    public class ReorderTestCasesRequest
    {
        public List<TestCaseOrderDto> TestCaseOrders { get; set; } = new();
    }

    public class TestCaseOrderDto
    {
        public Guid TestCaseId { get; set; }
        public int OrderIndex { get; set; }
    }

    public class AddTemplateRequest
    {
        public string Language { get; set; } = string.Empty;
        public string StarterCode { get; set; } = string.Empty;
        public string SolutionCode { get; set; } = string.Empty;
    }
}