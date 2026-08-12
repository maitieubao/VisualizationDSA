using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Configuration;
using VisualizationDSA.Domain.Engine;
using VisualizationDSA.Domain.Enums;

namespace VisualizationDSA.Domain.Strategies
{
    // =========================================================================
    // Chiến lược thanh toán stateless (demo in-memory cho frontend stateless).
    // PM-006: giá/bank đọc từ IConfiguration (cùng nguồn với PaymentService) —
    // KHÔNG hardcode 199.000/number tài khoản. PM-005: fail-closed khi thiếu config.
    // =========================================================================
    public class StatelessPaymentStrategy
    {
        private readonly ConcurrentDictionary<string, InMemoryOrder> _orders = new();
        private readonly ConcurrentDictionary<string, bool> _premiumUsers = new();
        private readonly List<InMemoryTransactionLog> _transactionLog = new();
        private readonly object _logLock = new();
        private readonly StatelessAuthStrategy _authStrategy;

        // PM-006: 1 nguồn cấu hình duy nhất — khởi tạo từ IConfiguration (fail-closed).
        private readonly decimal _premiumPrice;
        private readonly string _bankId;
        private readonly string _bankAccount;
        private readonly string _accountName;

        // PM-003: vòng đời order khớp timer QR frontend (15 phút).
        private static readonly TimeSpan OrderLifetime = TimeSpan.FromMinutes(15);
        // PM-010: TTL giữ lại order/log đã đóng (Completed/Expired) trước khi evict.
        private static readonly TimeSpan ClosedOrderRetention = TimeSpan.FromDays(1);

        private static readonly List<StatelessPremiumFeature> PremiumFeatures = new()
        {
            new() { Id = "unlimited-runs",    Name = "Biên dịch không giới hạn", Description = "Chạy thuật toán tùy chọn bao nhiêu lần tùy ý", Icon = "⚡", RequiresPremium = true },
            new() { Id = "advanced-lessons",  Name = "Bài giảng cao cấp",        Description = "Truy cập SOLID, Design Patterns, System Design chuyên sâu", Icon = "📚", RequiresPremium = true },
            new() { Id = "premium-sandbox",   Name = "Sandbox đặc biệt",         Description = "Mở khóa sân chơi Premium với dữ liệu lớn", Icon = "🎮", RequiresPremium = true },
            new() { Id = "leaderboard-badge",  Name = "Huy hiệu Premium",         Description = "Hiển thị huy hiệu vàng trên bảng xếp hạng", Icon = "👑", RequiresPremium = true },
            new() { Id = "basic-viz",         Name = "Trực quan hóa cơ bản",     Description = "Sorting, BFS, DFS với dữ liệu mẫu", Icon = "📊", RequiresPremium = false },
            new() { Id = "quiz-basic",        Name = "Quiz cơ bản",              Description = "Trắc nghiệm 6 chủ đề miễn phí", Icon = "❓", RequiresPremium = false },
        };

        public StatelessPaymentStrategy(StatelessAuthStrategy authStrategy, IConfiguration configuration)
        {
            _authStrategy = authStrategy;

            // PM-005 (stateless flow): fail-closed — thiếu cấu hình ngân hàng/giá là lỗi vận hành,
            // KHÔNG fallback giá trị mặc định (tránh QR sai tài khoản / cấp premium giá sai).
            _bankId = configuration["SePay:BankId"];
            _bankAccount = configuration["SePay:BankAccount"];
            _accountName = configuration["SePay:AccountName"];
            var priceStr = configuration["SePay:PremiumPrice"];

            if (string.IsNullOrWhiteSpace(_bankAccount))
                throw new InvalidOperationException("Cấu hình thanh toán thiếu SePay:BankAccount — vui lòng kiểm tra appsettings.");
            if (string.IsNullOrWhiteSpace(_bankId))
                throw new InvalidOperationException("Cấu hình thanh toán thiếu SePay:BankId — vui lòng kiểm tra appsettings.");
            if (string.IsNullOrWhiteSpace(_accountName))
                throw new InvalidOperationException("Cấu hình thanh toán thiếu SePay:AccountName — vui lòng kiểm tra appsettings.");
            if (!decimal.TryParse(priceStr, out _premiumPrice) || _premiumPrice <= 0)
                throw new InvalidOperationException("Cấu hình thanh toán thiếu/sai SePay:PremiumPrice — vui lòng kiểm tra appsettings.");
        }

        public StatelessPaymentConfigDto GetConfig()
        {
            EvictStale();
            return new StatelessPaymentConfigDto
            {
                PremiumPrice = _premiumPrice,
                Currency = "VND",
                BankId = _bankId,
                BankAccount = _bankAccount,
                AccountName = _accountName,
                SupportedMethods = new List<string> { "vietqr", "bank_transfer", "momo" },
                PremiumFeatures = PremiumFeatures
            };
        }

        public StatelessOrderDto CreateCheckout(string userId, string paymentMethod)
        {
            EvictStale();

            if (string.IsNullOrWhiteSpace(userId))
                throw new ArgumentException("UserId không được để trống.");

            // Chặn user đã premium tạo order mới.
            if (CheckIsPremium(userId))
                throw new InvalidOperationException("Tài khoản đã là Premium. Không cần thanh toán thêm.");

            // PM-008 (stateless): chặn order Pending chưa hết hạn — tránh nhiều QR cùng lúc.
            var existingPending = _orders.Values.FirstOrDefault(o =>
                o.UserId == userId &&
                o.Status == OrderStatus.Pending.ToString() &&
                !o.IsExpired());
            if (existingPending != null)
                throw new InvalidOperationException("Bạn đã có hóa đơn đang chờ thanh toán. Vui lòng hoàn tất hoặc chờ hóa đơn hết hạn.");

            var paymentCode = $"VDSA{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
            var orderId = $"order-{Guid.NewGuid():N}";

            var order = new InMemoryOrder
            {
                Id = orderId,
                UserId = userId,
                PaymentCode = paymentCode,
                Amount = _premiumPrice,
                PaymentMethod = paymentMethod,
                Status = OrderStatus.Pending.ToString(),
                CreatedAt = DateTime.UtcNow,
            };
            order.ExpiresAt = order.CreatedAt.Add(OrderLifetime);

            _orders[orderId] = order;

            LogTransaction(orderId, userId, "CHECKOUT_CREATED", _premiumPrice, OrderStatus.Pending.ToString());

            return MapToOrderDto(order);
        }

        /// <summary>
        /// PM-001 (P0): KHÔNG cấp premium — chỉ trả về trạng thái hiện tại của order.
        /// Mọi cấp premium phải đi qua webhook xác thực (simulate-webhook ở Dev / sepay-webhook).
        /// </summary>
        public StatelessOrderDto VerifyPayment(string orderId, string? userId)
        {
            EvictStale();
            var order = GetOwnedOrder(orderId, userId);
            return MapToOrderDto(order);
        }

        public StatelessOrderDto GetOrderStatus(string orderId, string? userId)
        {
            EvictStale();
            var order = GetOwnedOrder(orderId, userId);
            return MapToOrderDto(order);
        }

        /// <summary>
        /// PM-002 (P1): simulate-webhook nhận userId từ token và so sánh order.UserId —
        /// chặn user A hoàn thành order của user B (guard KHÔNG chỉ dựa vào env Development).
        /// Chỉ ghi nhận thanh toán trong bộ nhớ; cấp premium thực sự diễn ra qua
        /// ConfirmPremium SAU khi controller đã commit DB (PM-007 — DB là nguồn chân lý).
        /// </summary>
        public StatelessOrderDto SimulateWebhook(string orderId, string userId)
        {
            EvictStale();

            if (string.IsNullOrWhiteSpace(userId))
                throw new UnauthorizedAccessException("Không xác định được người dùng.");

            var order = GetOwnedOrder(orderId, userId);

            if (order.Status == OrderStatus.Completed.ToString())
                return MapToOrderDto(order);

            // PM-003: order quá hạn → từ chối (QR cũ không được kích hoạt premium).
            if (order.IsExpired())
            {
                order.MarkExpired();
                LogTransaction(orderId, order.UserId, "WEBHOOK_REJECTED_EXPIRED", order.Amount, OrderStatus.Expired.ToString());
                throw new InvalidOperationException("Hóa đơn đã hết hạn. Vui lòng tạo hóa đơn mới.");
            }

            order.Status = OrderStatus.Completed.ToString();
            order.CompletedAt = DateTime.UtcNow;

            LogTransaction(orderId, order.UserId, "WEBHOOK_CONFIRMED", order.Amount, OrderStatus.Completed.ToString());

            return MapToOrderDto(order);
        }

        /// <summary>
        /// PM-007 (P2): gọi SAU khi controller đã commit cấp premium xuống DB —
        /// DB là nguồn chân lý; cache in-memory chỉ được set sau khi commit thành công.
        /// </summary>
        public void ConfirmPremium(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId)) return;

            _premiumUsers[userId] = true;
            _authStrategy.SetUserPremium(userId, true);
        }

        /// <summary>PM-015: check feature fail-closed — feature không tồn tại → false.</summary>
        public bool CheckFeatureAccess(string userId, string featureId)
        {
            var feature = PremiumFeatures.FirstOrDefault(f => f.Id == featureId);
            if (feature == null) return false;
            if (!feature.RequiresPremium) return true;
            return CheckIsPremium(userId);
        }

        /// <summary>PM-015: hỗ trợ controller trả 404 khi feature không tồn tại.</summary>
        public bool FeatureExists(string featureId)
            => PremiumFeatures.Any(f => f.Id == featureId);

        public StatelessPremiumStatusDto GetPremiumStatus(string userId)
        {
            EvictStale();

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

        public List<StatelessTransactionLogEntry> GetTransactionLog(string? userId = null)
        {
            EvictStale();

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

        // ============================ Helpers nội bộ ============================

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

        /// <summary>Lấy order + kiểm tra ownership (chống IDOR — userId != null bắt buộc so sánh).</summary>
        private InMemoryOrder GetOwnedOrder(string orderId, string? userId)
        {
            if (!_orders.TryGetValue(orderId, out var order))
                throw new KeyNotFoundException("Hóa đơn không tồn tại.");

            if (userId != null && order.UserId != userId)
                throw new UnauthorizedAccessException("Bạn không có quyền truy cập hóa đơn này.");

            return order;
        }

        /// <summary>
        /// PM-010: evict order Completed/Expired quá TTL + log quá TTL — chống RAM tăng vô hạn.
        /// Được gọi ở đầu mọi method public để dữ liệu đã đóng tự dọn dẹp khi có truy cập.
        /// </summary>
        private void EvictStale()
        {
            var cutoff = DateTime.UtcNow.Add(-ClosedOrderRetention);

            foreach (var kv in _orders)
            {
                var isClosed = kv.Value.Status == OrderStatus.Completed.ToString() ||
                               kv.Value.Status == OrderStatus.Expired.ToString();
                var closedTime = kv.Value.CompletedAt ?? kv.Value.ExpiresAt;
                if (isClosed && closedTime < cutoff)
                {
                    _orders.TryRemove(kv.Key, out _);
                }
            }

            lock (_logLock)
            {
                _transactionLog.RemoveAll(t => t.Timestamp < cutoff);
            }
        }

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
            var qrUrl = $"https://img.vietqr.io/image/{_bankId}-{_bankAccount}-compact.png" +
                        $"?amount={(int)order.Amount}&addInfo={order.PaymentCode}&accountName={Uri.EscapeDataString(_accountName)}";

            return new StatelessOrderDto
            {
                Id = order.Id,
                UserId = order.UserId,
                PaymentCode = order.PaymentCode,
                Amount = order.Amount,
                Status = order.Status,
                CreatedAt = order.CreatedAt,
                ExpiresAt = order.ExpiresAt,
                CompletedAt = order.CompletedAt,
                BankId = _bankId,
                BankAccount = _bankAccount,
                AccountName = _accountName,
                QrUrl = qrUrl,
            };
        }

        // ======================== Model in-memory nội bộ ========================

        private class InMemoryOrder
        {
            public string Id { get; set; } = string.Empty;
            public string UserId { get; set; } = string.Empty;
            public string PaymentCode { get; set; } = string.Empty;
            public decimal Amount { get; set; }
            public string PaymentMethod { get; set; } = string.Empty;
            public string Status { get; set; } = OrderStatus.Pending.ToString();
            public DateTime CreatedAt { get; set; }
            // PM-003: vòng đời hết hạn của order in-memory (khớp Order entity DB).
            public DateTime ExpiresAt { get; set; }
            public DateTime? CompletedAt { get; set; }

            public bool IsExpired()
            {
                return Status == OrderStatus.Pending.ToString() && DateTime.UtcNow >= ExpiresAt;
            }

            public void MarkExpired()
            {
                if (Status == OrderStatus.Pending.ToString())
                {
                    Status = OrderStatus.Expired.ToString();
                }
            }
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
