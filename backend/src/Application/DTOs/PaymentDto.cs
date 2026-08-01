using System;
using System.Text.Json.Serialization;

namespace VisualizationDSA.Application.DTOs
{
    public class CreateOrderRequest
    {
        
    }

    public class OrderDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
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

    public class SePayWebhookPayload
    {
        [JsonPropertyName("id")]
        public long Id { get; set; }

        [JsonPropertyName("gateway")]
        public string Gateway { get; set; } = string.Empty;

        [JsonPropertyName("transactionDate")]
        public string TransactionDate { get; set; } = string.Empty;

        [JsonPropertyName("accountNumber")]
        public string AccountNumber { get; set; } = string.Empty;

        [JsonPropertyName("subAccount")]
        public string? SubAccount { get; set; }

        [JsonPropertyName("code")]
        public string? Code { get; set; } 

        [JsonPropertyName("content")]
        public string Content { get; set; } = string.Empty; 

        [JsonPropertyName("transferType")]
        public string TransferType { get; set; } = "in"; 

        [JsonPropertyName("transferAmount")]
        public decimal TransferAmount { get; set; }

        [JsonPropertyName("accumulated")]
        public decimal Accumulated { get; set; }

        [JsonPropertyName("referenceCode")]
        public string ReferenceCode { get; set; } = string.Empty; 
        
        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;
    }
}
