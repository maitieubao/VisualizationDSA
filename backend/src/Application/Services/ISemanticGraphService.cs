using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace VisualizationDSA.Application.Services
{
    /// <summary>
    /// Truy vấn đồ thị tri thức ngữ nghĩa (Graph RAG) — trả về các concept node
    /// và knowledge edge phục vụ trực quan hóa / suy luận cross-cutting dependency.
    /// </summary>
    public interface ISemanticGraphService
    {
        /// <summary>
        /// Lấy toàn bộ (hoặc lọc theo category) đồ thị ngữ nghĩa: nodes + edges + thống kê.
        /// </summary>
        Task<SemanticGraphDto> GetSemanticGraphAsync(string? category = null);
    }

    public class SemanticGraphDto
    {
        public List<SemanticNodeDto> Nodes { get; set; } = new();
        public List<SemanticEdgeDto> Edges { get; set; } = new();
        public SemanticGraphStatsDto Stats { get; set; } = new();
        public DateTime GeneratedAt { get; set; }
    }

    public class SemanticNodeDto
    {
        public Guid     Id          { get; set; }
        public string   ConceptKey  { get; set; } = string.Empty;
        public string   Title       { get; set; } = string.Empty;
        public string   Category    { get; set; } = string.Empty;
        public string   Description { get; set; } = string.Empty;
        public double   Importance  { get; set; }
        public int      Degree      { get; set; }  // bậc của đỉnh (in + out)
        public double[] Embedding   { get; set; } = Array.Empty<double>();
    }

    public class SemanticEdgeDto
    {
        public Guid   Id           { get; set; }
        public Guid   SourceNodeId { get; set; }
        public Guid   TargetNodeId { get; set; }
        public string RelationType { get; set; } = string.Empty;
        public double Weight       { get; set; }
    }

    public class SemanticGraphStatsDto
    {
        public int    NodeCount     { get; set; }
        public int    EdgeCount     { get; set; }
        public double GraphDensity  { get; set; }  // mật độ đồ thị có hướng
        public int    CategoryCount { get; set; }
    }
}
