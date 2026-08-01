using System;
using System.Net;
using System.Net.Http;
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
    public class PistonCodeJudgeServiceTests
    {
        private const string RuntimesJson =
            "[{\"language\":\"python\",\"version\":\"3.10.0\",\"aliases\":[]}," +
            "{\"language\":\"csharp\",\"version\":\"6.12.0\",\"aliases\":[]}," +
            "{\"language\":\"javascript\",\"version\":\"15.10.0\",\"aliases\":[]}]";

        private static PistonCodeJudgeService CreateService(Func<HttpRequestMessage, HttpResponseMessage> responder)
        {
            var handler = new FakeMessageHandler(responder);
            var httpClient = new HttpClient(handler);
            var options = Options.Create(new JudgeOptions { PistonApiUrl = "https://piston.test", MaxConcurrency = 3 });
            var cache = new MemoryCache(new MemoryCacheOptions());
            return new PistonCodeJudgeService(httpClient, options, cache, NullLogger<PistonCodeJudgeService>.Instance);
        }

        private static CodelabTestCase TestCase(string input, string expected, bool hidden = false, int order = 1)
        {
            return new CodelabTestCase(Guid.NewGuid(), input, expected, hidden, 1, order);
        }

        private static HttpResponseMessage JsonResponse(string body)
        {
            return new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(body, Encoding.UTF8, "application/json")
            };
        }

        [Fact]
        public async Task EvaluateCodeAsync_GivenMatchingOutput_ShouldReturnAccepted()
        {
            var service = CreateService(request =>
            {
                if (request.RequestUri!.PathAndQuery.Contains("runtimes"))
                    return JsonResponse(RuntimesJson);

                return JsonResponse(
                    "{\"language\":\"python\",\"version\":\"3.10.0\"," +
                    "\"run\":{\"stdout\":\"5\\n\",\"stderr\":\"\",\"code\":0,\"signal\":null," +
                    "\"message\":null,\"status\":null,\"wall_time\":15,\"memory\":2048}}");
            });

            var testCases = new System.Collections.Generic.List<CodelabTestCase>
            {
                TestCase("2 3", "5")
            };

            var result = await service.EvaluateCodeAsync("print(5)", "python", testCases, 2000, 128000000);

            result.Passed.Should().BeTrue();
            result.Status.Should().Be(SubmissionStatus.Accepted);
            result.PassedCount.Should().Be(1);
            result.TotalCount.Should().Be(1);
            result.RuntimeMs.Should().Be(15);
            result.MemoryBytes.Should().Be(2048);
        }

        [Fact]
        public async Task EvaluateCodeAsync_GivenWrongOutput_ShouldReturnWrongAnswer()
        {
            var service = CreateService(request =>
            {
                if (request.RequestUri!.PathAndQuery.Contains("runtimes"))
                    return JsonResponse(RuntimesJson);

                return JsonResponse(
                    "{\"language\":\"python\",\"version\":\"3.10.0\"," +
                    "\"run\":{\"stdout\":\"6\\n\",\"stderr\":\"\",\"code\":0,\"signal\":null," +
                    "\"message\":null,\"status\":null,\"wall_time\":10,\"memory\":1024}}");
            });

            var testCases = new System.Collections.Generic.List<CodelabTestCase>
            {
                TestCase("2 3", "5")
            };

            var result = await service.EvaluateCodeAsync("print(6)", "python", testCases, 2000, 128000000);

            result.Passed.Should().BeFalse();
            result.Status.Should().Be(SubmissionStatus.WrongAnswer);
            result.TestCaseResults[0].ActualOutput.Should().Be("6");
            result.TestCaseResults[0].ExpectedOutput.Should().Be("5");
        }

        [Fact]
        public async Task EvaluateCodeAsync_GivenWhitespaceDifferences_ShouldStillPass()
        {
            var service = CreateService(request =>
            {
                if (request.RequestUri!.PathAndQuery.Contains("runtimes"))
                    return JsonResponse(RuntimesJson);

                return JsonResponse(
                    "{\"language\":\"python\",\"version\":\"3.10.0\"," +
                    "\"run\":{\"stdout\":\"  5  \\n\\n\",\"stderr\":\"\",\"code\":0,\"signal\":null," +
                    "\"message\":null,\"status\":null,\"wall_time\":8,\"memory\":512}}");
            });

            var testCases = new System.Collections.Generic.List<CodelabTestCase>
            {
                TestCase("2 3", "5")
            };

            var result = await service.EvaluateCodeAsync("print(' 5 ')", "python", testCases, 2000, 128000000);

            result.Passed.Should().BeTrue();
            result.Status.Should().Be(SubmissionStatus.Accepted);
        }

        [Fact]
        public async Task EvaluateCodeAsync_GivenCompileFailure_ShouldReturnCompilationError()
        {
            var service = CreateService(request =>
            {
                if (request.RequestUri!.PathAndQuery.Contains("runtimes"))
                    return JsonResponse(RuntimesJson);

                return JsonResponse(
                    "{\"language\":\"python\",\"version\":\"3.10.0\"," +
                    "\"compile\":{\"stdout\":\"\",\"stderr\":\"line 1: SyntaxError: invalid syntax\"," +
                    "\"code\":1,\"signal\":null,\"message\":\"Compilation failed\"," +
                    "\"status\":null,\"wall_time\":300,\"memory\":0}}");
            });

            var testCases = new System.Collections.Generic.List<CodelabTestCase>
            {
                TestCase("2 3", "5")
            };

            var result = await service.EvaluateCodeAsync("print((", "python", testCases, 2000, 128000000);

            result.Passed.Should().BeFalse();
            result.Status.Should().Be(SubmissionStatus.CompilationError);
            result.ErrorMessage.Should().Contain("SyntaxError");
        }

        [Fact]
        public async Task EvaluateCodeAsync_GivenTimeout_ShouldReturnTimeLimitExceeded()
        {
            var service = CreateService(request =>
            {
                if (request.RequestUri!.PathAndQuery.Contains("runtimes"))
                    return JsonResponse(RuntimesJson);

                return JsonResponse(
                    "{\"language\":\"python\",\"version\":\"3.10.0\"," +
                    "\"run\":{\"stdout\":\"\",\"stderr\":\"\",\"code\":null,\"signal\":\"SIGKILL\"," +
                    "\"message\":\"Time limit exceeded\",\"status\":\"TO\",\"wall_time\":2000,\"memory\":1024}}");
            });

            var testCases = new System.Collections.Generic.List<CodelabTestCase>
            {
                TestCase("1", "1")
            };

            var result = await service.EvaluateCodeAsync("while True: pass", "python", testCases, 1000, 128000000);

            result.Passed.Should().BeFalse();
            result.Status.Should().Be(SubmissionStatus.TimeLimitExceeded);
            result.TestCaseResults[0].ErrorMessage.Should().Be("Time Limit Exceeded");
        }

        [Fact]
        public async Task EvaluateCodeAsync_GivenRuntimeError_ShouldReturnRuntimeError()
        {
            var service = CreateService(request =>
            {
                if (request.RequestUri!.PathAndQuery.Contains("runtimes"))
                    return JsonResponse(RuntimesJson);

                return JsonResponse(
                    "{\"language\":\"python\",\"version\":\"3.10.0\"," +
                    "\"run\":{\"stdout\":\"\",\"stderr\":\"IndexError: list index out of range\"," +
                    "\"code\":1,\"signal\":null,\"message\":null,\"status\":\"RE\"," +
                    "\"wall_time\":12,\"memory\":1024}}");
            });

            var testCases = new System.Collections.Generic.List<CodelabTestCase>
            {
                TestCase("1", "1")
            };

            var result = await service.EvaluateCodeAsync("raise IndexError", "python", testCases, 2000, 128000000);

            result.Passed.Should().BeFalse();
            result.Status.Should().Be(SubmissionStatus.RuntimeError);
            result.ErrorMessage.Should().Contain("IndexError");
        }

        [Fact]
        public async Task EvaluateCodeAsync_GivenJudgeDown_ShouldReturnJudgeUnavailable()
        {
            var service = CreateService(_ => throw new HttpRequestException("connection refused"));

            var testCases = new System.Collections.Generic.List<CodelabTestCase>
            {
                TestCase("1", "1")
            };

            var result = await service.EvaluateCodeAsync("print(1)", "python", testCases, 2000, 128000000);

            result.Passed.Should().BeFalse();
            result.Status.Should().Be(SubmissionStatus.JudgeUnavailable);
            result.ErrorMessage.Should().NotBeNullOrEmpty();
        }

        [Fact]
        public async Task EvaluateCodeAsync_GivenUnsupportedLanguage_ShouldReturnCompilationError()
        {
            var service = CreateService(_ => throw new InvalidOperationException("should not be called"));

            var testCases = new System.Collections.Generic.List<CodelabTestCase>
            {
                TestCase("1", "1")
            };

            var result = await service.EvaluateCodeAsync("print(1)", "brainfuck", testCases, 2000, 128000000);

            result.Passed.Should().BeFalse();
            result.Status.Should().Be(SubmissionStatus.CompilationError);
            result.ErrorMessage.Should().Contain("không được hỗ trợ");
        }

        [Fact]
        public async Task EvaluateCodeAsync_GivenHiddenTestCase_ShouldPropagateHiddenFlag()
        {
            var service = CreateService(request =>
            {
                if (request.RequestUri!.PathAndQuery.Contains("runtimes"))
                    return JsonResponse(RuntimesJson);

                return JsonResponse(
                    "{\"language\":\"python\",\"version\":\"3.10.0\"," +
                    "\"run\":{\"stdout\":\"5\\n\",\"stderr\":\"\",\"code\":0,\"signal\":null," +
                    "\"message\":null,\"status\":null,\"wall_time\":5,\"memory\":128}}");
            });

            var testCases = new System.Collections.Generic.List<CodelabTestCase>
            {
                TestCase("2 3", "5", hidden: true, order: 2)
            };

            var result = await service.EvaluateCodeAsync("print(5)", "python", testCases, 2000, 128000000);

            result.TestCaseResults[0].IsHidden.Should().BeTrue();
            result.TestCaseResults[0].Name.Should().Be("Testcase #2");
        }

        [Fact]
        public async Task EvaluateCodeAsync_GivenPartialFailures_ShouldAggregateScoreFromPassedCases()
        {
            var calls = 0;
            var service = CreateService(request =>
            {
                if (request.RequestUri!.PathAndQuery.Contains("runtimes"))
                    return JsonResponse(RuntimesJson);

                calls++;
                var passed = calls == 1;
                return JsonResponse(
                    "{\"language\":\"python\",\"version\":\"3.10.0\"," +
                    $"\"run\":{{\"stdout\":\"{(passed ? "5" : "99")}\\n\",\"stderr\":\"\",\"code\":0,\"signal\":null," +
                    "\"message\":null,\"status\":null,\"wall_time\":10,\"memory\":512}}");
            });

            var testCases = new System.Collections.Generic.List<CodelabTestCase>
            {
                TestCase("2 3", "5"),
                TestCase("1 1", "2")
            };

            var result = await service.EvaluateCodeAsync("print(5)", "python", testCases, 2000, 128000000);

            result.Passed.Should().BeFalse();
            result.Status.Should().Be(SubmissionStatus.WrongAnswer);
            result.PassedCount.Should().Be(1);
            result.TotalCount.Should().Be(2);
            result.TotalScore.Should().Be(1);
        }
    }

    internal class FakeMessageHandler : HttpMessageHandler
    {
        private readonly Func<HttpRequestMessage, HttpResponseMessage> _responder;

        public FakeMessageHandler(Func<HttpRequestMessage, HttpResponseMessage> responder)
        {
            _responder = responder;
        }

        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request, CancellationToken cancellationToken)
        {
            return Task.FromResult(_responder(request));
        }
    }
}
