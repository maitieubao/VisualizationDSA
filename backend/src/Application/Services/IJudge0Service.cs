using System.Collections.Generic;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs.PracticeLadder;

namespace VisualizationDSA.Application.Services
{
    public interface IJudge0Service
    {
        Task<LeetCodeSubmitResponseDto> ExecuteAsync(string sourceCode, string language, IEnumerable<TestCaseDto> testCases);
    }

    public class TestCaseDto
    {
        public string Input { get; set; } = string.Empty;
        public string ExpectedOutput { get; set; } = string.Empty;
    }
}
