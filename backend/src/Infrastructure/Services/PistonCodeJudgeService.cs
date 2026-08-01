using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;

namespace VisualizationDSA.Infrastructure.Services
{
    public class JudgeOptions
    {
        public const string SectionName = "Judge";

        public string PistonApiUrl { get; set; } = "https://emkc.org/api/v2/piston";
        public string? AuthToken { get; set; }
        public string AuthHeader { get; set; } = "Authorization";
        public int HttpTimeoutSeconds { get; set; } = 30;
        public int MaxConcurrency { get; set; } = 3;
    }

    /// <summary>
    /// Judge thật dựa trên Piston (engine-man/piston) — chạy code trong sandbox Isolate,
    /// so sánh stdout với ExpectedOutput của từng test case, đo runtime/memory thực tế.
    /// </summary>
    public class PistonCodeJudgeService : ICodeJudgeService
    {
        private static readonly Dictionary<string, string> LanguageMap = new(StringComparer.OrdinalIgnoreCase)
        {
            ["csharp"] = "csharp",
            ["python"] = "python",
            ["javascript"] = "javascript",
            ["java"] = "java",
            ["cpp"] = "c++",
            ["c++"] = "c++",
            ["go"] = "go",
            ["rust"] = "rust",
            ["typescript"] = "typescript",
        };

        private readonly HttpClient _httpClient;
        private readonly JudgeOptions _options;
        private readonly IMemoryCache _cache;
        private readonly ILogger<PistonCodeJudgeService> _logger;

        public PistonCodeJudgeService(
            HttpClient httpClient,
            IOptions<JudgeOptions> options,
            IMemoryCache cache,
            ILogger<PistonCodeJudgeService> logger)
        {
            _httpClient = httpClient;
            _options = options.Value;
            _cache = cache;
            _logger = logger;
        }

        public async Task<CodeJudgeResult> EvaluateCodeAsync(
            string code,
            string language,
            List<CodelabTestCase> testCases,
            int maxRuntimeMs,
            int maxMemoryBytes)
        {
            var result = new CodeJudgeResult
            {
                Status = SubmissionStatus.Pending,
                TotalCount = testCases.Count
            };

            if (!LanguageMap.TryGetValue(language, out var pistonLanguage))
            {
                result.Passed = false;
                result.Status = SubmissionStatus.CompilationError;
                result.ErrorMessage = $"Ngôn ngữ '{language}' không được hỗ trợ bởi hệ thống chấm bài.";
                return result;
            }

            var version = await GetRuntimeVersionAsync(pistonLanguage, CancellationToken.None);
            if (string.IsNullOrEmpty(version))
            {
                _logger.LogWarning("Piston judge không khả dụng (không lấy được runtime cho {Language}).", pistonLanguage);
                result.Passed = false;
                result.Status = SubmissionStatus.JudgeUnavailable;
                result.ErrorMessage = "Hệ thống chấm bài (Judge) hiện không khả dụng. Vui lòng thử lại sau.";
                return result;
            }

            var semaphore = new SemaphoreSlim(Math.Max(1, _options.MaxConcurrency));
            var tasks = testCases.Select(async tc =>
            {
                await semaphore.WaitAsync();
                try
                {
                    return await EvaluateOneAsync(code, pistonLanguage, version, tc, maxRuntimeMs, maxMemoryBytes);
                }
                finally
                {
                    semaphore.Release();
                }
            });

            var perCaseResults = await Task.WhenAll(tasks);
            result.TestCaseResults.AddRange(perCaseResults);
            Aggregate(result, perCaseResults);
            return result;
        }

        private async Task<TestCaseResult> EvaluateOneAsync(
            string code,
            string pistonLanguage,
            string version,
            CodelabTestCase testCase,
            int maxRuntimeMs,
            int maxMemoryBytes)
        {
            var tcResult = new TestCaseResult
            {
                Name = $"Testcase #{testCase.OrderIndex}",
                IsHidden = testCase.IsHidden,
                ExpectedOutput = testCase.ExpectedOutput
            };

            var payload = new PistonExecuteRequest
            {
                Language = pistonLanguage,
                Version = version,
                Files = new[] { new PistonFile { Name = "main", Content = code } },
                Stdin = testCase.Input,
                RunTimeout = Math.Max(maxRuntimeMs, 1000) + 2000,
                CompileTimeout = 15000,
                RunMemoryLimit = maxMemoryBytes
            };

            try
            {
                var response = await ExecuteAsync(payload);

                if (response.Compile != null && (response.Compile.Code ?? 0) != 0)
                {
                    tcResult.Passed = false;
                    tcResult.Status = SubmissionStatus.CompilationError;
                    tcResult.ErrorMessage = TrimOutput(response.Compile.Stderr);
                    if (string.IsNullOrWhiteSpace(tcResult.ErrorMessage))
                        tcResult.ErrorMessage = response.Compile.Message ?? "Compilation Error";
                    return tcResult;
                }

                var run = response.Run;
                tcResult.RuntimeMs = (int)(run?.WallTimeMs ?? 0);
                tcResult.MemoryBytes = (int)(run?.MemoryBytes ?? 0);

                if (run == null)
                {
                    tcResult.Passed = false;
                    tcResult.Status = SubmissionStatus.RuntimeError;
                    tcResult.ErrorMessage = "Không nhận được kết quả thực thi từ Judge.";
                    return tcResult;
                }

                if (run.Status == "TO")
                {
                    tcResult.Passed = false;
                    tcResult.Status = SubmissionStatus.TimeLimitExceeded;
                    tcResult.ErrorMessage = "Time Limit Exceeded";
                    return tcResult;
                }

                if ((run.Code ?? 0) == 137 || (run.Status == "SG" && run.MemoryBytes > maxMemoryBytes))
                {
                    tcResult.Passed = false;
                    tcResult.Status = SubmissionStatus.MemoryLimitExceeded;
                    tcResult.ErrorMessage = "Memory Limit Exceeded";
                    return tcResult;
                }

                if ((run.Code ?? 0) != 0)
                {
                    tcResult.Passed = false;
                    tcResult.Status = SubmissionStatus.RuntimeError;
                    tcResult.ErrorMessage = TrimOutput(run.Stderr);
                    if (string.IsNullOrWhiteSpace(tcResult.ErrorMessage))
                        tcResult.ErrorMessage = run.Message ?? "Runtime Error";
                    return tcResult;
                }

                var actual = NormalizeOutput(run.Stdout ?? string.Empty);
                var expected = NormalizeOutput(testCase.ExpectedOutput);
                tcResult.Passed = actual == expected;
                tcResult.Status = tcResult.Passed ? SubmissionStatus.Accepted : SubmissionStatus.WrongAnswer;
                tcResult.ActualOutput = actual;
                if (!tcResult.Passed)
                {
                    tcResult.ErrorMessage = "Wrong Answer";
                }

                return tcResult;
            }
            catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
            {
                _logger.LogWarning(ex, "Piston judge không phản hồi khi chấm test case {Name}.", testCase.OrderIndex);
                tcResult.Passed = false;
                tcResult.Status = SubmissionStatus.JudgeUnavailable;
                tcResult.ErrorMessage = "Judge service unavailable. Please try again later.";
                return tcResult;
            }
        }

        private async Task<PistonExecuteResponse> ExecuteAsync(PistonExecuteRequest payload)
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, $"{_options.PistonApiUrl.TrimEnd('/')}/execute")
            {
                Content = JsonContent.Create(payload)
            };
            if (!string.IsNullOrWhiteSpace(_options.AuthToken))
            {
                request.Headers.TryAddWithoutValidation(_options.AuthHeader, _options.AuthToken);
            }

            using var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("Piston trả về {StatusCode}: {Body}", (int)response.StatusCode, body);
                throw new HttpRequestException($"Piston API returned {(int)response.StatusCode}");
            }

            var result = await response.Content.ReadFromJsonAsync<PistonExecuteResponse>();
            return result ?? throw new HttpRequestException("Piston API returned empty body");
        }

        private async Task<string?> GetRuntimeVersionAsync(string language, CancellationToken cancellationToken)
        {
            if (_cache.TryGetValue($"piston-runtime:{language}", out string? cached) && !string.IsNullOrEmpty(cached))
            {
                return cached;
            }

            var runtimes = await FetchRuntimesAsync(cancellationToken);
            if (runtimes == null) return null;

            var candidates = runtimes
                .Where(r => string.Equals(r.Language, language, StringComparison.OrdinalIgnoreCase)
                            || (r.Aliases?.Any(a => string.Equals(a, language, StringComparison.OrdinalIgnoreCase)) ?? false))
                .ToList();

            if (candidates.Count == 0) return null;

            var selected = candidates
                .OrderByDescending(r => TryParseVersion(r.Version))
                .First();

            _cache.Set($"piston-runtime:{language}", selected.Version, TimeSpan.FromHours(1));
            return selected.Version;
        }

        private async Task<List<PistonRuntime>?> FetchRuntimesAsync(CancellationToken cancellationToken)
        {
            try
            {
                using var request = new HttpRequestMessage(HttpMethod.Get, $"{_options.PistonApiUrl.TrimEnd('/')}/runtimes");
                if (!string.IsNullOrWhiteSpace(_options.AuthToken))
                {
                    request.Headers.TryAddWithoutValidation(_options.AuthHeader, _options.AuthToken);
                }

                using var response = await _httpClient.SendAsync(request, cancellationToken);
                if (!response.IsSuccessStatusCode) return null;

                return await response.Content.ReadFromJsonAsync<List<PistonRuntime>>(cancellationToken: cancellationToken);
            }
            catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
            {
                _logger.LogWarning(ex, "Không lấy được danh sách runtime từ Piston.");
                return null;
            }
        }

        private static void Aggregate(CodeJudgeResult result, TestCaseResult[] perCase)
        {
            result.Passed = true;
            result.TotalScore = 0;
            result.RuntimeMs = 0;
            result.MemoryBytes = 0;

            SubmissionStatus worst = SubmissionStatus.Accepted;

            foreach (var tc in perCase)
            {
                if (tc.Passed)
                {
                    result.PassedCount++;
                    result.TotalScore += 1;
                }
                else
                {
                    result.Passed = false;
                    worst = WorseStatus(worst, tc.Status);
                }

                if (tc.RuntimeMs > result.RuntimeMs) result.RuntimeMs = tc.RuntimeMs;
                if (tc.MemoryBytes > result.MemoryBytes) result.MemoryBytes = tc.MemoryBytes;
            }

            result.Status = result.Passed ? SubmissionStatus.Accepted : worst;

            var primaryFailure = perCase
                .Where(tc => !tc.Passed)
                .Select(tc => tc.ErrorMessage)
                .FirstOrDefault(tc => !string.IsNullOrWhiteSpace(tc));

            if (!result.Passed)
            {
                result.ErrorMessage = primaryFailure ?? string.Empty;

                if (result.Status == SubmissionStatus.CompilationError)
                {
                    foreach (var tc in perCase.Where(tc => !tc.Passed))
                    {
                        tc.ErrorMessage = primaryFailure ?? string.Empty;
                    }
                }
            }
        }

        private static SubmissionStatus WorseStatus(SubmissionStatus current, SubmissionStatus candidate)
        {
            var severity = new Dictionary<SubmissionStatus, int>
            {
                [SubmissionStatus.Accepted] = 0,
                [SubmissionStatus.WrongAnswer] = 1,
                [SubmissionStatus.TimeLimitExceeded] = 2,
                [SubmissionStatus.MemoryLimitExceeded] = 3,
                [SubmissionStatus.RuntimeError] = 4,
                [SubmissionStatus.CompilationError] = 5,
                [SubmissionStatus.JudgeUnavailable] = 6,
            };
            return severity[candidate] > severity[current] ? candidate : current;
        }

        private static Version TryParseVersion(string? version)
        {
            if (string.IsNullOrWhiteSpace(version)) return new Version(0, 0);
            var numeric = version.Split('-', '+')[0];
            if (Version.TryParse(numeric, out var parsed)) return parsed;
            return new Version(0, 0);
        }

        private static string NormalizeOutput(string output)
        {
            return output
                .Replace("\r\n", "\n")
                .Replace("\r", "\n")
                .Trim(' ', '\t', '\n');
        }

        private static string TrimOutput(string? output)
        {
            var trimmed = (output ?? string.Empty).Trim();
            return trimmed.Length > 4000 ? trimmed[..4000] : trimmed;
        }
    }

    internal class PistonExecuteRequest
    {
        [JsonPropertyName("language")]
        public string Language { get; set; } = string.Empty;

        [JsonPropertyName("version")]
        public string Version { get; set; } = string.Empty;

        [JsonPropertyName("files")]
        public PistonFile[] Files { get; set; } = Array.Empty<PistonFile>();

        [JsonPropertyName("stdin")]
        public string? Stdin { get; set; }

        [JsonPropertyName("compile_timeout")]
        public int? CompileTimeout { get; set; }

        [JsonPropertyName("run_timeout")]
        public int? RunTimeout { get; set; }

        [JsonPropertyName("run_memory_limit")]
        public int? RunMemoryLimit { get; set; }
    }

    internal class PistonFile
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("content")]
        public string Content { get; set; } = string.Empty;
    }

    internal class PistonRuntime
    {
        [JsonPropertyName("language")]
        public string Language { get; set; } = string.Empty;

        [JsonPropertyName("version")]
        public string Version { get; set; } = string.Empty;

        [JsonPropertyName("aliases")]
        public List<string>? Aliases { get; set; }
    }

    internal class PistonExecuteResponse
    {
        [JsonPropertyName("language")]
        public string? Language { get; set; }

        [JsonPropertyName("version")]
        public string? Version { get; set; }

        [JsonPropertyName("compile")]
        public PistonStage? Compile { get; set; }

        [JsonPropertyName("run")]
        public PistonStage? Run { get; set; }
    }

    internal class PistonStage
    {
        [JsonPropertyName("stdout")]
        public string? Stdout { get; set; }

        [JsonPropertyName("stderr")]
        public string? Stderr { get; set; }

        [JsonPropertyName("code")]
        public int? Code { get; set; }

        [JsonPropertyName("signal")]
        public string? Signal { get; set; }

        [JsonPropertyName("message")]
        public string? Message { get; set; }

        [JsonPropertyName("status")]
        public string? Status { get; set; }

        [JsonPropertyName("wall_time")]
        public long WallTimeMs { get; set; }

        [JsonPropertyName("memory")]
        public long MemoryBytes { get; set; }
    }
}
