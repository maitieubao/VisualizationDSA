using FluentAssertions;
using Moq;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Domain.Interfaces;
using VisualizationDSA.Infrastructure.Services;
using Xunit;

namespace VisualizationDSA.UnitTests.Services
{
    /// <summary>
    /// Test PaymentService (luồng checkout Premium có DB): PM-053 guard webhook từng trường hợp,
    /// PM-054 success path atomic (Begin/Commit + SetPremiumStatus), rollback, idempotency 2 webhook
    /// cùng id không double-grant, IDOR GetOrderStatusAsync. Dùng repo mock in-memory.
    /// </summary>
    public class PaymentServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly Mock<IRepository<Order>> _mockOrderRepo;
        private readonly Mock<IUserRepository> _mockUserRepo;
        private readonly Mock<IConfiguration> _mockConfig;
        private readonly PaymentService _service;

        private readonly List<Order> _orders = new();
        private readonly List<User> _users = new();

        public PaymentServiceTests()
        {
            _mockUow = new Mock<IUnitOfWork>();
            _mockOrderRepo = new Mock<IRepository<Order>>();
            _mockUserRepo = new Mock<IUserRepository>();
            _mockConfig = new Mock<IConfiguration>();

            SetupPaymentConfig("MBBank", "99999999999", "DSA VISUALIZER ACADEMY", "199000");

            // In-memory repo: truy vấn trực tiếp trên danh sách — mô phỏng đúng hành vi EF truy vấn.
            _mockOrderRepo.Setup(r => r.FindAsync(It.IsAny<Expression<Func<Order, bool>>>()))
                .Returns((Expression<Func<Order, bool>> predicate) =>
                    Task.FromResult<IEnumerable<Order>>(_orders.Where(predicate.Compile()).ToList()));
            _mockOrderRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
                .Returns((Guid id) => Task.FromResult(_orders.FirstOrDefault(o => o.Id == id)));

            _mockUserRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
                .Returns((Guid id) => Task.FromResult(_users.FirstOrDefault(u => u.Id == id)));

            _mockUow.Setup(u => u.Orders).Returns(_mockOrderRepo.Object);
            _mockUow.Setup(u => u.Users).Returns(_mockUserRepo.Object);
            _mockUow.Setup(u => u.CommitAsync()).ReturnsAsync(2); // order + user thay đổi

            _service = new PaymentService(_mockUow.Object, _mockConfig.Object);
        }

        private void SetupPaymentConfig(string? bankId, string? bankAccount, string? accountName, string? price)
        {
            _mockConfig.Setup(c => c["SePay:BankId"]).Returns(bankId);
            _mockConfig.Setup(c => c["SePay:BankAccount"]).Returns(bankAccount);
            _mockConfig.Setup(c => c["SePay:AccountName"]).Returns(accountName);
            _mockConfig.Setup(c => c["SePay:PremiumPrice"]).Returns(price);
        }

        private User AddUser(bool premium = false)
        {
            var user = new User($"user-{Guid.NewGuid():N}@test.com", $"user{Guid.NewGuid():N}", "hash");
            if (premium) user.SetPremiumStatus(true);
            _users.Add(user);
            return user;
        }

        private Order AddPendingOrder(string paymentCode = "VDSA123456", decimal amount = 199000, Guid? userId = null)
        {
            var order = new Order(userId ?? Guid.NewGuid(), paymentCode, amount);
            _orders.Add(order);
            return order;
        }

        private static SePayWebhookPayload BuildPayload(long id = 42, string transferType = "in",
            decimal amount = 199000, string? code = "VDSA123456", string account = "99999999999",
            string content = "")
            => new()
            {
                Id = id,
                TransferType = transferType,
                TransferAmount = amount,
                Code = code,
                AccountNumber = account,
                Content = content,
            };

        // ============================ PM-053: guard từng webhook ============================

        [Theory]
        [InlineData("out")]
        [InlineData("UP")]
        [InlineData("")]
        public async Task Webhook_WithWrongTransferType_ReturnsFalse(string transferType)
        {
            AddPendingOrder();

            var result = await _service.ProcessSePayWebhookAsync(BuildPayload(transferType: transferType));

            result.Should().BeFalse();
            _mockUow.Verify(u => u.BeginTransactionAsync(), Times.Never);
        }

        [Fact]
        public async Task Webhook_WithUnderpay_ReturnsFalse()
        {
            AddPendingOrder(amount: 199000);

            var result = await _service.ProcessSePayWebhookAsync(BuildPayload(amount: 199000 - 1));

            result.Should().BeFalse();
            _mockUow.Verify(u => u.BeginTransactionAsync(), Times.Never);
        }

        [Fact]
        public async Task Webhook_WithUnknownPaymentCode_ReturnsFalse()
        {
            AddPendingOrder(paymentCode: "VDSA111111");

            var result = await _service.ProcessSePayWebhookAsync(BuildPayload(code: "VDSA999999"));

            result.Should().BeFalse();
            _mockUow.Verify(u => u.BeginTransactionAsync(), Times.Never);
        }

        [Fact]
        public async Task Webhook_WithoutPaymentCodeInCodeOrContent_ReturnsFalse()
        {
            AddPendingOrder();

            var result = await _service.ProcessSePayWebhookAsync(BuildPayload(code: null, content: "No code here"));

            result.Should().BeFalse();
            _mockUow.Verify(u => u.BeginTransactionAsync(), Times.Never);
        }

        [Fact]
        public async Task Webhook_WhenOrderAlreadyCompleted_ReturnsFalse()
        {
            var order = AddPendingOrder();
            order.MarkAsCompleted();

            var result = await _service.ProcessSePayWebhookAsync(BuildPayload());

            result.Should().BeFalse();
            _mockUow.Verify(u => u.BeginTransactionAsync(), Times.Never);
        }

        [Fact]
        public async Task Webhook_WhenOrderExpired_MarksExpiredAndReturnsFalse()
        {
            // PM-003: order quá hạn → webhook từ chối (QR cũ không kích hoạt premium).
            var order = AddPendingOrder();
            SetExpiresAt(order, DateTime.UtcNow.AddMinutes(-1));

            var result = await _service.ProcessSePayWebhookAsync(BuildPayload());

            result.Should().BeFalse();
            order.Status.Should().Be(OrderStatus.Expired.ToString());
            order.TransactionReference.Should().BeNull();
            _mockUow.Verify(u => u.CommitTransactionAsync(), Times.Once);
        }

        [Fact]
        public async Task Webhook_WhenBankAccountMismatch_ReturnsFalse()
        {
            AddPendingOrder();

            var result = await _service.ProcessSePayWebhookAsync(BuildPayload(account: "000000000000"));

            result.Should().BeFalse();
            _mockUow.Verify(u => u.BeginTransactionAsync(), Times.Never);
        }

        // ============================ PM-054: success path atomic ============================

        [Fact]
        public async Task Webhook_Success_CompletesOrderAndGrantsPremium_InSingleTransaction()
        {
            var user = AddUser();
            var order = AddPendingOrder(userId: user.Id);

            var result = await _service.ProcessSePayWebhookAsync(BuildPayload(id: 555));

            result.Should().BeTrue();
            order.Status.Should().Be(OrderStatus.Completed.ToString());
            order.TransactionReference.Should().Be("555");
            order.CompletedAt.Should().NotBeNull();
            user.IsPremium.Should().BeTrue();

            // Atomic: bắt đầu transaction → commit dữ liệu → commit transaction; KHÔNG rollback.
            _mockUow.Verify(u => u.BeginTransactionAsync(), Times.Once);
            _mockUow.Verify(u => u.CommitAsync(), Times.Once);
            _mockUow.Verify(u => u.CommitTransactionAsync(), Times.Once);
            _mockUow.Verify(u => u.RollbackTransactionAsync(), Times.Never);
        }

        [Fact]
        public async Task Webhook_TwoSameIdWebhooks_NoDoubleGrant()
        {
            var user = AddUser();
            AddPendingOrder(userId: user.Id);
            var payload = BuildPayload(id: 777);

            (await _service.ProcessSePayWebhookAsync(payload)).Should().BeTrue();
            (await _service.ProcessSePayWebhookAsync(payload)).Should().BeTrue();

            // Webhook 2 là idempotent replay — KHÔNG mở transaction/commit lần 2 → không double-grant.
            _mockUow.Verify(u => u.BeginTransactionAsync(), Times.Once);
            _mockUow.Verify(u => u.CommitTransactionAsync(), Times.Once);
            _mockUow.Verify(u => u.RollbackTransactionAsync(), Times.Never);
            user.IsPremium.Should().BeTrue();
        }

        [Fact]
        public async Task Webhook_WhenCommitFails_RollsBackAndRethrows()
        {
            var user = AddUser();
            AddPendingOrder(userId: user.Id);
            _mockUow.Setup(u => u.CommitAsync()).ThrowsAsync(new InvalidOperationException("db down"));

            var act = () => _service.ProcessSePayWebhookAsync(BuildPayload());

            await act.Should().ThrowAsync<InvalidOperationException>();
            _mockUow.Verify(u => u.RollbackTransactionAsync(), Times.Once);
            _mockUow.Verify(u => u.CommitTransactionAsync(), Times.Never);
        }

        [Fact]
        public async Task Webhook_WhenZeroRowsAffected_TreatedAsIdempotent()
        {
            // Compare-and-swap: 0 dòng thay đổi = request khác đã giành quyền → không cấp lại.
            AddPendingOrder();
            _mockUow.Setup(u => u.CommitAsync()).ReturnsAsync(0);

            var result = await _service.ProcessSePayWebhookAsync(BuildPayload());

            result.Should().BeTrue();
            _mockUow.Verify(u => u.RollbackTransactionAsync(), Times.Once);
            _mockUow.Verify(u => u.CommitTransactionAsync(), Times.Never);
        }

        // ============================ IDOR GetOrderStatusAsync ============================

        [Fact]
        public async Task GetOrderStatus_WhenUserIsNotOwner_ThrowsKeyNotFound()
        {
            var owner = AddUser();
            var order = AddPendingOrder(userId: owner.Id);

            var otherUser = Guid.NewGuid();
            var act = () => _service.GetOrderStatusAsync(order.Id, otherUser);

            await act.Should().ThrowAsync<KeyNotFoundException>();
        }

        [Fact]
        public async Task GetOrderStatus_WhenOwner_ReturnsOrder()
        {
            var owner = AddUser();
            var order = AddPendingOrder(userId: owner.Id);

            var dto = await _service.GetOrderStatusAsync(order.Id, owner.Id);

            dto.Id.Should().Be(order.Id);
            dto.Status.Should().Be(OrderStatus.Pending.ToString());
        }

        // ============================ PM-008: CreateOrderAsync ============================

        [Fact]
        public async Task CreateOrder_WhenUserAlreadyPremium_ThrowsConflict()
        {
            var user = AddUser(premium: true);

            var act = () => _service.CreateOrderAsync(user.Id);

            await act.Should().ThrowAsync<InvalidOperationException>();
        }

        [Fact]
        public async Task CreateOrder_WhenPendingOrderNotExpired_ThrowsConflict()
        {
            var user = AddUser();
            AddPendingOrder(userId: user.Id);

            var act = () => _service.CreateOrderAsync(user.Id);

            await act.Should().ThrowAsync<InvalidOperationException>();
        }

        [Fact]
        public async Task CreateOrder_WhenPendingOrderExpired_AllowsNewOrder()
        {
            var user = AddUser();
            var expired = AddPendingOrder(userId: user.Id);
            SetExpiresAt(expired, DateTime.UtcNow.AddMinutes(-1));

            var dto = await _service.CreateOrderAsync(user.Id);

            dto.Id.Should().NotBeEmpty();
            dto.ExpiresAt.Should().BeAfter(dto.CreatedAt);
            dto.Status.Should().Be(OrderStatus.Pending.ToString());
        }

        [Fact]
        public async Task CreateOrder_Success_UsesConfiguredPriceAndBank()
        {
            SetupPaymentConfig("VPBank", "0123456789", "ACADEMY TEST", "250000");
            var serviceWithNewConfig = new PaymentService(_mockUow.Object, _mockConfig.Object);
            var user = AddUser();

            var dto = await serviceWithNewConfig.CreateOrderAsync(user.Id);

            dto.Amount.Should().Be(250000m);
            dto.BankId.Should().Be("VPBank");
            dto.BankAccount.Should().Be("0123456789");
            dto.QrUrl.Should().Contain("VPBank-0123456789");
        }

        [Fact]
        public async Task CreateOrder_WhenBankAccountConfigMissing_ThrowsConfigError()
        {
            // PM-005: fail-closed — thiếu SePay:BankAccount → từ chối, KHÔNG fallback "99999999999".
            SetupPaymentConfig("MBBank", null, "DSA VISUALIZER ACADEMY", "199000");
            var serviceWithMissingConfig = new PaymentService(_mockUow.Object, _mockConfig.Object);
            var user = AddUser();

            var act = () => serviceWithMissingConfig.CreateOrderAsync(user.Id);

            await act.Should().ThrowAsync<PaymentConfigurationException>();
        }

        // ============================ C1: lazy-cleanup order hết hạn ============================

        [Fact]
        public async Task GetOrderStatus_WhenOrderExpired_MarksAsExpiredAndReturnsExpiredStatus()
        {
            // C1: order Pending quá hạn (ExpiresAt) được đánh dấu Expired ngay khi tra cứu —
            // không còn hiện "Pending" mập mờ cho QR đã chết.
            var user = AddUser();
            var order = AddPendingOrder(userId: user.Id);
            SetExpiresAt(order, DateTime.UtcNow.AddMinutes(-1));

            var dto = await _service.GetOrderStatusAsync(order.Id, user.Id);

            dto.Status.Should().Be(OrderStatus.Expired.ToString());
            order.Status.Should().Be(OrderStatus.Expired.ToString(), "order trong DB phải được đánh dấu Expired");
            _mockUow.Verify(u => u.CommitAsync(), Times.AtLeastOnce);
        }

        [Fact]
        public async Task GetOrderStatus_WhenOrderStillValid_KeepsPendingAndNoCommit()
        {
            // Order còn hạn → giữ nguyên Pending, không commit thừa (không thay đổi dữ liệu).
            var user = AddUser();
            var order = AddPendingOrder(userId: user.Id);

            var dto = await _service.GetOrderStatusAsync(order.Id, user.Id);

            dto.Status.Should().Be(OrderStatus.Pending.ToString());
            _mockUow.Verify(u => u.CommitAsync(), Times.Never);
        }

        // ============================ Helpers ============================

        /// <summary>Ép order hết hạn (ExpiresAt private set) để test nhánh quá hạn.</summary>
        private static void SetExpiresAt(Order order, DateTime value)
        {
            var prop = typeof(Order).GetProperty(nameof(Order.ExpiresAt))!;
            prop.SetValue(order, value);
        }
    }
}
