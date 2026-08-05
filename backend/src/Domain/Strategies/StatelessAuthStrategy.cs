using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies
{
    
    
    
    
    
    public class StatelessAuthStrategy
    {
        private readonly ConcurrentDictionary<string, InMemoryUser> _usersByEmail = new();
        private readonly ConcurrentDictionary<string, InMemoryUser> _usersById = new();
        private readonly ConcurrentDictionary<string, string> _refreshTokens = new(); 
        private static readonly TimeSpan AccessTokenLifetime = TimeSpan.FromMinutes(15);

        public static Func<string, string, bool> VerifyPasswordDelegate { get; set; } = (password, hash) => 
            HashPassword(password) == hash;

        /// <summary>
        /// Chỉ seed tài khoản demo/admin mặc định ở môi trường Development.
        /// Program.cs set giá trị này theo IWebHostEnvironment — nếu bật ở production,
        /// ai biết credential công khai trong source sẽ login được quyền Admin/Teacher.
        /// </summary>
        public static bool EnableDemoAccounts { get; set; } = false;

        public StatelessAuthStrategy()
        {
            if (!EnableDemoAccounts) return;

            var demoUser = new InMemoryUser
            {
                Id = "demo-user-001",
                Email = "demo@visualizationdsa.dev",
                Username = "VisualizationDSA Student",
                PasswordHash = HashPassword("Demo@2024"),
                TotalXP = 150,
                CurrentLevel = 2,
                StreakDays = 3,
                IsPremium = false,
                Role = "Teacher",
                CreatedAt = DateTime.UtcNow.AddDays(-30),
                LastLoginAt = DateTime.UtcNow.AddHours(-2),
                Badges = new List<InMemoryBadge>
                {
                    new() { Id = "first-steps", Name = "Bước Đầu Tiên", Description = "Hoàn thành bài học đầu tiên", Icon = "🎯", Color = "#10B981", EarnedAt = DateTime.UtcNow.AddDays(-25) },
                }
            };
            _usersByEmail[demoUser.Email] = demoUser;
            _usersById[demoUser.Id] = demoUser;

            var adminUser = new InMemoryUser
            {
                Id = "admin-user-001",
                Email = "admin@visualizationdsa.dev",
                Username = "VisualizationDSA Admin",
                PasswordHash = HashPassword("Admin@2024"),
                TotalXP = 9999,
                CurrentLevel = 8,
                StreakDays = 30,
                IsPremium = true,
                Role = "Admin",
                CreatedAt = DateTime.UtcNow.AddDays(-90),
                LastLoginAt = DateTime.UtcNow,
                Badges = new List<InMemoryBadge>()
            };
            _usersByEmail[adminUser.Email] = adminUser;
            _usersById[adminUser.Id] = adminUser;

            var easyAdmin = new InMemoryUser
            {
                Id = "admin-user-002",
                Email = "admin@gmail.com",
                Username = "Easy Admin",
                PasswordHash = HashPassword("admin123"),
                TotalXP = 9999,
                CurrentLevel = 8,
                StreakDays = 30,
                IsPremium = true,
                Role = "Admin",
                CreatedAt = DateTime.UtcNow.AddDays(-90),
                LastLoginAt = DateTime.UtcNow,
                Badges = new List<InMemoryBadge>()
            };
            _usersByEmail[easyAdmin.Email] = easyAdmin;
            _usersById[easyAdmin.Id] = easyAdmin;
        }

        public StatelessAuthResponse Register(StatelessRegisterRequest request, string? dbUserId = null)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
                throw new ArgumentException("Email, username và password không được để trống.");

            if (request.Password.Length < 8)
                throw new ArgumentException("Mật khẩu phải có ít nhất 8 ký tự.");

            if (_usersByEmail.ContainsKey(request.Email))
                throw new ArgumentException("Email này đã được sử dụng bởi tài khoản khác.");

            if (_usersByEmail.Values.Any(u => u.Username == request.Username))
                throw new ArgumentException("Username này đã được sử dụng bởi tài khoản khác.");

            var user = new InMemoryUser
            {
                Id = dbUserId ?? $"user-{Guid.NewGuid():N}",
                Email = request.Email,
                Username = request.Username,
                PasswordHash = HashPassword(request.Password),
                TotalXP = 0,
                CurrentLevel = 1,
                StreakDays = 0,
                IsPremium = false,
                Role = "Student",
                CreatedAt = DateTime.UtcNow,
                LastLoginAt = DateTime.UtcNow,
                Badges = new List<InMemoryBadge>()
            };

            _usersByEmail[user.Email] = user;
            _usersById[user.Id] = user;

            return GenerateAuthResponse(user);
        }

        public StatelessAuthResponse Login(StatelessLoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");

            if (!_usersByEmail.TryGetValue(request.Email, out var user))
                throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");

            if (!VerifyPassword(request.Password, user.PasswordHash))
                throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");

            user.LastLoginAt = DateTime.UtcNow;
            return GenerateAuthResponse(user);
        }

        public StatelessUserDto GetProfile(string userId)
        {
            if (!_usersById.TryGetValue(userId, out var user))
                throw new KeyNotFoundException("Người dùng không tồn tại.");
            return MapToUserDto(user);
        }

        public StatelessAuthResponse RefreshToken(string refreshTokenValue)
        {
            if (!_refreshTokens.TryGetValue(refreshTokenValue, out var userId))
                throw new UnauthorizedAccessException("Refresh token không hợp lệ hoặc đã hết hạn.");

            if (!_usersById.TryGetValue(userId, out var user))
                throw new KeyNotFoundException("Người dùng không tồn tại.");

            _refreshTokens.TryRemove(refreshTokenValue, out _);
            return GenerateAuthResponse(user);
        }

        public void Logout(string refreshTokenValue)
        {
            _refreshTokens.TryRemove(refreshTokenValue, out _);
        }

        public StatelessUserDto UpdateProfile(string userId, string? newUsername, string? newNickname = null, string? newBio = null, string? newUniversity = null)
        {
            if (!_usersById.TryGetValue(userId, out var user))
                throw new KeyNotFoundException("Người dùng không tồn tại.");

            if (!string.IsNullOrWhiteSpace(newUsername))
            {
                if (_usersByEmail.Values.Any(u => u.Username == newUsername && u.Id != userId))
                    throw new ArgumentException("Username này đã được sử dụng.");
                user.Username = newUsername;
            }

            user.Nickname = newNickname;
            user.Bio = newBio;
            user.University = newUniversity;

            return MapToUserDto(user);
        }

        public StatelessUserProgressDto GetUserProgress(string userId)
        {
            if (!_usersById.TryGetValue(userId, out var user))
                throw new KeyNotFoundException("Người dùng không tồn tại.");

            var levelThresholds = new[] { 0, 100, 300, 600, 1000, 1500, 2200, 3000 };
            var currentIdx = Math.Min(user.CurrentLevel - 1, levelThresholds.Length - 1);
            var nextIdx = Math.Min(user.CurrentLevel, levelThresholds.Length - 1);
            var currentThreshold = levelThresholds[currentIdx];
            var nextThreshold = levelThresholds[nextIdx];
            var xpInLevel = user.TotalXP - currentThreshold;
            var xpForLevel = nextThreshold - currentThreshold;
            var progressPercent = xpForLevel > 0 ? Math.Min(100, (int)(xpInLevel * 100.0 / xpForLevel)) : 100;

            return new StatelessUserProgressDto
            {
                TotalXP = user.TotalXP,
                CurrentLevel = user.CurrentLevel,
                XpToNextLevel = Math.Max(0, nextThreshold - user.TotalXP),
                LevelProgressPercent = progressPercent,
                BadgesEarned = user.Badges.Count,
                ModulesCompleted = user.CompletedModules.Count,
                CurrentStreak = user.StreakDays,
                CompletedModuleIds = user.CompletedModules.ToList(),
                Badges = user.Badges.Select(MapToBadgeDto).ToList(),
                IsPremium = user.IsPremium
            };
        }

        public StatelessUserDto AwardXP(string userId, int amount, string reason)
        {
            if (!_usersById.TryGetValue(userId, out var user))
                throw new KeyNotFoundException("Người dùng không tồn tại.");

            if (amount <= 0)
                throw new ArgumentException("Số XP phải lớn hơn 0.");

            user.TotalXP += amount;
            CheckLevelUp(user);

            return MapToUserDto(user);
        }

        public List<StatelessUserDto> GetAllUsers()
        {
            return _usersById.Values.Select(MapToUserDto).ToList();
        }

        

        private StatelessAuthResponse GenerateAuthResponse(InMemoryUser user)
        {
            var accessToken = GenerateMockJwt(user);
            var refreshToken = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
            _refreshTokens[refreshToken] = user.Id;

            return new StatelessAuthResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresIn = (int)AccessTokenLifetime.TotalSeconds,
                User = MapToUserDto(user)
            };
        }

        private static string GenerateMockJwt(InMemoryUser user)
        {
            var header = JwtSigningConfig.Base64UrlEncode(Encoding.UTF8.GetBytes("{\"alg\":\"HS256\",\"typ\":\"JWT\"}"));
            var payload = JwtSigningConfig.Base64UrlEncode(Encoding.UTF8.GetBytes(
                $"{{\"sub\":\"{user.Id}\",\"email\":\"{user.Email}\",\"name\":\"{user.Username}\"," +
                $"\"role\":\"{user.Role}\"," +
                $"\"level\":{user.CurrentLevel},\"exp\":{DateTimeOffset.UtcNow.Add(AccessTokenLifetime).ToUnixTimeSeconds()}," +
                $"\"jti\":\"{Guid.NewGuid()}\"}}"
            ));
            var signature = JwtSigningConfig.Base64UrlEncode(
                HMACSHA256.HashData(JwtSigningConfig.Key, Encoding.UTF8.GetBytes($"{header}.{payload}"))
            );
            return $"{header}.{payload}.{signature}";
        }

        private static void CheckLevelUp(InMemoryUser user)
        {
            var levelThresholds = new[] { 0, 100, 300, 600, 1000, 1500, 2200, 3000 };
            var newLevel = 1;
            for (var i = levelThresholds.Length - 1; i >= 0; i--)
            {
                if (user.TotalXP >= levelThresholds[i]) { newLevel = i + 1; break; }
            }
            if (newLevel > user.CurrentLevel) user.CurrentLevel = newLevel;
        }

        private static string HashPassword(string password)
        {
            // BCrypt — KHÔNG dùng SHA256 (salt tĩnh, yếu) để DB đồng bộ với AuthService chuẩn,
            // tránh tài khoản đăng ký/đổi mật khẩu qua stateless không login được qua hệ chuẩn.
            return BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
        }

        private static bool VerifyPassword(string password, string hash)
            => VerifyPasswordDelegate(password, hash);

        public void EnsureUserInMemory(
            string id,
            string email,
            string username,
            string passwordHash,
            bool isPremium,
            string role,
            int totalXP,
            int currentLevel,
            int streakDays)
        {
            if (!_usersById.ContainsKey(id))
            {
                var user = new InMemoryUser
                {
                    Id = id,
                    Email = email,
                    Username = username,
                    PasswordHash = passwordHash,
                    TotalXP = totalXP,
                    CurrentLevel = currentLevel,
                    StreakDays = streakDays,
                    IsPremium = isPremium,
                    Role = role,
                    CreatedAt = DateTime.UtcNow,
                    LastLoginAt = DateTime.UtcNow,
                    Badges = new List<InMemoryBadge>()
                };
                _usersByEmail[email] = user;
                _usersById[id] = user;
            }
        }

        public void ForceAddRefreshToken(string token, string userId)
        {
            _refreshTokens[token] = userId;
        }

        /// <summary>Đổi id của user trong bộ nhớ (Register: id tạm → id DB) — giữ đúng sub cho token.</summary>
        public bool ChangeUserId(string oldId, string newId)
        {
            if (!_usersById.TryRemove(oldId, out var user)) return false;
            user.Id = newId;
            _usersById[newId] = user;
            _usersByEmail[user.Email] = user;
            return true;
        }

        public void AddUser(string id, string email, string username, string passwordHash, string role, bool isPremium)
        {
            var user = new InMemoryUser
            {
                Id = id,
                Email = email,
                Username = username,
                PasswordHash = passwordHash,
                Role = role,
                IsPremium = isPremium,
                CreatedAt = DateTime.UtcNow,
                LastLoginAt = DateTime.UtcNow,
                Badges = new List<InMemoryBadge>()
            };
            _usersById[id] = user;
            _usersByEmail[email] = user;
        }

        public void RemoveUser(string id)
        {
            if (_usersById.TryRemove(id, out var user))
            {
                _usersByEmail.TryRemove(user.Email, out _);
            }
        }

        public void SetUserPremium(string userId, bool isPremium)
        {
            if (_usersById.TryGetValue(userId, out var user))
            {
                user.IsPremium = isPremium;
            }
        }

        public void UpdateUserRole(string userId, string newRole)
        {
            if (_usersById.TryGetValue(userId, out var user))
            {
                user.Role = newRole;
            }
        }

        public void UpdateUserPassword(string userId, string newPasswordHash)
        {
            if (_usersById.TryGetValue(userId, out var user))
            {
                user.PasswordHash = newPasswordHash;
            }
        }

        private static StatelessUserDto MapToUserDto(InMemoryUser user) => new()
        {
            Id = user.Id,
            Email = user.Email,
            Username = user.Username,
            TotalXP = user.TotalXP,
            CurrentLevel = user.CurrentLevel,
            StreakDays = user.StreakDays,
            CreatedAt = user.CreatedAt,
            Badges = user.Badges.Select(MapToBadgeDto).ToList(),
            IsPremium = user.IsPremium,
            Role = user.Role,
            Nickname = user.Nickname,
            Bio = user.Bio,
            University = user.University
        };

        private static StatelessBadgeInfoDto MapToBadgeDto(InMemoryBadge b) => new()
        {
            Id = b.Id, Name = b.Name, Description = b.Description,
            Icon = b.Icon, Color = b.Color, EarnedAt = b.EarnedAt
        };

        

        private class InMemoryUser
        {
            public string Id { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Username { get; set; } = string.Empty;
            public string PasswordHash { get; set; } = string.Empty;
            public int TotalXP { get; set; }
            public int CurrentLevel { get; set; }
            public int StreakDays { get; set; }
            public bool IsPremium { get; set; }
            public string Role { get; set; } = "Student";
            public DateTime CreatedAt { get; set; }
            public DateTime? LastLoginAt { get; set; }
            public List<InMemoryBadge> Badges { get; set; } = new();
            public List<string> CompletedModules { get; set; } = new();
            public string? Nickname { get; set; }
            public string? Bio { get; set; }
            public string? University { get; set; }
        }

        private class InMemoryBadge
        {
            public string Id { get; set; } = string.Empty;
            public string Name { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
            public string Icon { get; set; } = string.Empty;
            public string Color { get; set; } = string.Empty;
            public DateTime EarnedAt { get; set; }
        }
    }
}
