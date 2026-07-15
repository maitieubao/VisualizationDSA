namespace VisualizationDSA.Domain.Engine;

/// <summary>
/// Biểu diễn một node trong cấu trúc cây (BST).
/// Dùng cho TreeRenderer ở Frontend.
/// </summary>
public class TreeNodeDTO
{
    public int Id { get; set; }
    public int Value { get; set; }
    public int? LeftNodeId { get; set; }
    public int? RightNodeId { get; set; }
}
