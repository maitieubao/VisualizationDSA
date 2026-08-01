using System.Collections.Generic;
using System.Threading.Tasks;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;

namespace VisualizationDSA.Application.Services
{
    public class TestCaseResult
    {
        public bool Passed { get; set; }
        public string ActualOutput { get; set; } = string.Empty;
        public string ExpectedOutput { get; set; } = string.Empty;
        public int RuntimeMs { get; set; }
        public int MemoryBytes { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
    }

    public class CodeJudgeResult
    {
        public bool Passed { get; set; }
        public SubmissionStatus Status { get; set; } = SubmissionStatus.Pending;
        public string ErrorMessage { get; set; } = string.Empty;
        public int RuntimeMs { get; set; }
        public int MemoryBytes { get; set; }
        public int PassedCount { get; set; }
        public int TotalCount { get; set; }
        public int TotalScore { get; set; }
        public List<TestCaseResult> TestCaseResults { get; set; } = new List<TestCaseResult>();
    }

    public interface ICodeJudgeService
    {
        Task<CodeJudgeResult> EvaluateCodeAsync(string code, string language, List<CodelabTestCase> testCases, int maxRuntimeMs, int maxMemoryBytes);
    }
}
