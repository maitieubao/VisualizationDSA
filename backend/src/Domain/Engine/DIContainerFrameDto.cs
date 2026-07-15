namespace VisualizationDSA.Domain.Engine;

/// <summary>
/// Frame DTO cho mô-đun DI/IoC Container Visualizer.
/// Mỗi frame thể hiện một bước trong quá trình register → resolve → lifetime management.
/// </summary>
public class DIContainerFrameDto
{
    public int StepIndex { get; set; }
    public string ActionType { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
    public List<DIServiceRegistrationDto> Registrations { get; set; } = new();
    public List<DIServiceInstanceDto> Instances { get; set; } = new();
    public DIGraphDto? DependencyGraph { get; set; }
    public string? ResolvedServiceName { get; set; }
    public string? ResolvedLifetime { get; set; }
    public bool HasCycle { get; set; }
}

public class DIServiceRegistrationDto
{
    public string InterfaceName { get; set; } = string.Empty;
    public string ImplementationName { get; set; } = string.Empty;
    public string Lifetime { get; set; } = string.Empty; // "SINGLETON" | "TRANSIENT" | "SCOPED"
    public List<string> Dependencies { get; set; } = new();
    public bool IsRegistered { get; set; }
}

public class DIServiceInstanceDto
{
    public string ServiceName { get; set; } = string.Empty;
    public string InstanceId { get; set; } = string.Empty;
    public string Lifetime { get; set; } = string.Empty;
    public int ResolveCount { get; set; }
    public bool IsNew { get; set; }
}

public class DIGraphDto
{
    public List<string> Nodes { get; set; } = new();
    public List<DIGraphEdgeDto> Edges { get; set; } = new();
}

public class DIGraphEdgeDto
{
    public string From { get; set; } = string.Empty;
    public string To { get; set; } = string.Empty;
}
