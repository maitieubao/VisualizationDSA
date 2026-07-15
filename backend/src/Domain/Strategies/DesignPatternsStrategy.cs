using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

/// <summary>
/// Strategy sinh chuỗi frame cho mô-đun Design Patterns Visualizer.
/// Hỗ trợ 3 kịch bản: Strategy Pattern, Observer Pattern, Singleton Pattern.
/// </summary>
public class DesignPatternsStrategy : IConceptStrategy
{
    public string ConceptId => "design-patterns";
    public string Name => "Design Patterns Visualizer";
    public string Category => "Architecture";
    public List<string> SupportedScenarios => new() { "strategy-pattern", "observer-pattern", "singleton-pattern" };

    public List<DesignPatternFrameDto> ExecuteScenario(string scenarioId, CancellationToken ct = default)
    {
        return scenarioId.ToLowerInvariant() switch
        {
            "strategy-pattern" => GenerateStrategyPatternFrames(),
            "observer-pattern" => GenerateObserverPatternFrames(),
            "singleton-pattern" => GenerateSingletonPatternFrames(),
            _ => throw new ArgumentException($"Kịch bản Design Pattern '{scenarioId}' không được hỗ trợ.")
        };
    }

    private static List<DesignPatternFrameDto> GenerateStrategyPatternFrames()
    {
        var frames = new List<DesignPatternFrameDto>();

        // Frame 1: Giới thiệu vấn đề — hardcoded if/else
        frames.Add(new DesignPatternFrameDto
        {
            StepIndex = 0,
            ActionType = "SHOW_PROBLEM",
            PatternName = "Strategy",
            Explanation = "SorterClient chứa if/else để chọn thuật toán sắp xếp. Thêm HeapSort → phải sửa SorterClient. Vi phạm OCP và khó test riêng từng thuật toán.",
            Nodes = new List<UMLNodeDto>
            {
                new() { Id = "Client", Name = "SorterClient", NodeType = "class", Attributes = new() { "- algorithmType: string" }, Methods = new() { "+ sort(data): void // if-else chain" }, X = 200, Y = 80 },
            },
            Links = new(),
            CouplingIndex = 85
        });

        // Frame 2: Introduce Strategy Interface
        frames.Add(new DesignPatternFrameDto
        {
            StepIndex = 1,
            ActionType = "INTRODUCE_INTERFACE",
            PatternName = "Strategy",
            Explanation = "Tạo interface ISortStrategy với phương thức execute(). Client giữ tham chiếu tới ISortStrategy thay vì hardcode logic.",
            Nodes = new List<UMLNodeDto>
            {
                new() { Id = "Client", Name = "SorterClient", NodeType = "class", Attributes = new() { "- strategy: ISortStrategy" }, Methods = new() { "+ sort(data): void" }, X = 200, Y = 50 },
                new() { Id = "Strategy", Name = "ISortStrategy", NodeType = "interface", Attributes = new(), Methods = new() { "+ execute(data): void" }, X = 200, Y = 200 },
            },
            Links = new List<UMLLinkDto>
            {
                new() { Id = "ClientToStrategy", SourceId = "Client", TargetId = "Strategy", LinkType = "dependency", IsActive = true },
            },
            ActiveLinkId = "ClientToStrategy",
            CouplingIndex = 40
        });

        // Frame 3: Implement concrete strategies
        frames.Add(new DesignPatternFrameDto
        {
            StepIndex = 2,
            ActionType = "ADD_IMPLEMENTATIONS",
            PatternName = "Strategy",
            Explanation = "BubbleSort và QuickSort implement ISortStrategy. Client không biết implementation cụ thể — chỉ gọi strategy.execute(). Có thể swap tại runtime.",
            Nodes = new List<UMLNodeDto>
            {
                new() { Id = "Client", Name = "SorterClient", NodeType = "class", Attributes = new() { "- strategy: ISortStrategy" }, Methods = new() { "+ sort(data): void" }, X = 200, Y = 50 },
                new() { Id = "Strategy", Name = "ISortStrategy", NodeType = "interface", Attributes = new(), Methods = new() { "+ execute(data): void" }, X = 200, Y = 200 },
                new() { Id = "Bubble", Name = "BubbleSort", NodeType = "class", Attributes = new(), Methods = new() { "+ execute(data): void" }, X = 80, Y = 360 },
                new() { Id = "Quick", Name = "QuickSort", NodeType = "class", Attributes = new(), Methods = new() { "+ execute(data): void" }, X = 320, Y = 360 },
            },
            Links = new List<UMLLinkDto>
            {
                new() { Id = "ClientToStrategy", SourceId = "Client", TargetId = "Strategy", LinkType = "dependency", IsActive = true },
                new() { Id = "BubbleToStrategy", SourceId = "Bubble", TargetId = "Strategy", LinkType = "realization", IsActive = false },
                new() { Id = "QuickToStrategy", SourceId = "Quick", TargetId = "Strategy", LinkType = "realization", IsActive = false },
            },
            CouplingIndex = 20
        });

        // Frame 4: Runtime swap demonstration
        frames.Add(new DesignPatternFrameDto
        {
            StepIndex = 3,
            ActionType = "RUNTIME_SWAP",
            PatternName = "Strategy",
            Explanation = "Runtime swap: client.setStrategy(new QuickSort()). Liên kết dependency snap từ BubbleSort sang QuickSort. Không cần sửa code Client — chỉ inject strategy mới.",
            Nodes = new List<UMLNodeDto>
            {
                new() { Id = "Client", Name = "SorterClient", NodeType = "class", Attributes = new() { "- strategy: ISortStrategy" }, Methods = new() { "+ sort(data): void", "+ setStrategy(s): void" }, X = 200, Y = 50 },
                new() { Id = "Strategy", Name = "ISortStrategy", NodeType = "interface", Attributes = new(), Methods = new() { "+ execute(data): void" }, X = 200, Y = 200 },
                new() { Id = "Bubble", Name = "BubbleSort", NodeType = "class", Attributes = new(), Methods = new() { "+ execute(data): void" }, X = 80, Y = 360, StatusLabel = "INACTIVE" },
                new() { Id = "Quick", Name = "QuickSort", NodeType = "class", Attributes = new(), Methods = new() { "+ execute(data): void" }, X = 320, Y = 360, StatusLabel = "ACTIVE ★" },
            },
            Links = new List<UMLLinkDto>
            {
                new() { Id = "ClientToStrategy", SourceId = "Client", TargetId = "Quick", LinkType = "dependency", IsActive = true },
                new() { Id = "BubbleToStrategy", SourceId = "Bubble", TargetId = "Strategy", LinkType = "realization", IsActive = false },
                new() { Id = "QuickToStrategy", SourceId = "Quick", TargetId = "Strategy", LinkType = "realization", IsActive = true },
            },
            ActiveNodeId = "Quick",
            ActiveLinkId = "ClientToStrategy",
            CouplingIndex = 15
        });

        return frames;
    }

    private static List<DesignPatternFrameDto> GenerateObserverPatternFrames()
    {
        var frames = new List<DesignPatternFrameDto>();

        // Frame 1: Subject holds list of observers
        frames.Add(new DesignPatternFrameDto
        {
            StepIndex = 0,
            ActionType = "SETUP",
            PatternName = "Observer",
            Explanation = "NewsPublisher (Subject) quản lý danh sách IObserver. Khi có tin mới, gọi notify() để thông báo tất cả subscriber cùng lúc.",
            Nodes = new List<UMLNodeDto>
            {
                new() { Id = "Subject", Name = "NewsPublisher", NodeType = "class", Attributes = new() { "- observers: IObserver[]" }, Methods = new() { "+ subscribe(o): void", "+ notify(): void" }, X = 220, Y = 50 },
                new() { Id = "IObserver", Name = "IObserver", NodeType = "interface", Attributes = new(), Methods = new() { "+ update(data): void" }, X = 220, Y = 200 },
            },
            Links = new List<UMLLinkDto>
            {
                new() { Id = "SubjectToObserver", SourceId = "Subject", TargetId = "IObserver", LinkType = "association", IsActive = false },
            },
            CouplingIndex = 30
        });

        // Frame 2: Register observers
        frames.Add(new DesignPatternFrameDto
        {
            StepIndex = 1,
            ActionType = "REGISTER_OBSERVERS",
            PatternName = "Observer",
            Explanation = "3 subscriber đăng ký: EmailSubscriber, SMSSubscriber, AppSubscriber. Tất cả implement IObserver. Subject không biết chi tiết implementation — chỉ biết interface.",
            Nodes = new List<UMLNodeDto>
            {
                new() { Id = "Subject", Name = "NewsPublisher", NodeType = "class", Attributes = new() { "- observers: IObserver[3]" }, Methods = new() { "+ notify(): void" }, X = 220, Y = 50 },
                new() { Id = "IObserver", Name = "IObserver", NodeType = "interface", Attributes = new(), Methods = new() { "+ update(data): void" }, X = 220, Y = 200 },
                new() { Id = "ObsA", Name = "EmailSubscriber", NodeType = "class", Attributes = new(), Methods = new() { "+ update(data): void" }, X = 40, Y = 360 },
                new() { Id = "ObsB", Name = "SMSSubscriber", NodeType = "class", Attributes = new(), Methods = new() { "+ update(data): void" }, X = 220, Y = 360 },
                new() { Id = "ObsC", Name = "AppSubscriber", NodeType = "class", Attributes = new(), Methods = new() { "+ update(data): void" }, X = 400, Y = 360 },
            },
            Links = new List<UMLLinkDto>
            {
                new() { Id = "SubjectToObserver", SourceId = "Subject", TargetId = "IObserver", LinkType = "association", IsActive = false },
                new() { Id = "ObsAImpl", SourceId = "ObsA", TargetId = "IObserver", LinkType = "realization", IsActive = false },
                new() { Id = "ObsBImpl", SourceId = "ObsB", TargetId = "IObserver", LinkType = "realization", IsActive = false },
                new() { Id = "ObsCImpl", SourceId = "ObsC", TargetId = "IObserver", LinkType = "realization", IsActive = false },
            },
            CouplingIndex = 25
        });

        // Frame 3: Notify pulse
        frames.Add(new DesignPatternFrameDto
        {
            StepIndex = 2,
            ActionType = "NOTIFY_ALL",
            PatternName = "Observer",
            Explanation = "publisher.notify() → gọi update() trên TỪNG observer đồng loạt. Email gửi mail, SMS gửi tin nhắn, App hiện push notification. Subject không quan tâm chi tiết.",
            Nodes = new List<UMLNodeDto>
            {
                new() { Id = "Subject", Name = "NewsPublisher", NodeType = "class", Attributes = new() { "- observers: IObserver[3]" }, Methods = new() { "+ notify(): void" }, X = 220, Y = 50, StatusLabel = "NOTIFYING..." },
                new() { Id = "IObserver", Name = "IObserver", NodeType = "interface", Attributes = new(), Methods = new() { "+ update(data): void" }, X = 220, Y = 200 },
                new() { Id = "ObsA", Name = "EmailSubscriber", NodeType = "class", Attributes = new(), Methods = new() { "+ update(data): void" }, X = 40, Y = 360, StatusLabel = "📧 RECEIVED" },
                new() { Id = "ObsB", Name = "SMSSubscriber", NodeType = "class", Attributes = new(), Methods = new() { "+ update(data): void" }, X = 220, Y = 360, StatusLabel = "📱 RECEIVED" },
                new() { Id = "ObsC", Name = "AppSubscriber", NodeType = "class", Attributes = new(), Methods = new() { "+ update(data): void" }, X = 400, Y = 360, StatusLabel = "🔔 RECEIVED" },
            },
            Links = new List<UMLLinkDto>
            {
                new() { Id = "SubjectToObserver", SourceId = "Subject", TargetId = "IObserver", LinkType = "association", IsActive = true },
                new() { Id = "ObsAImpl", SourceId = "ObsA", TargetId = "IObserver", LinkType = "realization", IsActive = true },
                new() { Id = "ObsBImpl", SourceId = "ObsB", TargetId = "IObserver", LinkType = "realization", IsActive = true },
                new() { Id = "ObsCImpl", SourceId = "ObsC", TargetId = "IObserver", LinkType = "realization", IsActive = true },
            },
            ActiveNodeId = "Subject",
            CouplingIndex = 20
        });

        // Frame 4: Conclusion
        frames.Add(new DesignPatternFrameDto
        {
            StepIndex = 3,
            ActionType = "CONCLUSION",
            PatternName = "Observer",
            Explanation = "Observer Pattern cho phép loose coupling: Subject và Observer không biết nhau trực tiếp. Thêm/xóa subscriber không ảnh hưởng code Subject. Rất phù hợp cho event-driven systems.",
            Nodes = new List<UMLNodeDto>
            {
                new() { Id = "Subject", Name = "NewsPublisher", NodeType = "class", Attributes = new(), Methods = new() { "+ notify(): void" }, X = 220, Y = 50, StatusLabel = "✓ LOOSE COUPLING" },
                new() { Id = "IObserver", Name = "IObserver", NodeType = "interface", Attributes = new(), Methods = new() { "+ update(data): void" }, X = 220, Y = 200, StatusLabel = "✓ CONTRACT" },
            },
            Links = new List<UMLLinkDto>
            {
                new() { Id = "SubjectToObserver", SourceId = "Subject", TargetId = "IObserver", LinkType = "association", IsActive = false },
            },
            CouplingIndex = 15
        });

        return frames;
    }

    private static List<DesignPatternFrameDto> GenerateSingletonPatternFrames()
    {
        var frames = new List<DesignPatternFrameDto>();

        // Frame 1: Problem — multiple instances
        frames.Add(new DesignPatternFrameDto
        {
            StepIndex = 0,
            ActionType = "SHOW_PROBLEM",
            PatternName = "Singleton",
            Explanation = "DatabaseConnection tạo nhiều instance → lãng phí tài nguyên, inconsistency giữa các connection. Cần đảm bảo chỉ CÓ MỘT instance duy nhất.",
            Nodes = new List<UMLNodeDto>
            {
                new() { Id = "DB1", Name = "DatabaseConnection #1", NodeType = "class", Attributes = new() { "- connStr: string" }, Methods = new() { "+ query(): Result" }, X = 80, Y = 200, StatusLabel = "INSTANCE 1" },
                new() { Id = "DB2", Name = "DatabaseConnection #2", NodeType = "class", Attributes = new() { "- connStr: string" }, Methods = new() { "+ query(): Result" }, X = 300, Y = 200, StatusLabel = "INSTANCE 2" },
                new() { Id = "DB3", Name = "DatabaseConnection #3", NodeType = "class", Attributes = new() { "- connStr: string" }, Methods = new() { "+ query(): Result" }, X = 520, Y = 200, StatusLabel = "INSTANCE 3" },
            },
            Links = new(),
            CouplingIndex = 70
        });

        // Frame 2: Singleton implementation
        frames.Add(new DesignPatternFrameDto
        {
            StepIndex = 1,
            ActionType = "IMPLEMENT_SINGLETON",
            PatternName = "Singleton",
            Explanation = "Biến constructor thành private. Thêm static getInstance() trả về instance duy nhất. Lazy initialization: chỉ tạo khi gọi lần đầu.",
            Nodes = new List<UMLNodeDto>
            {
                new() { Id = "Singleton", Name = "DatabaseConnection", NodeType = "class", Attributes = new() { "- static instance: DatabaseConnection", "- connStr: string" }, Methods = new() { "- DatabaseConnection() // private", "+ static getInstance(): DatabaseConnection", "+ query(): Result" }, X = 200, Y = 150, StatusLabel = "SINGLETON" },
            },
            Links = new(),
            CouplingIndex = 30
        });

        // Frame 3: Multiple callers, same instance
        frames.Add(new DesignPatternFrameDto
        {
            StepIndex = 2,
            ActionType = "RESOLVE_SAME_INSTANCE",
            PatternName = "Singleton",
            Explanation = "ServiceA và ServiceB cùng gọi DatabaseConnection.getInstance() → nhận về CÙNG MỘT object. Đảm bảo consistency và tiết kiệm tài nguyên.",
            Nodes = new List<UMLNodeDto>
            {
                new() { Id = "Singleton", Name = "DatabaseConnection", NodeType = "class", Attributes = new() { "- static instance" }, Methods = new() { "+ static getInstance()" }, X = 200, Y = 50, StatusLabel = "SINGLE INSTANCE" },
                new() { Id = "ServiceA", Name = "ServiceA", NodeType = "class", Attributes = new(), Methods = new() { "+ doWork(): void" }, X = 80, Y = 250 },
                new() { Id = "ServiceB", Name = "ServiceB", NodeType = "class", Attributes = new(), Methods = new() { "+ doWork(): void" }, X = 320, Y = 250 },
            },
            Links = new List<UMLLinkDto>
            {
                new() { Id = "AtoSingleton", SourceId = "ServiceA", TargetId = "Singleton", LinkType = "dependency", IsActive = true },
                new() { Id = "BtoSingleton", SourceId = "ServiceB", TargetId = "Singleton", LinkType = "dependency", IsActive = true },
            },
            ActiveNodeId = "Singleton",
            CouplingIndex = 25
        });

        // Frame 4: Conclusion
        frames.Add(new DesignPatternFrameDto
        {
            StepIndex = 3,
            ActionType = "CONCLUSION",
            PatternName = "Singleton",
            Explanation = "Singleton đảm bảo duy nhất 1 instance trong toàn bộ ứng dụng. Phù hợp cho: DB connection pool, logger, configuration. Cẩn thận: khó test, hidden dependency — nên kết hợp với DI Container.",
            Nodes = new List<UMLNodeDto>
            {
                new() { Id = "Singleton", Name = "DatabaseConnection", NodeType = "class", Attributes = new(), Methods = new() { "+ static getInstance()" }, X = 200, Y = 150, StatusLabel = "✓ SINGLETON — 1 INSTANCE" },
            },
            Links = new(),
            CouplingIndex = 20
        });

        return frames;
    }
}
