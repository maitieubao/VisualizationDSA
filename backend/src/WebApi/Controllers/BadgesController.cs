using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Asp.Versioning;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Interfaces;

using VisualizationDSA.WebApi.Filters;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [RequireJwtRole]
    public class BadgesController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IGamificationService _gamificationService;

        public BadgesController(IUnitOfWork unitOfWork, IGamificationService gamificationService)
        {
            _unitOfWork = unitOfWork;
            _gamificationService = gamificationService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Badge>>> GetAll()
        {
            var badges = await _unitOfWork.Badges.GetAllAsync();
            return Ok(badges);
        }

        [HttpGet("my")]
        public async Task<ActionResult<IEnumerable<Badge>>> GetMyBadges()
        {
            var userId = GetCurrentUserId();
            // Load kèm UserBadges + Badge trong 1 query (khử N+1 truy vấn từng badge).
            var user = await _unitOfWork.Users.GetByIdWithDetailsAsync(userId, track: false);

            if (user == null) return NotFound();

            var badges = user.UserBadges
                .Where(ub => ub.Badge != null)
                .Select(ub => ub.Badge!)
                .ToList();

            return Ok(badges);
        }

        [HttpPost("check")]
        public async Task<ActionResult<IEnumerable<Badge>>> CheckNewBadges()
        {
            var userId = GetCurrentUserId();
            var newBadges = await _gamificationService.CheckAndAwardBadgesAsync(userId);
            return Ok(newBadges);
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = JwtHelper.ExtractSubFromToken(Request);
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                throw new UnauthorizedAccessException("User identity claim không hợp lệ hoặc bị thiếu.");
            return userId;
        }
    }
}
