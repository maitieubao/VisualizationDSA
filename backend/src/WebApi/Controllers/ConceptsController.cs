using Microsoft.AspNetCore.Mvc;
using Asp.Versioning;
using System.Threading.Tasks;
using VisualizationDSA.Application.Services;

namespace VisualizationDSA.WebApi.Controllers
{
    
    
    
    
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/concepts")]
    public class ConceptsController : ControllerBase
    {
        private readonly ISemanticGraphService _semanticGraph;

        public ConceptsController(ISemanticGraphService semanticGraph)
        {
            _semanticGraph = semanticGraph;
        }

        
        
        
        
        
        [HttpGet("analytics/semantic-graph")]
        public async Task<ActionResult<SemanticGraphDto>> GetSemanticGraph(
            [FromQuery] string? category = null)
        {
            var graph = await _semanticGraph.GetSemanticGraphAsync(category);
            return Ok(graph);
        }
    }
}
