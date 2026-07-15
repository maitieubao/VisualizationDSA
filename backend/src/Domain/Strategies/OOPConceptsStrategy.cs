using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

/// <summary>
/// Strategy sinh chuỗi frame trực quan hóa các khái niệm OOP:
/// Đóng gói (Encapsulation), Kế thừa (Inheritance), Đa hình (Polymorphism),
/// Trừu tượng (Abstraction). Mỗi kịch bản sinh ra một chuỗi OOPFrameDto
/// tương ứng với các bước trong frontend ScenarioStep.
/// </summary>
public class OOPConceptsStrategy : IConceptStrategy
{
    public string ConceptId => "oop-concepts";
    public string Name => "OOP Concepts Visualizer (4 Pillars)";
    public string Category => "OOP";

    public List<string> SupportedScenarios => new()
    {
        "encapsulation",
        "inheritance",
        "polymorphism",
        "abstraction"
    };

    // ── Định nghĩa các lớp OOP dùng chung cho mọi kịch bản ──

    private static readonly ClassDefinitionDto ShapeClass = new()
    {
        ClassName = "Shape",
        IsAbstract = true,
        Members = new List<ClassMemberDto>
        {
            new() { Name = "color", Type = "FIELD", AccessModifier = "PROTECTED", ReturnType = "string" },
            new() { Name = "draw", Type = "METHOD", AccessModifier = "PUBLIC", IsAbstract = true, ReturnType = "void" },
            new() { Name = "area", Type = "METHOD", AccessModifier = "PUBLIC", IsAbstract = true, ReturnType = "double" }
        }
    };

    private static readonly ClassDefinitionDto CircleClass = new()
    {
        ClassName = "Circle",
        ParentClass = "Shape",
        Members = new List<ClassMemberDto>
        {
            new() { Name = "radius", Type = "FIELD", AccessModifier = "PRIVATE", ReturnType = "double" },
            new() { Name = "draw", Type = "METHOD", AccessModifier = "PUBLIC", IsOverridden = true, ReturnType = "void" },
            new() { Name = "area", Type = "METHOD", AccessModifier = "PUBLIC", IsOverridden = true, ReturnType = "double" },
            new() { Name = "setRadius", Type = "METHOD", AccessModifier = "PUBLIC", ReturnType = "void" },
            new() { Name = "getRadius", Type = "METHOD", AccessModifier = "PUBLIC", ReturnType = "double" }
        }
    };

    private static readonly ClassDefinitionDto RectangleClass = new()
    {
        ClassName = "Rectangle",
        ParentClass = "Shape",
        Members = new List<ClassMemberDto>
        {
            new() { Name = "width", Type = "FIELD", AccessModifier = "PRIVATE", ReturnType = "double" },
            new() { Name = "height", Type = "FIELD", AccessModifier = "PRIVATE", ReturnType = "double" },
            new() { Name = "draw", Type = "METHOD", AccessModifier = "PUBLIC", IsOverridden = true, ReturnType = "void" },
            new() { Name = "area", Type = "METHOD", AccessModifier = "PUBLIC", IsOverridden = true, ReturnType = "double" }
        }
    };

    /// <summary>
    /// Sinh chuỗi frame hoạt ảnh cho kịch bản OOP được chỉ định.
    /// </summary>
    public List<OOPFrameDto> ExecuteScenario(string scenarioId, CancellationToken cancellationToken = default)
    {
        return scenarioId.ToLowerInvariant() switch
        {
            "encapsulation" => GenerateEncapsulationFrames(cancellationToken),
            "inheritance" => GenerateInheritanceFrames(cancellationToken),
            "polymorphism" => GeneratePolymorphismFrames(cancellationToken),
            "abstraction" => GenerateAbstractionFrames(cancellationToken),
            _ => throw new ArgumentException($"Kịch bản OOP '{scenarioId}' không được hỗ trợ.")
        };
    }

    // ══════════════════════════════════════════════
    // Encapsulation: Đóng gói — Bảo vệ trường private
    // ══════════════════════════════════════════════

    private List<OOPFrameDto> GenerateEncapsulationFrames(CancellationToken ct)
    {
        var frames = new List<OOPFrameDto>();
        int step = 0;

        // Bước 1: Khởi tạo Circle
        ct.ThrowIfCancellationRequested();
        frames.Add(new OOPFrameDto
        {
            StepId = ++step,
            CodeLineIndex = 1,
            ActionName = "INSTANTIATE",
            Explanation = "Khởi tạo đối tượng Circle. Trường radius là PRIVATE — không cho phép truy cập trực tiếp.",
            ClassDefinitions = new List<ClassDefinitionDto> { ShapeClass, CircleClass },
            HeapObjects = new List<HeapObjectDto>
            {
                CreateHeapObject("0x310000", "Circle", new() { { "radius", 0 }, { "color", "none" } })
            },
            ActionPayload = new Dictionary<string, object> { { "className", "Circle" } }
        });

        // Bước 2: Vi phạm đóng gói — truy cập private trực tiếp
        ct.ThrowIfCancellationRequested();
        frames.Add(new OOPFrameDto
        {
            StepId = ++step,
            CodeLineIndex = 4,
            ActionName = "VIOLATE_ACCESS",
            Explanation = "Cố gán circle.radius = -10. Trường radius là PRIVATE → Kích hoạt lỗi truy cập.",
            ClassDefinitions = new List<ClassDefinitionDto> { ShapeClass, CircleClass },
            HeapObjects = new List<HeapObjectDto>
            {
                CreateHeapObject("0x310000", "Circle", new() { { "radius", 0 }, { "color", "none" } })
            },
            Violation = new EncapsulationViolationDto
            {
                TargetClass = "Circle",
                MemberName = "radius",
                CallerClass = "Main",
                ErrorMessage = "Access Denied: 'radius' is PRIVATE in Circle"
            },
            ActionPayload = new Dictionary<string, object> { { "className", "Circle" }, { "memberName", "radius" } }
        });

        // Bước 3: Gọi setter an toàn — seeking VTable
        ct.ThrowIfCancellationRequested();
        frames.Add(new OOPFrameDto
        {
            StepId = ++step,
            CodeLineIndex = 7,
            ActionName = "CALL_METHOD",
            Explanation = "Gọi circle.setRadius(10). Laser bắn từ Heap Object đến phương thức setRadius() trên class card.",
            ClassDefinitions = new List<ClassDefinitionDto> { ShapeClass, CircleClass },
            HeapObjects = new List<HeapObjectDto>
            {
                CreateHeapObject("0x310000", "Circle", new() { { "radius", 0 }, { "color", "none" } })
            },
            ExecutionPointer = new ExecutionPointerDto
            {
                CallerClass = "Main",
                ActiveObjectAddress = "0x310000",
                ActiveMethod = "setRadius",
                DispatchStatus = "SEEKING_VTABLE"
            },
            ActionPayload = new Dictionary<string, object> { { "methodName", "setRadius" }, { "state", "seeking" } }
        });

        // Bước 4: Setter thực thi — cập nhật giá trị
        ct.ThrowIfCancellationRequested();
        frames.Add(new OOPFrameDto
        {
            StepId = ++step,
            CodeLineIndex = 7,
            ActionName = "VALIDATE_SETTER",
            Explanation = "Setter setRadius() kiểm tra value > 0. Thỏa mãn! Cập nhật radius = 10 trên Heap.",
            ClassDefinitions = new List<ClassDefinitionDto> { ShapeClass, CircleClass },
            HeapObjects = new List<HeapObjectDto>
            {
                CreateHeapObject("0x310000", "Circle", new() { { "radius", 10 }, { "color", "none" } })
            },
            ExecutionPointer = new ExecutionPointerDto
            {
                CallerClass = "Main",
                ActiveObjectAddress = "0x310000",
                ActiveMethod = "setRadius",
                DispatchStatus = "DISPATCHED",
                ResolvedClass = "Circle"
            },
            ActionPayload = new Dictionary<string, object> { { "memberName", "radius" }, { "value", 10 } }
        });

        return frames;
    }

    // ══════════════════════════════════════════════
    // Inheritance: Kế thừa — Sao chép phương thức từ cha
    // ══════════════════════════════════════════════

    private List<OOPFrameDto> GenerateInheritanceFrames(CancellationToken ct)
    {
        var frames = new List<OOPFrameDto>();
        int step = 0;

        // Bước 1: Clone members từ Shape sang Circle
        ct.ThrowIfCancellationRequested();
        frames.Add(new OOPFrameDto
        {
            StepId = ++step,
            CodeLineIndex = 2,
            ActionName = "CLONE_MEMBERS",
            Explanation = "Circle kế thừa Shape. Phương thức draw() và area() sao chép xuống Circle dưới dạng 'phương thức kế thừa'.",
            ClassDefinitions = new List<ClassDefinitionDto> { ShapeClass, CircleClass },
            HeapObjects = new List<HeapObjectDto>(),
            ActionPayload = new Dictionary<string, object> { { "className", "Circle" } }
        });

        // Bước 2: Khởi tạo Circle trên Heap
        ct.ThrowIfCancellationRequested();
        frames.Add(new OOPFrameDto
        {
            StepId = ++step,
            CodeLineIndex = 2,
            ActionName = "INSTANTIATE",
            Explanation = "Khởi tạo Circle trên Heap. VTable trỏ draw() tới Shape.draw() (chưa override).",
            ClassDefinitions = new List<ClassDefinitionDto> { ShapeClass, CircleClass },
            HeapObjects = new List<HeapObjectDto>
            {
                CreateHeapObject("0x310000", "Circle",
                    new() { { "radius", 0 }, { "color", "none" } },
                    new() { { "draw", "Shape.draw" }, { "area", "Shape.area" } })
            },
            ActionPayload = new Dictionary<string, object> { { "className", "Circle" } }
        });

        // Bước 3: Gọi draw() — dispatch qua VTable
        ct.ThrowIfCancellationRequested();
        frames.Add(new OOPFrameDto
        {
            StepId = ++step,
            CodeLineIndex = 5,
            ActionName = "CALL_METHOD",
            Explanation = "Gọi circle.draw(). VTable lookup → con trỏ trỏ tới Shape.draw() vì chưa override.",
            ClassDefinitions = new List<ClassDefinitionDto> { ShapeClass, CircleClass },
            HeapObjects = new List<HeapObjectDto>
            {
                CreateHeapObject("0x310000", "Circle",
                    new() { { "radius", 0 }, { "color", "none" } },
                    new() { { "draw", "Shape.draw" }, { "area", "Shape.area" } })
            },
            ExecutionPointer = new ExecutionPointerDto
            {
                CallerClass = "Main",
                ActiveObjectAddress = "0x310000",
                ActiveMethod = "draw",
                DispatchStatus = "SEEKING_VTABLE"
            },
            ActionPayload = new Dictionary<string, object> { { "methodName", "draw" }, { "state", "seeking" } }
        });

        // Bước 4: Dispatch hoàn tất — resolved tới Shape.draw()
        ct.ThrowIfCancellationRequested();
        frames.Add(new OOPFrameDto
        {
            StepId = ++step,
            CodeLineIndex = 5,
            ActionName = "CALL_METHOD",
            Explanation = "VTable dispatch hoàn tất: circle.draw() → Shape.draw(). Laser xanh lục xác nhận.",
            ClassDefinitions = new List<ClassDefinitionDto> { ShapeClass, CircleClass },
            HeapObjects = new List<HeapObjectDto>
            {
                CreateHeapObject("0x310000", "Circle",
                    new() { { "radius", 0 }, { "color", "none" } },
                    new() { { "draw", "Shape.draw" }, { "area", "Shape.area" } })
            },
            ExecutionPointer = new ExecutionPointerDto
            {
                CallerClass = "Main",
                ActiveObjectAddress = "0x310000",
                ActiveMethod = "draw",
                DispatchStatus = "DISPATCHED",
                ResolvedClass = "Shape"
            },
            ActionPayload = new Dictionary<string, object> { { "methodName", "draw" }, { "state", "resolved" }, { "targetClass", "Shape" } }
        });

        return frames;
    }

    // ══════════════════════════════════════════════
    // Polymorphism: Đa hình — Override & Dynamic Dispatch
    // ══════════════════════════════════════════════

    private List<OOPFrameDto> GeneratePolymorphismFrames(CancellationToken ct)
    {
        var frames = new List<OOPFrameDto>();
        int step = 0;
        var allClasses = new List<ClassDefinitionDto> { ShapeClass, CircleClass, RectangleClass };

        // Bước 1: Khởi tạo Circle (đã override draw)
        ct.ThrowIfCancellationRequested();
        frames.Add(new OOPFrameDto
        {
            StepId = ++step,
            CodeLineIndex = 0,
            ActionName = "INSTANTIATE",
            Explanation = "Tạo Circle trên Heap. Circle đã override draw() → VTable trỏ tới Circle.draw().",
            ClassDefinitions = allClasses,
            HeapObjects = new List<HeapObjectDto>
            {
                CreateHeapObject("0x310000", "Circle",
                    new() { { "radius", 5 } },
                    new() { { "draw", "Circle.draw" }, { "area", "Circle.area" } })
            },
            ActionPayload = new Dictionary<string, object> { { "className", "Circle" } }
        });

        // Bước 2: Khởi tạo Rectangle
        ct.ThrowIfCancellationRequested();
        frames.Add(new OOPFrameDto
        {
            StepId = ++step,
            CodeLineIndex = 1,
            ActionName = "INSTANTIATE",
            Explanation = "Tạo Rectangle trên Heap. Rectangle cũng override draw() → VTable riêng.",
            ClassDefinitions = allClasses,
            HeapObjects = new List<HeapObjectDto>
            {
                CreateHeapObject("0x310000", "Circle",
                    new() { { "radius", 5 } },
                    new() { { "draw", "Circle.draw" }, { "area", "Circle.area" } }),
                CreateHeapObject("0x310010", "Rectangle",
                    new() { { "width", 10 }, { "height", 5 } },
                    new() { { "draw", "Rectangle.draw" }, { "area", "Rectangle.area" } })
            },
            ActionPayload = new Dictionary<string, object> { { "className", "Rectangle" } }
        });

        // Bước 3: Gọi shape.draw() trên Circle — Dynamic Dispatch
        ct.ThrowIfCancellationRequested();
        frames.Add(new OOPFrameDto
        {
            StepId = ++step,
            CodeLineIndex = 3,
            ActionName = "CALL_METHOD",
            Explanation = "Gọi shapes[0].draw(). Biến shapes[0] kiểu Shape nhưng thực thể là Circle → VTable dispatch tới Circle.draw().",
            ClassDefinitions = allClasses,
            HeapObjects = new List<HeapObjectDto>
            {
                CreateHeapObject("0x310000", "Circle",
                    new() { { "radius", 5 } },
                    new() { { "draw", "Circle.draw" }, { "area", "Circle.area" } }),
                CreateHeapObject("0x310010", "Rectangle",
                    new() { { "width", 10 }, { "height", 5 } },
                    new() { { "draw", "Rectangle.draw" }, { "area", "Rectangle.area" } })
            },
            ExecutionPointer = new ExecutionPointerDto
            {
                CallerClass = "Main",
                ActiveObjectAddress = "0x310000",
                ActiveMethod = "draw",
                DispatchStatus = "DISPATCHED",
                ResolvedClass = "Circle"
            },
            ActionPayload = new Dictionary<string, object> { { "methodName", "draw" }, { "state", "resolved" }, { "targetClass", "Circle" } }
        });

        // Bước 4: Gọi shape.draw() trên Rectangle — Dynamic Dispatch
        ct.ThrowIfCancellationRequested();
        frames.Add(new OOPFrameDto
        {
            StepId = ++step,
            CodeLineIndex = 3,
            ActionName = "CALL_METHOD",
            Explanation = "Gọi shapes[1].draw(). Thực thể là Rectangle → VTable dispatch tới Rectangle.draw(). Cùng lời gọi, hành vi khác nhau!",
            ClassDefinitions = allClasses,
            HeapObjects = new List<HeapObjectDto>
            {
                CreateHeapObject("0x310000", "Circle",
                    new() { { "radius", 5 } },
                    new() { { "draw", "Circle.draw" }, { "area", "Circle.area" } }),
                CreateHeapObject("0x310010", "Rectangle",
                    new() { { "width", 10 }, { "height", 5 } },
                    new() { { "draw", "Rectangle.draw" }, { "area", "Rectangle.area" } })
            },
            ExecutionPointer = new ExecutionPointerDto
            {
                CallerClass = "Main",
                ActiveObjectAddress = "0x310010",
                ActiveMethod = "draw",
                DispatchStatus = "DISPATCHED",
                ResolvedClass = "Rectangle"
            },
            ActionPayload = new Dictionary<string, object> { { "methodName", "draw" }, { "state", "resolved" }, { "targetClass", "Rectangle" } }
        });

        return frames;
    }

    // ══════════════════════════════════════════════
    // Abstraction: Trừu tượng — Không thể khởi tạo lớp abstract
    // ══════════════════════════════════════════════

    private List<OOPFrameDto> GenerateAbstractionFrames(CancellationToken ct)
    {
        var frames = new List<OOPFrameDto>();
        int step = 0;

        // Bước 1: Cố khởi tạo Shape trực tiếp — lỗi abstract
        ct.ThrowIfCancellationRequested();
        frames.Add(new OOPFrameDto
        {
            StepId = ++step,
            CodeLineIndex = 0,
            ActionName = "SHOW_ABSTRACT_ERROR",
            Explanation = "Cố tạo Shape trực tiếp: new Shape(). Lỗi! Shape là abstract class — không thể khởi tạo trực tiếp.",
            ClassDefinitions = new List<ClassDefinitionDto> { ShapeClass, CircleClass },
            HeapObjects = new List<HeapObjectDto>(),
            ActionPayload = new Dictionary<string, object> { { "className", "Shape" } }
        });

        // Bước 2: Khởi tạo Circle (concrete) thành công
        ct.ThrowIfCancellationRequested();
        frames.Add(new OOPFrameDto
        {
            StepId = ++step,
            CodeLineIndex = 2,
            ActionName = "INSTANTIATE",
            Explanation = "Tạo Circle (concrete class kế thừa Shape). Thành công! Circle đã triển khai draw() và area().",
            ClassDefinitions = new List<ClassDefinitionDto> { ShapeClass, CircleClass },
            HeapObjects = new List<HeapObjectDto>
            {
                CreateHeapObject("0x310000", "Circle",
                    new() { { "radius", 5 } },
                    new() { { "draw", "Circle.draw" }, { "area", "Circle.area" } })
            },
            ActionPayload = new Dictionary<string, object> { { "className", "Circle" } }
        });

        // Bước 3: Gọi draw() trên Circle — triển khai abstract method
        ct.ThrowIfCancellationRequested();
        frames.Add(new OOPFrameDto
        {
            StepId = ++step,
            CodeLineIndex = 4,
            ActionName = "CALL_METHOD",
            Explanation = "Gọi circle.draw(). Abstract method draw() đã được Circle triển khai cụ thể → Thực thi Circle.draw().",
            ClassDefinitions = new List<ClassDefinitionDto> { ShapeClass, CircleClass },
            HeapObjects = new List<HeapObjectDto>
            {
                CreateHeapObject("0x310000", "Circle",
                    new() { { "radius", 5 } },
                    new() { { "draw", "Circle.draw" }, { "area", "Circle.area" } })
            },
            ExecutionPointer = new ExecutionPointerDto
            {
                CallerClass = "Main",
                ActiveObjectAddress = "0x310000",
                ActiveMethod = "draw",
                DispatchStatus = "DISPATCHED",
                ResolvedClass = "Circle"
            },
            ActionPayload = new Dictionary<string, object> { { "methodName", "draw" }, { "state", "resolved" }, { "targetClass", "Circle" } }
        });

        return frames;
    }

    // ── Helper ──

    private static HeapObjectDto CreateHeapObject(
        string address,
        string className,
        Dictionary<string, object> fields,
        Dictionary<string, string>? vTable = null)
    {
        return new HeapObjectDto
        {
            Address = address,
            ClassName = className,
            FieldsData = fields,
            VTable = vTable ?? new Dictionary<string, string>()
        };
    }
}
