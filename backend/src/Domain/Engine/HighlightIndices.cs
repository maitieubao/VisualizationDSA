namespace VisualizationDSA.Domain.Engine;

/// <summary>
/// Các con trỏ làm nổi bật hiển thị trên UI.
/// </summary>
public class HighlightIndices
{
    public List<int> Compare { get; set; } = new();
    public List<int> Swap { get; set; } = new();
    public List<int> Sorted { get; set; } = new();
    public int? Pivot { get; set; }
    public int? Found { get; set; }
    public int? Low { get; set; }
    public int? Mid { get; set; }
    public int? High { get; set; }
    public List<int> Dimmed { get; set; } = new();
    public List<int> Active { get; set; } = new();
}
