using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Asp.Versioning;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Services;

using VisualizationDSA.WebApi.Filters;
using Microsoft.AspNetCore.RateLimiting;
using VisualizationDSA.Infrastructure.Services;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly IConfiguration _configuration;

        public PaymentsController(IPaymentService paymentService, IConfiguration configuration)
        {
            _paymentService = paymentService;
            _configuration = configuration;
        }

        // Tạo hóa đơn mua Premium — user lấy từ token (không nhận userId từ client).
        [HttpPost("order")]
        [EnableRateLimiting("api")]
        [RequireJwtRole]
        public async Task<ActionResult<OrderDto>> CreateOrder()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { message = "Không xác định được người dùng." });

            try
            {
                var order = await _paymentService.CreateOrderAsync(userId.Value);
                return Ok(order);
            }
            catch (PaymentConfigurationException ex)
            {
                // PM-005: fail-closed — lỗi cấu hình server, message generic không lộ chi tiết.
                Serilog.Log.Warning(ex, "CreateOrder thất bại do thiếu cấu hình thanh toán.");
                return StatusCode(StatusCodes.Status503ServiceUnavailable, new { message = "Cổng thanh toán chưa được cấu hình hoàn chỉnh." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                // PM-008: user đã premium / đang có order Pending chưa hết hạn → 409 Conflict.
                return Conflict(new { message = ex.Message });
            }
        }

        // Xem trạng thái hóa đơn — chỉ chủ sở hữu (IDOR guard nằm trong service).
        [HttpGet("orders/{orderId}/status")]
        [RequireJwtRole]
        public async Task<ActionResult<OrderDto>> GetOrderStatus(Guid orderId)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { message = "Không xác định được người dùng." });

            try
            {
                var order = await _paymentService.GetOrderStatusAsync(orderId, userId.Value);
                return Ok(order);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (PaymentConfigurationException ex)
            {
                Serilog.Log.Warning(ex, "GetOrderStatus thất bại do thiếu cấu hình thanh toán.");
                return StatusCode(StatusCodes.Status503ServiceUnavailable, new { message = "Cổng thanh toán chưa được cấu hình hoàn chỉnh." });
            }
        }

        // Webhook SePay — KHÔNG yêu cầu JWT, xác thực bằng Apikey header (Fail-closed).
        // PM-012: rate-limit riêng (policy "webhook") + 500 generic không lộ cấu hình.
        [HttpPost("sepay-webhook")]
        [AllowAnonymous]
        [EnableRateLimiting("webhook")]
        public async Task<IActionResult> ReceiveSePayWebhook([FromBody] SePayWebhookPayload payload)
        {
            // Fail-closed: bắt buộc xác thực qua Apikey (cơ chế chính của SePay).
            // KHÔNG fallback sang cơ chế khác khi thiếu header — từ chối ngay.
            var expectedApiKey = _configuration["SePay:ApiKey"];
            if (string.IsNullOrEmpty(expectedApiKey))
            {
                // PM-012: log chi tiết cho admin, phản hồi generic cho client.
                Serilog.Log.Error("Webhook SePay từ chối: thiếu cấu hình SePay:ApiKey.");
                return StatusCode(StatusCodes.Status500InternalServerError, new { success = false, message = "Cổng thanh toán chưa được cấu hình." });
            }

            var expectedHeaderValue = $"Apikey {expectedApiKey}";
            var authHeader = Request.Headers["Authorization"].ToString();
            if (string.IsNullOrEmpty(authHeader))
            {
                Serilog.Log.Warning("Webhook SePay từ chối: thiếu Authorization header.");
                return Unauthorized(new { success = false, message = "Khóa xác thực Webhook không hợp lệ." });
            }

            var authHeaderBytes = System.Text.Encoding.UTF8.GetBytes(authHeader);
            var expectedHeaderBytes = System.Text.Encoding.UTF8.GetBytes(expectedHeaderValue);

            if (authHeaderBytes.Length != expectedHeaderBytes.Length ||
                !System.Security.Cryptography.CryptographicOperations.FixedTimeEquals(authHeaderBytes, expectedHeaderBytes))
            {
                Serilog.Log.Warning("Webhook SePay từ chối: sai khóa xác thực.");
                return Unauthorized(new { success = false, message = "Khóa xác thực Webhook không hợp lệ." });
            }

            // Hợp đồng cũ giữ nguyên: 200 + success=false khi không khớp.
            // PM-013: log chi tiết transaction "lạ" + trả thêm trường warning (không phá contract).
            try
            {
                var isProcessed = await _paymentService.ProcessSePayWebhookAsync(payload);
                if (isProcessed)
                {
                    return Ok(new { success = true });
                }

                Serilog.Log.Warning("Webhook SePay nhận giao dịch không khớp: id={Id}, code={Code}, content={Content}, amount={Amount}, account={Account}",
                    payload.Id, payload.Code, payload.Content, payload.TransferAmount, payload.AccountNumber);

                return Ok(new
                {
                    success = false,
                    message = "Giao dịch không khớp hoặc không hợp lệ để kích hoạt Premium.",
                    warning = "Giao dịch đã được ghi log để đối soát — không cấp premium cho giao dịch lạ."
                });
            }
            catch (PaymentConfigurationException ex)
            {
                // PM-012: log đầy đủ để debug, client chỉ thấy message generic.
                Serilog.Log.Error(ex, "SePay webhook thất bại do thiếu cấu hình thanh toán.");
                return StatusCode(StatusCodes.Status500InternalServerError, new { success = false, message = "Lỗi xử lý thanh toán. Vui lòng thử lại." });
            }
            catch (Exception ex)
            {
                // Webhook SePay — log đầy đủ để debug khi merchant/proxy thay đổi format payload.
                Serilog.Log.Error(ex, "SePay webhook failed");
                return StatusCode(StatusCodes.Status500InternalServerError, new { success = false, message = "Lỗi xử lý thanh toán. Vui lòng thử lại." });
            }
        }

        // PM-011: token thiếu claim sub → null → 401 (trước đây Guid.Parse(null) ném NRE → 500).
        private Guid? GetCurrentUserId()
        {
            var claim = JwtHelper.ExtractSubFromToken(Request);
            if (string.IsNullOrWhiteSpace(claim))
                return null;
            return Guid.TryParse(claim, out var userId) ? userId : null;
        }
    }
}
