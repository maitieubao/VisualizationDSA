using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using VisualizationDSA.Domain.Engine;
using VisualizationDSA.Domain.Strategies;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.WebApi.Controllers
{
    
    
    
    
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/concepts/payment")]
    public class StatelessPaymentController : ControllerBase
    {
        private readonly StatelessPaymentStrategy _paymentStrategy;
        private readonly ApplicationDbContext _dbContext;

        public StatelessPaymentController(StatelessPaymentStrategy paymentStrategy, ApplicationDbContext dbContext)
        {
            _paymentStrategy = paymentStrategy;
            _dbContext = dbContext;
        }

        
        
        
        
        [HttpGet("config")]
        public ActionResult<StatelessPaymentConfigDto> GetConfig()
        {
            return Ok(_paymentStrategy.GetConfig());
        }

        
        
        
        
        [HttpPost("checkout")]
        public ActionResult<StatelessOrderDto> Checkout([FromBody] StatelessCheckoutRequest request)
        {
            try
            {
                var userId = request.UserId ?? "demo-user-001";
                var order = _paymentStrategy.CreateCheckout(userId, request.PaymentMethod);
                return Ok(order);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = "CHECKOUT_FAILED", message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { error = "ALREADY_PREMIUM", message = ex.Message });
            }
        }

        
        
        
        
        [HttpPost("verify")]
        public async Task<ActionResult<StatelessOrderDto>> Verify([FromBody] StatelessVerifyRequest request)
        {
            try
            {
                var order = _paymentStrategy.VerifyPayment(request.OrderId, request.UserId);

                
                await PersistPremiumStatus(order.UserId);

                return Ok(order);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = "ORDER_NOT_FOUND", message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { error = "UNAUTHORIZED", message = ex.Message });
            }
        }

        
        
        
        
        [HttpGet("orders/{orderId}/status")]
        public ActionResult<StatelessOrderDto> GetOrderStatus(string orderId, [FromQuery] string? userId)
        {
            try
            {
                var order = _paymentStrategy.GetOrderStatus(orderId, userId);
                return Ok(order);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = "ORDER_NOT_FOUND", message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { error = "UNAUTHORIZED", message = ex.Message });
            }
        }

        
        
        
        
        [HttpPost("simulate-webhook")]
        public async Task<ActionResult<StatelessOrderDto>> SimulateWebhook([FromBody] StatelessVerifyRequest request)
        {
            try
            {
                var order = _paymentStrategy.SimulateWebhook(request.OrderId);

                
                await PersistPremiumStatus(order.UserId);

                return Ok(order);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = "ORDER_NOT_FOUND", message = ex.Message });
            }
        }

        
        
        
        
        [HttpGet("premium-status")]
        public ActionResult<StatelessPremiumStatusDto> GetPremiumStatus([FromQuery] string? userId)
        {
            var id = userId ?? "demo-user-001";
            return Ok(_paymentStrategy.GetPremiumStatus(id));
        }

        
        
        
        
        [HttpGet("check-access")]
        public ActionResult<object> CheckFeatureAccess([FromQuery] string? userId, [FromQuery] string featureId)
        {
            var id = userId ?? "demo-user-001";
            var hasAccess = _paymentStrategy.CheckFeatureAccess(id, featureId);
            return Ok(new { userId = id, featureId, hasAccess });
        }

        
        
        
        
        [HttpGet("transactions")]
        public ActionResult<List<StatelessTransactionLogEntry>> GetTransactions([FromQuery] string? userId)
        {
            var log = _paymentStrategy.GetTransactionLog(userId);
            return Ok(log);
        }

        
        
        
        private async Task PersistPremiumStatus(string? userId)
        {
            if (string.IsNullOrWhiteSpace(userId)) return;
            
            var email = userId == "demo-user-001" ? "demo@visualizationdsa.dev" : userId;
            var dbUser = await _dbContext.Users
                .FirstOrDefaultAsync(u => u.Email == email || u.Id.ToString() == userId);
            if (dbUser != null)
            {
                dbUser.SetPremiumStatus(true);
                await _dbContext.SaveChangesAsync();
            }
        }
    }
}
