using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Services;

namespace VisualizationDSA.WebApi.Controllers
{
    /// <summary>
    /// Auth Controller — xử lý đăng ký, đăng nhập, refresh token và logout.
    /// Route: api/v{version:apiVersion}/auth
    /// </summary>
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]      // ✅ FIX 1.5: Chuẩn hóa về v1
    [EnableRateLimiting("auth")]        // ✅ FIX 4.2: Tất cả /auth routes đều bị rate-limit
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        /// <summary>
        /// Đăng ký tài khoản mới.
        /// POST /api/v1/auth/register
        /// </summary>
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
        {
            var response = await _authService.RegisterAsync(request);
            return Ok(response);
        }

        /// <summary>
        /// Đăng nhập và nhận Access Token + Refresh Token.
        /// POST /api/v1/auth/login
        /// </summary>
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            var response = await _authService.LoginAsync(request);
            return Ok(response);
        }

        /// <summary>
        /// Lấy Access Token mới từ Refresh Token.
        /// POST /api/v1/auth/refresh
        /// </summary>
        [HttpPost("refresh")]
        public async Task<ActionResult<AuthResponse>> Refresh([FromBody] RefreshTokenRequest request)
        {
            var response = await _authService.RefreshTokenAsync(request.RefreshToken);
            return Ok(response);
        }

        /// <summary>
        /// Đăng xuất — thu hồi Refresh Token.
        /// POST /api/v1/auth/logout
        /// </summary>
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout([FromBody] RefreshTokenRequest request)
        {
            await _authService.LogoutAsync(request.RefreshToken);
            return NoContent();
        }

        /// <summary>
        /// Lấy thông tin user hiện tại từ JWT đã xác thực.
        /// GET /api/v1/auth/me
        /// ✅ FIX 1.3: Đọc userId từ JWT Claims thay vì Header
        /// </summary>
        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<UserDto>> GetMe()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                         ?? User.FindFirstValue("sub");

            if (userId == null)
                return Unauthorized(new { message = "Token không hợp lệ." });

            var user = await _authService.GetCurrentUserAsync(userId);
            return Ok(user);
        }
    }
}
