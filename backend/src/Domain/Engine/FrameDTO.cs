namespace VisualizationDSA.Domain.Engine;

/// <summary>
/// Lưu trữ snapshot của một bước trong giải thuật.
/// </summary>
public class FrameDTO
{
    public int StepId { get; set; }
    public int ActiveLine { get; set; }
    public string Explanation { get; set; } = string.Empty;
    public int[] DataState { get; set; } = Array.Empty<int>();
    public HighlightIndices Highlights { get; set; } = new();
    public List<TreeNodeDTO>? TreeNodes { get; set; }
}
