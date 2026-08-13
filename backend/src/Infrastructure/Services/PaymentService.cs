using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Serilog;
using System;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Domain.Interfaces;

namespace VisualizationDSA.Infrastructure.Services
{
    /// <summary>Lỗi cấu hình thanh toán (fail-closed PM-005) — tách riêng khỏi conflict nghiệp vụ.</summary>
    public sealed class PaymentConfigurationException : InvalidOperationException
    {
        public PaymentConfigurationException(string message) : base(message) { }
    }

    public class PaymentService : IPaymentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;

        public PaymentService(IUnitOfWork unitOfWork, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
        }

        public async Task<OrderDto> CreateOrderAsync(Guid userId)
        {
            // Lấy người dùng — phải tồn tại.
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null)
                throw new KeyNotFoundException("Người dùng không tồn tại.");

            // PM-008: chặn user đã premium tạo order mới (khớp hành vi stateless).
            if (user.IsPremium)
                throw new InvalidOperationException("Tài khoản đã là Premium. Không cần thanh toán thêm.");

            // PM-008: chặn order Pending chưa hết hạn — tránh nhiều QR hoạt động cùng lúc.
            var pendingOrders = await _unitOfWork.Orders.FindAsync(o =>
                o.UserId == userId && o.Status == OrderStatus.Pending.ToString());
            if (pendingOrders.Any(o => !o.IsExpired()))
                throw new InvalidOperationException("Bạn đã có hóa đơn đang chờ thanh toán. Vui lòng hoàn tất hoặc chờ hóa đơn hết hạn.");

            // PM-005/PM-006: 1 nguồn cấu hình duy nhất, fail-closed — thiếu config → từ chối.
            var (bankId, bankAccount, accountName, amount) = ReadPaymentConfig();

            // Sinh mã thanh toán độc nhất (thử tối đa 10 lần).
            string paymentCode = string.Empty;
            bool isUnique = false;
            int retries = 0;

            while (!isUnique && retries < 10)
            {
                paymentCode = GenerateRandomPaymentCode();
                var existing = await _unitOfWork.Orders.FindAsync(o => o.PaymentCode == paymentCode);
                if (!existing.Any())
                {
                    isUnique = true;
                }
                retries++;
            }

            if (!isUnique)
            {
                throw new InvalidOperationException("Không thể tạo mã thanh toán độc nhất tại thời điểm này. Vui lòng thử lại.");
            }

            // PM-003: Order tự mang ExpiresAt (CreatedAt + 15 phút) — webhook từ chối order quá hạn.
            var order = new Order(userId, paymentCode, amount);
            await _unitOfWork.Orders.AddAsync(order);
            await _unitOfWork.CommitAsync();

            return MapToOrderDto(order, bankId, bankAccount, accountName);
        }

        public async Task<OrderDto> GetOrderStatusAsync(Guid orderId, Guid userId)
        {
            // IDOR guard: chỉ chủ sở hữu order xem được trạng thái (user khác → 404 như không tồn tại).
            var order = await _unitOfWork.Orders.GetByIdAsync(orderId);
            if (order == null || order.UserId != userId)
                throw new KeyNotFoundException("Hóa đơn không tồn tại hoặc bạn không có quyền truy cập.");

            // C1: lazy-cleanup — order Pending quá hạn (ExpiresAt) được đánh dấu Expired ngay
            // khi người dùng tra cứu trạng thái (không cần job riêng — order chết không còn hiện Pending).
            if (order.IsExpired())
            {
                order.MarkAsExpired();
                await _unitOfWork.CommitAsync();
            }

            var (bankId, bankAccount, accountName, _) = ReadPaymentConfig();

            return MapToOrderDto(order, bankId, bankAccount, accountName);
        }

        public async Task<bool> ProcessSePayWebhookAsync(SePayWebhookPayload payload)
        {
            // Guard 1: chỉ xử lý giao dịch "tiền vào" (in) — "out" là tiền ra khỏi tài khoản.
            if (!"in".Equals(payload.TransferType, StringComparison.OrdinalIgnoreCase))
            {
                Log.Warning("SePay webhook từ chối: TransferType '{TransferType}' không phải 'in'.", payload.TransferType);
                return false;
            }

            // Trích xuất mã thanh toán: ưu tiên trường Code, fallback regex trong Content.
            string? paymentCode = null;

            if (!string.IsNullOrEmpty(payload.Code))
            {
                paymentCode = payload.Code.Trim().ToUpper();
            }
            else if (!string.IsNullOrEmpty(payload.Content))
            {
                // Nội dung chuyển tiền dạng "VDSAxxxxxx" (không phân biệt hoa thường).
                var match = Regex.Match(payload.Content, @"VDSA[A-Z0-9]{6}", RegexOptions.IgnoreCase);
                if (match.Success)
                {
                    paymentCode = match.Value.ToUpper();
                }
            }

            if (string.IsNullOrEmpty(paymentCode))
            {
                Log.Warning("SePay webhook từ chối: không trích xuất được mã thanh toán (code/content rỗng).");
                return false;
            }

            // Tìm order theo mã thanh toán.
            var orders = await _unitOfWork.Orders.FindAsync(o => o.PaymentCode == paymentCode);
            var order = orders.FirstOrDefault();

            if (order == null)
            {
                Log.Warning("SePay webhook từ chối: không tìm thấy order với mã {PaymentCode}.", paymentCode);
                return false;
            }

            // Idempotency replay: webhook trùng id mà order đã Completed với đúng ref → true
            // (SePay gửi lại webhook sau khi ta đã xử lý xong — không cấp premium lần 2).
            if (order.TransactionReference == transactionRef(payload))
            {
                Log.Information("SePay webhook: order {OrderId} đã xử lý ref {Ref} — bỏ qua (idempotent).", order.Id, transactionRef(payload));
                return true;
            }

            // Guard: order không còn Pending (đã Completed/Cancelled/Expired) → từ chối.
            if (order.Status != OrderStatus.Pending.ToString())
            {
                Log.Warning("SePay webhook từ chối: order {OrderId} có trạng thái {Status} (không phải Pending).", order.Id, order.Status);
                return false;
            }

            // PM-005: fail-closed — bank account phải khớp cấu hình (thiếu config → ném lỗi, không fallback).
            var (_, expectedBankAccount, _, _) = ReadPaymentConfig();
            if (!string.Equals(payload.AccountNumber, expectedBankAccount, StringComparison.Ordinal))
            {
                Log.Warning("SePay webhook từ chối: accountNumber '{Account}' không khớp cấu hình.", payload.AccountNumber);
                return false;
            }

            // Guard: số tiền chuyển nhỏ hơn giá order → thiếu → từ chối.
            if (payload.TransferAmount < order.Amount)
            {
                Log.Warning("SePay webhook từ chối: số tiền {Amount} < giá order {Expected} (order {OrderId}).",
                    payload.TransferAmount, order.Amount, order.Id);
                return false;
            }

            // PM-004 (TOCTOU): TOÀN BỘ check idempotency + cập nhật nằm TRONG 1 transaction.
            // - Re-check TransactionReference bên trong transaction (không check ngoài như cũ).
            // - Unique index DB trên TransactionReference là rào chặn cuối (2 webhook song song).
            // - Compare-and-swap: CommitAsync trả số dòng ảnh hưởng — 0 dòng = request khác đã thắng.
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // Idempotency check trong transaction: đã có webhook (song song/trùng lặp) xử lý ref này?
                var duplicateByRef = await _unitOfWork.Orders.FindAsync(o => o.TransactionReference == transactionRef(payload));
                if (duplicateByRef.Any())
                {
                    // Webhook trùng id đã xử lý xong → trả true như idempotent success, không cấp premium lần 2.
                    await _unitOfWork.RollbackTransactionAsync();
                    return true;
                }

                // Nạp lại entity CÓ tracking để cập nhật an toàn bên trong transaction.
                var trackedOrder = await _unitOfWork.Orders.GetByIdAsync(order.Id);
                if (trackedOrder == null || trackedOrder.Status != OrderStatus.Pending.ToString())
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    Log.Warning("SePay webhook từ chối: order {OrderId} không còn Pending trong transaction.", order.Id);
                    return false;
                }

                // PM-003: order quá hạn → đánh dấu Expired và từ chối (QR cũ không kích hoạt premium).
                if (trackedOrder.IsExpired())
                {
                    trackedOrder.MarkAsExpired();
                    await _unitOfWork.CommitAsync();
                    await _unitOfWork.CommitTransactionAsync();
                    Log.Warning("SePay webhook từ chối: order {OrderId} đã hết hạn (ExpiresAt={ExpiresAt}).",
                        trackedOrder.Id, trackedOrder.ExpiresAt);
                    return false;
                }

                // PM-007: cấp premium + cập nhật order trong CÙNG transaction DB.
                trackedOrder.SetTransactionReference(transactionRef(payload));
                trackedOrder.MarkAsCompleted();

                var user = await _unitOfWork.Users.GetByIdAsync(trackedOrder.UserId);
                if (user != null)
                {
                    user.SetPremiumStatus(true);
                }

                // Compare-and-swap: 0 dòng thay đổi nghĩa là transaction khác đã giành quyền → idempotent.
                var affected = await _unitOfWork.CommitAsync();
                if (affected == 0)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return true;
                }

                await _unitOfWork.CommitTransactionAsync();
                Log.Information("SePay webhook: order {OrderId} hoàn tất, user {UserId} được cấp premium.",
                    trackedOrder.Id, trackedOrder.UserId);
                return true;
            }
            catch (DbUpdateException ex) when (IsUniqueConstraintViolation(ex))
            {
                // Unique index TransactionReference — webhook song song cùng id đã thắng.
                await _unitOfWork.RollbackTransactionAsync();
                Log.Warning(ex, "SePay webhook: transaction reference {Ref} đã tồn tại (idempotent).", transactionRef(payload));
                return true;
            }
            catch (Exception)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }

        // ============================ Helpers nội bộ ============================

        /// <summary>PM-006: 1 nguồn cấu hình giá/bank duy nhất — fail-closed khi thiếu (PM-005).</summary>
        private (string bankId, string bankAccount, string accountName, decimal amount) ReadPaymentConfig()
        {
            var bankId = _configuration["SePay:BankId"];
            var bankAccount = _configuration["SePay:BankAccount"];
            var accountName = _configuration["SePay:AccountName"];
            var priceStr = _configuration["SePay:PremiumPrice"];

            // Fail-closed: KHÔNG fallback giá trị mặc định — cấu hình sai phải dừng luồng thanh toán.
            if (string.IsNullOrWhiteSpace(bankAccount))
                throw new PaymentConfigurationException("Cấu hình thanh toán thiếu SePay:BankAccount — vui lòng kiểm tra appsettings.");
            if (string.IsNullOrWhiteSpace(bankId))
                throw new PaymentConfigurationException("Cấu hình thanh toán thiếu SePay:BankId — vui lòng kiểm tra appsettings.");
            if (string.IsNullOrWhiteSpace(accountName))
                throw new PaymentConfigurationException("Cấu hình thanh toán thiếu SePay:AccountName — vui lòng kiểm tra appsettings.");
            if (!decimal.TryParse(priceStr, out var amount) || amount <= 0)
                throw new PaymentConfigurationException("Cấu hình thanh toán thiếu/sai SePay:PremiumPrice — vui lòng kiểm tra appsettings.");

            return (bankId, bankAccount, accountName, amount);
        }

        private static string transactionRef(SePayWebhookPayload payload)
            => payload.Id.ToString();

        private static bool IsUniqueConstraintViolation(DbUpdateException ex)
        {
            // SQLite: SQLITE_CONSTRAINT (19). PostgreSQL: unique_violation (23505).
            var inner = ex.InnerException;
            while (inner != null)
            {
                if (inner is Microsoft.Data.Sqlite.SqliteException { SqliteErrorCode: 19 })
                    return true;
                if (inner.GetType().FullName?.Contains("PostgresException") == true &&
                    inner.Message.Contains("23505", StringComparison.Ordinal))
                    return true;
                inner = inner.InnerException;
            }
            return false;
        }

        private static string GenerateRandomPaymentCode()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var code = new string(Enumerable.Repeat(chars, 6)
                .Select(s => s[System.Security.Cryptography.RandomNumberGenerator.GetInt32(chars.Length)]).ToArray());
            return $"VDSA{code}";
        }

        private static OrderDto MapToOrderDto(Order order, string bankId, string bankAccount, string accountName)
        {
            var encodedAccountName = Uri.EscapeDataString(accountName);
            var qrUrl = $"https://img.vietqr.io/image/{bankId}-{bankAccount}-qr_only.png?amount={(int)order.Amount}&addInfo={order.PaymentCode}&accountName={encodedAccountName}";

            return new OrderDto
            {
                Id = order.Id,
                UserId = order.UserId,
                PaymentCode = order.PaymentCode,
                Amount = order.Amount,
                Status = order.Status,
                CreatedAt = order.CreatedAt,
                ExpiresAt = order.ExpiresAt,
                CompletedAt = order.CompletedAt,
                BankId = bankId,
                BankAccount = bankAccount,
                AccountName = accountName,
                QrUrl = qrUrl
            };
        }
    }
}
