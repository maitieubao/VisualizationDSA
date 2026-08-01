namespace VisualizationDSA.Domain.Engine;





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





public class ClassDefinitionDto
{
    public string ClassName { get; set; } = string.Empty;
    public string? ParentClass { get; set; }
    public bool IsAbstract { get; set; }
    public List<ClassMemberDto> Members { get; set; } = new();
}




public class ClassMemberDto
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;  
    public string AccessModifier { get; set; } = string.Empty;  
    public bool IsOverridden { get; set; }
    public bool IsAbstract { get; set; }
    public string? ReturnType { get; set; }
}





public class HeapObjectDto
{
    public string Address { get; set; } = string.Empty;
    public string ClassName { get; set; } = string.Empty;
    public Dictionary<string, object> FieldsData { get; set; } = new();
    public Dictionary<string, string> VTable { get; set; } = new();
}





public class ExecutionPointerDto
{
    public string CallerClass { get; set; } = string.Empty;
    public string ActiveObjectAddress { get; set; } = string.Empty;
    public string ActiveMethod { get; set; } = string.Empty;
    public string DispatchStatus { get; set; } = "IDLE";  
    public string? ResolvedClass { get; set; }
}





public class EncapsulationViolationDto
{
    public string TargetClass { get; set; } = string.Empty;
    public string MemberName { get; set; } = string.Empty;
    public string CallerClass { get; set; } = string.Empty;
    public string ErrorMessage { get; set; } = string.Empty;
}
