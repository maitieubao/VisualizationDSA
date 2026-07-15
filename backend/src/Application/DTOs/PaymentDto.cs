using System;
using System.Text.Json.Serialization;

namespace VisualizationDSA.Application.DTOs
{
    public class CreateOrderRequest
    {
        // Yêu cầu đơn giản, Backend sẽ tự lấy Price từ cấu hình
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

        // Thông tin chuyển khoản để hiển thị trên client
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
        public string? Code { get; set; } // Mã thanh toán SePay tự khớp

        [JsonPropertyName("content")]
        public string Content { get; set; } = string.Empty; // Nội dung chuyển khoản thô

        [JsonPropertyName("transferType")]
        public string TransferType { get; set; } = "in"; // in (tiền vào), out (tiền ra)

        [JsonPropertyName("transferAmount")]
        public decimal TransferAmount { get; set; }

        [JsonPropertyName("accumulated")]
        public decimal Accumulated { get; set; }

        [JsonPropertyName("referenceCode")]
        public string ReferenceCode { get; set; } = string.Empty; // Mã giao dịch của Ngân hàng
        
        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;
    }
}
