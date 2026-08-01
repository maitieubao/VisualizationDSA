using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Threading.Tasks;
using VisualizationDSA.Application.Services;
using VisualizationDSA.WebApi.Filters;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiController]
    [Route("api/v1/classrooms")]
    [Authorize(Roles = "Teacher,Admin")]
    public class ClassroomGradingController : ControllerBase
    {
        private readonly IClassroomGradingService _gradingService;

        public ClassroomGradingController(IClassroomGradingService gradingService)
        {
            _gradingService = gradingService;
        }

        [HttpGet("{classroomId}/analytics")]
        public async Task<IActionResult> GetClassAnalytics(Guid classroomId)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (!Guid.TryParse(userIdStr, out var teacherId))
                return Unauthorized();

            try
            {
                var stats = await _gradingService.GetClassStatisticsAsync(classroomId, teacherId);
                return Ok(stats);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }
    }
}
