using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiController]
    [Route("api/v1/concepts/admin/users")]
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
