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

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            
            var fileUrl = $"/uploads/{uniqueFileName}";

            return Ok(new { url = fileUrl, message = "Upload thành công." });
        }
    }
}
