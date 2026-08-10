using System.Collections.Generic;

namespace VisualizationDSA.Domain.Engine;




public class FrameDTO
{
    public int StepId { get; set; }
    public int ActiveLine { get; set; }
    public string Explanation { get; set; } = string.Empty;
    public int[] DataState { get; set; } = Array.Empty<int>();
    public HighlightIndices Highlights { get; set; } = new();

    
    /// <summary>LogicalId khớp với script pseudocode phía frontend (vd "COMPARE_STEP", "SWAP_STEP", "OUTER_LOOP", "INNER_LOOP", "FUNC_DECL").</summary>
    public string? ActiveLogicalLineId { get; set; }

    /// <summary>Giá trị biến tại thời điểm frame (vd i, j, n, temp) để Watch Panel hiển thị.</summary>
    public Dictionary<string, object>? Variables { get; set; }

    
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