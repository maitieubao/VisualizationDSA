using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Infrastructure.Services;
using Xunit;

namespace VisualizationDSA.UnitTests.Services
{
    /// <summary>
    /// Edge cases bổ sung cho PistonCodeJudgeService: MLE (2 đường dẫn), auth header,
    /// chọn runtime version, fallback message, output dài, run null, runtimes fail.
    /// </summary>
    public class PistonCodeJudgeServiceEdgeTests
    {
        private const string RuntimesJson =
            "[{\"language\":\"python\",\"version\":\"3.10.0\",\"aliases\":[]}," +
            "{\"language\":\"csharp\",\"version\":\"6.12.0\",\"aliases\":[]}]";

        private static PistonCodeJudgeService CreateService(
            Func<HttpRequestMessage, HttpResponseMessage> responder,
            JudgeOptions? options = null)
        {
            var handler = new FakeMessageHandler(responder);
            var httpClient = new HttpClient(handler);
            var opts = Options.Create(options ?? new JudgeOptions { PistonApiUrl = "https://piston.test", MaxConcurrency = 3 });
            var cache = new MemoryCache(new MemoryCacheOptions());
            return new PistonCodeJudgeService(httpClient, opts, cache, NullLogger<PistonCodeJudgeService>.Instance);
        }

        private static HttpResponseMessage JsonResponse(string body)
        {
            return new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(body, Encoding.UTF8, "application/json")
            };
        }

        private static System.Collections.Generic.List<CodelabTestCase> OneCase(string expected = "1")
        {
            return new System.Collections.Generic.List<CodelabTestCase>
            {
                new CodelabTestCase(Guid.NewGuid(), "1", expected, false, 1, 1)
            };
        }

        [Fact]
        public async Task EvaluateCodeAsync_GivenKillCode137_ShouldReturnMemoryLimitExceeded()
        {
            var service = CreateService(request =>
            {
                if (request.RequestUri!.PathAndQuery.Contains("runtimes"))
                    return JsonResponse(RuntimesJson);

                return JsonResponse(
                    "{\"language\":\"python\",\"version\":\"3.10.0\"," +
                    "\"run\":{\"stdout\":\"\",\"stderr\":\"\",\"code\":137,\"signal\":null," +
                    "\"message\":\"Killed\",\"status\":null,\"wall_time\":100,\"memory\":90000000}}");
            });

            var result = await service.EvaluateCodeAsync("x", "python", OneCase(), 2000, 128000000);

            result.Status.Should().Be(SubmissionStatus.MemoryLimitExceeded);
            result.Passed.Should().BeFalse();
        }

        [Fact]
        public async Task EvaluateCodeAsync_GivenSignalWithHighMemory_ShouldReturnMemoryLimitExceeded()
        {
            var service = CreateService(request =>
            {
                if (request.RequestUri!.PathAndQuery.Contains("runtimes"))
                    return JsonResponse(RuntimesJson);

                return JsonResponse(
                    "{\"language\":\"python\",\"version\":\"3.10.0\"," +
                    "\"run\":{\"stdout\":\"\",\"stderr\":\"\",\"code\":9,\"signal\":\"SIGKILL\"," +
                    "\"message\":\"OOM\",\"status\":\"SG\",\"wall_time\":100,\"memory\":150000000}}");
            });

            var result = await service.EvaluateCodeAsync("x", "python", OneCase(), 2000, 128000000);

            result.Status.Should().Be(SubmissionStatus.MemoryLimitExceeded);
            result.Passed.Should().BeFalse();
        }

        [Fact]
        public async Task EvaluateCodeAsync_GivenSignalWithLowMemory_ShouldNotBeMemoryLimit()
        {
            var service = CreateService(request =>
            {
                if (request.RequestUri!.PathAndQuery.Contains("runtimes"))
                    return JsonResponse(RuntimesJson);

                return JsonResponse(
                    "{\"language\":\"python\",\"version\":\"3.10.0\"," +
                    "\"run\":{\"stdout\":\"\",\"stderr\":\"Segmentation fault\",\"code\":139,\"signal\":\"SIGSEGV\"," +
                    "\"message\":null,\"status\":\"SG\",\"wall_time\":100,\"memory\":5000}}");
            });

            var result = await service.EvaluateCodeAsync("x", "python", OneCase(), 2000, 128000000);

            result.Status.Should().Be(SubmissionStatus.RuntimeError);
            result.ErrorMessage.Should().Contain("Segmentation fault");
        }

        [Fact]
        public async Task EvaluateCodeAsync_GivenAuthToken_ShouldSendHeader()
        {
            HttpRequestMessage? executeRequest = null;
            var service = CreateService(request =>
            {
                if (request.RequestUri!.PathAndQuery.Contains("runtimes"))
                    return JsonResponse(RuntimesJson);

                executeRequest = request;
                return JsonResponse(
                    "{\"language\":\"python\",\"version\":\"3.10.0\"," +
                    "\"run\":{\"stdout\":\"1\\n\",\"stderr\":\"\",\"code\":0,\"signal\":null," +
                    "\"message\":null,\"status\":null,\"wall_time\":5,\"memory\":128}}");
            }, options: new JudgeOptions
            {
                PistonApiUrl = "https://piston.test",
                AuthToken = "secret-token-123",
                AuthHeader = "X-Auth-Token"
            });

            var result = await service.EvaluateCodeAsync("print(1)", "python", OneCase(), 2000, 128000000);

            result.Passed.Should().BeTrue();
            executeRequest.Should().NotBeNull();
            executeRequest!.Headers.Should().Contain(h => h.Key == "X-Auth-Token" && h.Value.Contains("secret-token-123"));
        }

        [Fact]
        public async Task EvaluateCodeAsync_GivenMultipleVersions_ShouldPickNewest()
        {
            string? usedVersion = null;
            var runtimesWithVersions =
                "[{\"language\":\"python\",\"version\":\"3.9.0\",\"aliases\":[]}," +
                "{\"language\":\"python\",\"version\":\"3.10.5\",\"aliases\":[]}," +
                "{\"language\":\"python\",\"version\":\"3.11.0\",\"aliases\":[]}]";

            var service = CreateService(request =>
            {
                if (request.RequestUri!.PathAndQuery.Contains("runtimes"))
                    return JsonResponse(runtimesWithVersions);

                var body = request.Content!.ReadAsStringAsync().GetAwaiter().GetResult();
                usedVersion = System.Text.Json.JsonDocument.Parse(body).RootElement.GetProperty("version").GetString();
                return JsonResponse(
                    "{\"language\":\"python\",\"version\":\"3.11.0\"," +
                    "\"run\":{\"stdout\":\"1\\n\",\"stderr\":\"\",\"code\":0,\"signal\":null," +
                    "\"message\":null,\"status\":null,\"wall_time\":5,\"memory\":128}}");
            });

            var result = await service.EvaluateCodeAsync("print(1)", "python", OneCase(), 2000, 128000000);

            result.Passed.Should().BeTrue();
            usedVersion.Should().Be("3.11.0");
        }

        [Fact]
        public async Task EvaluateCodeAsync_GivenCompileErrorWithoutStderr_ShouldFallbackToMessage()
        {
            var service = CreateService(request =>
            {
                if (request.RequestUri!.PathAndQuery.Contains("runtimes"))
                    return JsonResponse(RuntimesJson);

                return JsonResponse(
                    "{\"language\":\"python\",\"version\":\"3.10.0\"," +
                    "\"compile\":{\"stdout\":\"\",\"stderr\":\"\",\"code\":1,\"signal\":null," +
                    "\"message\":\"Compilation failed: missing semicolon\",\"status\":null," +
                    "\"wall_time\":300,\"memory\":0}}");
            });

            var result = await service.EvaluateCodeAsync("x", "python", OneCase(), 2000, 128000000);

            result.Status.Should().Be(SubmissionStatus.CompilationError);
            result.ErrorMessage.Should().Be("Compilation failed: missing semicolon");
        }

        [Fact]
        public async Task EvaluateCodeAsync_GivenHugeStderr_ShouldTruncateTo4000Chars()
        {
            var service = CreateService(request =>
            {
                if (request.RequestUri!.PathAndQuery.Contains("runtimes"))
                    return JsonResponse(RuntimesJson);

                var hugeError = new string('E', 8000);
                return JsonResponse(
                    "{\"language\":\"python\",\"version\":\"3.10.0\"," +
                    $"\"run\":{{\"stdout\":\"\",\"stderr\":\"{hugeError}\",\"code\":1,\"signal\":null," +
                    "\"message\":null,\"status\":null,\"wall_time\":5,\"memory\":128}}");
            });

            var result = await service.EvaluateCodeAsync("x", "python", OneCase(), 2000, 128000000);

            result.Status.Should().Be(SubmissionStatus.RuntimeError);
            result.ErrorMessage.Length.Should().Be(4000);
        }

        [Fact]
        public async Task EvaluateCodeAsync_GivenMissingRunStage_ShouldReturnRuntimeError()
        {
            var service = CreateService(request =>
            {
                if (request.RequestUri!.PathAndQuery.Contains("runtimes"))
                    return JsonResponse(RuntimesJson);

                return JsonResponse("{\"language\":\"python\",\"version\":\"3.10.0\",\"compile\":null,\"run\":null}");
            });

            var result = await service.EvaluateCodeAsync("x", "python", OneCase(), 2000, 128000000);

            result.Passed.Should().BeFalse();
            result.Status.Should().Be(SubmissionStatus.RuntimeError);
            result.ErrorMessage.Should().Contain("kết quả thực thi");
        }

        [Fact]
        public async Task EvaluateCodeAsync_GivenRuntimesFetchFails_ShouldReturnJudgeUnavailable()
        {
            var service = CreateService(_ => new HttpResponseMessage(HttpStatusCode.InternalServerError));

            var result = await service.EvaluateCodeAsync("print(1)", "python", OneCase(), 2000, 128000000);

            result.Passed.Should().BeFalse();
            result.Status.Should().Be(SubmissionStatus.JudgeUnavailable);
        }

        [Fact]
        public async Task EvaluateCodeAsync_GivenExecuteHttp500_ShouldReturnJudgeUnavailable()
        {
            var service = CreateService(request =>
            {
                if (request.RequestUri!.PathAndQuery.Contains("runtimes"))
                    return JsonResponse(RuntimesJson);

                return new HttpResponseMessage(HttpStatusCode.InternalServerError);
            });

            var result = await service.EvaluateCodeAsync("print(1)", "python", OneCase(), 2000, 128000000);

            result.Passed.Should().BeFalse();
            result.Status.Should().Be(SubmissionStatus.JudgeUnavailable);
        }

        [Fact]
        public async Task EvaluateCodeAsync_GivenMixedStatuses_ShouldPickMostSevere()
        {
            var calls = 0;
            var service = CreateService(request =>
            {
                if (request.RequestUri!.PathAndQuery.Contains("runtimes"))
                    return JsonResponse(RuntimesJson);

                calls++;
                // case 1: WrongAnswer, case 2: CompilationError → kết quả phải là CompilationError
                var body = calls == 1
                    ? "{\"language\":\"python\",\"version\":\"3.10.0\"," +
                      "\"run\":{\"stdout\":\"9\\n\",\"stderr\":\"\",\"code\":0,\"signal\":null," +
                      "\"message\":null,\"status\":null,\"wall_time\":5,\"memory\":128}}"
                    : "{\"language\":\"python\",\"version\":\"3.10.0\"," +
                      "\"compile\":{\"stdout\":\"\",\"stderr\":\"Syntax error\",\"code\":1,\"signal\":null," +
                      "\"message\":null,\"status\":null,\"wall_time\":5,\"memory\":0}}";
                return JsonResponse(body);
            });

            var testCases = new System.Collections.Generic.List<CodelabTestCase>
            {
                new CodelabTestCase(Guid.NewGuid(), "1", "1", false, 1, 1),
                new CodelabTestCase(Guid.NewGuid(), "2", "2", false, 1, 2)
            };

            var result = await service.EvaluateCodeAsync("x", "python", testCases, 2000, 128000000);

            result.Status.Should().Be(SubmissionStatus.CompilationError);
            result.PassedCount.Should().Be(0);
            result.TotalScore.Should().Be(0);
        }
    }
}
