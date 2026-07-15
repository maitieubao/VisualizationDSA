using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using System;

namespace VisualizationDSA.WebApi.Controllers
{
    /// <summary>
    /// Diagnostics Controller — endpoints phục vụ kiểm thử lỗi & health check.
    /// Route: api/v{version:apiVersion}/diagnostics
    /// </summary>
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/diagnostics")]
    public class DiagnosticsController : ControllerBase
    {
        /// <summary>
        /// Health check endpoint.
        /// GET /api/v1/diagnostics/health
        /// </summary>
        [HttpGet("health")]
        public ActionResult<object> Health()
        {
            return Ok(new
            {
                success = true,
                message = "Hệ thống hoạt động bình thường.",
                timestamp = DateTime.UtcNow,
                environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"
            });
        }

        /// <summary>
        /// Mô phỏng lỗi cho mục đích kiểm thử middleware xử lý lỗi.
        /// GET /api/v1/diagnostics/simulate-error?type=500|400|404|401|409|501
        /// </summary>
        [HttpGet("simulate-error")]
        public IActionResult SimulateError([FromQuery] int type = 500)
        {
            throw type switch
            {
                400 => new ArgumentException("Tham số đầu vào không hợp lệ (mô phỏng lỗi 400)."),
                401 => new UnauthorizedAccessException("Phiên đăng nhập đã hết hạn (mô phỏng lỗi 401)."),
                404 => new KeyNotFoundException("Tài nguyên không tồn tại (mô phỏng lỗi 404)."),
                409 => new InvalidOperationException("Xung đột dữ liệu (mô phỏng lỗi 409)."),
                501 => new NotImplementedException("Tính năng chưa sẵn sàng (mô phỏng lỗi 501)."),
                _   => new Exception("Lỗi hệ thống nội bộ không xác định (mô phỏng lỗi 500).")
            };
        }
    }
}
