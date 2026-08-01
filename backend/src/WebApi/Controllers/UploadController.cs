using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;
using VisualizationDSA.WebApi.Filters;
using VisualizationDSA.Application.Common.Interfaces;
using System.IO;
using System;
using VisualizationDSA.WebApi.Helpers;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiController]
    [Route("api/v1/upload")]
    public class UploadController : ControllerBase
    {
        private readonly IUploadService _uploadService;

        public UploadController(IUploadService uploadService)
        {
            _uploadService = uploadService;
        }

        [HttpPost("theory-image")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> UploadTheoryImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { error = "INVALID_FILE", message = "File không hợp lệ." });

            if (file.Length > 5 * 1024 * 1024)
                return BadRequest(new { error = "FILE_TOO_LARGE", message = "Dung lượng ảnh tối đa 5MB." });

            var allowedExtensions = new[] { ".png", ".jpg", ".jpeg", ".webp" };
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(ext))
                return BadRequest(new { error = "INVALID_FORMAT", message = "Chỉ hỗ trợ PNG, JPG, WEBP." });

            try
            {
                using var stream = file.OpenReadStream();
                if (!FileSignatureValidator.IsValidFileSignature(stream, ext))
                    return BadRequest(new { error = "INVALID_FILE_SIGNATURE", message = "File bị giả mạo hoặc không đúng định dạng." });

                var url = await _uploadService.UploadImageAsync(stream, file.FileName);
                if (string.IsNullOrEmpty(url))
                    return StatusCode(500, new { error = "UPLOAD_FAILED", message = "Tải ảnh thất bại." });

                return Ok(new { url });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "UPLOAD_FAILED", message = ex.Message });
            }
        }

        [HttpPost("theory-video")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> UploadTheoryVideo(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { error = "INVALID_FILE", message = "File không hợp lệ." });

            if (file.Length > 50 * 1024 * 1024)
                return BadRequest(new { error = "FILE_TOO_LARGE", message = "Dung lượng video tối đa 50MB." });

            var allowedExtensions = new[] { ".mp4", ".webm" };
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(ext))
                return BadRequest(new { error = "INVALID_FORMAT", message = "Chỉ hỗ trợ MP4, WEBM." });

            try
            {
                using var stream = file.OpenReadStream();
                var url = await _uploadService.UploadVideoAsync(stream, file.FileName);
                if (string.IsNullOrEmpty(url))
                    return StatusCode(500, new { error = "UPLOAD_FAILED", message = "Tải video thất bại." });

                return Ok(new { url });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "UPLOAD_FAILED", message = ex.Message });
            }
        }

        [HttpPost("avatar")]
        [RequireJwtRole]
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { error = "INVALID_FILE", message = "File không hợp lệ." });

            if (file.Length > 5 * 1024 * 1024)
                return BadRequest(new { error = "FILE_TOO_LARGE", message = "Dung lượng ảnh tối đa 5MB." });

            var allowedExtensions = new[] { ".png", ".jpg", ".jpeg", ".webp" };
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(ext))
                return BadRequest(new { error = "INVALID_FORMAT", message = "Chỉ hỗ trợ PNG, JPG, WEBP." });

            try
            {
                using var stream = file.OpenReadStream();
                if (!FileSignatureValidator.IsValidFileSignature(stream, ext))
                    return BadRequest(new { error = "INVALID_FILE_SIGNATURE", message = "File bị giả mạo hoặc không đúng định dạng." });

                var url = await _uploadService.UploadImageAsync(stream, $"avatar_{Guid.NewGuid()}{ext}");
                if (string.IsNullOrEmpty(url))
                    return StatusCode(500, new { error = "UPLOAD_FAILED", message = "Tải ảnh thất bại." });

                return Ok(new { url });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "UPLOAD_FAILED", message = ex.Message });
            }
        }

        [HttpPost("cv-document")]
        [RequireJwtRole]
        public async Task<IActionResult> UploadCV(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { error = "INVALID_FILE", message = "File không hợp lệ." });

            if (file.Length > 5 * 1024 * 1024)
                return BadRequest(new { error = "FILE_TOO_LARGE", message = "Dung lượng file tối đa 5MB." });

            var allowedExtensions = new[] { ".pdf" };
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(ext))
                return BadRequest(new { error = "INVALID_FORMAT", message = "Chỉ hỗ trợ file PDF." });

            try
            {
                using var stream = file.OpenReadStream();
                if (!FileSignatureValidator.IsValidFileSignature(stream, ext))
                    return BadRequest(new { error = "INVALID_FILE_SIGNATURE", message = "File bị giả mạo hoặc không đúng định dạng PDF." });

                var url = await _uploadService.UploadDocumentAsync(stream, $"cv_{Guid.NewGuid()}{ext}");
                if (string.IsNullOrEmpty(url))
                    return StatusCode(500, new { error = "UPLOAD_FAILED", message = "Tải file thất bại." });

                return Ok(new { url });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "UPLOAD_FAILED", message = ex.Message });
            }
        }
    }
}
