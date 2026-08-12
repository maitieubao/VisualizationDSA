using System;
using VisualizationDSA.Domain.Enums;

namespace VisualizationDSA.Domain.Entities
{
    public class Order
    {
        // PM-003: vòng đời hết hạn của order — QR chuyển tiền chỉ hợp lệ trong 15 phút (khớp
        // timer frontend). Webhook sẽ từ chối order đã quá hạn để QR cũ không kích hoạt premium.
        public static readonly TimeSpan OrderLifetime = TimeSpan.FromMinutes(15);

        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }
        public string PaymentCode { get; private set; } = string.Empty;
        public string? TransactionReference { get; private set; }
        public decimal Amount { get; private set; }
        // PM-009: dùng enum OrderStatus thay magic string (lưu DB dưới dạng chuỗi để giữ nguyên schema).
        public string Status { get; private set; } = OrderStatus.Pending.ToString();
        public DateTime CreatedAt { get; private set; }
        // PM-003: thời điểm order hết hạn (CreatedAt + OrderLifetime).
        public DateTime ExpiresAt { get; private set; }
        public DateTime? CompletedAt { get; private set; }

        // Navigation property phục vụ EF Core mapping (không public setter).
        public virtual User User { get; private set; } = null!;

        private Order() { } // Bắt buộc cho EF Core khi materialize entity.

        public Order(Guid userId, string paymentCode, decimal amount)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            PaymentCode = paymentCode;
            Amount = amount;
            Status = OrderStatus.Pending.ToString();
            CreatedAt = DateTime.UtcNow;
            ExpiresAt = CreatedAt.Add(OrderLifetime);
        }

        /// <summary>Order đang Pending nhưng đã quá hạn — webhook phải từ chối (PM-003).</summary>
        public bool IsExpired()
        {
            return Status == OrderStatus.Pending.ToString() && DateTime.UtcNow >= ExpiresAt;
        }

        public void MarkAsCompleted()
        {
            if (Status == OrderStatus.Pending.ToString())
            {
                Status = OrderStatus.Completed.ToString();
                CompletedAt = DateTime.UtcNow;
            }
        }

        /// <summary>PM-003/PM-009: chuyển order Pending quá hạn sang trạng thái Expired.</summary>
        public void MarkAsExpired()
        {
            if (Status == OrderStatus.Pending.ToString())
            {
                Status = OrderStatus.Expired.ToString();
            }
        }

        public void Cancel()
        {
            if (Status == OrderStatus.Pending.ToString())
            {
                Status = OrderStatus.Cancelled.ToString();
            }
        }

        public void SetTransactionReference(string reference)
        {
            if (string.IsNullOrWhiteSpace(reference))
                throw new ArgumentException("Mã tham chiếu giao dịch không được để trống.", nameof(reference));
            
            TransactionReference = reference;
        }
    }
}
