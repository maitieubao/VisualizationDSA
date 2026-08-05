using FluentAssertions;
using VisualizationDSA.Domain.Entities;
using Xunit;

namespace VisualizationDSA.UnitTests.Domain
{
    /// <summary>
    /// Bao phủ trực tiếp User.AwardXP / User.DeductXP và logic level-up —
    /// nền tảng cho cơ chế XP của reveal-hint và submit codelab.
    /// </summary>
    public class UserXpTests
    {
        private static User NewUser() => new("xp@test.com", "xp", "hash");

        [Theory]
        [InlineData(0)]
        [InlineData(-50)]
        public void AwardXP_GivenNonPositive_ShouldBeNoOp(int amount)
        {
            var user = NewUser();
            user.AwardXP(amount);

            user.TotalXP.Should().Be(0);
            user.CurrentLevel.Should().Be(1);
        }

        [Fact]
        public void AwardXP_GivenPositive_ShouldAccumulate()
        {
            var user = NewUser();
            user.AwardXP(100);
            user.AwardXP(50);

            user.TotalXP.Should().Be(150);
        }

        [Theory]
        [InlineData(0)]
        [InlineData(-10)]
        public void DeductXP_GivenNonPositiveCost_ShouldSucceedWithoutChange(int cost)
        {
            var user = NewUser();
            user.AwardXP(100);

            var ok = user.DeductXP(cost);

            ok.Should().BeTrue();
            user.TotalXP.Should().Be(100);
        }

        [Fact]
        public void DeductXP_GivenSufficientXp_ShouldDeduct()
        {
            var user = NewUser();
            user.AwardXP(100);

            var ok = user.DeductXP(40);

            ok.Should().BeTrue();
            user.TotalXP.Should().Be(60);
        }

        [Fact]
        public void DeductXP_GivenExactBalance_ShouldSucceed()
        {
            var user = NewUser();
            user.AwardXP(100);

            var ok = user.DeductXP(100);

            ok.Should().BeTrue();
            user.TotalXP.Should().Be(0);
        }

        [Fact]
        public void DeductXP_GivenInsufficientXp_ShouldFailWithoutChange()
        {
            var user = NewUser();
            user.AwardXP(30);

            var ok = user.DeductXP(50);

            ok.Should().BeFalse();
            user.TotalXP.Should().Be(30);
        }

        [Theory]
        [InlineData(99, 1)]
        [InlineData(100, 2)]
        [InlineData(299, 2)]
        [InlineData(300, 3)]
        [InlineData(600, 4)]
        [InlineData(1000, 5)]
        [InlineData(1500, 6)]
        [InlineData(2200, 7)]
        [InlineData(3000, 8)]
        public void AwardXP_GivenThresholds_ShouldLevelUp(int totalXp, int expectedLevel)
        {
            var user = NewUser();
            user.AwardXP(totalXp);

            user.CurrentLevel.Should().Be(expectedLevel);
        }

        [Fact]
        public void AwardXP_GivenExactBoundary_ShouldLevelUpExactlyOnce()
        {
            var user = NewUser();
            user.AwardXP(99);
            user.CurrentLevel.Should().Be(1);

            user.AwardXP(1);
            user.CurrentLevel.Should().Be(2);

            user.AwardXP(1);
            user.CurrentLevel.Should().Be(2);
        }

        [Fact]
        public void DeductXP_ShouldNeverLowerLevel()
        {
            var user = NewUser();
            user.AwardXP(500);
            user.CurrentLevel.Should().Be(3);

            user.DeductXP(300);

            user.TotalXP.Should().Be(200);
            user.CurrentLevel.Should().Be(3);
        }
    }
}
