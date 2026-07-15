using System;
using System.Collections.Generic;

namespace VisualizationDSA.Domain.Engine
{
    /// <summary>
    /// Stateless Payment DTOs — dùng cho StatelessPaymentStrategy (in-memory, không cần PostgreSQL).
    /// </summary>

    public class StatelessOrderDto
    {
        public string Id { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string PaymentCode { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Status { get; set; } = "Pending";
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string BankId { get; set; } = string.Empty;
        public string BankAccount { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public string QrUrl { get; set; } = string.Empty;
    }

    public class StatelessCheckoutRequest
    {
        public string? UserId { get; set; }
        public string PaymentMethod { get; set; } = "vietqr";
    }

    public class StatelessVerifyRequest
    {
        public string OrderId { get; set; } = string.Empty;
        public string? UserId { get; set; }
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
