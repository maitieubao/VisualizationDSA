using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using VisualizationDSA.Domain.Engine;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Strategies;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.UnitTests.Common;
using VisualizationDSA.WebApi.Controllers;
using Xunit;

namespace VisualizationDSA.UnitTests.Services
{
    /// <summary>
    /// Test StatelessPaymentController (/api/v1/concepts/payment/*):
    /// PM-001 verify không cấp premium, PM-002 simulate-webhook ownership (token vs order),
    /// PM-003 order hết hạn 409, PM-007 premium ghi DB trước cache, PM-008 409 chồng order,
    /// PM-015 feature không tồn tại → 404, PM-057 simulate-webhook ngoài Development → 404.
    /// </summary>
    public class StatelessPaymentControllerTests
    {
        private static readonly Dictionary<string, string?> BaseConfig = new()
        {
            ["SePay:BankId"] = "MBBank",
            ["SePay:BankAccount"] = "99999999999",
            ["SePay:AccountName"] = "DSA VISUALIZER ACADEMY",
            ["SePay:PremiumPrice"] = "199000",
        };

        private sealed class Fixture
        {
            public StatelessPaymentController Controller { get; init; } = null!;
            public ApplicationDbContext Db { get; init; } = null!;
            public StatelessAuthStrategy Auth { get; init; } = null!;
            public StatelessPaymentStrategy Strategy { get; init; } = null!;
            public string UserId { get; init; } = string.Empty;
            public string Token { get; init; } = string.Empty;
        }

        private static Fixture Create(string email = "pay@test.com", string environment = "Development")
        {
            var db = TestDbContextFactory.CreateSimple($"payment-{Guid.NewGuid():N}");
            var dbUser = new User(email, "payuser", "hash");
            db.Users.Add(dbUser);
            db.SaveChanges();

            var auth = new StatelessAuthStrategy();
            var config = new ConfigurationBuilder().AddInMemoryCollection(BaseConfig).Build();
            var strategy = new StatelessPaymentStrategy(auth, config);

            var env = new Mock<IWebHostEnvironment>();
            env.Setup(e => e.EnvironmentName).Returns(environment);

            var response = auth.Register(new StatelessRegisterRequest
            {
                Email = email,
                Username = "payuser",
                Password = "Password123"
            }, dbUser.Id.ToString());

            var controller = new StatelessPaymentController(strategy, db, env.Object);
            SetAuthHeader(controller, response.AccessToken);

            return new Fixture
            {
                Controller = controller,
                Db = db,
                Auth = auth,
                Strategy = strategy,
                UserId = dbUser.Id.ToString(),
                Token = response.AccessToken,
            };
        }

        private static void SetAuthHeader(StatelessPaymentController controller, string accessToken)
        {
            var httpContext = new DefaultHttpContext();
            if (!string.IsNullOrEmpty(accessToken))
                httpContext.Request.Headers["Authorization"] = $"Bearer {accessToken}";
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
        }

        private static string SerializeValue(object? value)
            => JsonSerializer.Serialize(value);

        private static StatelessOrderDto Checkout(Fixture f)
        {
            var result = f.Controller.Checkout(new StatelessCheckoutRequest { PaymentMethod = "vietqr" });
            var ok = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            return ok.Value.Should().BeOfType<StatelessOrderDto>().Subject;
        }

        private static void ForceExpireOrder(StatelessPaymentStrategy strategy, string orderId)
        {
            var field = typeof(StatelessPaymentStrategy).GetField("_orders",
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)!;
            var dict = field.GetValue(strategy)!;
            var tryGet = dict.GetType().GetMethod("TryGetValue")!;
            var args = new object?[] { orderId, null };
            tryGet.Invoke(dict, args);
            var order = args[1]!;
            order.GetType().GetProperty("ExpiresAt")!.SetValue(order, DateTime.UtcNow.AddMinutes(-1));
        }

        // ============================ PM-057: simulate-webhook env guard ============================

        [Fact]
        public async Task SimulateWebhook_OutsideDevelopment_Returns404()
        {
            var fixture = Create(environment: "Production");

            var result = await fixture.Controller.SimulateWebhook(new StatelessVerifyRequest { OrderId = "order-any" });

            result.Result.Should().BeOfType<NotFoundObjectResult>();
        }

        [Fact]
        public async Task SimulateWebhook_WithoutAuthToken_Returns401()
        {
            var fixture = Create();
            SetAuthHeader(fixture.Controller, string.Empty);

            var result = await fixture.Controller.SimulateWebhook(new StatelessVerifyRequest { OrderId = "order-any" });

            result.Result.Should().BeOfType<UnauthorizedObjectResult>();
        }

        // ============================ PM-001: verify không cấp premium ============================

        [Fact]
        public void Verify_DoesNotCompleteOrderOrGrantPremium()
        {
            var fixture = Create();
            var order = Checkout(fixture);

            var result = fixture.Controller.Verify(new StatelessVerifyRequest { OrderId = order.Id });
            var ok = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var dto = ok.Value.Should().BeOfType<StatelessOrderDto>().Subject;

            dto.Status.Should().Be("Pending");
            fixture.Db.Users.Single(u => u.Id.ToString() == fixture.UserId).IsPremium.Should().BeFalse();
        }

        // ============================ PM-002: simulate-webhook ownership ============================

        [Fact]
        public async Task SimulateWebhook_AnotherUserOrder_Returns401()
        {
            var fixture = Create();
            var order = Checkout(fixture);

            // User B (đăng ký riêng, cùng strategy/controller) cố simulate order của user A.
            var dbUserB = new User("other@test.com", "otheruser", "hash");
            fixture.Db.Users.Add(dbUserB);
            fixture.Db.SaveChanges();
            var tokenB = fixture.Auth.Register(new StatelessRegisterRequest
            {
                Email = "other@test.com",
                Username = "otheruser",
                Password = "Password123"
            }, dbUserB.Id.ToString()).AccessToken;
            SetAuthHeader(fixture.Controller, tokenB);

            var result = await fixture.Controller.SimulateWebhook(new StatelessVerifyRequest { OrderId = order.Id });

            result.Result.Should().BeOfType<UnauthorizedObjectResult>();
            fixture.Db.Users.Single(u => u.Id.ToString() == fixture.UserId).IsPremium.Should().BeFalse();
        }

        // ============================ PM-007: DB commit trước cache ============================

        [Fact]
        public async Task SimulateWebhook_Success_CompletesOrderAndPersistsPremiumToDb()
        {
            var fixture = Create();
            var order = Checkout(fixture);

            var result = await fixture.Controller.SimulateWebhook(new StatelessVerifyRequest { OrderId = order.Id });
            var ok = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var dto = ok.Value.Should().BeOfType<StatelessOrderDto>().Subject;

            dto.Status.Should().Be("Completed");
            fixture.Db.Users.Single(u => u.Id.ToString() == fixture.UserId).IsPremium.Should().BeTrue();

            // Cache in-memory cũng đồng bộ sau khi DB commit.
            fixture.Strategy.GetPremiumStatus(fixture.UserId).IsPremium.Should().BeTrue();
        }

        // ============================ PM-003: order hết hạn ============================

        [Fact]
        public async Task SimulateWebhook_ExpiredOrder_Returns409()
        {
            var fixture = Create();
            var order = Checkout(fixture);
            ForceExpireOrder(fixture.Strategy, order.Id);

            var result = await fixture.Controller.SimulateWebhook(new StatelessVerifyRequest { OrderId = order.Id });

            var conflict = result.Result.Should().BeOfType<ConflictObjectResult>().Subject;
            SerializeValue(conflict.Value).Should().Contain("ORDER_EXPIRED");
            fixture.Db.Users.Single(u => u.Id.ToString() == fixture.UserId).IsPremium.Should().BeFalse();
        }

        // ============================ PM-008: chặn trùng checkout ============================

        [Fact]
        public async Task Checkout_WhenUserAlreadyPremium_Returns409()
        {
            var fixture = Create();
            var order = Checkout(fixture);
            await fixture.Controller.SimulateWebhook(new StatelessVerifyRequest { OrderId = order.Id });

            var result = fixture.Controller.Checkout(new StatelessCheckoutRequest { PaymentMethod = "vietqr" });

            result.Result.Should().BeOfType<ConflictObjectResult>();
        }

        [Fact]
        public void Checkout_WhenPendingOrderNotExpired_Returns409()
        {
            var fixture = Create();
            Checkout(fixture);

            var result = fixture.Controller.Checkout(new StatelessCheckoutRequest { PaymentMethod = "vietqr" });

            result.Result.Should().BeOfType<ConflictObjectResult>();
        }

        // ============================ PM-015: feature fail-closed ============================

        [Fact]
        public void CheckFeatureAccess_UnknownFeature_Returns404()
        {
            var fixture = Create();

            var result = fixture.Controller.CheckFeatureAccess("no-such-feature");

            result.Result.Should().BeOfType<NotFoundObjectResult>();
        }

        [Fact]
        public void CheckFeatureAccess_ExistingFreeFeature_ReturnsTrue()
        {
            var fixture = Create();

            var result = fixture.Controller.CheckFeatureAccess("basic-viz");

            var ok = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            using var doc = JsonDocument.Parse(SerializeValue(ok.Value));
            doc.RootElement.GetProperty("hasAccess").GetBoolean().Should().BeTrue();
        }
    }
}
