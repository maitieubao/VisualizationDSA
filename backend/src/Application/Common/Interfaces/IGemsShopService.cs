using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs.GemsShop;

namespace VisualizationDSA.Application.Common.Interfaces
{
    public interface IGemsShopService
    {
        IEnumerable<ShopItemDto> GetCatalog();
        Task<IEnumerable<InventoryItemDto>> GetMyInventoryAsync(Guid userId);
        Task<PurchaseResult> PurchaseItemAsync(Guid userId, string itemId);
        Task<bool> EquipAvatarFrameAsync(Guid userId, string? frameType);
        Task<bool> EquipAvatarAsync(Guid userId, string? avatarId);
        Task<ConsumeHintTokenResponse?> ConsumeHintTokenAsync(Guid userId, ConsumeHintTokenRequest request);
    }
}
