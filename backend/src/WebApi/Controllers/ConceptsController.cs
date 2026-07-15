using Microsoft.AspNetCore.Mvc;
using Asp.Versioning;
using System.Threading.Tasks;
using VisualizationDSA.Application.Services;

namespace VisualizationDSA.WebApi.Controllers
{
    /// <summary>
    /// Concepts Controller — truy vấn đồ thị tri thức ngữ nghĩa (Graph RAG).
    /// Route: api/v{version:apiVersion}/concepts
    /// </summary>
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

        /// <summary>
        /// Trả về đồ thị ngữ nghĩa (nodes + edges + thống kê) phục vụ Graph RAG.
        /// Có thể lọc theo category (OOP, DSA, SOLID, SystemDesign...).
        /// GET /api/v1/concepts/analytics/semantic-graph?category=SOLID
        /// </summary>
        [HttpGet("analytics/semantic-graph")]
        public async Task<ActionResult<SemanticGraphDto>> GetSemanticGraph(
            [FromQuery] string? category = null)
        {
            var graph = await _semanticGraph.GetSemanticGraphAsync(category);
            return Ok(graph);
        }
    }
}
