using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using VisualizationDSA.Application.DTOs.PracticeLadder;
using VisualizationDSA.Application.Services;

namespace VisualizationDSA.Infrastructure.Services
{
    public class Judge0Service : IJudge0Service
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<Judge0Service> _logger;

        public Judge0Service(HttpClient httpClient, IConfiguration config, ILogger<Judge0Service> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
            var baseUrl = config["Judge0:BaseUrl"] ?? "http://localhost:2358";
            _httpClient.BaseAddress = new Uri(baseUrl);
        }

        public async Task<LeetCodeSubmitResponseDto> ExecuteAsync(string sourceCode, string language, IEnumerable<TestCaseDto> testCases)
        {
            // 1. Map language to Judge0 language_id (71=Python, 54=C++, 62=Java, 63=JavaScript)
            int languageId = language.ToLower() switch
            {
                "cpp" => 54,
                "c++" => 54,
                "java" => 62,
                "python" => 71,
                "js" => 63,
                "javascript" => 63,
                _ => 54 // Default to C++
            };

            var testCaseList = testCases.ToList();
            var submissions = testCaseList.Select(tc => new
            {
                source_code = sourceCode,
                language_id = languageId,
                stdin = tc.Input,
                expected_output = tc.ExpectedOutput,
                cpu_time_limit = 5.0, // 5 seconds
                memory_limit = 262144 // 256 MB
            }).ToList();

            var response = new LeetCodeSubmitResponseDto
            {
                TotalTestcases = testCaseList.Count,
                PassedTestcases = 0,
                Passed = false
            };

            try
            {
                // Note: Judge0 Batch submission requires proper setup. 
                // For simplicity, we are simulating the behavior if Judge0 is not running yet.
                // In production, we'd POST to `/submissions/batch` and poll.

                _logger.LogInformation("Submitting code to Judge0 for {Count} test cases.", testCaseList.Count);

                // Mock behavior for now to allow FE integration before Docker is fully set up by the user.
                // In a real implementation we would:
                // 1. POST /submissions/batch?base64_encoded=false
                // 2. Get tokens
                // 3. Poll /submissions/batch?tokens=...
                // Since this is a placeholder implementation as per the plan:

                response.PassedTestcases = testCaseList.Count; // Mock all passed
                response.Result = "AC";
                response.Score = 100;
                response.Passed = true;
                response.RuntimeMs = new Random().Next(10, 50);
                response.MemoryKb = new Random().Next(10000, 20000);
                response.Percentile = 85;

                await Task.Delay(500); // Simulate network delay
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing code via Judge0.");
                response.Result = "CE";
                response.CompilerOutput = ex.Message;
            }

            return response;
        }
    }
}
