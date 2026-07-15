namespace VisualizationDSA.Domain.Engine;

/// <summary>
/// Frame DTO cho mô-đun Design Patterns Visualizer.
/// Mỗi frame thể hiện một bước trong kịch bản pattern (Strategy swap, Observer notify, etc.).
/// </summary>
public class DesignPatternFrameDto
{
    public int StepIndex { get; set; }
    public string ActionType { get; set; } = string.Empty;
    public string PatternName { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
    public List<UMLNodeDto> Nodes { get; set; } = new();
    public List<UMLLinkDto> Links { get; set; } = new();
    public string? ActiveNodeId { get; set; }
    public string? ActiveLinkId { get; set; }
    public int CouplingIndex { get; set; }
}

public class UMLNodeDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string NodeType { get; set; } = string.Empty; // "class" | "interface" | "abstract"
    public List<string> Attributes { get; set; } = new();
    public List<string> Methods { get; set; } = new();
    public double X { get; set; }
    public double Y { get; set; }
    public string? StatusLabel { get; set; }
}

public class UMLLinkDto
{
    public string Id { get; set; } = string.Empty;
    public string SourceId { get; set; } = string.Empty;
    public string TargetId { get; set; } = string.Empty;
    public string LinkType { get; set; } = string.Empty; // "dependency" | "realization" | "association"
    public bool IsActive { get; set; }
}
