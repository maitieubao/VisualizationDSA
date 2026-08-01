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

        // Static catalog based on spec
        private static readonly List<ShopItemDto> Catalog = new()
        {
            new ShopItemDto { Id = "ai_hint_token", Name = "💡 AI Hint Token", Price = 30, Type = "Consumable", MaxStack = 10, Notes = "Dùng 1 token = thêm 1 hint trong bài" },
            new ShopItemDto { Id = "streak_freeze", Name = "🧊 Streak Freeze", Price = 100, Type = "Consumable", MaxStack = 2, Notes = "Tự động dùng khi streak sắp mất" },
            new ShopItemDto { Id = "frame_neon", Name = "👑 Khung Neon", Price = 300, Type = "Permanent", MaxStack = 1, Notes = "Equip 1 tại 1 thời điểm" },
            new ShopItemDto { Id = "frame_gold", Name = "👑 Khung Vàng", Price = 500, Type = "Permanent", MaxStack = 1, Notes = "" },
            new ShopItemDto { Id = "frame_diamond", Name = "👑 Khung Kim Cương", Price = 1000, Type = "Permanent", MaxStack = 1, Notes = "" },
            new ShopItemDto { Id = "theme_dark", Name = "🎨 Theme Dark", Price = 150, Type = "Permanent", MaxStack = 1, Notes = "" },
            new ShopItemDto { Id = "theme_dracula", Name = "🎨 Theme Dracula", Price = 150, Type = "Permanent", MaxStack = 1, Notes = "" },
            new ShopItemDto { Id = "xp_boost_2x", Name = "⚡ XP Boost 2x", Price = 300, Type = "XPBoost", MaxStack = 9999, Notes = "Mua thêm = cộng dồn giờ (24h/lần)" }
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
