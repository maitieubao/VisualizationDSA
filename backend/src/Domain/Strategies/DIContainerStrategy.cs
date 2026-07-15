using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

/// <summary>
/// Strategy sinh chuỗi frame cho mô-đun DI/IoC Container Visualizer.
/// Hỗ trợ 2 kịch bản: lifetime-demo (Singleton vs Transient) và cycle-detection.
/// </summary>
public class DIContainerStrategy : IConceptStrategy
{
    public string ConceptId => "di-container";
    public string Name => "DI/IoC Container Visualizer";
    public string Category => "Architecture";
    public List<string> SupportedScenarios => new() { "lifetime-demo", "cycle-detection" };

    public List<DIContainerFrameDto> ExecuteScenario(string scenarioId, CancellationToken ct = default)
    {
        return scenarioId.ToLowerInvariant() switch
        {
            "lifetime-demo" => GenerateLifetimeDemoFrames(),
            "cycle-detection" => GenerateCycleDetectionFrames(),
            _ => throw new ArgumentException($"Kịch bản DI Container '{scenarioId}' không được hỗ trợ.")
        };
    }

    private static List<DIContainerFrameDto> GenerateLifetimeDemoFrames()
    {
        var frames = new List<DIContainerFrameDto>();

        // Frame 1: Register services
        frames.Add(new DIContainerFrameDto
        {
            StepIndex = 0,
            ActionType = "REGISTER_SERVICES",
            Explanation = "Đăng ký 3 service vào DI Container: ILogger (Singleton), IRepository (Transient), IEmailService (Singleton). Mỗi service có lifetime khác nhau.",
            Registrations = new List<DIServiceRegistrationDto>
            {
                new() { InterfaceName = "ILogger", ImplementationName = "ConsoleLogger", Lifetime = "SINGLETON", Dependencies = new(), IsRegistered = true },
                new() { InterfaceName = "IRepository", ImplementationName = "SqlRepository", Lifetime = "TRANSIENT", Dependencies = new() { "ILogger" }, IsRegistered = true },
                new() { InterfaceName = "IEmailService", ImplementationName = "SmtpEmailService", Lifetime = "SINGLETON", Dependencies = new() { "ILogger" }, IsRegistered = true },
            },
            Instances = new(),
            DependencyGraph = new DIGraphDto
            {
                Nodes = new() { "ILogger", "IRepository", "IEmailService" },
                Edges = new()
                {
                    new() { From = "IRepository", To = "ILogger" },
                    new() { From = "IEmailService", To = "ILogger" },
                }
            }
        });

        // Frame 2: Resolve ILogger (Singleton — first time)
        frames.Add(new DIContainerFrameDto
        {
            StepIndex = 1,
            ActionType = "RESOLVE_SINGLETON_NEW",
            Explanation = "Resolve ILogger lần đầu → tạo instance MỚI ConsoleLogger#1. Vì là Singleton, instance này được cache và sẽ được tái sử dụng cho mọi lần resolve tiếp theo.",
            Registrations = new List<DIServiceRegistrationDto>
            {
                new() { InterfaceName = "ILogger", ImplementationName = "ConsoleLogger", Lifetime = "SINGLETON", Dependencies = new(), IsRegistered = true },
                new() { InterfaceName = "IRepository", ImplementationName = "SqlRepository", Lifetime = "TRANSIENT", Dependencies = new() { "ILogger" }, IsRegistered = true },
                new() { InterfaceName = "IEmailService", ImplementationName = "SmtpEmailService", Lifetime = "SINGLETON", Dependencies = new() { "ILogger" }, IsRegistered = true },
            },
            Instances = new List<DIServiceInstanceDto>
            {
                new() { ServiceName = "ILogger", InstanceId = "ConsoleLogger#1", Lifetime = "SINGLETON", ResolveCount = 1, IsNew = true },
            },
            ResolvedServiceName = "ILogger",
            ResolvedLifetime = "SINGLETON"
        });

        // Frame 3: Resolve IRepository (Transient — creates new each time)
        frames.Add(new DIContainerFrameDto
        {
            StepIndex = 2,
            ActionType = "RESOLVE_TRANSIENT",
            Explanation = "Resolve IRepository → tạo instance MỚI SqlRepository#1 (Transient). Dependency ILogger được inject — nhưng tái sử dụng ConsoleLogger#1 (Singleton đã tạo trước đó).",
            Registrations = new List<DIServiceRegistrationDto>
            {
                new() { InterfaceName = "ILogger", ImplementationName = "ConsoleLogger", Lifetime = "SINGLETON", Dependencies = new(), IsRegistered = true },
                new() { InterfaceName = "IRepository", ImplementationName = "SqlRepository", Lifetime = "TRANSIENT", Dependencies = new() { "ILogger" }, IsRegistered = true },
                new() { InterfaceName = "IEmailService", ImplementationName = "SmtpEmailService", Lifetime = "SINGLETON", Dependencies = new() { "ILogger" }, IsRegistered = true },
            },
            Instances = new List<DIServiceInstanceDto>
            {
                new() { ServiceName = "ILogger", InstanceId = "ConsoleLogger#1", Lifetime = "SINGLETON", ResolveCount = 2, IsNew = false },
                new() { ServiceName = "IRepository", InstanceId = "SqlRepository#1", Lifetime = "TRANSIENT", ResolveCount = 1, IsNew = true },
            },
            ResolvedServiceName = "IRepository",
            ResolvedLifetime = "TRANSIENT"
        });

        // Frame 4: Resolve IRepository again (Transient — NEW instance)
        frames.Add(new DIContainerFrameDto
        {
            StepIndex = 3,
            ActionType = "RESOLVE_TRANSIENT_AGAIN",
            Explanation = "Resolve IRepository LẦN NỮA → tạo instance MỚI SqlRepository#2! Transient luôn tạo mới. So sánh: ILogger vẫn là ConsoleLogger#1 (Singleton chỉ tạo 1 lần).",
            Registrations = new List<DIServiceRegistrationDto>
            {
                new() { InterfaceName = "ILogger", ImplementationName = "ConsoleLogger", Lifetime = "SINGLETON", Dependencies = new(), IsRegistered = true },
                new() { InterfaceName = "IRepository", ImplementationName = "SqlRepository", Lifetime = "TRANSIENT", Dependencies = new() { "ILogger" }, IsRegistered = true },
                new() { InterfaceName = "IEmailService", ImplementationName = "SmtpEmailService", Lifetime = "SINGLETON", Dependencies = new() { "ILogger" }, IsRegistered = true },
            },
            Instances = new List<DIServiceInstanceDto>
            {
                new() { ServiceName = "ILogger", InstanceId = "ConsoleLogger#1", Lifetime = "SINGLETON", ResolveCount = 3, IsNew = false },
                new() { ServiceName = "IRepository", InstanceId = "SqlRepository#1", Lifetime = "TRANSIENT", ResolveCount = 1, IsNew = false },
                new() { ServiceName = "IRepository", InstanceId = "SqlRepository#2", Lifetime = "TRANSIENT", ResolveCount = 1, IsNew = true },
            },
            ResolvedServiceName = "IRepository",
            ResolvedLifetime = "TRANSIENT"
        });

        // Frame 5: Conclusion
        frames.Add(new DIContainerFrameDto
        {
            StepIndex = 4,
            ActionType = "CONCLUSION",
            Explanation = "Kết quả: Singleton (ILogger) → 1 instance dùng chung. Transient (IRepository) → instance MỚI mỗi lần resolve. DI Container quản lý vòng đời tự động — developer không cần new() thủ công.",
            Registrations = new List<DIServiceRegistrationDto>
            {
                new() { InterfaceName = "ILogger", ImplementationName = "ConsoleLogger", Lifetime = "SINGLETON", Dependencies = new(), IsRegistered = true },
                new() { InterfaceName = "IRepository", ImplementationName = "SqlRepository", Lifetime = "TRANSIENT", Dependencies = new() { "ILogger" }, IsRegistered = true },
            },
            Instances = new List<DIServiceInstanceDto>
            {
                new() { ServiceName = "ILogger", InstanceId = "ConsoleLogger#1", Lifetime = "SINGLETON", ResolveCount = 3, IsNew = false },
                new() { ServiceName = "IRepository", InstanceId = "SqlRepository#1", Lifetime = "TRANSIENT", ResolveCount = 1, IsNew = false },
                new() { ServiceName = "IRepository", InstanceId = "SqlRepository#2", Lifetime = "TRANSIENT", ResolveCount = 1, IsNew = false },
            }
        });

        return frames;
    }

    private static List<DIContainerFrameDto> GenerateCycleDetectionFrames()
    {
        var frames = new List<DIContainerFrameDto>();

        // Frame 1: Register services with circular dependency
        frames.Add(new DIContainerFrameDto
        {
            StepIndex = 0,
            ActionType = "REGISTER_WITH_CYCLE",
            Explanation = "Đăng ký 3 services: ServiceA → ServiceB → ServiceC → ServiceA. Tạo thành vòng tròn phụ thuộc (circular dependency)!",
            Registrations = new List<DIServiceRegistrationDto>
            {
                new() { InterfaceName = "IServiceA", ImplementationName = "ServiceA", Lifetime = "TRANSIENT", Dependencies = new() { "IServiceB" }, IsRegistered = true },
                new() { InterfaceName = "IServiceB", ImplementationName = "ServiceB", Lifetime = "TRANSIENT", Dependencies = new() { "IServiceC" }, IsRegistered = true },
                new() { InterfaceName = "IServiceC", ImplementationName = "ServiceC", Lifetime = "TRANSIENT", Dependencies = new() { "IServiceA" }, IsRegistered = true },
            },
            Instances = new(),
            DependencyGraph = new DIGraphDto
            {
                Nodes = new() { "IServiceA", "IServiceB", "IServiceC" },
                Edges = new()
                {
                    new() { From = "IServiceA", To = "IServiceB" },
                    new() { From = "IServiceB", To = "IServiceC" },
                    new() { From = "IServiceC", To = "IServiceA" },
                }
            },
            HasCycle = false
        });

        // Frame 2: Attempt to resolve → detect cycle
        frames.Add(new DIContainerFrameDto
        {
            StepIndex = 1,
            ActionType = "DETECT_CYCLE",
            Explanation = "Resolve IServiceA → cần IServiceB → cần IServiceC → cần IServiceA... ĐÃ GẶP LẠI! DI Container phát hiện circular dependency bằng thuật toán DFS trên dependency graph.",
            Registrations = new List<DIServiceRegistrationDto>
            {
                new() { InterfaceName = "IServiceA", ImplementationName = "ServiceA", Lifetime = "TRANSIENT", Dependencies = new() { "IServiceB" }, IsRegistered = true },
                new() { InterfaceName = "IServiceB", ImplementationName = "ServiceB", Lifetime = "TRANSIENT", Dependencies = new() { "IServiceC" }, IsRegistered = true },
                new() { InterfaceName = "IServiceC", ImplementationName = "ServiceC", Lifetime = "TRANSIENT", Dependencies = new() { "IServiceA" }, IsRegistered = true },
            },
            Instances = new(),
            DependencyGraph = new DIGraphDto
            {
                Nodes = new() { "IServiceA", "IServiceB", "IServiceC" },
                Edges = new()
                {
                    new() { From = "IServiceA", To = "IServiceB" },
                    new() { From = "IServiceB", To = "IServiceC" },
                    new() { From = "IServiceC", To = "IServiceA" },
                }
            },
            HasCycle = true
        });

        // Frame 3: Fix by introducing interface
        frames.Add(new DIContainerFrameDto
        {
            StepIndex = 2,
            ActionType = "BREAK_CYCLE",
            Explanation = "Sửa lỗi: ServiceC không inject trực tiếp IServiceA. Thay bằng IMediator hoặc Lazy<IServiceA> để phá vòng. Dependency graph giờ là DAG (không có chu trình).",
            Registrations = new List<DIServiceRegistrationDto>
            {
                new() { InterfaceName = "IServiceA", ImplementationName = "ServiceA", Lifetime = "TRANSIENT", Dependencies = new() { "IServiceB" }, IsRegistered = true },
                new() { InterfaceName = "IServiceB", ImplementationName = "ServiceB", Lifetime = "TRANSIENT", Dependencies = new() { "IServiceC" }, IsRegistered = true },
                new() { InterfaceName = "IServiceC", ImplementationName = "ServiceC", Lifetime = "TRANSIENT", Dependencies = new() { "IMediator" }, IsRegistered = true },
                new() { InterfaceName = "IMediator", ImplementationName = "EventMediator", Lifetime = "SINGLETON", Dependencies = new(), IsRegistered = true },
            },
            Instances = new(),
            DependencyGraph = new DIGraphDto
            {
                Nodes = new() { "IServiceA", "IServiceB", "IServiceC", "IMediator" },
                Edges = new()
                {
                    new() { From = "IServiceA", To = "IServiceB" },
                    new() { From = "IServiceB", To = "IServiceC" },
                    new() { From = "IServiceC", To = "IMediator" },
                }
            },
            HasCycle = false
        });

        // Frame 4: Conclusion
        frames.Add(new DIContainerFrameDto
        {
            StepIndex = 3,
            ActionType = "CONCLUSION",
            Explanation = "DI Container phải luôn kiểm tra circular dependency trước khi resolve. Giải pháp: Mediator Pattern, Lazy injection, hoặc tái cấu trúc dependencies. ASP.NET Core sẽ throw exception nếu phát hiện cycle.",
            Registrations = new List<DIServiceRegistrationDto>
            {
                new() { InterfaceName = "IServiceA", ImplementationName = "ServiceA", Lifetime = "TRANSIENT", Dependencies = new() { "IServiceB" }, IsRegistered = true },
                new() { InterfaceName = "IServiceB", ImplementationName = "ServiceB", Lifetime = "TRANSIENT", Dependencies = new() { "IServiceC" }, IsRegistered = true },
                new() { InterfaceName = "IServiceC", ImplementationName = "ServiceC", Lifetime = "TRANSIENT", Dependencies = new() { "IMediator" }, IsRegistered = true },
                new() { InterfaceName = "IMediator", ImplementationName = "EventMediator", Lifetime = "SINGLETON", Dependencies = new(), IsRegistered = true },
            },
            Instances = new(),
            HasCycle = false
        });

        return frames;
    }
}
