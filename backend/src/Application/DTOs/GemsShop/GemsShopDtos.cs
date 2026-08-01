using System;

namespace VisualizationDSA.Application.DTOs.GemsShop
{
    public class ShopItemDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public int Price { get; set; }
        public string Type { get; set; } = string.Empty;
        public int MaxStack { get; set; }
        public string Notes { get; set; } = string.Empty;
    }

    public class PurchaseResult
    {
        public bool Success { get; set; }
        public string ErrorCode { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;

        public static PurchaseResult Fail(string errorCode, string message)
        {
            return new PurchaseResult { Success = false, ErrorCode = errorCode, Message = message };
        }

        public static PurchaseResult Ok()
        {
            return new PurchaseResult { Success = true };
        }
    }

    public class InventoryItemDto
    {
        public string ItemId { get; set; } = string.Empty;
        public string ItemType { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class EquipAvatarFrameRequest
    {
        public string? FrameType { get; set; } // e.g. Neon, Gold, Diamond, or null to unequip
    }

    public class ConsumeHintTokenRequest
    {
        public string SessionId { get; set; } = string.Empty;
        public string NodeId { get; set; } = string.Empty;
        public string Step { get; set; } = string.Empty;
    }

    public class ConsumeHintTokenResponse
    {
        public string Hint { get; set; } = string.Empty;
        public int TokensRemaining { get; set; }
    }
}
