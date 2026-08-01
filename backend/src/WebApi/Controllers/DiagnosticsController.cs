using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using System;

namespace VisualizationDSA.WebApi.Controllers
{
    
    
    
    
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/diagnostics")]
    public class DiagnosticsController : ControllerBase
    {
        
        
        
        
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
