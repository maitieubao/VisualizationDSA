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
using VisualizationDSA.Domain.Strategies;

namespace VisualizationDSA.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;

        
        private static readonly TimeSpan AccessTokenLifetime = TimeSpan.FromMinutes(15);

        // AU-014: dummy hash (cùng cost factor BCrypt) để verify khi email không tồn tại
        // — cân bằng thời gian phản hồi, chống timing side-channel.
        private static readonly string DummyPasswordHash = BCrypt.Net.BCrypt.HashPassword("dummy-timing-password", workFactor: 12);

        public AuthService(IUnitOfWork unitOfWork, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            // Message chung chung — không lộ email/username nào đã tồn tại (chống user enumeration).

            // AU-037: normalize email trước mọi check/insert.
            var normalizedEmail = NormalizeEmail(request.Email);

            var existingUsers = await _unitOfWork.Users.FindAsync(u => u.Email == normalizedEmail);
            if (existingUsers.Any())
            {
                throw new ArgumentException("Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.");
            }

            
            var existingByUsername = await _unitOfWork.Users.FindAsync(u => u.Username == request.Username);
            if (existingByUsername.Any())
            {
                throw new ArgumentException("Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.");
            }

            
            var passwordHash = HashPassword(request.Password);

            var user = new User(normalizedEmail, request.Username, passwordHash);
            await _unitOfWork.Users.AddAsync(user);

            try
            {
                await _unitOfWork.CommitAsync();
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException)
            {
                // AU-012: TOCTOU — race trùng email/username (unique constraint) → 400 message
                // generic thay vì 500 (server vẫn đang dùng check-then-insert để thân thiện hơn).
                throw new ArgumentException("Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.");
            }

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
            // AU-037: normalize email trước khi tra cứu.
            var normalizedEmail = NormalizeEmail(request.Email);

            var users = await _unitOfWork.Users.FindAsync(u => u.Email == normalizedEmail);
            var user  = users.FirstOrDefault();

            
            if (user == null)
            {
                // AU-014: verify dummy hash khi email không tồn tại — thời gian phản hồi
                // tương đương user tồn tại, chống phân biệt email bằng timing.
                _ = VerifyPassword(request.Password, DummyPasswordHash);
                throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");
            }

            if (!VerifyPassword(request.Password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");
            }

            // Tài khoản bị khóa (IsActive=false) không được đăng nhập — message chung chống enumeration.
            if (!user.IsActive)
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
            // AU-004/AU-038: rotation trong CÙNG transaction — generate token mới TRƯỚC,
            // revoke token cũ SAU, commit 1 lần. DB fail giữa chừng → rollback → phiên cũ vẫn sống.
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // Tra cứu KHÔNG lọc revoked/expired để phát hiện reuse (AU-004: family revocation).
                var tokens = await _unitOfWork.RefreshTokens.FindAsync(rt => rt.Token == refreshTokenValue);
                var existingToken = tokens.FirstOrDefault();
                if (existingToken == null)
                {
                    throw new UnauthorizedAccessException("Refresh token không hợp lệ hoặc đã hết hạn.");
                }

                if (existingToken.IsRevoked || existingToken.ExpiresAt <= DateTime.UtcNow)
                {
                    // AU-004: reuse detection — token đã bị dùng/revoke → thu hồi TOÀN BỘ phiên
                    // của user (family revocation) để chặn kẻ đánh cắp token cũ tiếp tục dùng.
                    var familyTokens = await _unitOfWork.RefreshTokens.FindAsync(
                        rt => rt.UserId == existingToken.UserId && !rt.IsRevoked);
                    foreach (var t in familyTokens) t.Revoke();
                    await _unitOfWork.CommitAsync();
                    await _unitOfWork.CommitTransactionAsync();
                    throw new UnauthorizedAccessException("Refresh token không hợp lệ hoặc đã hết hạn.");
                }

                var user = await _unitOfWork.Users.GetByIdAsync(existingToken.UserId);
                if (user == null)
                {
                    // AU-030: user đã bị xóa → 401 thay vì 404 (không lộ thông tin).
                    throw new UnauthorizedAccessException("Phiên đăng nhập không còn hiệu lực.");
                }

                // AU-011: user bị ban không được refresh vô hạn (trước đây bỏ qua IsActive).
                if (!user.IsActive)
                {
                    throw new UnauthorizedAccessException("Phiên đăng nhập không còn hiệu lực.");
                }

                // AU-038: generate TRƯỚC (trong bộ nhớ), revoke SAU — cả 2 lưu trong 1 commit
                // (cùng transaction) → không thể rơi vào trạng thái mất session khi DB lỗi.
                var accessToken = GenerateAccessToken(user);
                var newRefreshToken = CreateRefreshToken(user.Id);
                await _unitOfWork.RefreshTokens.AddAsync(newRefreshToken);
                existingToken.Revoke();

                await _unitOfWork.CommitAsync();
                await _unitOfWork.CommitTransactionAsync();

                return new AuthResponse
                {
                    AccessToken  = accessToken,
                    RefreshToken = newRefreshToken.Token,
                    ExpiresIn    = (int)AccessTokenLifetime.TotalSeconds,
                    User         = MapToUserDto(user)
                };
            }
            catch
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
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
            
        }

        

        private async Task<(string accessToken, string refreshTokenValue)> GenerateTokenPairAndSaveAsync(User user)
        {
            var accessToken   = GenerateAccessToken(user);
            var refreshToken  = CreateRefreshToken(user.Id);

            
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
                token:     Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N"), 
                expiresAt: DateTime.UtcNow.AddDays(30)
            );
        }

        
        private static string HashPassword(string password)
            => BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);

        // AU-033: dùng CHUNG helper verify của StatelessAuthStrategy (BCrypt → fallback SHA256)
        // — trước đây logic này duplicate 3 chỗ dễ lệch.
        private static bool VerifyPassword(string password, string passwordHash)
            => StatelessAuthStrategy.VerifyPassword(password, passwordHash);

        // AU-037: chuẩn hóa email (Trim + ToLowerInvariant) trước mọi check/insert.
        private static string NormalizeEmail(string email)
            => (email ?? string.Empty).Trim().ToLowerInvariant();

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
            IsPremium  = user.IsPremium,
            // Trước đây bỏ qua Role → mọi user qua flow chuẩn trả về "Student" dù là Admin/Teacher.
            Role       = user.Role
        };
    }
}
