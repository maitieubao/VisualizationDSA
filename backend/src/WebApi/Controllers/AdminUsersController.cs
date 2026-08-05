using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using VisualizationDSA.WebApi.Filters;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiController]
    [Route("api/v1/concepts/admin/users")]
    [RequireJwtRole("Admin")]
    public class AdminUsersController : ControllerBase
    {
        private readonly MediatR.IMediator _mediator;

        public AdminUsersController(MediatR.IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string search = "")
        {
            // Clamp phân trang để tránh Skip âm (500) và pageSize khổng lồ (DoS).
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);
            search = search?.Trim() ?? string.Empty;

            var result = await _mediator.Send(new VisualizationDSA.Application.Features.Admin.Queries.GetUsers.GetUsersQuery 
            { 
                Page = page, 
                PageSize = pageSize, 
                Search = search 
            });
            return Ok(result);
        }
    }
}
