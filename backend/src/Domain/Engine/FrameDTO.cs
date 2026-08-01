using System.Collections.Generic;

namespace VisualizationDSA.Domain.Engine;




public class FrameDTO
{
    public int StepId { get; set; }
    public int ActiveLine { get; set; }
    public string Explanation { get; set; } = string.Empty;
    public int[] DataState { get; set; } = Array.Empty<int>();
    public HighlightIndices Highlights { get; set; } = new();

    
    public List<TreeNodeDTO>? TreeNodes { get; set; }

    
    public List<GraphNodeDTO>? GraphNodes { get; set; }
    public List<GraphEdgeDTO>? GraphEdges { get; set; }
    public Dictionary<int, int>? Distances { get; set; }
    public Dictionary<int, int>? Predecessors { get; set; }
    public List<int>? QueueState { get; set; }
    public List<int>? VisitedSet { get; set; }
    public List<int>? CurrentPath { get; set; }
    public List<int>? OpenSet { get; set; }
    public List<int>? ClosedSet { get; set; }

    
    public Dictionary<int, int>? BalanceFactors { get; set; }
    public string? RotationInfo { get; set; }

    
    public int[]? HeapArray { get; set; }
    public int? HeapSize { get; set; }
}