using Microsoft.Extensions.Configuration;
using System;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Interfaces;

namespace VisualizationDSA.Infrastructure.Services
{
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
            
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null)
                throw new KeyNotFoundException("Người dùng không tồn tại.");

            
            var bankId = _configuration["SePay:BankId"] ?? "MBBank";
            var bankAccount = _configuration["SePay:BankAccount"] ?? "99999999999";
            var accountName = _configuration["SePay:AccountName"] ?? "DSA VISUALIZER ACADEMY";
            var priceStr = _configuration["SePay:PremiumPrice"] ?? "199000";
            
            if (!decimal.TryParse(priceStr, out var amount))
            {
                amount = 199000m; 
            }

            
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

            
            var order = new Order(userId, paymentCode, amount);
            await _unitOfWork.Orders.AddAsync(order);
            await _unitOfWork.CommitAsync();

            return MapToOrderDto(order, bankId, bankAccount, accountName);
        }

        public async Task<OrderDto> GetOrderStatusAsync(Guid orderId, Guid userId)
        {
            var order = await _unitOfWork.Orders.GetByIdAsync(orderId);
            if (order == null || order.UserId != userId)
                throw new KeyNotFoundException("Hóa đơn không tồn tại hoặc bạn không có quyền truy cập.");

            var bankId = _configuration["SePay:BankId"] ?? "MBBank";
            var bankAccount = _configuration["SePay:BankAccount"] ?? "99999999999";
            var accountName = _configuration["SePay:AccountName"] ?? "DSA VISUALIZER ACADEMY";

            return MapToOrderDto(order, bankId, bankAccount, accountName);
        }

        public async Task<bool> ProcessSePayWebhookAsync(SePayWebhookPayload payload)
        {
            
            if (!"in".Equals(payload.TransferType, StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            
            var transactionRef = payload.Id.ToString();
            var existingByRef = await _unitOfWork.Orders.FindAsync(o => o.TransactionReference == transactionRef);
            if (existingByRef.Any())
            {
                return true;
            }

            
            string? paymentCode = null;

            
            if (!string.IsNullOrEmpty(payload.Code))
            {
                paymentCode = payload.Code.Trim().ToUpper();
            }
            else if (!string.IsNullOrEmpty(payload.Content))
            {
                
                var match = Regex.Match(payload.Content, @"VDSA[A-Z0-9]{6}", RegexOptions.IgnoreCase);
                if (match.Success)
                {
                    paymentCode = match.Value.ToUpper();
                }
            }

            if (string.IsNullOrEmpty(paymentCode))
            {
                
                return false;
            }

            
            var orders = await _unitOfWork.Orders.FindAsync(o => o.PaymentCode == paymentCode);
            var order = orders.FirstOrDefault();

            if (order == null)
            {
                
                return false;
            }

            
            if (order.Status != "Pending")
            {
                
                return false;
            }

            
            
            var expectedBankAccount = _configuration["SePay:BankAccount"];
            if (!string.IsNullOrEmpty(expectedBankAccount) &&
                !string.Equals(payload.AccountNumber, expectedBankAccount, StringComparison.Ordinal))
            {
                
                return false;
            }

            
            if (payload.TransferAmount < order.Amount)
            {
                
                return false;
            }

            
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                order.SetTransactionReference(transactionRef);
                order.MarkAsCompleted();

                
                var user = await _unitOfWork.Users.GetByIdAsync(order.UserId);
                if (user != null)
                {
                    user.SetPremiumStatus(true);
                }

                await _unitOfWork.CommitAsync();
                await _unitOfWork.CommitTransactionAsync();
                return true;
            }
            catch (Exception)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }

        

        private static string GenerateRandomPaymentCode()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            var code = new string(Enumerable.Repeat(chars, 6)
                .Select(s => s[random.Next(s.Length)]).ToArray());
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
                CompletedAt = order.CompletedAt,
                BankId = bankId,
                BankAccount = bankAccount,
                AccountName = accountName,
                QrUrl = qrUrl
            };
        }
    }
}
