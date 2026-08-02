using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Common.Interfaces;
using VisualizationDSA.Application.DTOs.GemsShop;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.Infrastructure.Services
{
    public class GemsShopService : IGemsShopService
    {
        private readonly ApplicationDbContext _db;

        private static readonly List<ShopItemDto> Catalog = new()
        {
            new ShopItemDto { Id = "ai_hint_token", Name = "💡 AI Hint Token", Price = 30, Type = "Consumable", MaxStack = 10, Notes = "Dùng 1 token = thêm 1 hint trong bài" },
            new ShopItemDto { Id = "streak_freeze", Name = "🧊 Streak Freeze", Price = 100, Type = "Consumable", MaxStack = 2, Notes = "Tự động dùng khi streak sắp mất" },
            new ShopItemDto { Id = "xp_boost_2x", Name = "⚡ XP Boost 2x", Price = 300, Type = "XPBoost", MaxStack = 9999, Notes = "Mua thêm = cộng dồn giờ (24h/lần)" },
            new ShopItemDto { Id = "theme_dark", Name = "🎨 Theme Dark", Price = 150, Type = "Permanent", MaxStack = 1, Notes = "" },
            new ShopItemDto { Id = "theme_dracula", Name = "🎨 Theme Dracula", Price = 150, Type = "Permanent", MaxStack = 1, Notes = "" },
            // Khung Avatar
            new ShopItemDto { Id = "frame_neon", Name = "Khung Neon", Price = 300, Type = "Permanent", MaxStack = 1, Notes = "Khung viền Neon tỏa sáng trong bóng tối." },
            new ShopItemDto { Id = "frame_gold", Name = "Khung Vàng Hoàng Gia", Price = 500, Type = "Permanent", MaxStack = 1, Notes = "Khung hoàng gia mạ vàng quyền lực." },
            new ShopItemDto { Id = "frame_cyber", Name = "Khung Cyberpunk", Price = 400, Type = "Permanent", MaxStack = 1, Notes = "Khung viền công nghệ tương lai." },
            new ShopItemDto { Id = "frame_fire", Name = "Khung Hellfire", Price = 600, Type = "Permanent", MaxStack = 1, Notes = "Khung viền bốc lửa rực cháy." },
            new ShopItemDto { Id = "frame_ice", Name = "Khung Frostbite", Price = 350, Type = "Permanent", MaxStack = 1, Notes = "Khung băng giá buốt lạnh." },
            // Avatars
            new ShopItemDto { Id = "avatar_cyber_hacker", Name = "Avatar Cyber Hacker", Price = 100, Type = "Permanent", MaxStack = 1, Notes = "Avatar phong cách Cyberpunk, bóng mờ xanh neon." },
            new ShopItemDto { Id = "avatar_gold_knight", Name = "Avatar Golden Knight", Price = 200, Type = "Permanent", MaxStack = 1, Notes = "Hiệp sĩ hoàng kim sáng chói." },
            new ShopItemDto { Id = "avatar_neon_ninja", Name = "Avatar Neon Ninja", Price = 150, Type = "Permanent", MaxStack = 1, Notes = "Ninja ẩn mình trong bóng tối với viền neon hồng." },
            new ShopItemDto { Id = "avatar_wizard", Name = "Avatar Code Wizard", Price = 250, Type = "Permanent", MaxStack = 1, Notes = "Pháp sư code có khả năng debug thần sầu." },
            new ShopItemDto { Id = "avatar_ai_bot", Name = "Avatar AI Companion", Price = 50, Type = "Permanent", MaxStack = 1, Notes = "Trợ lý AI siêu cấp dễ thương." }
        };

        public GemsShopService(ApplicationDbContext db)
        {
            _db = db;
        }

        public IEnumerable<ShopItemDto> GetCatalog()
        {
            return Catalog;
        }

        public async Task<IEnumerable<InventoryItemDto>> GetMyInventoryAsync(Guid userId)
        {
            var inventory = await _db.UserInventory
                .Where(i => i.UserId == userId)
                .GroupBy(i => new { i.ItemId, i.ItemType })
                .Select(g => new InventoryItemDto
                {
                    ItemId = g.Key.ItemId,
                    ItemType = g.Key.ItemType,
                    Count = g.Count()
                })
                .ToListAsync();

            return inventory;
        }

        public async Task<PurchaseResult> PurchaseItemAsync(Guid userId, string itemId)
        {
            var item = Catalog.FirstOrDefault(c => c.Id == itemId);
            if (item == null)
            {
                return PurchaseResult.Fail("ITEM_NOT_FOUND", "Vật phẩm không tồn tại");
            }

            // 1. Check max stack
            var currentStack = await _db.UserInventory
                .CountAsync(i => i.UserId == userId && i.ItemId == itemId);
            
            if (currentStack >= item.MaxStack)
            {
                return PurchaseResult.Fail("MAX_STACK", $"Bạn đã có tối đa {item.MaxStack} {item.Name}");
            }

            // 2. Atomic deduct gems
            // Using raw SQL to avoid race conditions. 
            // Note: In SQLite (or general DBs), returning affected rows is reliable.
            var affected = await _db.Database.ExecuteSqlRawAsync(
                "UPDATE Users SET GemsCount = GemsCount - {0} WHERE Id = {1} AND GemsCount >= {0}",
                item.Price, userId);

            if (affected == 0)
            {
                return PurchaseResult.Fail("INSUFFICIENT_GEMS", "Không đủ Gems");
            }

            // 3. Add to inventory (if it's not a pure buff that doesn't need tracking, but we track all for history)
            // Wait, for XPBoost, do we add to inventory? The spec says "Add to inventory" and then "Handle special items"
            _db.UserInventory.Add(new UserInventory(userId, item.Id, item.Type));

            // 4. Handle special items
            if (item.Type == "XPBoost")
            {
                var user = await _db.Users.FindAsync(userId);
                if (user != null)
                {
                    var baseTime = user.XpBoostExpiresAt.HasValue && user.XpBoostExpiresAt.Value > DateTime.UtcNow 
                                    ? user.XpBoostExpiresAt.Value 
                                    : DateTime.UtcNow;
                    user.SetXpBoostExpiry(baseTime.AddHours(24));
                }
            }

            await _db.SaveChangesAsync();
            return PurchaseResult.Ok();
        }

        public async Task<bool> EquipAvatarFrameAsync(Guid userId, string? frameType)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return false;

            if (string.IsNullOrEmpty(frameType))
            {
                // Unequip
                user.SetAvatarFrameType(null);
                await _db.SaveChangesAsync();
                return true;
            }

            // Verify ownership
            // Frame items have ID like "frame_neon"
            var frameItemId = $"frame_{frameType.ToLower()}";
            var ownsFrame = await _db.UserInventory.AnyAsync(i => i.UserId == userId && i.ItemId == frameItemId);
            if (!ownsFrame)
            {
                return false;
            }

            user.SetAvatarFrameType(frameType);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> EquipAvatarAsync(Guid userId, string? avatarId)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return false;

            if (string.IsNullOrEmpty(avatarId))
            {
                // Unequip
                user.SetAvatarUrl(null);
                await _db.SaveChangesAsync();
                return true;
            }

            // Verify ownership
            var ownsAvatar = await _db.UserInventory.AnyAsync(i => i.UserId == userId && i.ItemId == avatarId);
            if (!ownsAvatar)
            {
                return false;
            }

            var avatarName = avatarId.Replace("avatar_", "").Replace("_", "-");
            user.SetAvatarUrl($"/assets/avatars/{avatarName}.png");
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<ConsumeHintTokenResponse?> ConsumeHintTokenAsync(Guid userId, ConsumeHintTokenRequest request)
        {
            var tokenItem = await _db.UserInventory.FirstOrDefaultAsync(i => i.UserId == userId && i.ItemId == "ai_hint_token");
            if (tokenItem == null)
            {
                return null; // Not enough tokens
            }

            // Deduct
            _db.UserInventory.Remove(tokenItem);
            await _db.SaveChangesAsync();

            // Mock AI Hint logic
            var hint = "Thử dùng thuật toán Two-Pointer hoặc kiểm tra kỹ điều kiện vòng lặp.";

            var tokensRemaining = await _db.UserInventory.CountAsync(i => i.UserId == userId && i.ItemId == "ai_hint_token");

            return new ConsumeHintTokenResponse
            {
                Hint = hint,
                TokensRemaining = tokensRemaining
            };
        }
    }
}
