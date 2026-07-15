using System;

namespace VisualizationDSA.Domain.Entities
{
    public class Order
    {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }
        public string PaymentCode { get; private set; } = string.Empty;
        public string? TransactionReference { get; private set; }
        public decimal Amount { get; private set; }
        public string Status { get; private set; } = "Pending"; // Pending, Completed, Cancelled
        public DateTime CreatedAt { get; private set; }
        public DateTime? CompletedAt { get; private set; }

        // Navigation property
        public virtual User User { get; private set; } = null!;

        private Order() { } // EF Core constructor

        public Order(Guid userId, string paymentCode, decimal amount)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            PaymentCode = paymentCode;
            Amount = amount;
            Status = "Pending";
            CreatedAt = DateTime.UtcNow;
        }

        public void MarkAsCompleted()
        {
            if (Status == "Pending")
            {
                Status = "Completed";
                CompletedAt = DateTime.UtcNow;
            }
        }

        public void Cancel()
        {
            if (Status == "Pending")
            {
                Status = "Cancelled";
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
