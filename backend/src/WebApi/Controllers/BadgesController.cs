using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Asp.Versioning;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Interfaces;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [Authorize]
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
        public async Task<ActionResult<IEnumerable<BadgeDto>>> GetAll()
        {
            var badges = await _unitOfWork.Badges.GetAllAsync();
            var result = badges.Select(b => new BadgeDto
            {
                Id          = b.Id,
                Name        = b.Name,
                Description = b.Description,
                Icon        = b.Icon,
                Color       = b.Color,
                EarnedAt    = DateTime.MinValue,
            });
            return Ok(result);
        }

        [HttpGet("my")]
        public async Task<ActionResult<IEnumerable<BadgeDto>>> GetMyBadges()
        {
            var userId = GetCurrentUserId();
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            
            if (user == null) return NotFound();

            var badges = user.UserBadges.Select(ub => new BadgeDto
            {
                Id          = ub.BadgeId,
                Name        = ub.Badge?.Name        ?? string.Empty,
                Description = ub.Badge?.Description ?? string.Empty,
                Icon        = ub.Badge?.Icon        ?? string.Empty,
                Color       = ub.Badge?.Color       ?? string.Empty,
                EarnedAt    = ub.EarnedAt,
            });

            return Ok(badges);
        }

        [HttpPost("check")]
        public async Task<ActionResult<IEnumerable<BadgeDto>>> CheckNewBadges()
        {
            var userId = GetCurrentUserId();
            var newBadges = await _gamificationService.CheckAndAwardBadgesAsync(userId);
            var result = newBadges.Select(b => new BadgeDto
            {
                Id          = b.Id,
                Name        = b.Name,
                Description = b.Description,
                Icon        = b.Icon,
                Color       = b.Color,
                EarnedAt    = DateTime.MinValue,
            });
            return Ok(result);
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            return Guid.Parse(userIdClaim!);
        }
    }
}
