using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

/// <summary>
/// Strategy sinh chuỗi frame cho mô-đun SOLID Principles Visualizer.
/// Hỗ trợ 3 kịch bản chính: SRP (God Class → Split), OCP (Extension vs Modification),
/// LSP (Substitution Violation).
/// </summary>
public class SOLIDPrinciplesStrategy : IConceptStrategy
{
    public string ConceptId => "solid-principles";
    public string Name => "SOLID Principles Visualizer";
    public string Category => "Architecture";
    public List<string> SupportedScenarios => new() { "srp", "ocp", "lsp" };

    public List<SOLIDFrameDto> ExecuteScenario(string scenarioId, CancellationToken ct = default)
    {
        return scenarioId.ToLowerInvariant() switch
        {
            "srp" => GenerateSRPFrames(),
            "ocp" => GenerateOCPFrames(),
            "lsp" => GenerateLSPFrames(),
            _ => throw new ArgumentException($"Kịch bản SOLID '{scenarioId}' không được hỗ trợ.")
        };
    }

    private static List<SOLIDFrameDto> GenerateSRPFrames()
    {
        var frames = new List<SOLIDFrameDto>();

        // Frame 1: God Class — UserManager có nhiều trách nhiệm
        frames.Add(new SOLIDFrameDto
        {
            StepIndex = 0,
            ActionType = "SHOW_VIOLATION",
            Principle = "SRP",
            Explanation = "Lớp UserManager đang VI PHẠM SRP: chứa 3 nhóm trách nhiệm khác nhau (Database, Hashing, Email). LCOM4 = 3 — cho thấy lớp nên tách ra.",
            IsViolation = true,
            ClassNodes = new List<SOLIDClassNodeDto>
            {
                new()
                {
                    NodeId = "user-manager",
                    ClassName = "UserManager",
                    Members = new List<SOLIDMemberDto>
                    {
                        new() { Name = "dbConn", MemberType = "FIELD", AccessedFields = new() },
                        new() { Name = "hasher", MemberType = "FIELD", AccessedFields = new() },
                        new() { Name = "smtpServer", MemberType = "FIELD", AccessedFields = new() },
                        new() { Name = "saveUser", MemberType = "METHOD", AccessedFields = new() { "dbConn" } },
                        new() { Name = "findUser", MemberType = "METHOD", AccessedFields = new() { "dbConn" } },
                        new() { Name = "hashPassword", MemberType = "METHOD", AccessedFields = new() { "hasher" } },
                        new() { Name = "sendWelcomeEmail", MemberType = "METHOD", AccessedFields = new() { "smtpServer" } },
                    },
                    CohesionScore = 3.0,
                    IsViolating = true,
                    StatusLabel = "GOD CLASS"
                }
            },
            Metrics = new SOLIDMetricsDto { Lcom4Score = 3.0, ResponsibilityCount = 3, CouplingLevel = "HIGH" }
        });

        // Frame 2: Phân tích nhóm trách nhiệm
        frames.Add(new SOLIDFrameDto
        {
            StepIndex = 1,
            ActionType = "ANALYZE_RESPONSIBILITIES",
            Principle = "SRP",
            Explanation = "Phân tích LCOM4: phát hiện 3 cụm phương thức độc lập. Nhóm 1: saveUser + findUser (dùng dbConn). Nhóm 2: hashPassword (dùng hasher). Nhóm 3: sendWelcomeEmail (dùng smtpServer).",
            IsViolation = true,
            ClassNodes = new List<SOLIDClassNodeDto>
            {
                new()
                {
                    NodeId = "user-manager",
                    ClassName = "UserManager",
                    Members = new List<SOLIDMemberDto>
                    {
                        new() { Name = "dbConn", MemberType = "FIELD", AccessedFields = new() },
                        new() { Name = "hasher", MemberType = "FIELD", AccessedFields = new() },
                        new() { Name = "smtpServer", MemberType = "FIELD", AccessedFields = new() },
                        new() { Name = "saveUser", MemberType = "METHOD", AccessedFields = new() { "dbConn" } },
                        new() { Name = "findUser", MemberType = "METHOD", AccessedFields = new() { "dbConn" } },
                        new() { Name = "hashPassword", MemberType = "METHOD", AccessedFields = new() { "hasher" } },
                        new() { Name = "sendWelcomeEmail", MemberType = "METHOD", AccessedFields = new() { "smtpServer" } },
                    },
                    CohesionScore = 3.0,
                    IsViolating = true,
                    StatusLabel = "PHÂN TÍCH NHÓM"
                }
            },
            Metrics = new SOLIDMetricsDto { Lcom4Score = 3.0, ResponsibilityCount = 3, CouplingLevel = "HIGH" }
        });

        // Frame 3: Tách thành 3 lớp đơn trách nhiệm
        frames.Add(new SOLIDFrameDto
        {
            StepIndex = 2,
            ActionType = "SPLIT_CLASS",
            Principle = "SRP",
            Explanation = "Tách UserManager thành 3 lớp đơn trách nhiệm: UserRepository (persistence), PasswordHasher (security), EmailNotifier (notification). Mỗi lớp có LCOM4 = 1.",
            IsViolation = false,
            ClassNodes = new List<SOLIDClassNodeDto>
            {
                new()
                {
                    NodeId = "user-repository",
                    ClassName = "UserRepository",
                    Members = new List<SOLIDMemberDto>
                    {
                        new() { Name = "dbConn", MemberType = "FIELD", AccessedFields = new() },
                        new() { Name = "saveUser", MemberType = "METHOD", AccessedFields = new() { "dbConn" } },
                        new() { Name = "findUser", MemberType = "METHOD", AccessedFields = new() { "dbConn" } },
                    },
                    CohesionScore = 1.0,
                    IsViolating = false,
                    StatusLabel = "CLEAN"
                },
                new()
                {
                    NodeId = "password-hasher",
                    ClassName = "PasswordHasher",
                    Members = new List<SOLIDMemberDto>
                    {
                        new() { Name = "hasher", MemberType = "FIELD", AccessedFields = new() },
                        new() { Name = "hashPassword", MemberType = "METHOD", AccessedFields = new() { "hasher" } },
                    },
                    CohesionScore = 1.0,
                    IsViolating = false,
                    StatusLabel = "CLEAN"
                },
                new()
                {
                    NodeId = "email-notifier",
                    ClassName = "EmailNotifier",
                    Members = new List<SOLIDMemberDto>
                    {
                        new() { Name = "smtpServer", MemberType = "FIELD", AccessedFields = new() },
                        new() { Name = "sendWelcomeEmail", MemberType = "METHOD", AccessedFields = new() { "smtpServer" } },
                    },
                    CohesionScore = 1.0,
                    IsViolating = false,
                    StatusLabel = "CLEAN"
                }
            },
            Metrics = new SOLIDMetricsDto { Lcom4Score = 1.0, ResponsibilityCount = 1, CouplingLevel = "LOW" }
        });

        // Frame 4: Kết luận
        frames.Add(new SOLIDFrameDto
        {
            StepIndex = 3,
            ActionType = "CONCLUSION",
            Principle = "SRP",
            Explanation = "Kết quả: Mỗi lớp giờ chỉ có MỘT lý do để thay đổi. UserRepository thay đổi khi schema DB đổi. PasswordHasher thay đổi khi thuật toán hash đổi. EmailNotifier thay đổi khi dịch vụ email đổi.",
            IsViolation = false,
            ClassNodes = new List<SOLIDClassNodeDto>
            {
                new() { NodeId = "user-repository", ClassName = "UserRepository", Members = new(), CohesionScore = 1.0, IsViolating = false, StatusLabel = "✓ SRP" },
                new() { NodeId = "password-hasher", ClassName = "PasswordHasher", Members = new(), CohesionScore = 1.0, IsViolating = false, StatusLabel = "✓ SRP" },
                new() { NodeId = "email-notifier", ClassName = "EmailNotifier", Members = new(), CohesionScore = 1.0, IsViolating = false, StatusLabel = "✓ SRP" },
            },
            Metrics = new SOLIDMetricsDto { Lcom4Score = 1.0, ResponsibilityCount = 1, CouplingLevel = "LOW" }
        });

        return frames;
    }

    private static List<SOLIDFrameDto> GenerateOCPFrames()
    {
        var frames = new List<SOLIDFrameDto>();

        // Frame 1: Vi phạm OCP — sửa đổi trực tiếp lớp khi thêm loại mới
        frames.Add(new SOLIDFrameDto
        {
            StepIndex = 0,
            ActionType = "SHOW_VIOLATION",
            Principle = "OCP",
            Explanation = "Lớp AreaCalculator VI PHẠM OCP: mỗi khi thêm hình mới (Triangle, Pentagon...), phải sửa phương thức calculateArea() — thêm if/else mới.",
            IsViolation = true,
            ClassNodes = new List<SOLIDClassNodeDto>
            {
                new()
                {
                    NodeId = "area-calculator",
                    ClassName = "AreaCalculator",
                    Members = new List<SOLIDMemberDto>
                    {
                        new() { Name = "calculateArea", MemberType = "METHOD", AccessedFields = new() },
                    },
                    CohesionScore = 0,
                    IsViolating = true,
                    StatusLabel = "PHẢI SỬA ĐỔI"
                },
                new()
                {
                    NodeId = "circle",
                    ClassName = "Circle",
                    Members = new List<SOLIDMemberDto>
                    {
                        new() { Name = "radius", MemberType = "FIELD", AccessedFields = new() },
                    },
                    CohesionScore = 1.0,
                    IsViolating = false
                },
                new()
                {
                    NodeId = "rectangle",
                    ClassName = "Rectangle",
                    Members = new List<SOLIDMemberDto>
                    {
                        new() { Name = "width", MemberType = "FIELD", AccessedFields = new() },
                        new() { Name = "height", MemberType = "FIELD", AccessedFields = new() },
                    },
                    CohesionScore = 1.0,
                    IsViolating = false
                }
            },
            Metrics = new SOLIDMetricsDto { Lcom4Score = 0, ResponsibilityCount = 1, CouplingLevel = "HIGH" },
            ViolationDetail = "Thêm Triangle → phải sửa calculateArea(). Vi phạm 'Closed for modification'."
        });

        // Frame 2: Giới thiệu Interface IShape
        frames.Add(new SOLIDFrameDto
        {
            StepIndex = 1,
            ActionType = "INTRODUCE_ABSTRACTION",
            Principle = "OCP",
            Explanation = "Giải pháp: Tạo interface IShape với phương thức area(). Mỗi hình tự tính diện tích. AreaCalculator chỉ gọi shape.area() — KHÔNG cần sửa khi thêm hình mới.",
            IsViolation = false,
            ClassNodes = new List<SOLIDClassNodeDto>
            {
                new() { NodeId = "ishape", ClassName = "IShape", Members = new List<SOLIDMemberDto> { new() { Name = "area()", MemberType = "METHOD", AccessedFields = new() } }, CohesionScore = 1.0, IsViolating = false, StatusLabel = "INTERFACE" },
                new() { NodeId = "circle", ClassName = "Circle : IShape", Members = new List<SOLIDMemberDto> { new() { Name = "area()", MemberType = "METHOD", AccessedFields = new() { "radius" } } }, CohesionScore = 1.0, IsViolating = false, StatusLabel = "IMPLEMENTS" },
                new() { NodeId = "rectangle", ClassName = "Rectangle : IShape", Members = new List<SOLIDMemberDto> { new() { Name = "area()", MemberType = "METHOD", AccessedFields = new() { "width", "height" } } }, CohesionScore = 1.0, IsViolating = false, StatusLabel = "IMPLEMENTS" },
            },
            Metrics = new SOLIDMetricsDto { Lcom4Score = 1.0, ResponsibilityCount = 1, CouplingLevel = "LOW" }
        });

        // Frame 3: Mở rộng bằng cách thêm class mới (không sửa code cũ)
        frames.Add(new SOLIDFrameDto
        {
            StepIndex = 2,
            ActionType = "EXTEND_WITHOUT_MODIFY",
            Principle = "OCP",
            Explanation = "Thêm Triangle chỉ cần tạo lớp mới implement IShape. AreaCalculator KHÔNG bị sửa đổi. Đây là 'Open for extension, Closed for modification'.",
            IsViolation = false,
            ClassNodes = new List<SOLIDClassNodeDto>
            {
                new() { NodeId = "ishape", ClassName = "IShape", Members = new List<SOLIDMemberDto> { new() { Name = "area()", MemberType = "METHOD", AccessedFields = new() } }, CohesionScore = 1.0, IsViolating = false, StatusLabel = "INTERFACE" },
                new() { NodeId = "circle", ClassName = "Circle : IShape", Members = new(), CohesionScore = 1.0, IsViolating = false },
                new() { NodeId = "rectangle", ClassName = "Rectangle : IShape", Members = new(), CohesionScore = 1.0, IsViolating = false },
                new() { NodeId = "triangle", ClassName = "Triangle : IShape", Members = new List<SOLIDMemberDto> { new() { Name = "area()", MemberType = "METHOD", AccessedFields = new() { "base", "height" } } }, CohesionScore = 1.0, IsViolating = false, StatusLabel = "MỚI — KHÔNG SỬA CODE CŨ" },
            },
            Metrics = new SOLIDMetricsDto { Lcom4Score = 1.0, ResponsibilityCount = 1, CouplingLevel = "LOW" }
        });

        // Frame 4: Kết luận
        frames.Add(new SOLIDFrameDto
        {
            StepIndex = 3,
            ActionType = "CONCLUSION",
            Principle = "OCP",
            Explanation = "Kết quả: Hệ thống tuân thủ OCP. Thêm hình mới = tạo class mới implement IShape. Không file cũ nào bị sửa → giảm rủi ro regression, dễ test riêng.",
            IsViolation = false,
            ClassNodes = new List<SOLIDClassNodeDto>
            {
                new() { NodeId = "area-calculator", ClassName = "AreaCalculator", Members = new(), CohesionScore = 1.0, IsViolating = false, StatusLabel = "✓ OCP — CLOSED" },
                new() { NodeId = "ishape", ClassName = "IShape", Members = new(), CohesionScore = 1.0, IsViolating = false, StatusLabel = "✓ OPEN FOR EXTENSION" },
            },
            Metrics = new SOLIDMetricsDto { Lcom4Score = 1.0, ResponsibilityCount = 1, CouplingLevel = "LOW" }
        });

        return frames;
    }

    private static List<SOLIDFrameDto> GenerateLSPFrames()
    {
        var frames = new List<SOLIDFrameDto>();

        // Frame 1: Giới thiệu kế thừa Bird → FlyingBird
        frames.Add(new SOLIDFrameDto
        {
            StepIndex = 0,
            ActionType = "SETUP_HIERARCHY",
            Principle = "LSP",
            Explanation = "Xây dựng hệ phân cấp: Bird (base) với phương thức fly(). FlyingBird kế thừa Bird — mọi thứ hoạt động bình thường.",
            IsViolation = false,
            ClassNodes = new List<SOLIDClassNodeDto>
            {
                new() { NodeId = "bird", ClassName = "Bird", Members = new List<SOLIDMemberDto> { new() { Name = "fly()", MemberType = "METHOD", AccessedFields = new() } }, CohesionScore = 1.0, IsViolating = false, StatusLabel = "BASE CLASS" },
                new() { NodeId = "eagle", ClassName = "Eagle : Bird", Members = new List<SOLIDMemberDto> { new() { Name = "fly()", MemberType = "METHOD", AccessedFields = new() } }, CohesionScore = 1.0, IsViolating = false, StatusLabel = "✓ CAN FLY" },
            },
            Metrics = new SOLIDMetricsDto { Lcom4Score = 1.0, ResponsibilityCount = 1, CouplingLevel = "LOW" }
        });

        // Frame 2: Thêm Penguin — vi phạm LSP
        frames.Add(new SOLIDFrameDto
        {
            StepIndex = 1,
            ActionType = "SHOW_VIOLATION",
            Principle = "LSP",
            Explanation = "Thêm Penguin kế thừa Bird. Nhưng Penguin KHÔNG THỂ fly()! Gọi penguin.fly() → throw Exception. Vi phạm LSP: không thể thay thế Bird bằng Penguin mà không phá vỡ chương trình.",
            IsViolation = true,
            ClassNodes = new List<SOLIDClassNodeDto>
            {
                new() { NodeId = "bird", ClassName = "Bird", Members = new List<SOLIDMemberDto> { new() { Name = "fly()", MemberType = "METHOD", AccessedFields = new() } }, CohesionScore = 1.0, IsViolating = false, StatusLabel = "BASE CLASS" },
                new() { NodeId = "eagle", ClassName = "Eagle : Bird", Members = new(), CohesionScore = 1.0, IsViolating = false, StatusLabel = "✓ CAN FLY" },
                new() { NodeId = "penguin", ClassName = "Penguin : Bird", Members = new List<SOLIDMemberDto> { new() { Name = "fly()", MemberType = "METHOD", AccessedFields = new() } }, CohesionScore = 1.0, IsViolating = true, StatusLabel = "✗ CANNOT FLY — EXCEPTION!" },
            },
            Metrics = new SOLIDMetricsDto { Lcom4Score = 1.0, ResponsibilityCount = 1, CouplingLevel = "HIGH" },
            ViolationDetail = "Penguin.fly() throws NotSupportedException. Client code expecting Bird.fly() to work will crash."
        });

        // Frame 3: Sửa bằng cách tách interface
        frames.Add(new SOLIDFrameDto
        {
            StepIndex = 2,
            ActionType = "FIX_WITH_INTERFACE",
            Principle = "LSP",
            Explanation = "Giải pháp: Tách Bird thành IFlyable (có fly()) và ISwimmable (có swim()). Eagle implements IFlyable. Penguin implements ISwimmable. Không vi phạm contract nữa.",
            IsViolation = false,
            ClassNodes = new List<SOLIDClassNodeDto>
            {
                new() { NodeId = "iflyable", ClassName = "IFlyable", Members = new List<SOLIDMemberDto> { new() { Name = "fly()", MemberType = "METHOD", AccessedFields = new() } }, CohesionScore = 1.0, IsViolating = false, StatusLabel = "INTERFACE" },
                new() { NodeId = "iswimmable", ClassName = "ISwimmable", Members = new List<SOLIDMemberDto> { new() { Name = "swim()", MemberType = "METHOD", AccessedFields = new() } }, CohesionScore = 1.0, IsViolating = false, StatusLabel = "INTERFACE" },
                new() { NodeId = "eagle", ClassName = "Eagle : IFlyable", Members = new(), CohesionScore = 1.0, IsViolating = false, StatusLabel = "✓ SUBSTITUTABLE" },
                new() { NodeId = "penguin", ClassName = "Penguin : ISwimmable", Members = new(), CohesionScore = 1.0, IsViolating = false, StatusLabel = "✓ SUBSTITUTABLE" },
            },
            Metrics = new SOLIDMetricsDto { Lcom4Score = 1.0, ResponsibilityCount = 1, CouplingLevel = "LOW" }
        });

        // Frame 4: Kết luận
        frames.Add(new SOLIDFrameDto
        {
            StepIndex = 3,
            ActionType = "CONCLUSION",
            Principle = "LSP",
            Explanation = "Kết quả: Liskov Substitution đảm bảo mọi subtype đều thay thế được base type mà KHÔNG phá vỡ hành vi. Nếu subtype không thể thực hiện contract của base → tách interface riêng.",
            IsViolation = false,
            ClassNodes = new List<SOLIDClassNodeDto>
            {
                new() { NodeId = "iflyable", ClassName = "IFlyable", Members = new(), CohesionScore = 1.0, IsViolating = false, StatusLabel = "✓ LSP" },
                new() { NodeId = "iswimmable", ClassName = "ISwimmable", Members = new(), CohesionScore = 1.0, IsViolating = false, StatusLabel = "✓ LSP" },
            },
            Metrics = new SOLIDMetricsDto { Lcom4Score = 1.0, ResponsibilityCount = 1, CouplingLevel = "LOW" }
        });

        return frames;
    }
}
