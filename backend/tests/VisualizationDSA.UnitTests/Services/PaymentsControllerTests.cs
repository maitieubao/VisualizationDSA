using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Moq;
using System;
using System.Text.Json;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain;
using VisualizationDSA.Infrastructure.Services;
using VisualizationDSA.WebApi.Controllers;
using Xunit;

namespace VisualizationDSA.UnitTests.Services
{
    /// <summary>
    /// Test PaymentsController (/api/v1/payments/*): PM-057 webhook auth (thiếu/sai Apikey → 401),
    /// PM-012 500 generic không lộ cấu hình, PM-013 không khớp → 200 + warning,
    /// PM-011 token thiếu sub → 401, fail-closed cấu hình → 503.
    /// </summary>
    public class PaymentsControllerTests
    {
        private static PaymentsController Create(Mock<IPaymentService>? service = null, string? apiKey = "secret-key")
        {
            var config = new Mock<IConfiguration>();
            config.Setup(c => c["SePay:ApiKey"]).Returns(apiKey);

            var controller = new PaymentsController(
                (service ?? new Mock<IPaymentService>()).Object,
                config.Object);
            var httpContext = new DefaultHttpContext();
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
            return controller;
        }

        private static void SetWebhookHeader(PaymentsController controller, string? value)
        {
            if (!string.IsNullOrEmpty(value))
                controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = value;
        }

        /// <summary>Tạo token hợp lệ (ký bằng JwtSigningConfig.Key giống JwtHelper) để qua bước lấy userId.</summary>
        private static void SetJwtHeader(PaymentsController controller)
        {
            var header = JwtSigningConfig.Base64UrlEncode(System.Text.Encoding.UTF8.GetBytes("{\"alg\":\"HS256\",\"typ\":\"JWT\"}"));
            var payloadJson = JsonSerializer.Serialize(new
            {
                sub = Guid.NewGuid().ToString(),
                exp = DateTimeOffset.UtcNow.AddMinutes(5).ToUnixTimeSeconds(),
            });
            var payload = JwtSigningConfig.Base64UrlEncode(System.Text.Encoding.UTF8.GetBytes(payloadJson));
            var signature = JwtSigningConfig.Base64UrlEncode(
                System.Security.Cryptography.HMACSHA256.HashData(
                    JwtSigningConfig.Key, System.Text.Encoding.UTF8.GetBytes($"{header}.{payload}")));
            controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = $"Bearer {header}.{payload}.{signature}";
        }

        private static SePayWebhookPayload BuildPayload()
            => new()
            {
                Id = 1,
                TransferType = "in",
                TransferAmount = 199000,
                Code = "VDSA123456",
                AccountNumber = "99999999999",
            };

        // ============================ PM-057: webhook auth ============================

        [Fact]
        public async Task Webhook_WithoutApiKeyHeader_Returns401()
        {
            var controller = Create();

            var result = await controller.ReceiveSePayWebhook(BuildPayload());

            result.Should().BeOfType<UnauthorizedObjectResult>();
        }

        [Fact]
        public async Task Webhook_WithWrongApiKey_Returns401()
        {
            var controller = Create();
            SetWebhookHeader(controller, "Apikey wrong-key");

            var result = await controller.ReceiveSePayWebhook(BuildPayload());

            result.Should().BeOfType<UnauthorizedObjectResult>();
        }

        [Fact]
        public async Task Webhook_WithValidApiKey_ReturnsSuccess()
        {
            var service = new Mock<IPaymentService>();
            service.Setup(s => s.ProcessSePayWebhookAsync(It.IsAny<SePayWebhookPayload>())).ReturnsAsync(true);
            var controller = Create(service);
            SetWebhookHeader(controller, "Apikey secret-key");

            var result = await controller.ReceiveSePayWebhook(BuildPayload());

            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            using var doc = JsonDocument.Parse(JsonSerializer.Serialize(ok.Value));
            doc.RootElement.GetProperty("success").GetBoolean().Should().BeTrue();
        }

        // ============================ PM-012: 500 generic ============================

        [Fact]
        public async Task Webhook_WhenApiKeyNotConfigured_Returns500Generic()
        {
            var controller = Create(apiKey: null);

            var result = await controller.ReceiveSePayWebhook(BuildPayload());

            var status = result.Should().BeOfType<ObjectResult>().Subject;
            status.StatusCode.Should().Be(StatusCodes.Status500InternalServerError);
            // Không lộ chi tiết cấu hình nội bộ (không chứa "SePay").
            JsonSerializer.Serialize(status.Value).Should().NotContain("SePay");
        }

        [Fact]
        public async Task Webhook_WhenServiceThrows_Returns500Generic()
        {
            var service = new Mock<IPaymentService>();
            service.Setup(s => s.ProcessSePayWebhookAsync(It.IsAny<SePayWebhookPayload>())).ThrowsAsync(new Exception("boom"));
            var controller = Create(service);
            SetWebhookHeader(controller, "Apikey secret-key");

            var result = await controller.ReceiveSePayWebhook(BuildPayload());

            var status = result.Should().BeOfType<ObjectResult>().Subject;
            status.StatusCode.Should().Be(StatusCodes.Status500InternalServerError);
            JsonSerializer.Serialize(status.Value).Should().NotContain("boom");
        }

        // ============================ PM-013: không khớp → 200 + warning ============================

        [Fact]
        public async Task Webhook_WhenNotMatched_Returns200WithWarningField()
        {
            var service = new Mock<IPaymentService>();
            service.Setup(s => s.ProcessSePayWebhookAsync(It.IsAny<SePayWebhookPayload>())).ReturnsAsync(false);
            var controller = Create(service);
            SetWebhookHeader(controller, "Apikey secret-key");

            var result = await controller.ReceiveSePayWebhook(BuildPayload());

            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            using var doc = JsonDocument.Parse(JsonSerializer.Serialize(ok.Value));
            doc.RootElement.GetProperty("success").GetBoolean().Should().BeFalse();
            doc.RootElement.TryGetProperty("warning", out _).Should().BeTrue();
        }

        // ============================ PM-011: token thiếu sub → 401 ============================

        [Fact]
        public async Task CreateOrder_WithoutAuthToken_Returns401()
        {
            var service = new Mock<IPaymentService>();
            var controller = Create(service);

            var result = await controller.CreateOrder();

            result.Result.Should().BeOfType<UnauthorizedObjectResult>();
        }

        // ============================ PM-005: fail-closed config → 503 ============================

        [Fact]
        public async Task CreateOrder_WhenConfigError_Returns503Generic()
        {
            var service = new Mock<IPaymentService>();
            service.Setup(s => s.CreateOrderAsync(It.IsAny<Guid>()))
                .ThrowsAsync(new PaymentConfigurationException("SePay:BankAccount chưa được cấu hình."));
            var controller = Create(service);
            SetJwtHeader(controller);

            var result = await controller.CreateOrder();

            var status = result.Result.Should().BeOfType<ObjectResult>().Subject;
            status.StatusCode.Should().Be(StatusCodes.Status503ServiceUnavailable);
            JsonSerializer.Serialize(status.Value).Should().NotContain("BankAccount");
        }

        [Fact]
        public async Task CreateOrder_WhenConflict_Returns409()
        {
            var service = new Mock<IPaymentService>();
            service.Setup(s => s.CreateOrderAsync(It.IsAny<Guid>()))
                .ThrowsAsync(new InvalidOperationException("Tài khoản đã là Premium."));
            var controller = Create(service);
            SetJwtHeader(controller);

            var result = await controller.CreateOrder();

            result.Result.Should().BeOfType<ConflictObjectResult>();
        }
    }
}
