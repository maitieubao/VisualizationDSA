using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;

namespace VisualizationDSA.Infrastructure.Services
{
    public class MockCodeJudgeService : ICodeJudgeService
    {
        public async Task<CodeJudgeResult> EvaluateCodeAsync(string code, string language, List<CodelabTestCase> testCases, int maxRuntimeMs, int maxMemoryBytes)
        {
            var random = new Random();
            var result = new CodeJudgeResult
            {
                Status = SubmissionStatus.Accepted,
                Passed = true
            };

            
            if (code.Contains("syntax error") || code.Contains("throw"))
            {
                result.Passed = false;
                result.Status = SubmissionStatus.CompilationError;
                result.ErrorMessage = "Syntax error or unexpected token.";
                result.RuntimeMs = random.Next(10, 50);
                result.MemoryBytes = random.Next(1024, maxMemoryBytes);
                return result;
            }

            int totalScore = 0;
            int totalRuntime = 0;
            int maxMemory = 0;

            foreach (var testCase in testCases)
            {
                int delayMs = random.Next(10, 300);
                await Task.Delay(10); 

                int memBytes = random.Next(1024, maxMemoryBytes / 2);

                if (delayMs > maxRuntimeMs)
                {
                    result.TestCaseResults.Add(new TestCaseResult
                    {
                        Passed = false,
                        RuntimeMs = delayMs,
                        MemoryBytes = memBytes,
                        ActualOutput = "",
                        ExpectedOutput = testCase.ExpectedOutput,
                        ErrorMessage = "Time Limit Exceeded"
                    });
                    result.Passed = false;
                    result.Status = SubmissionStatus.TimeLimitExceeded;
                    break;
                }

                
                bool isSuccess = !code.Contains("bug") && !code.Contains("fail");
                
                var tcResult = new TestCaseResult
                {
                    Passed = isSuccess,
                    RuntimeMs = delayMs,
                    MemoryBytes = memBytes,
                    ActualOutput = isSuccess ? testCase.ExpectedOutput : "wrong output",
                    ExpectedOutput = testCase.ExpectedOutput,
                    ErrorMessage = isSuccess ? "" : "Wrong Answer"
                };

                result.TestCaseResults.Add(tcResult);

                if (isSuccess)
                {
                    result.PassedCount++;
                    totalScore += testCase.ScoreWeight;
                }
                else
                {
                    result.Passed = false;
                    result.Status = SubmissionStatus.WrongAnswer;
                }

                totalRuntime += delayMs;
                if (memBytes > maxMemory) maxMemory = memBytes;
                
                
            }

            result.TotalCount = testCases.Count;
            result.TotalScore = totalScore;
            result.RuntimeMs = totalRuntime;
            result.MemoryBytes = maxMemory;

            if (result.Passed)
            {
                result.Status = SubmissionStatus.Accepted;
            }

            return result;
        }
    }
}
