using FluentAssertions;
using Moq;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Interfaces;
using VisualizationDSA.Infrastructure.Services;
using Xunit;

namespace VisualizationDSA.UnitTests.Services
{
    public class PaymentServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly Mock<IRepository<Order>> _mockOrderRepo;
        private readonly Mock<IUserRepository> _mockUserRepo;
        private readonly Mock<IConfiguration> _mockConfig;
        private readonly PaymentService _service;

        public PaymentServiceTests()
        {
            _mockUow = new Mock<IUnitOfWork>();
            _mockOrderRepo = new Mock<IRepository<Order>>();
            _mockUserRepo = new Mock<IUserRepository>();
            _mockConfig = new Mock<IConfiguration>();

            _mockUow.Setup(u => u.Orders).Returns(_mockOrderRepo.Object);
            _mockUow.Setup(u => u.Users).Returns(_mockUserRepo.Object);

            _service = new PaymentService(_mockUow.Object, _mockConfig.Object);
        }

        [Fact]
        public async Task ProcessSePayWebhookAsync_ShouldBeIdempotent_WhenTransactionReferenceExists()
        {
            // Arrange
            var payload = new SePayWebhookPayload
            {
                Id = 12345,
                TransferType = "in",
                TransferAmount = 199000,
                Code = "VDSA123456"
            };

            var existingOrder = new Order(Guid.NewGuid(), "VDSA123456", 199000);
            existingOrder.SetTransactionReference("12345");
            existingOrder.MarkAsCompleted();

            var matchingOrders = new List<Order> { existingOrder };

            _mockOrderRepo.Setup(r => r.FindAsync(It.IsAny<Expression<Func<Order, bool>>>()))
                .ReturnsAsync(matchingOrders);

            // Act
            var result = await _service.ProcessSePayWebhookAsync(payload);

            // Assert
            result.Should().BeTrue();
            // Should not attempt to begin a new transaction or complete again since it's idempotent
            _mockUow.Verify(u => u.BeginTransactionAsync(), Times.Never);
        }
    }
}
