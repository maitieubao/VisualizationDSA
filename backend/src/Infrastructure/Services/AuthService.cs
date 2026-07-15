using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Interfaces;

namespace VisualizationDSA.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;

        // Access token sống 15 phút — refresh token sẽ gia hạn
        private static readonly TimeSpan AccessTokenLifetime = TimeSpan.FromMinutes(15);

        public AuthService(IUnitOfWork unitOfWork, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            // ✅ FIX 1.2: Kiểm tra email đúng cách — FindAsync trả IEnumerable
            var existingUsers = await _unitOfWork.Users.FindAsync(u => u.Email == request.Email);
            if (existingUsers.Any())
            {
                throw new ArgumentException("Email này đã được sử dụng bởi tài khoản khác.");
            }

            // Kiểm tra username trùng
            var existingByUsername = await _unitOfWork.Users.FindAsync(u => u.Username == request.Username);
            if (existingByUsername.Any())
            {
                throw new ArgumentException("Username này đã được sử dụng bởi tài khoản khác.");
            }

            // ✅ FIX 1.1: BCrypt thay vì SHA256 thô
            var passwordHash = HashPassword(request.Password);

            var user = new User(request.Email, request.Username, passwordHash);
            await _unitOfWork.Users.AddAsync(user);
            await _unitOfWork.CommitAsync();

            var (accessToken, refreshToken) = await GenerateTokenPairAndSaveAsync(user);

            return new AuthResponse
            {
                AccessToken  = accessToken,
                RefreshToken = refreshToken,
                ExpiresIn    = (int)AccessTokenLifetime.TotalSeconds,
                User         = MapToUserDto(user)
            };
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var users = await _unitOfWork.Users.FindAsync(u => u.Email == request.Email);
            var user  = users.FirstOrDefault();

            // Thông báo chung để không lộ user có tồn tại hay không
            if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");
            }

            user.RecordLogin();
            await _unitOfWork.CommitAsync();

            var (accessToken, refreshToken) = await GenerateTokenPairAndSaveAsync(user);

            return new AuthResponse
            {
                AccessToken  = accessToken,
                RefreshToken = refreshToken,
                ExpiresIn    = (int)AccessTokenLifetime.TotalSeconds,
                User         = MapToUserDto(user)
            };
        }

        // ✅ FIX 1.3: Đọc userId từ Guid string (đã xác thực bởi JWT middleware)
        public async Task<UserDto> GetCurrentUserAsync(string userId)
        {
            if (!Guid.TryParse(userId, out var id))
                throw new ArgumentException("UserId không hợp lệ.");

            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user == null)
                throw new KeyNotFoundException("Người dùng không tồn tại.");

            return MapToUserDto(user);
        }

        public async Task<AuthResponse> RefreshTokenAsync(string refreshTokenValue)
        {
            var tokens = await _unitOfWork.RefreshTokens.FindAsync(
                rt => rt.Token == refreshTokenValue && !rt.IsRevoked && rt.ExpiresAt > DateTime.UtcNow);

            var existingToken = tokens.FirstOrDefault();
            if (existingToken == null)
                throw new UnauthorizedAccessException("Refresh token không hợp lệ hoặc đã hết hạn.");

            // Revoke token cũ (Rotation strategy — mỗi refresh tạo token mới)
            existingToken.Revoke();
            await _unitOfWork.CommitAsync();

            var user = await _unitOfWork.Users.GetByIdAsync(existingToken.UserId);
            if (user == null)
                throw new KeyNotFoundException("Người dùng không tồn tại.");

            var (accessToken, newRefreshToken) = await GenerateTokenPairAndSaveAsync(user);

            return new AuthResponse
            {
                AccessToken  = accessToken,
                RefreshToken = newRefreshToken,
                ExpiresIn    = (int)AccessTokenLifetime.TotalSeconds,
                User         = MapToUserDto(user)
            };
        }

        public async Task LogoutAsync(string refreshTokenValue)
        {
            var tokens = await _unitOfWork.RefreshTokens.FindAsync(
                rt => rt.Token == refreshTokenValue && !rt.IsRevoked);

            var token = tokens.FirstOrDefault();
            if (token != null)
            {
                token.Revoke();
                await _unitOfWork.CommitAsync();
            }
            // Không throw nếu token không tìm thấy — idempotent logout
        }

        // ── Helpers ──────────────────────────────────────────────────────

        private async Task<(string accessToken, string refreshTokenValue)> GenerateTokenPairAndSaveAsync(User user)
        {
            var accessToken   = GenerateAccessToken(user);
            var refreshToken  = CreateRefreshToken(user.Id);

            // Persist refresh token to DB
            await _unitOfWork.RefreshTokens.AddAsync(refreshToken);
            await _unitOfWork.CommitAsync();

            return (accessToken, refreshToken.Token);
        }

        private string GenerateAccessToken(User user)
        {
            var key         = _configuration["Jwt:Key"]
                              ?? throw new InvalidOperationException("JWT Key chưa được cấu hình.");
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub,   user.Id.ToString()),
                new(JwtRegisteredClaimNames.Email, user.Email),
                new(JwtRegisteredClaimNames.Name,  user.Username),
                new(JwtRegisteredClaimNames.Jti,   Guid.NewGuid().ToString()),
                new("level", user.CurrentLevel.ToString()),
                new("role", user.Role)
            };

            var token = new JwtSecurityToken(
                issuer:             _configuration["Jwt:Issuer"],
                audience:           _configuration["Jwt:Audience"],
                claims:             claims,
                notBefore:          DateTime.UtcNow,
                expires:            DateTime.UtcNow.Add(AccessTokenLifetime),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static RefreshToken CreateRefreshToken(Guid userId)
        {
            return new RefreshToken(
                userId:    userId,
                token:     Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N"), // 64-char token
                expiresAt: DateTime.UtcNow.AddDays(30)
            );
        }

        // ✅ FIX 1.1: BCrypt với work factor 12 — industry standard
        private static string HashPassword(string password)
            => BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);

        private static bool VerifyPassword(string password, string passwordHash)
        {
            if (passwordHash.StartsWith("$2a$") || passwordHash.StartsWith("$2b$") || passwordHash.StartsWith("$2y$"))
            {
                try
                {
                    return BCrypt.Net.BCrypt.Verify(password, passwordHash);
                }
                catch
                {
                    return false;
                }
            }
            var bytes = System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(password + "visualizationdsa-salt"));
            var sha256Hash = Convert.ToHexString(bytes).ToLowerInvariant();
            return sha256Hash == passwordHash;
        }

        private static UserDto MapToUserDto(User user) => new()
        {
            Id         = user.Id,
            Email      = user.Email,
            Username   = user.Username,
            TotalXP    = user.TotalXP,
            CurrentLevel = user.CurrentLevel,
            StreakDays = user.StreakDays,
            CreatedAt  = user.CreatedAt,
            Badges     = new List<BadgeDto>(),
            IsPremium  = user.IsPremium
        };
    }
}
