namespace VisualizationDSA.Domain.Engine;

/// <summary>
/// Frame DTO cho mô-đun SOLID Principles Visualizer.
/// Mỗi frame thể hiện một bước trong kịch bản vi phạm hoặc tuân thủ nguyên tắc SOLID.
/// </summary>
public class SOLIDFrameDto
{
    public int StepIndex { get; set; }
    public string ActionType { get; set; } = string.Empty;
    public string Principle { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
    public bool IsViolation { get; set; }
    public List<SOLIDClassNodeDto> ClassNodes { get; set; } = new();
    public SOLIDMetricsDto? Metrics { get; set; }
    public string? ViolationDetail { get; set; }
}

public class SOLIDClassNodeDto
{
    public string NodeId { get; set; } = string.Empty;
    public string ClassName { get; set; } = string.Empty;
    public List<SOLIDMemberDto> Members { get; set; } = new();
    public double CohesionScore { get; set; }
    public bool IsViolating { get; set; }
    public string? StatusLabel { get; set; }
}

public class SOLIDMemberDto
{
    public string Name { get; set; } = string.Empty;
    public string MemberType { get; set; } = string.Empty; // "FIELD" | "METHOD"
    public List<string> AccessedFields { get; set; } = new();
}

public class SOLIDMetricsDto
{
    public double Lcom4Score { get; set; }
    public int ResponsibilityCount { get; set; }
    public string CouplingLevel { get; set; } = string.Empty; // "LOW" | "MEDIUM" | "HIGH"
}
