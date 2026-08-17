using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.WebApi.Filters;

namespace VisualizationDSA.WebApi.Controllers
{
    /// <summary>
    /// F7 (FR-6.2) — Cấu hình hệ thống (chỉ Admin).
    /// GET/PUT /api/v1/admin/settings. Cache in-memory đơn giản bằng
    /// ConcurrentDictionary — đọc nhanh và cập nhật ngay sau PUT mà không cần restart.
    /// </summary>
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/admin/settings")]
    [RequireJwtRole("Admin")]
    public class SettingsController : ControllerBase
    {
        private static readonly ConcurrentDictionary<string, string> _cache = new(StringComparer.Ordinal);
        private readonly ApplicationDbContext _dbContext;

        public SettingsController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <summary>Xóa cache in-memory (chủ yếu phục vụ unit test độc lập).</summary>
        public static void ClearCache()
        {
            _cache.Clear();
        }

        [HttpGet]
        public async Task<IActionResult> GetSettings()
        {
            if (_cache.IsEmpty)
            {
                var settings = await _dbContext.Set<SystemSetting>().AsNoTracking().ToListAsync();
                foreach (var setting in settings)
                {
                    _cache[setting.Key] = setting.Value;
                }
            }

            var result = _cache
                .Select(kv => new { key = kv.Key, value = kv.Value })
                .OrderBy(s => s.key)
                .ToList();

            return Ok(result);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateSettings([FromBody] List<UpdateSettingDto> settings)
        {
            if (settings == null || settings.Count == 0)
                return BadRequest(new { error = "INVALID_SETTINGS", message = "Danh sách cấu hình không được rỗng." });

            var updatedBy = TryGetCurrentUserId();

            foreach (var item in settings)
            {
                if (item == null || string.IsNullOrWhiteSpace(item.Key))
                    return BadRequest(new { error = "INVALID_SETTINGS", message = "Key của cấu hình không được để trống." });

                var value = item.Value ?? string.Empty;
                var existing = await _dbContext.Set<SystemSetting>().FindAsync(item.Key);

                if (existing == null)
                {
                    _dbContext.Set<SystemSetting>().Add(new SystemSetting(item.Key, value, updatedBy: updatedBy));
                }
                else
                {
                    existing.Update(value, null, updatedBy);
                }

                _cache[item.Key] = value;
            }

            await _dbContext.SaveChangesAsync();

            var result = _cache
                .Select(kv => new { key = kv.Key, value = kv.Value })
                .OrderBy(s => s.key)
                .ToList();

            return Ok(new
            {
                message = "Đã cập nhật cấu hình hệ thống.",
                settings = result
            });
        }

        private Guid? TryGetCurrentUserId()
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            return userIdStr != null && Guid.TryParse(userIdStr, out var userId) ? userId : null;
        }
    }

    public record UpdateSettingDto(string Key, string Value);
}
