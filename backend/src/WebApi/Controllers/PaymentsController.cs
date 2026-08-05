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

        
        
        
        
        [HttpPost("order")]
        [RequireJwtRole]
        public async Task<ActionResult<OrderDto>> CreateOrder()
        {
            var userId = GetCurrentUserId();
            try
            {
                var order = await _paymentService.CreateOrderAsync(userId);
                return Ok(order);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(StatusCodes.Status503ServiceUnavailable, new { message = ex.Message });
            }
        }

        
        
        
        
        [HttpGet("orders/{orderId}/status")]
        [RequireJwtRole]
        public async Task<ActionResult<OrderDto>> GetOrderStatus(Guid orderId)
        {
            var userId = GetCurrentUserId();
            try
            {
                var order = await _paymentService.GetOrderStatusAsync(orderId, userId);
                return Ok(order);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        
        
        
        
        [HttpPost("sepay-webhook")]
        [AllowAnonymous]
        public async Task<IActionResult> ReceiveSePayWebhook([FromBody] SePayWebhookPayload payload)
        {
            // Fail-closed: bắt buộc xác thực qua Apikey (cơ chế chính của SePay).
            // KHÔNG fallback sang cơ chế khác khi thiếu header — từ chối ngay.
            var expectedApiKey = _configuration["SePay:ApiKey"];
            if (string.IsNullOrEmpty(expectedApiKey))
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Cổng thanh toán chưa được cấu hình khóa bảo mật." });
            }

            var expectedHeaderValue = $"Apikey {expectedApiKey}";
            var authHeader = Request.Headers["Authorization"].ToString();
            if (string.IsNullOrEmpty(authHeader))
            {
                return Unauthorized(new { message = "Khóa xác thực Webhook không hợp lệ." });
            }

            var authHeaderBytes = System.Text.Encoding.UTF8.GetBytes(authHeader);
            var expectedHeaderBytes = System.Text.Encoding.UTF8.GetBytes(expectedHeaderValue);

            if (authHeaderBytes.Length != expectedHeaderBytes.Length ||
                !System.Security.Cryptography.CryptographicOperations.FixedTimeEquals(authHeaderBytes, expectedHeaderBytes))
            {
                return Unauthorized(new { message = "Khóa xác thực Webhook không hợp lệ." });
            }

            
            try
            {
                var isProcessed = await _paymentService.ProcessSePayWebhookAsync(payload);
                if (isProcessed)
                {
                    return Ok(new { success = true });
                }
                
                return Ok(new { success = false, message = "Giao dịch không khớp hoặc không hợp lệ để kích hoạt Premium." });
            }
            catch (Exception)
            {
                
                return StatusCode(StatusCodes.Status500InternalServerError, new { success = false, message = "Lỗi xử lý thanh toán. Vui lòng thử lại." });
            }
        }

        private Guid GetCurrentUserId()
        {
            var claim = JwtHelper.ExtractSubFromToken(Request);
            return Guid.Parse(claim!);
        }
    }
}
