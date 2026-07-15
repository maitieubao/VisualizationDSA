using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.Infrastructure.Services
{
    /// <summary>
    /// Truy vấn ma trận vector quan hệ (SemanticConceptNode / KnowledgeEdge) trực tiếp
    /// trên ApplicationDbContext bằng projection + AsNoTracking để tối ưu read-path.
    /// </summary>
    public class SemanticGraphService : ISemanticGraphService
    {
        private readonly ApplicationDbContext _db;

        public SemanticGraphService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<SemanticGraphDto> GetSemanticGraphAsync(string? category = null)
        {
            var nodesQuery = _db.SemanticConceptNodes.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(category))
                nodesQuery = nodesQuery.Where(n => n.Category == category);

            var nodes = await nodesQuery
                .OrderByDescending(n => n.Importance)
                .Select(n => new SemanticNodeDto
                {
                    Id          = n.Id,
                    ConceptKey  = n.ConceptKey,
                    Title       = n.Title,
                    Category    = n.Category,
                    Description = n.Description,
                    Importance  = n.Importance,
                    Embedding   = n.Embedding,
                    Degree      = n.OutgoingEdges.Count + n.IncomingEdges.Count,
                })
                .ToListAsync();

            var nodeIds = nodes.Select(n => n.Id).ToHashSet();

            // Chỉ lấy các cạnh nằm trọn trong tập node đã lọc (induced subgraph).
            var edges = await _db.KnowledgeEdges
                .AsNoTracking()
                .Where(e => nodeIds.Contains(e.SourceNodeId) && nodeIds.Contains(e.TargetNodeId))
                .Select(e => new SemanticEdgeDto
                {
                    Id           = e.Id,
                    SourceNodeId = e.SourceNodeId,
                    TargetNodeId = e.TargetNodeId,
                    RelationType = e.RelationType,
                    Weight       = e.Weight,
                })
                .ToListAsync();

            var nodeCount = nodes.Count;
            var edgeCount = edges.Count;
            // Mật độ đồ thị có hướng: E / (V * (V - 1)).
            var density = nodeCount > 1
                ? Math.Round((double)edgeCount / (nodeCount * (nodeCount - 1)), 4)
                : 0.0;

            return new SemanticGraphDto
            {
                Nodes = nodes,
                Edges = edges,
                Stats = new SemanticGraphStatsDto
                {
                    NodeCount     = nodeCount,
                    EdgeCount     = edgeCount,
                    GraphDensity  = density,
                    CategoryCount = nodes.Select(n => n.Category).Distinct().Count(),
                },
                GeneratedAt = DateTime.UtcNow,
            };
        }
    }
}
