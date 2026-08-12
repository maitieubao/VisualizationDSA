using FluentAssertions;
using System;
using System.Globalization;
using System.Linq;
using VisualizationDSA.Domain.Strategies;
using Xunit;

namespace VisualizationDSA.UnitTests.Domain.Strategies
{
    /// <summary>
    /// GM-046 + GM-011 + GM-016: spec GamificationStrategy —
    /// trạng thái RIÊNG theo user (không dùng chung 1 profile demo), streak cập nhật theo
    /// đúng luật _updateStreak (server UTC), bảng level dùng chung (GM-019).
    /// </summary>
    public class GamificationStrategyTests
    {
        private readonly GamificationStrategy _strategy = new();

        [Fact]
        public void AwardXp_UserA_DoesNotAffectUserB()
        {
            // GM-011: trước đây 1 profile demo dùng chung — XP của A cộng vào B.
            _strategy.AwardXp("user-a", 100, "Khen thưởng");
            _strategy.AwardXp("user-a", 100, "Khen thưởng");

            var profileA = _strategy.GetUserProfile("user-a");
            var profileB = _strategy.GetUserProfile("user-b");

            profileA.TotalXp.Should().Be(200);
            profileB.TotalXp.Should().Be(0, "user khác phải có trạng thái riêng biệt");
            profileB.StreakDays.Should().Be(0);
        }

        [Fact]
        public void AwardXp_FirstAward_StreakStartsAtOne()
        {
            var profile = _strategy.AwardXp("fresh-user", 50, "Khen thưởng");

            profile.StreakDays.Should().Be(1, "GM-016: award đầu tiên → streak = 1");
            profile.LastActiveDate.Should().Be(
                DateTime.UtcNow.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture));
        }

        [Fact]
        public void AwardXp_ConsecutiveDay_StreakIncrements()
        {
            // Ngày hoạt động gần nhất = hôm qua → hôm nay award → streak +1.
            var profile = _strategy.GetUserProfile("streak-user");
            profile.LastActiveDate = DateTime.UtcNow.AddDays(-1).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
            profile.StreakDays = 5;

            _strategy.AwardXp("streak-user", 10, "Khen thưởng");

            _strategy.GetUserProfile("streak-user").StreakDays.Should().Be(6);
        }

        [Fact]
        public void AwardXp_SameDay_StreakKept()
        {
            var profile = _strategy.GetUserProfile("same-day");
            profile.LastActiveDate = DateTime.UtcNow.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
            profile.StreakDays = 3;

            _strategy.AwardXp("same-day", 10, "Khen thưởng");

            _strategy.GetUserProfile("same-day").StreakDays.Should().Be(3, "cùng ngày không tăng streak");
        }

        [Fact]
        public void AwardXp_GapTwoDays_StreakResets()
        {
            var profile = _strategy.GetUserProfile("gap-user");
            profile.LastActiveDate = DateTime.UtcNow.AddDays(-3).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
            profile.StreakDays = 7;

            _strategy.AwardXp("gap-user", 10, "Khen thưởng");

            _strategy.GetUserProfile("gap-user").StreakDays.Should().Be(1, "gap ≥ 2 ngày → reset về 1");
        }

        [Fact]
        public void SyncProfileFromDb_DbIsSourceOfTruth()
        {
            // GM-011: DB-first — số liệu DB phải ghi đè profile in-memory.
            _strategy.SyncProfileFromDb("db-user", "Nguyen Van A", 250, 2, 4, DateTime.UtcNow.AddDays(-1));

            var profile = _strategy.GetUserProfile("db-user");
            profile.TotalXp.Should().Be(250);
            profile.CurrentLevel.Should().Be(2);
            profile.LevelName.Should().Be("Explorer");
            profile.StreakDays.Should().Be(4);
            profile.Username.Should().Be("Nguyen Van A");
        }

        [Fact]
        public void GetAllBadges_ReturnsFullCatalog_PerUserUnlock()
        {
            _strategy.AwardXp("badge-a", 50, "Khen thưởng");

            var badgesA = _strategy.GetAllBadges("badge-a");
            var badgesB = _strategy.GetAllBadges("badge-b");

            badgesA.Count.Should().Be(8, "phải trả ĐỦ 8 huy hiệu (mở + khóa) — GM-009");
            badgesA.Single(b => b.Id == "first-steps").EarnedAt.Should().NotBeNullOrEmpty();
            badgesB.Single(b => b.Id == "first-steps").EarnedAt.Should().BeEmpty("user chưa đạt điều kiện → chưa mở");
        }

        [Fact]
        public void AwardXp_LevelFromSharedTable()
        {
            // GM-019: level phải tính theo GamificationLevelTable (1 nguồn).
            var profile = _strategy.AwardXp("level-user", 300, "Khen thưởng");
            profile.CurrentLevel.Should().Be(3);
            profile.LevelName.Should().Be("Learner");

            _strategy.AwardXp("level-user", 300, "Khen thưởng");
            var after = _strategy.GetUserProfile("level-user");
            after.TotalXp.Should().Be(600);
            after.CurrentLevel.Should().Be(4);
            after.LevelName.Should().Be("Practitioner");
        }

        [Fact]
        public void GetConfig_LevelsMatchSharedTable()
        {
            var config = _strategy.GetConfig();
            config.Should().NotBeNull();
        }
    }
}
