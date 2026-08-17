using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.WebApi.Filters;

namespace VisualizationDSA.WebApi.Controllers
{
    /// <summary>
    /// F6 (FR-3.10) — Yêu thích mô phỏng.
    /// SimulationKey = id trong ALGORITHM_CATALOG (vd "bubble-sort").
    /// GET/POST/DELETE /api/v1/favorites.
    /// </summary>
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/favorites")]
    [RequireJwtRole]
    public class FavoritesController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public FavoritesController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetFavorites()
        {
            var userIdResult = TryGetCurrentUserId(out var userId);
            if (userIdResult != null) return userIdResult;

            var favorites = await _dbContext.Set<Favorite>()
                .AsNoTracking()
                .Where(f => f.UserId == userId)
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new
                {
                    f.SimulationKey,
                    f.InputJson,
                    f.CreatedAt
                })
                .ToListAsync();

            return Ok(favorites);
        }

        [HttpPost]
        public async Task<IActionResult> AddFavorite([FromBody] AddFavoriteDto dto)
        {
            var userIdResult = TryGetCurrentUserId(out var userId);
            if (userIdResult != null) return userIdResult;

            if (dto == null || string.IsNullOrWhiteSpace(dto.SimulationKey))
                return BadRequest(new { error = "INVALID_SIMULATION_KEY", message = "SimulationKey không được để trống." });

            var existing = await _dbContext.Set<Favorite>()
                .FirstOrDefaultAsync(f => f.UserId == userId && f.SimulationKey == dto.SimulationKey);

            if (existing != null)
            {
                return Ok(new
                {
                    message = "Đã có trong danh sách yêu thích.",
                    favorite = new { existing.SimulationKey, existing.InputJson, existing.CreatedAt }
                });
            }

            var favorite = new Favorite(userId, dto.SimulationKey, dto.InputJson);
            _dbContext.Set<Favorite>().Add(favorite);

            try
            {
                await _dbContext.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                // Race: request song song đã tạo trước — unique constraint là hàng rào.
                // Không match message (khác nhau giữa SQLite/Postgres) — re-query thấy bản ghi
                // tức là đã tồn tại (idempotent), không thấy thì rethrow lỗi thật.
                _dbContext.ChangeTracker.Clear();
                var raced = await _dbContext.Set<Favorite>()
                    .AsNoTracking()
                    .FirstOrDefaultAsync(f => f.UserId == userId && f.SimulationKey == dto.SimulationKey);
                if (raced != null)
                {
                    return Ok(new
                    {
                        message = "Đã có trong danh sách yêu thích.",
                        favorite = new { raced.SimulationKey, raced.InputJson, raced.CreatedAt }
                    });
                }
                throw;
            }

            return Ok(new
            {
                message = "Đã thêm vào danh sách yêu thích.",
                favorite = new { favorite.SimulationKey, favorite.InputJson, favorite.CreatedAt }
            });
        }

        [HttpDelete("{simulationKey}")]
        public async Task<IActionResult> RemoveFavorite(string simulationKey)
        {
            var userIdResult = TryGetCurrentUserId(out var userId);
            if (userIdResult != null) return userIdResult;

            var favorite = await _dbContext.Set<Favorite>()
                .FirstOrDefaultAsync(f => f.UserId == userId && f.SimulationKey == simulationKey);

            if (favorite == null)
                return Ok(new { message = "Không có mục yêu thích để xóa." });

            _dbContext.Set<Favorite>().Remove(favorite);
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Đã xóa khỏi danh sách yêu thích." });
        }

        private IActionResult? TryGetCurrentUserId(out Guid userId)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (userIdStr == null || !Guid.TryParse(userIdStr, out userId))
            {
                userId = Guid.Empty;
                return Unauthorized(new { error = "UNAUTHORIZED", message = "Yêu cầu đăng nhập." });
            }

            return null;
        }
    }

    public record AddFavoriteDto(string SimulationKey, string? InputJson);
}
