using Asp.Versioning;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using System;
using System.IO;
using System.Threading.Tasks;
using VisualizationDSA.WebApi.Filters;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/upload")]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        public UploadController(IWebHostEnvironment env)
        {
            _env = env;
        }

        
        
        
        
        [HttpPost("image")]
        [RequireJwtRole] 
        [RequestSizeLimit(6 * 1024 * 1024)] // chặn sớm body > 6MB (giới hạn 5MB + overhead)
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { error = "NO_FILE", message = "Vui lòng chọn một file ảnh." });
            }

            
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".gif" && ext != ".webp")
            {
                return BadRequest(new { error = "INVALID_FILE_TYPE", message = "Chỉ chấp nhận file ảnh (.jpg, .png, .gif, .webp)." });
            }

            // Chỉ kiểm tra đuôi file là KHÔNG đủ — file polyglot (.jpg chứa HTML/JS) có thể gây
            // stored XSS khi được phục vụ cùng origin. Kiểm tra magic bytes thực tế.
            var header = new byte[16];
            using (var readStream = file.OpenReadStream())
            {
                var read = await readStream.ReadAsync(header, 0, header.Length);
                if (read < 12)
                {
                    return BadRequest(new { error = "INVALID_FILE_TYPE", message = "File ảnh không hợp lệ." });
                }
                readStream.Position = 0;
            }

            var isImage = (header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF)   // jpeg
                || (header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47) // png
                || (header[0] == 'G' && header[1] == 'I' && header[2] == 'F' && header[3] == '8')     // gif
                || (header[0] == 'R' && header[1] == 'I' && header[2] == 'F' && header[3] == 'F');    // webp (RIFF....WEBP)
            if (!isImage)
            {
                return BadRequest(new { error = "INVALID_FILE_TYPE", message = "Nội dung file không phải ảnh hợp lệ." });
            }

            
            if (file.Length > 5 * 1024 * 1024)
            {
                return BadRequest(new { error = "FILE_TOO_LARGE", message = "File ảnh không được vượt quá 5MB." });
            }

            var webRootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadsFolder = Path.Combine(webRootPath, "uploads");

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = Guid.NewGuid().ToString() + ext;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            try
            {
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }
            }
            catch (Exception ex) when (ex is IOException or UnauthorizedAccessException)
            {
                // Dọn file partial nếu ghi dở — trước đây lỗi IO → 500 + file rác trên đĩa.
                try { if (System.IO.File.Exists(filePath)) System.IO.File.Delete(filePath); } catch { }
                Serilog.Log.Error(ex, "Không thể ghi file upload.");
                return StatusCode(StatusCodes.Status500InternalServerError, new { error = "UPLOAD_FAILED", message = "Không thể lưu file. Vui lòng thử lại." });
            }

            
            var fileUrl = $"/uploads/{uniqueFileName}";

            return Ok(new { url = fileUrl, message = "Upload thành công." });
        }
    }
}
