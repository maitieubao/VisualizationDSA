using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Asp.Versioning;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
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
        public async Task<ActionResult<IEnumerable<Badge>>> GetAll()
        {
            var badges = await _unitOfWork.Badges.GetAllAsync();
            return Ok(badges);
        }

        [HttpGet("my")]
        public async Task<ActionResult<IEnumerable<Badge>>> GetMyBadges()
        {
            var userId = GetCurrentUserId();
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            
            if (user == null) return NotFound();

            var badges = new List<Badge>();
            foreach (var userBadge in user.UserBadges)
            {
                var badge = await _unitOfWork.Badges.GetByIdAsync(userBadge.BadgeId);
                if (badge != null)
                {
                    badges.Add(badge);
                }
            }

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
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            return Guid.Parse(userIdClaim!);
        }
    }
}
