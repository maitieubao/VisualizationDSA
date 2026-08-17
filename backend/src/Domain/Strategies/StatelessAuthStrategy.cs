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
        // AD-043: refresh token mang thêm marker IsImpersonated/OriginalAdminId — khi xoay qua
        // /refresh, GenerateAuthResponse giữ nguyên marker (không biến thành token thật).
        private readonly ConcurrentDictionary<string, (string UserId, DateTime ExpiresAt, bool IsImpersonated, string? OriginalAdminId)> _refreshTokens = new(); 
        private static readonly TimeSpan AccessTokenLifetime = TimeSpan.FromMinutes(15);
        private static readonly TimeSpan RefreshTokenLifetime = TimeSpan.FromDays(30);

        // AU-016: TTL eviction — user không hoạt động quá UserIdleLifetime sẽ bị xóa khỏi bộ nhớ
        // (chống memory leak khi Singleton tích lũy user xóa khỏi DB). Cho phép chỉnh trong test.
        public static TimeSpan UserIdleLifetime { get; set; } = TimeSpan.FromDays(30);

        // AU-014: dummy hash dùng để cân bằng thời gian verify khi email không tồn tại
        // (chống timing side-channel).
        private static readonly string DummyPasswordHash = HashPassword("dummy-timing-password");

        /// <summary>Hook cho phép thay đổi thuật toán verify (test/legacy) — mặc định dùng helper chung.</summary>
        public static Func<string, string, bool> VerifyPasswordDelegate { get; set; } = VerifyPasswordCore;

        /// <summary>
        /// AU-033: helper verify hash dùng CHUNG cho cả hệ (AuthService, StatelessAuthStrategy,
        /// StatelessAuthController): BCrypt trước, fallback SHA256 cho dữ liệu legacy.
        /// </summary>
        public static bool VerifyPassword(string password, string hash)
            => VerifyPasswordDelegate(password, hash);

        private static bool VerifyPasswordCore(string password, string hash)
        {
            if (hash.StartsWith("$2a$") || hash.StartsWith("$2b$") || hash.StartsWith("$2y$"))
            {
                try { return BCrypt.Net.BCrypt.Verify(password, hash); }
                catch { return false; }
            }
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password + "visualizationdsa-salt"));
            return Convert.ToHexString(bytes).ToLowerInvariant() == hash;
        }

        /// <summary>AU-037: chuẩn hóa email (Trim + ToLowerInvariant) trước mọi check/insert.</summary>
        private static string NormalizeEmail(string email)
            => (email ?? string.Empty).Trim().ToLowerInvariant();

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

            // AU-037: normalize email trước mọi check/insert — "User@x.com" ≡ "user@x.com".
            var email = NormalizeEmail(request.Email);

            EvictIdleUsers();

            if (_usersByEmail.ContainsKey(email))
                throw new ArgumentException("Email này đã được sử dụng bởi tài khoản khác.");

            if (_usersByEmail.Values.Any(u => u.Username == request.Username))
                throw new ArgumentException("Username này đã được sử dụng bởi tài khoản khác.");

            var user = new InMemoryUser
            {
                Id = dbUserId ?? $"user-{Guid.NewGuid():N}",
                Email = email,
                Username = request.Username,
                PasswordHash = HashPassword(request.Password),
                TotalXP = 0,
                CurrentLevel = 1,
                StreakDays = 0,
                IsPremium = false,
                // F3 (FR-1.8): đăng ký giảng viên → chờ duyệt; mặc định Student.
                Role = request.IsTeacher ? "PendingTeacher" : "Student",
                CreatedAt = DateTime.UtcNow,
                LastLoginAt = DateTime.UtcNow,
                LastAccessAt = DateTime.UtcNow,
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

            // AU-037: normalize email trước khi tra cứu.
            var email = NormalizeEmail(request.Email);

            EvictIdleUsers();

            if (!_usersByEmail.TryGetValue(email, out var user))
            {
                // AU-014: verify dummy hash (cùng cost factor) để thời gian phản hồi tương đương
                // user tồn tại — chống timing side-channel phân biệt email.
                VerifyPassword(request.Password, DummyPasswordHash);
                throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");
            }

            if (!VerifyPassword(request.Password, user.PasswordHash))
                throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");

            // Chặn tài khoản bị ban trong memory (AdminController.BanUser đồng bộ qua SetUserActive).
            if (!user.IsActive)
                throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");

            user.LastLoginAt = DateTime.UtcNow;
            user.LastAccessAt = DateTime.UtcNow;
            return GenerateAuthResponse(user);
        }

        /// <summary>Lấy owner của refresh token KHÔNG rotation (dùng check ban trước khi xoay token).</summary>
        public string? GetRefreshTokenOwner(string refreshTokenValue)
        {
            return _refreshTokens.TryGetValue(refreshTokenValue, out var entry) ? entry.UserId : null;
        }

        public StatelessUserDto GetProfile(string userId)
        {
            EvictIdleUsers();
            if (!_usersById.TryGetValue(userId, out var user))
                throw new KeyNotFoundException("Người dùng không tồn tại.");
            user.LastAccessAt = DateTime.UtcNow;
            return MapToUserDto(user);
        }

        public StatelessAuthResponse RefreshToken(string refreshTokenValue)
        {
            // AU-004 (stateless): pattern remove-if-match — CHỈ request nào TryRemove thành công
            // mới được rotation; 2 refresh song song cùng 1 token chỉ 1 request thắng.
            if (!_refreshTokens.TryGetValue(refreshTokenValue, out var entry))
                throw new UnauthorizedAccessException("Refresh token không hợp lệ hoặc đã hết hạn.");

            // Hết hạn → từ chối + xóa token (trước đây token sống vô hạn).
            if (entry.ExpiresAt < DateTime.UtcNow)
            {
                _refreshTokens.TryRemove(refreshTokenValue, out _);
                throw new UnauthorizedAccessException("Refresh token không hợp lệ hoặc đã hết hạn.");
            }

            if (!_usersById.TryGetValue(entry.UserId, out var user))
            {
                // AU-030: user đã bị xóa → 401 (không lộ thông tin qua 404).
                _refreshTokens.TryRemove(refreshTokenValue, out _);
                throw new UnauthorizedAccessException("Phiên đăng nhập không còn hiệu lực.");
            }

            // AU-004: remove-if-match — thất bại nghĩa là request khác đã rotation xong.
            if (!_refreshTokens.TryRemove(refreshTokenValue, out entry))
                throw new UnauthorizedAccessException("Refresh token không hợp lệ hoặc đã hết hạn.");

            EvictIdleUsers();
            user.LastAccessAt = DateTime.UtcNow;

            // Giữ TTL CÒN LẠI của token gốc khi rotation — impersonation (15 phút) không được
            // "refresh thành 30 ngày" qua vòng xoay (trước đây phiên impersonate kéo dài 30 ngày).
            // AU-017: clamp TTL vào [1s, RefreshTokenLifetime] — token còn < 1s KHÔNG được
            // gia hạn full 30 ngày (ternary cũ sai vì token < 1s rơi nhánh full lifetime).
            var remaining = entry.ExpiresAt - DateTime.UtcNow;
            var newTtl = remaining < TimeSpan.FromSeconds(1)
                ? TimeSpan.FromSeconds(1)
                : (remaining > RefreshTokenLifetime ? RefreshTokenLifetime : remaining);
            // AD-043: giữ marker isImpersonated khi rotation — access token mới vẫn là token đóng vai.
            return GenerateAuthResponse(user, newTtl, entry.IsImpersonated, entry.OriginalAdminId);
        }

        /// <summary>Lấy thời điểm hết hạn của refresh token (hỗ trợ test/giám sát).</summary>
        public DateTime? GetRefreshTokenExpiry(string refreshTokenValue)
        {
            return _refreshTokens.TryGetValue(refreshTokenValue, out var entry) ? entry.ExpiresAt : null;
        }

        public void Logout(string refreshTokenValue)
        {
            _refreshTokens.TryRemove(refreshTokenValue, out _);
        }

        /// <summary>
        /// Thu hẹn toàn bộ refresh tokens của một user — dùng khi Admin ban tài khoản.
        /// Trước đây chỉ revoke 1 token, các thiết bị khác vẫn dùng refresh token cũ truy cập được.
        /// </summary>
        public void RevokeAllRefreshTokens(string userId)
        {
            var tokensToRemove = _refreshTokens
                .Where(kvp => kvp.Value.UserId == userId)
                .Select(kvp => kvp.Key)
                .ToList();

            foreach (var token in tokensToRemove)
            {
                _refreshTokens.TryRemove(token, out _);
            }
        }

        // PR-015: giới hạn username KHỚP DB (HasMaxLength(100)) + RegisterRequest (Min 3) —
        // trước đây không validate độ dài, chuỗi 500 ký tự vẫn được chấp nhận rồi fail DB.
        private const int UsernameMinLength = 3;
        private const int UsernameMaxLength = 100;

        public StatelessUserDto UpdateProfile(string userId, string? newUsername, string? newNickname = null, string? newBio = null, string? newUniversity = null, string? newAvatarUrl = null)
        {
            EvictIdleUsers();
            if (!_usersById.TryGetValue(userId, out var user))
                throw new KeyNotFoundException("Người dùng không tồn tại.");

            // PR-015: client gửi username rỗng/whitespace (≠ null) → 400 rõ ràng, không lặng lẽ bỏ qua.
            if (newUsername != null && string.IsNullOrWhiteSpace(newUsername))
                throw new ArgumentException("Username không được để trống.");

            if (!string.IsNullOrWhiteSpace(newUsername))
            {
                var trimmed = newUsername.Trim();
                if (trimmed.Length < UsernameMinLength || trimmed.Length > UsernameMaxLength)
                    throw new ArgumentException($"Username phải có từ {UsernameMinLength} đến {UsernameMaxLength} ký tự.");
                if (_usersByEmail.Values.Any(u => u.Username == trimmed && u.Id != userId))
                    throw new ArgumentException("Username này đã được sử dụng.");
                user.Username = trimmed;
            }

            user.Nickname = newNickname;
            user.Bio = newBio;
            user.University = newUniversity;
            user.AvatarUrl = newAvatarUrl;
            user.LastAccessAt = DateTime.UtcNow;

            return MapToUserDto(user);
        }

        public StatelessUserProgressDto GetUserProgress(string userId)
        {
            EvictIdleUsers();
            if (!_usersById.TryGetValue(userId, out var user))
                throw new KeyNotFoundException("Người dùng không tồn tại.");
            user.LastAccessAt = DateTime.UtcNow;

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
            EvictIdleUsers();
            if (!_usersById.TryGetValue(userId, out var user))
                throw new KeyNotFoundException("Người dùng không tồn tại.");

            if (amount <= 0)
                throw new ArgumentException("Số XP phải lớn hơn 0.");

            user.TotalXP += amount;
            user.LastAccessAt = DateTime.UtcNow;
            CheckLevelUp(user);

            return MapToUserDto(user);
        }

        public List<StatelessUserDto> GetAllUsers()
        {
            EvictIdleUsers();
            return _usersById.Values.Select(MapToUserDto).ToList();
        }

        /// <summary>
        /// AU-016: evict user không hoạt động quá UserIdleLifetime — Singleton ConcurrentDictionary
        /// không được tích lũy vô hạn (chống memory leak sau khi user bị xóa khỏi DB).
        /// </summary>
        private void EvictIdleUsers()
        {
            var cutoff = DateTime.UtcNow - UserIdleLifetime;
            foreach (var (id, user) in _usersById.ToArray())
            {
                if (user.LastAccessAt < cutoff)
                {
                    _usersById.TryRemove(id, out _);
                    _usersByEmail.TryRemove(user.Email, out _);
                    RevokeAllRefreshTokens(id);
                }
            }
        }

        private StatelessAuthResponse GenerateAuthResponse(InMemoryUser user, TimeSpan? refreshTtl = null, bool isImpersonated = false, string? originalAdminId = null)
        {
            var accessToken = GenerateMockJwt(user, isImpersonated, originalAdminId);
            var refreshToken = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
            _refreshTokens[refreshToken] = (user.Id, DateTime.UtcNow.Add(refreshTtl ?? RefreshTokenLifetime), isImpersonated, originalAdminId);
            user.LastAccessAt = DateTime.UtcNow;

            return new StatelessAuthResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresIn = (int)AccessTokenLifetime.TotalSeconds,
                User = MapToUserDto(user)
            };
        }

        private static string GenerateMockJwt(InMemoryUser user, bool isImpersonated = false, string? originalAdminId = null)
        {
            var header = JwtSigningConfig.Base64UrlEncode(Encoding.UTF8.GetBytes("{\"alg\":\"HS256\",\"typ\":\"JWT\"}"));
            // JsonSerializer — username/email chứa `"`/`\` không làm vỡ payload (trước đây
            // interpolate raw → token hỏng JSON → self-DoS).
            // AU-035: claim iss/aud từ config — khớp chuẩn JwtBearer (JwtHelper validate 2 claim này).
            // AD-043: token đóng vai giữ claim isImpersonated/originalAdminId qua mọi vòng refresh.
            var payloadJson = System.Text.Json.JsonSerializer.Serialize(new
            {
                sub = user.Id,
                email = user.Email,
                name = user.Username,
                role = user.Role,
                level = user.CurrentLevel,
                iss = JwtSigningConfig.Issuer ?? "VisualizationDSA",
                aud = JwtSigningConfig.Audience ?? "VisualizationDSA-Client",
                exp = DateTimeOffset.UtcNow.Add(AccessTokenLifetime).ToUnixTimeSeconds(),
                jti = Guid.NewGuid(),
                isImpersonated = isImpersonated ? true : (bool?)null,
                originalAdminId = originalAdminId
            });
            var payload = JwtSigningConfig.Base64UrlEncode(Encoding.UTF8.GetBytes(payloadJson));
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
            EvictIdleUsers();

            // AU-037: email luôn lưu theo key đã normalize.
            var normalizedEmail = NormalizeEmail(email);

            if (_usersById.TryGetValue(id, out var existing))
            {
                // AU-016: user ĐÃ tồn tại → CẬP NHẬT dữ liệu mới nhất (XP/level/premium/role đổi
                // qua flow DB phải phản ánh vào memory) — không insert-then-return-cũ.
                if (existing.Email != normalizedEmail)
                {
                    _usersByEmail.TryRemove(existing.Email, out _);
                    _usersByEmail[normalizedEmail] = existing;
                }
                existing.Email = normalizedEmail;
                existing.Username = username;
                existing.PasswordHash = passwordHash;
                existing.IsPremium = isPremium;
                existing.Role = role;
                existing.TotalXP = totalXP;
                existing.CurrentLevel = currentLevel;
                existing.StreakDays = streakDays;
                existing.LastAccessAt = DateTime.UtcNow;
                return;
            }

            var user = new InMemoryUser
            {
                Id = id,
                Email = normalizedEmail,
                Username = username,
                PasswordHash = passwordHash,
                TotalXP = totalXP,
                CurrentLevel = currentLevel,
                StreakDays = streakDays,
                IsPremium = isPremium,
                Role = role,
                CreatedAt = DateTime.UtcNow,
                LastLoginAt = DateTime.UtcNow,
                LastAccessAt = DateTime.UtcNow,
                Badges = new List<InMemoryBadge>()
            };
            _usersByEmail[normalizedEmail] = user;
            _usersById[id] = user;
        }

        public void ForceAddRefreshToken(string token, string userId, TimeSpan? lifetime = null, string? impersonatedBy = null)
        {
            // Impersonation: mặc định 15 phút — token refresh vĩnh viễn bị lộ = chiếm tài khoản vô hạn.
            // AD-043: impersonatedBy != null → marker isImpersonated được giữ suốt vòng đời token.
            var ttl = lifetime ?? TimeSpan.FromMinutes(15);
            _refreshTokens[token] = (userId, DateTime.UtcNow.Add(ttl), impersonatedBy != null, impersonatedBy);
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
                LastAccessAt = DateTime.UtcNow,
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
                // Dọn luôn refresh token của user đã xóa — tránh mồ côi trong dictionary.
                RevokeAllRefreshTokens(id);
            }
        }

        public void SetUserActive(string userId, bool isActive)
        {
            if (_usersById.TryGetValue(userId, out var user))
            {
                user.IsActive = isActive;
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

        /// <summary>Lấy hash mật khẩu hiện tại để verify (không lộ qua DTO response).</summary>
        public string? GetUserPasswordHash(string userId)
        {
            return _usersById.TryGetValue(userId, out var user) ? user.PasswordHash : null;
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
            University = user.University,
            AvatarUrl = user.AvatarUrl
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
            public bool IsActive { get; set; } = true;
            public string Role { get; set; } = "Student";
            public DateTime CreatedAt { get; set; }
            public DateTime? LastLoginAt { get; set; }
            // AU-016: mốc hoạt động cuối để evict user idle (TTL).
            public DateTime LastAccessAt { get; set; } = DateTime.UtcNow;
            public List<InMemoryBadge> Badges { get; set; } = new();
            public List<string> CompletedModules { get; set; } = new();
            public string? Nickname { get; set; }
            public string? Bio { get; set; }
            public string? University { get; set; }
            public string? AvatarUrl { get; set; }
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
