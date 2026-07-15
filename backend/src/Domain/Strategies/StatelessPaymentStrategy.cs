using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies
{
    /// <summary>
    /// Stateless Payment Strategy — mô phỏng luồng thanh toán Premium mà KHÔNG cần PostgreSQL / SePay.
    /// In-memory: hóa đơn, giao dịch, trạng thái Premium đều lưu trong ConcurrentDictionary.
    /// </summary>
    public class StatelessPaymentStrategy
    {
        private readonly ConcurrentDictionary<string, InMemoryOrder> _orders = new();
        private readonly ConcurrentDictionary<string, bool> _premiumUsers = new();
        private readonly List<InMemoryTransactionLog> _transactionLog = new();
        private readonly object _logLock = new();
        private readonly StatelessAuthStrategy _authStrategy;

        private const decimal PremiumPrice = 199_000m;
        private const string BankId = "MBBank";
        private const string BankAccount = "99999999999";
        private const string AccountName = "DSA VISUALIZER ACADEMY";

        private static readonly List<StatelessPremiumFeature> PremiumFeatures = new()
        {
            new() { Id = "unlimited-runs",    Name = "Biên dịch không giới hạn", Description = "Chạy thuật toán tùy chọn bao nhiêu lần tùy ý", Icon = "⚡", RequiresPremium = true },
            new() { Id = "advanced-lessons",  Name = "Bài giảng cao cấp",        Description = "Truy cập SOLID, Design Patterns, System Design chuyên sâu", Icon = "📚", RequiresPremium = true },
            new() { Id = "premium-sandbox",   Name = "Sandbox đặc biệt",         Description = "Mở khóa sân chơi Premium với dữ liệu lớn", Icon = "🎮", RequiresPremium = true },
            new() { Id = "leaderboard-badge",  Name = "Huy hiệu Premium",         Description = "Hiển thị huy hiệu vàng trên bảng xếp hạng", Icon = "👑", RequiresPremium = true },
            new() { Id = "basic-viz",         Name = "Trực quan hóa cơ bản",     Description = "Sorting, BFS, DFS với dữ liệu mẫu", Icon = "📊", RequiresPremium = false },
            new() { Id = "quiz-basic",        Name = "Quiz cơ bản",              Description = "Trắc nghiệm 6 chủ đề miễn phí", Icon = "❓", RequiresPremium = false },
        };

        public StatelessPaymentStrategy(StatelessAuthStrategy authStrategy)
        {
            _authStrategy = authStrategy;
        }

        public StatelessPaymentConfigDto GetConfig()
        {
            return new StatelessPaymentConfigDto
            {
                PremiumPrice = PremiumPrice,
                Currency = "VND",
                BankId = BankId,
                BankAccount = BankAccount,
                AccountName = AccountName,
                SupportedMethods = new List<string> { "vietqr", "bank_transfer", "momo" },
                PremiumFeatures = PremiumFeatures
            };
        }

        public StatelessOrderDto CreateCheckout(string userId, string paymentMethod)
        {
            if (string.IsNullOrWhiteSpace(userId))
                throw new ArgumentException("UserId không được để trống.");

            if (_premiumUsers.ContainsKey(userId))
                throw new InvalidOperationException("Tài khoản đã là Premium. Không cần thanh toán thêm.");

            var paymentCode = $"VDSA{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
            var orderId = $"order-{Guid.NewGuid():N}";

            var order = new InMemoryOrder
            {
                Id = orderId,
                UserId = userId,
                PaymentCode = paymentCode,
                Amount = PremiumPrice,
                PaymentMethod = paymentMethod,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow,
            };

            _orders[orderId] = order;

            LogTransaction(orderId, userId, "CHECKOUT_CREATED", PremiumPrice, "Pending");

            var qrUrl = $"https://img.vietqr.io/image/{BankId}-{BankAccount}-compact.png" +
                        $"?amount={(int)PremiumPrice}&addInfo={paymentCode}&accountName={Uri.EscapeDataString(AccountName)}";

            return new StatelessOrderDto
            {
                Id = orderId,
                UserId = userId,
                PaymentCode = paymentCode,
                Amount = PremiumPrice,
                Status = "Pending",
                CreatedAt = order.CreatedAt,
                CompletedAt = null,
                BankId = BankId,
                BankAccount = BankAccount,
                AccountName = AccountName,
                QrUrl = qrUrl,
            };
        }

        public StatelessOrderDto VerifyPayment(string orderId, string? userId)
        {
            if (!_orders.TryGetValue(orderId, out var order))
                throw new KeyNotFoundException("Hóa đơn không tồn tại.");

            if (userId != null && order.UserId != userId)
                throw new UnauthorizedAccessException("Bạn không có quyền xác nhận hóa đơn này.");

            if (order.Status == "Completed")
                return MapToOrderDto(order);

            // Simulate successful payment verification
            order.Status = "Completed";
            order.CompletedAt = DateTime.UtcNow;

            _premiumUsers[order.UserId] = true;
            _authStrategy.SetUserPremium(order.UserId, true);

            LogTransaction(orderId, order.UserId, "PAYMENT_VERIFIED", order.Amount, "Completed");

            return MapToOrderDto(order);
        }

        public StatelessOrderDto GetOrderStatus(string orderId, string? userId)
        {
            if (!_orders.TryGetValue(orderId, out var order))
                throw new KeyNotFoundException("Hóa đơn không tồn tại.");

            if (userId != null && order.UserId != userId)
                throw new UnauthorizedAccessException("Bạn không có quyền truy cập hóa đơn này.");

            return MapToOrderDto(order);
        }

        public StatelessOrderDto SimulateWebhook(string orderId)
        {
            if (!_orders.TryGetValue(orderId, out var order))
                throw new KeyNotFoundException("Hóa đơn không tồn tại.");

            if (order.Status == "Completed")
                return MapToOrderDto(order);

            order.Status = "Completed";
            order.CompletedAt = DateTime.UtcNow;

            _premiumUsers[order.UserId] = true;
            _authStrategy.SetUserPremium(order.UserId, true);

            LogTransaction(orderId, order.UserId, "WEBHOOK_CONFIRMED", order.Amount, "Completed");

            return MapToOrderDto(order);
        }

        private bool CheckIsPremium(string userId)
        {
            if (_premiumUsers.ContainsKey(userId)) return true;
            try
            {
                var profile = _authStrategy.GetProfile(userId);
                return profile.IsPremium;
            }
            catch (KeyNotFoundException)
            {
                return false;
            }
        }

        public StatelessPremiumStatusDto GetPremiumStatus(string userId)
        {
            var isPremium = CheckIsPremium(userId);
            var unlockedFeatures = PremiumFeatures
                .Where(f => !f.RequiresPremium || isPremium)
                .Select(f => f.Id)
                .ToList();

            return new StatelessPremiumStatusDto
            {
                IsPremium = isPremium,
                UpgradedAt = isPremium ? DateTime.UtcNow : null,
                Plan = isPremium ? "lifetime" : "free",
                UnlockedFeatures = unlockedFeatures,
            };
        }

        public bool CheckFeatureAccess(string userId, string featureId)
        {
            var feature = PremiumFeatures.FirstOrDefault(f => f.Id == featureId);
            if (feature == null) return true;
            if (!feature.RequiresPremium) return true;
            return CheckIsPremium(userId);
        }

        public List<StatelessTransactionLogEntry> GetTransactionLog(string? userId = null)
        {
            lock (_logLock)
            {
                var entries = userId == null
                    ? _transactionLog
                    : _transactionLog.Where(t => t.UserId == userId);

                return entries.OrderByDescending(t => t.Timestamp).Take(50).Select(t =>
                    new StatelessTransactionLogEntry
                    {
                        Id = t.Id,
                        OrderId = t.OrderId,
                        UserId = t.UserId,
                        Action = t.Action,
                        Amount = t.Amount,
                        Timestamp = t.Timestamp,
                        Status = t.Status,
                    }).ToList();
            }
        }

        // ── Helpers ──────────────────────────────────────────────────────

        private void LogTransaction(string orderId, string userId, string action, decimal amount, string status)
        {
            lock (_logLock)
            {
                _transactionLog.Add(new InMemoryTransactionLog
                {
                    Id = $"txn-{Guid.NewGuid():N}",
                    OrderId = orderId,
                    UserId = userId,
                    Action = action,
                    Amount = amount,
                    Timestamp = DateTime.UtcNow,
                    Status = status,
                });
            }
        }

        private StatelessOrderDto MapToOrderDto(InMemoryOrder order)
        {
            var qrUrl = $"https://img.vietqr.io/image/{BankId}-{BankAccount}-compact.png" +
                        $"?amount={(int)order.Amount}&addInfo={order.PaymentCode}&accountName={Uri.EscapeDataString(AccountName)}";

            return new StatelessOrderDto
            {
                Id = order.Id,
                UserId = order.UserId,
                PaymentCode = order.PaymentCode,
                Amount = order.Amount,
                Status = order.Status,
                CreatedAt = order.CreatedAt,
                CompletedAt = order.CompletedAt,
                BankId = BankId,
                BankAccount = BankAccount,
                AccountName = AccountName,
                QrUrl = qrUrl,
            };
        }

        // ── Inner Types ──────────────────────────────────────────────────

        private class InMemoryOrder
        {
            public string Id { get; set; } = string.Empty;
            public string UserId { get; set; } = string.Empty;
            public string PaymentCode { get; set; } = string.Empty;
            public decimal Amount { get; set; }
            public string PaymentMethod { get; set; } = string.Empty;
            public string Status { get; set; } = "Pending";
            public DateTime CreatedAt { get; set; }
            public DateTime? CompletedAt { get; set; }
        }

        private class InMemoryTransactionLog
        {
            public string Id { get; set; } = string.Empty;
            public string OrderId { get; set; } = string.Empty;
            public string UserId { get; set; } = string.Empty;
            public string Action { get; set; } = string.Empty;
            public decimal Amount { get; set; }
            public DateTime Timestamp { get; set; }
            public string Status { get; set; } = string.Empty;
        }
    }
}
