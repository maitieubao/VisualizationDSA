using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using VisualizationDSA.Application.Common.Interfaces;
using VisualizationDSA.Application.DTOs.Sandbox;
using VisualizationDSA.WebApi.Filters;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiController]
    [Route("api/v1/sandbox")]
    public class SandboxController : ControllerBase
    {
        private readonly ISandboxService _sandboxService;

        public SandboxController(ISandboxService sandboxService)
        {
            _sandboxService = sandboxService;
        }

        /// <summary>
        /// POST /api/v1/sandbox/execute
        /// Execute user's code and return visualization trace
        /// </summary>
        [HttpPost("execute")]
        [RequireJwtRole] // Require normal user access
        public async Task<IActionResult> ExecuteCode([FromBody] ExecuteCodeRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.SourceCode) || string.IsNullOrWhiteSpace(request.Language))
            {
                return BadRequest(SandboxResult.CreateError("INVALID_REQUEST", "Source code and Language are required."));
            }

            var result = await _sandboxService.ExecuteAsync(request.SourceCode, request.Language);

            if (result.Success)
            {
                return Ok(result);
            }
            
            return BadRequest(result);
        }
    }
}
