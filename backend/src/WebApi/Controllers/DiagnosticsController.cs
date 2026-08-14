using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using System;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/diagnostics")]
    public class DiagnosticsController : ControllerBase
    {
        private readonly IHostEnvironment _environment;

        public DiagnosticsController(IHostEnvironment environment)
        {
            _environment = environment;
        }

        [HttpGet("health")]
        public ActionResult<object> Health()
        {
            // SEC-2026-08-14: không lộ ASPNETCORE_ENVIRONMENT thật ra ngoài —
            // health check công khai chỉ cần trạng thái, không cần tên môi trường.
            return Ok(new
            {
                success = true,
                message = "Hệ thống hoạt động bình thường.",
                timestamp = DateTime.UtcNow
            });
        }

        // SEC-2026-08-14: simulate-error chỉ tồn tại ở Development — production bị 404
        // (không cho kẻ ngoài ép server ném lỗi + tạo noise log + thăm dò error pipeline).
        [HttpGet("simulate-error")]
        public IActionResult SimulateError([FromQuery] int type = 500)
        {
            if (!_environment.IsDevelopment())
                return NotFound();

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
