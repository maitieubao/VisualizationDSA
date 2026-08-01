using System.Collections.Generic;

namespace VisualizationDSA.Application.DTOs.Sandbox
{
    public class SandboxResult
    {
        public bool Success { get; set; }
        public List<ExecutionTraceStep> ExecutionTrace { get; set; } = new List<ExecutionTraceStep>();
        public int TotalSteps { get; set; }
        public string? Error { get; set; }
        public string? Message { get; set; }

        public static SandboxResult CreateSuccess(List<ExecutionTraceStep> trace)
        {
            return new SandboxResult
            {
                Success = true,
                ExecutionTrace = trace,
                TotalSteps = trace.Count
            };
        }

        public static SandboxResult CreateError(string error, string message)
        {
            return new SandboxResult
            {
                Success = false,
                Error = error,
                Message = message
            };
        }
    }

    public class ExecutionTraceStep
    {
        public int Step { get; set; }
        public int Line { get; set; }
        public Dictionary<string, object?> Variables { get; set; } = new Dictionary<string, object?>();
        public List<int> ArrayState { get; set; } = new List<int>();
        public List<int> HighlightIndices { get; set; } = new List<int>();
        public SwapEvent? SwapEvent { get; set; }
        public List<string> CallStack { get; set; } = new List<string>();
    }

    public class SwapEvent
    {
        public int From { get; set; }
        public int To { get; set; }
    }

    public class ExecuteCodeRequest
    {
        public string SourceCode { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
        public string? NodeId { get; set; }
    }
}
