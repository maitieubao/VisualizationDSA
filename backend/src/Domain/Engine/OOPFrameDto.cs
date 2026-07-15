namespace VisualizationDSA.Domain.Engine;

/// <summary>
/// Snapshot một bước trong kịch bản OOP Concepts.
/// Mỗi frame chứa trạng thái lớp, heap, con trỏ thực thi và vi phạm (nếu có).
/// </summary>
public class OOPFrameDto
{
    public int StepId { get; set; }
    public int CodeLineIndex { get; set; }
    public string ActionName { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
    public List<ClassDefinitionDto> ClassDefinitions { get; set; } = new();
    public List<HeapObjectDto> HeapObjects { get; set; } = new();
    public ExecutionPointerDto? ExecutionPointer { get; set; }
    public EncapsulationViolationDto? Violation { get; set; }
    public Dictionary<string, object>? ActionPayload { get; set; }
}

/// <summary>
/// Định nghĩa một lớp OOP (UML card) với danh sách thành viên.
/// Tương ứng với frontend ClassDefinition.
/// </summary>
public class ClassDefinitionDto
{
    public string ClassName { get; set; } = string.Empty;
    public string? ParentClass { get; set; }
    public bool IsAbstract { get; set; }
    public List<ClassMemberDto> Members { get; set; } = new();
}

/// <summary>
/// Thành viên của lớp (trường hoặc phương thức) với modifier truy cập.
/// </summary>
public class ClassMemberDto
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;  // "FIELD" | "METHOD"
    public string AccessModifier { get; set; } = string.Empty;  // "PUBLIC" | "PROTECTED" | "PRIVATE"
    public bool IsOverridden { get; set; }
    public bool IsAbstract { get; set; }
    public string? ReturnType { get; set; }
}

/// <summary>
/// Đối tượng trên vùng nhớ Heap — địa chỉ, lớp, dữ liệu trường và bảng VTable.
/// Tương ứng với frontend HeapObjectInstance.
/// </summary>
public class HeapObjectDto
{
    public string Address { get; set; } = string.Empty;
    public string ClassName { get; set; } = string.Empty;
    public Dictionary<string, object> FieldsData { get; set; } = new();
    public Dictionary<string, string> VTable { get; set; } = new();
}

/// <summary>
/// Con trỏ thực thi hiện tại — theo dõi trạng thái VTable dispatch.
/// Tương ứng với frontend ExecutionPointer.
/// </summary>
public class ExecutionPointerDto
{
    public string CallerClass { get; set; } = string.Empty;
    public string ActiveObjectAddress { get; set; } = string.Empty;
    public string ActiveMethod { get; set; } = string.Empty;
    public string DispatchStatus { get; set; } = "IDLE";  // "IDLE" | "SEEKING_VTABLE" | "DISPATCHED" | "ACCESS_VIOLATED"
    public string? ResolvedClass { get; set; }
}

/// <summary>
/// Sự kiện vi phạm đóng gói khi truy cập trường private trực tiếp.
/// Tương ứng với frontend EncapsulationViolation.
/// </summary>
public class EncapsulationViolationDto
{
    public string TargetClass { get; set; } = string.Empty;
    public string MemberName { get; set; } = string.Empty;
    public string CallerClass { get; set; } = string.Empty;
    public string ErrorMessage { get; set; } = string.Empty;
}
