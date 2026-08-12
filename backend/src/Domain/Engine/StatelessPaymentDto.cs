using System;
using System.Collections.Generic;

namespace VisualizationDSA.Domain.Engine
{
    
    
    

    public class StatelessOrderDto
    {
        public string Id { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string PaymentCode { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Status { get; set; } = "Pending";
        public DateTime CreatedAt { get; set; }
        // PM-003: thời điểm order hết hạn (CreatedAt + 15 phút) — frontend đồng bộ timer QR.
        public DateTime ExpiresAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string BankId { get; set; } = string.Empty;
        public string BankAccount { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public string QrUrl { get; set; } = string.Empty;
    }

    public class StatelessCheckoutRequest
    {
        // PM-014: userId không nhận từ client — backend lấy từ token (chống IDOR).
        public string PaymentMethod { get; set; } = "vietqr";
    }

    public class StatelessVerifyRequest
    {
        public string OrderId { get; set; } = string.Empty;
        // PM-014: userId bị xóa — "intentionally ignored, lấy từ token" (JwtHelper.ExtractSubFromToken).
    }

    public class StatelessPaymentConfigDto
    {
        public decimal PremiumPrice { get; set; }
        public string Currency { get; set; } = "VND";
        public string BankId { get; set; } = string.Empty;
        public string BankAccount { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public List<string> SupportedMethods { get; set; } = new();
        public List<StatelessPremiumFeature> PremiumFeatures { get; set; } = new();
    }

    public class StatelessPremiumFeature
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public bool RequiresPremium { get; set; }
    }

    public class StatelessTransactionLogEntry
    {
        public string Id { get; set; } = string.Empty;
        public string OrderId { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime Timestamp { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class StatelessPremiumStatusDto
    {
        public bool IsPremium { get; set; }
        public DateTime? UpgradedAt { get; set; }
        public string Plan { get; set; } = "free";
        public List<string> UnlockedFeatures { get; set; } = new();
    }
}
