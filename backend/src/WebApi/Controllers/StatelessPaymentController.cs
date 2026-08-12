using Asp.Versioning;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using VisualizationDSA.Domain.Engine;
using VisualizationDSA.Domain.Strategies;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.WebApi.Filters;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/concepts/payment")]
    public class StatelessPaymentController : ControllerBase
    {
        private readonly StatelessPaymentStrategy _paymentStrategy;
        private readonly ApplicationDbContext _dbContext;
        private readonly IWebHostEnvironment _env;

        public StatelessPaymentController(StatelessPaymentStrategy paymentStrategy, ApplicationDbContext dbContext, IWebHostEnvironment env)
        {
            _paymentStrategy = paymentStrategy;
            _dbContext = dbContext;
            _env = env;
        }

        /// <summary>Cấu hình công khai (giá, phương thức) — không cần đăng nhập.</summary>
        [HttpGet("config")]
        public ActionResult<StatelessPaymentConfigDto> GetConfig()
        {
            return Ok(_paymentStrategy.GetConfig());
        }

        [HttpPost("checkout")]
        [RequireJwtRole]
        public ActionResult<StatelessOrderDto> Checkout([FromBody] StatelessCheckoutRequest request)
        {
            // Người dùng lấy từ token — KHÔNG tin userId client gửi (chống cấp premium cho người khác).
            var userId = JwtHelper.ExtractSubFromToken(Request);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { error = "UNAUTHORIZED", message = "Không xác định được người dùng." });

            try
            {
                var order = _paymentStrategy.CreateCheckout(userId, request.PaymentMethod);
                return Ok(order);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = "CHECKOUT_FAILED", message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                // PM-008: đã premium HOẶC đang có order Pending chưa hết hạn → 409.
                return Conflict(new { error = "ALREADY_PREMIUM", message = ex.Message });
            }
        }

        /// <summary>
        /// PM-001 (P0): endpoint này CHỈ trả trạng thái hiện tại của order — KHÔNG cấp premium.
        /// Mọi cấp premium phải đi qua webhook xác thực: simulate-webhook (Development)
        /// hoặc sepay-webhook (có verify chữ ký Apikey). Trước đây verify tự đánh Completed
        /// + ghi premium vào DB thật mà không xác minh chuyển tiền — đã loại bỏ.
        /// </summary>
        [HttpPost("verify")]
        [RequireJwtRole]
        public ActionResult<StatelessOrderDto> Verify([FromBody] StatelessVerifyRequest request)
        {
            var userId = JwtHelper.ExtractSubFromToken(Request);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { error = "UNAUTHORIZED", message = "Không xác định được người dùng." });

            try
            {
                // Chỉ đọc trạng thái — KHÔNG đổi trạng thái, KHÔNG cấp premium.
                var order = _paymentStrategy.VerifyPayment(request.OrderId, userId);
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
        [RequireJwtRole]
        public ActionResult<StatelessOrderDto> GetOrderStatus(string orderId)
        {
            var userId = JwtHelper.ExtractSubFromToken(Request);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { error = "UNAUTHORIZED", message = "Không xác định được người dùng." });

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

        /// <summary>
        /// Chỉ tồn tại ở môi trường Development để demo luồng thanh toán.
        /// Production: trả 404 — webhook thật phải đi qua PaymentsController (có verify chữ ký).
        /// PM-002: userId lấy từ token và được so sánh với order.UserId ngay trong strategy —
        /// guard KHÔNG chỉ dựa vào env (trước đây user A có thể hoàn thành order user B).
        /// PM-007: commit cấp premium xuống DB TRƯỚC, sau đó mới set cache in-memory.
        /// </summary>
        [HttpPost("simulate-webhook")]
        [RequireJwtRole]
        public async Task<ActionResult<StatelessOrderDto>> SimulateWebhook([FromBody] StatelessVerifyRequest request)
        {
            if (!_env.IsDevelopment())
                return NotFound(new { error = "NOT_FOUND", message = "Endpoint chỉ dùng cho môi trường phát triển." });

            var userId = JwtHelper.ExtractSubFromToken(Request);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { error = "UNAUTHORIZED", message = "Không xác định được người dùng." });

            try
            {
                // PM-002: strategy tự kiểm tra ownership (userId từ token vs order.UserId).
                var order = _paymentStrategy.SimulateWebhook(request.OrderId, userId);

                // PM-007: DB là nguồn chân lý — commit premium xuống DB trước.
                await PersistPremiumToDbAsync(order.UserId);

                // Commit DB thành công → mới đồng bộ cache in-memory (tránh split-brain).
                _paymentStrategy.ConfirmPremium(order.UserId);

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
            catch (InvalidOperationException ex)
            {
                // PM-003: order đã hết hạn → 409 (không cấp premium cho QR cũ).
                return Conflict(new { error = "ORDER_EXPIRED", message = ex.Message });
            }
        }

        [HttpGet("premium-status")]
        [RequireJwtRole]
        public ActionResult<StatelessPremiumStatusDto> GetPremiumStatus()
        {
            var userId = JwtHelper.ExtractSubFromToken(Request);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { error = "UNAUTHORIZED", message = "Không xác định được người dùng." });

            return Ok(_paymentStrategy.GetPremiumStatus(userId));
        }

        [HttpGet("check-access")]
        [RequireJwtRole]
        public ActionResult<object> CheckFeatureAccess([FromQuery] string featureId)
        {
            var userId = JwtHelper.ExtractSubFromToken(Request);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { error = "UNAUTHORIZED", message = "Không xác định được người dùng." });

            // PM-015: feature không tồn tại → 404 (fail-closed, không ngụ ý "mở cho free").
            if (!_paymentStrategy.FeatureExists(featureId))
                return NotFound(new { error = "FEATURE_NOT_FOUND", message = "Tính năng không tồn tại." });

            var hasAccess = _paymentStrategy.CheckFeatureAccess(userId, featureId);
            return Ok(new { userId, featureId, hasAccess });
        }

        [HttpGet("transactions")]
        [RequireJwtRole]
        public ActionResult<List<StatelessTransactionLogEntry>> GetTransactions()
        {
            var userId = JwtHelper.ExtractSubFromToken(Request);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { error = "UNAUTHORIZED", message = "Không xác định được người dùng." });

            var log = _paymentStrategy.GetTransactionLog(userId);
            return Ok(log);
        }

        /// <summary>
        /// PM-007: cấp premium cho user trong DB (nguồn chân lý duy nhất).
        /// Ném exception nếu không tìm thấy user — controller trả 500, không set cache in-memory.
        /// </summary>
        private async Task PersistPremiumToDbAsync(string? userId)
        {
            if (string.IsNullOrWhiteSpace(userId)) return;

            var email = userId == "demo-user-001" ? "demo@visualizationdsa.dev" : userId;
            var dbUser = await _dbContext.Users
                .FirstOrDefaultAsync(u => u.Email == email || u.Id.ToString() == userId);
            if (dbUser == null)
                throw new KeyNotFoundException("Người dùng không tồn tại trong hệ thống.");

            dbUser.SetPremiumStatus(true);
            await _dbContext.SaveChangesAsync();
        }
    }
}
