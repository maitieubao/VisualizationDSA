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
        [Authorize]
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
        [Authorize]
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
            
            var authHeader = Request.Headers["Authorization"].ToString();
            var secretKey = _configuration["SePay:WebhookSecret"];
            var signatureHeader = Request.Headers["X-SePay-Signature"].ToString();

            if (!string.IsNullOrEmpty(secretKey) && !string.IsNullOrEmpty(signatureHeader))
            {
                
                var rawMessage = $"id={payload.Id}&amount={payload.TransferAmount}&code={payload.Code ?? string.Empty}";
                using var hmac = new System.Security.Cryptography.HMACSHA256(System.Text.Encoding.UTF8.GetBytes(secretKey));
                var computedHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(rawMessage));
                var computedSignature = Convert.ToHexString(computedHash).ToLower();

                var computedBytes = System.Text.Encoding.UTF8.GetBytes(computedSignature);
                var headerBytes = System.Text.Encoding.UTF8.GetBytes(signatureHeader.Trim().ToLowerInvariant());

                if (computedBytes.Length != headerBytes.Length || 
                    !System.Security.Cryptography.CryptographicOperations.FixedTimeEquals(computedBytes, headerBytes))
                {
                    return Unauthorized(new { message = "Chữ ký webhook không hợp lệ." });
                }
            }
            else
            {
                
                var expectedApiKey = _configuration["SePay:ApiKey"];
                if (string.IsNullOrEmpty(expectedApiKey))
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Cổng thanh toán chưa được cấu hình khóa bảo mật." });
                }

                var expectedHeaderValue = $"Apikey {expectedApiKey}";
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
            catch (Exception ex)
            {
                
                return StatusCode(StatusCodes.Status500InternalServerError, new { success = false, message = ex.Message });
            }
        }

        private Guid GetCurrentUserId()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                        ?? User.FindFirstValue("sub");
            return Guid.Parse(claim!);
        }
    }
}
