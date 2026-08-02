using System;
using VisualizationDSA.Domain.Entities;
using Xunit;

namespace VisualizationDSA.UnitTests.Domain
{
    public class UserTests
    {
        [Fact]
        public void DowngradeFromPremium_ShouldSetMaxHeartsTo10_ButNotReduceCurrentHearts()
        {
            // Arrange
            var user = new User("test", "test@example.com", "hash");
            user.SetPremium(DateTime.UtcNow.AddDays(30)); // MaxHearts = 30, Hearts = 30

            // Act
            user.DowngradeFromPremium();

            // Assert
            Assert.Equal(10, user.MaxHearts);
            Assert.Equal(30, user.Hearts); // Current hearts remain 30 (not clamped)
        }

        [Fact]
        public void SetTeacherAppStatus_ShouldUpdateStatus()
        {
            var user = new User("teacher", "teacher@example.com", "hash");
            user.SetTeacherAppStatus("Approved");
            Assert.Equal("Approved", user.TeacherAppStatus);
        }
    }
}
