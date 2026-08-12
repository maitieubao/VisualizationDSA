using FluentAssertions;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using VisualizationDSA.Domain.Engine;
using VisualizationDSA.Domain.Strategies;
using Xunit;

namespace VisualizationDSA.UnitTests.Services
{
    /// <summary>
    /// Test StatelessPaymentStrategy (flow demo in-memory): PM-001 verify không cấp premium,
    /// PM-002 simulate-webhook ownership, PM-003 hết hạn, PM-005 fail-closed config,
    /// PM-006 config duy nhất, PM-007 premium sau khi DB commit (ConfirmPremium),
    /// PM-008 chặn premium/pending, PM-010 evict, PM-015 fail-closed feature.
    /// </summary>
    public class StatelessPaymentStrategyTests
    {
        private static readonly Dictionary<string, string?> BaseConfig = new()
        {
            ["SePay:BankId"] = "MBBank",
            ["SePay:BankAccount"] = "99999999999",
            ["SePay:AccountName"] = "DSA VISUALIZER ACADEMY",
            ["SePay:PremiumPrice"] = "199000",
        };

        private static StatelessPaymentStrategy Create(Dictionary<string, string?>? overrides = null)
        {
            var values = new Dictionary<string, string?>(BaseConfig);
            if (overrides != null)
            {
                foreach (var kv in overrides) values[kv.Key] = kv.Value;
            }
            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(values)
                .Build();
            return new StatelessPaymentStrategy(new StatelessAuthStrategy(), config);
        }

        private static (StatelessPaymentStrategy Strategy, StatelessAuthStrategy Auth) CreateWithAuth()
        {
            var auth = new StatelessAuthStrategy();
            var config = new ConfigurationBuilder().AddInMemoryCollection(BaseConfig).Build();
            return (new StatelessPaymentStrategy(auth, config), auth);
        }

        private static string RegisterUser(StatelessAuthStrategy auth, string email = "pay@test.com")
        {
            var response = auth.Register(new StatelessRegisterRequest
            {
                Email = email,
                Username = $"user-{email[..email.IndexOf('@')]}",
                Password = "Password123"
            });
            return response.User.Id;
        }

        // ============================ PM-005/PM-006: config ============================

        [Fact]
        public void Constructor_WhenBankAccountMissing_Throws()
        {
            var act = () => Create(new Dictionary<string, string?> { ["SePay:BankAccount"] = null });

            act.Should().Throw<InvalidOperationException>().WithMessage("*SePay:BankAccount*");
        }

        [Theory]
        [InlineData(null)]
        [InlineData("abc")]
        [InlineData("0")]
        public void Constructor_WhenPriceInvalid_Throws(string? price)
        {
            var act = () => Create(new Dictionary<string, string?> { ["SePay:PremiumPrice"] = price });

            act.Should().Throw<InvalidOperationException>().WithMessage("*SePay:PremiumPrice*");
        }

        [Fact]
        public void GetConfig_UsesConfiguredPriceAndBank()
        {
            var strategy = Create(new Dictionary<string, string?>
            {
                ["SePay:PremiumPrice"] = "250000",
                ["SePay:BankId"] = "VPBank",
                ["SePay:BankAccount"] = "0123456789",
            });

            var config = strategy.GetConfig();

            config.PremiumPrice.Should().Be(250000m);
            config.BankId.Should().Be("VPBank");
            config.BankAccount.Should().Be("0123456789");
        }

        [Fact]
        public void Checkout_OrderUsesConfiguredPriceAndBank()
        {
            var (strategy, auth) = CreateWithAuth();
            var userId = RegisterUser(auth);

            var order = strategy.CreateCheckout(userId, "vietqr");

            order.Amount.Should().Be(199000m);
            order.BankAccount.Should().Be("99999999999");
            order.QrUrl.Should().Contain("MBBank-99999999999");
        }

        // ============================ PM-008: chặn trùng ============================

        [Fact]
        public void Checkout_WhenUserPremium_Throws()
        {
            var (strategy, auth) = CreateWithAuth();
            var userId = RegisterUser(auth);
            strategy.ConfirmPremium(userId);

            var act = () => strategy.CreateCheckout(userId, "vietqr");

            act.Should().Throw<InvalidOperationException>();
        }

        [Fact]
        public void Checkout_WhenPendingOrderNotExpired_Throws()
        {
            var (strategy, auth) = CreateWithAuth();
            var userId = RegisterUser(auth);
            strategy.CreateCheckout(userId, "vietqr");

            var act = () => strategy.CreateCheckout(userId, "vietqr");

            act.Should().Throw<InvalidOperationException>();
        }

        // ============================ PM-001: verify KHÔNG cấp premium ============================

        [Fact]
        public void Verify_DoesNotCompleteOrGrantPremium()
        {
            var (strategy, auth) = CreateWithAuth();
            var userId = RegisterUser(auth);
            var order = strategy.CreateCheckout(userId, "vietqr");

            var verified = strategy.VerifyPayment(order.Id, userId);

            verified.Status.Should().Be("Pending");
            strategy.GetPremiumStatus(userId).IsPremium.Should().BeFalse();
        }

        [Fact]
        public void Verify_OtherUser_ThrowsUnauthorized()
        {
            var (strategy, auth) = CreateWithAuth();
            var ownerId = RegisterUser(auth, "owner@test.com");
            var otherId = RegisterUser(auth, "other@test.com");
            var order = strategy.CreateCheckout(ownerId, "vietqr");

            var act = () => strategy.VerifyPayment(order.Id, otherId);

            act.Should().Throw<UnauthorizedAccessException>();
        }

        // ============================ PM-002/PM-003/PM-007: simulate-webhook ============================

        [Fact]
        public void SimulateWebhook_OtherUser_ThrowsUnauthorized()
        {
            var (strategy, auth) = CreateWithAuth();
            var ownerId = RegisterUser(auth, "owner@test.com");
            var otherId = RegisterUser(auth, "other@test.com");
            var order = strategy.CreateCheckout(ownerId, "vietqr");

            var act = () => strategy.SimulateWebhook(order.Id, otherId);

            act.Should().Throw<UnauthorizedAccessException>();
        }

        [Fact]
        public void SimulateWebhook_CompletesOrder_ButPremiumOnlyAfterConfirm()
        {
            // PM-007: strategy chỉ ghi nhận; premium thực sự cấp qua ConfirmPremium
            // sau khi controller commit DB (DB là nguồn chân lý).
            var (strategy, auth) = CreateWithAuth();
            var userId = RegisterUser(auth);
            var order = strategy.CreateCheckout(userId, "vietqr");

            var completed = strategy.SimulateWebhook(order.Id, userId);

            completed.Status.Should().Be("Completed");
            strategy.GetPremiumStatus(userId).IsPremium.Should().BeFalse();

            strategy.ConfirmPremium(userId);

            strategy.GetPremiumStatus(userId).IsPremium.Should().BeTrue();
        }

        [Fact]
        public void SimulateWebhook_ExpiredOrder_Throws()
        {
            var (strategy, auth) = CreateWithAuth();
            var userId = RegisterUser(auth);
            var order = strategy.CreateCheckout(userId, "vietqr");
            ForceExpireOrder(strategy, order.Id);

            var act = () => strategy.SimulateWebhook(order.Id, userId);

            act.Should().Throw<InvalidOperationException>();
            strategy.GetPremiumStatus(userId).IsPremium.Should().BeFalse();
        }

        [Fact]
        public void SimulateWebhook_CompletedOrder_ReturnsIdempotent()
        {
            var (strategy, auth) = CreateWithAuth();
            var userId = RegisterUser(auth);
            var order = strategy.CreateCheckout(userId, "vietqr");
            strategy.SimulateWebhook(order.Id, userId);

            var again = strategy.SimulateWebhook(order.Id, userId);

            again.Status.Should().Be("Completed");
        }

        // ============================ PM-015: feature fail-closed ============================

        [Fact]
        public void CheckFeatureAccess_UnknownFeature_ReturnsFalse()
        {
            var (strategy, auth) = CreateWithAuth();
            var userId = RegisterUser(auth);

            strategy.CheckFeatureAccess(userId, "no-such-feature").Should().BeFalse();
            strategy.FeatureExists("no-such-feature").Should().BeFalse();
            strategy.FeatureExists("basic-viz").Should().BeTrue();
        }

        [Fact]
        public void CheckFeatureAccess_FreeFeature_AlwaysTrue_WithoutPremium()
        {
            var (strategy, auth) = CreateWithAuth();
            var userId = RegisterUser(auth);

            strategy.CheckFeatureAccess(userId, "basic-viz").Should().BeTrue();
        }

        [Fact]
        public void CheckFeatureAccess_PremiumFeature_RequiresPremium()
        {
            var (strategy, auth) = CreateWithAuth();
            var userId = RegisterUser(auth);

            strategy.CheckFeatureAccess(userId, "unlimited-runs").Should().BeFalse();

            strategy.ConfirmPremium(userId);
            strategy.CheckFeatureAccess(userId, "unlimited-runs").Should().BeTrue();
        }

        // ============================ PM-010: eviction ============================

        [Fact]
        public void StaleCompletedOrder_IsEvicted()
        {
            var (strategy, auth) = CreateWithAuth();
            var userId = RegisterUser(auth);
            var order = strategy.CreateCheckout(userId, "vietqr");
            strategy.SimulateWebhook(order.Id, userId);

            // Ép CompletedAt về quá TTL (1 ngày) rồi kích hoạt eviction qua GetConfig.
            ForceCompletedAt(strategy, order.Id, DateTime.UtcNow.AddDays(-2));

            strategy.GetConfig();

            var act = () => strategy.GetOrderStatus(order.Id, userId);
            act.Should().Throw<KeyNotFoundException>();
        }

        // ============================ Helpers (reflection) ============================

        /// <summary>Ép order in-memory hết hạn (InMemoryOrder là private class).</summary>
        private static object GetInMemoryOrder(StatelessPaymentStrategy strategy, string orderId)
        {
            var field = typeof(StatelessPaymentStrategy).GetField("_orders",
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)!;
            var dict = field.GetValue(strategy)!;
            var tryGet = dict.GetType().GetMethod("TryGetValue")!;
            var args = new object?[] { orderId, null };
            tryGet.Invoke(dict, args);
            return args[1]!;
        }

        private static void ForceExpireOrder(StatelessPaymentStrategy strategy, string orderId)
        {
            var order = GetInMemoryOrder(strategy, orderId);
            order.GetType().GetProperty("ExpiresAt")!.SetValue(order, DateTime.UtcNow.AddMinutes(-1));
        }

        private static void ForceCompletedAt(StatelessPaymentStrategy strategy, string orderId, DateTime value)
        {
            var order = GetInMemoryOrder(strategy, orderId);
            order.GetType().GetProperty("CompletedAt")!.SetValue(order, value);
        }
    }
}
