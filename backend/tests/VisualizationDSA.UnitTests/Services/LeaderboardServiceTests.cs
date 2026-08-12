using FluentAssertions;
using Microsoft.Extensions.Caching.Memory;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Interfaces;
using VisualizationDSA.Infrastructure.Services;
using Xunit;

namespace VisualizationDSA.UnitTests.Services
{
    /// <summary>
    /// GM-046: spec LeaderboardService — clamp limit 1..100, cache theo limit, tie-break/rank
    /// chuyển tiếp từ repository (thứ tự ổn định do repo quyết định).
    /// </summary>
    public class LeaderboardServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly Mock<IUserRepository> _mockUserRepo;
        private readonly LeaderboardService _service;
        private readonly List<User> _users;

        public LeaderboardServiceTests()
        {
            _mockUow = new Mock<IUnitOfWork>();
            _mockUserRepo = new Mock<IUserRepository>();
            _mockUow.Setup(u => u.Users).Returns(_mockUserRepo.Object);
            _service = new LeaderboardService(_mockUow.Object, new MemoryCache(new MemoryCacheOptions()));

            _users = new List<User>
            {
                new("a@test.dev", "Alpha", "h1"),
                new("b@test.dev", "Beta", "h2"),
                new("c@test.dev", "Gamma", "h3"),
            };
            _users[0].AwardXP(300);
            _users[1].AwardXP(200);
            _users[2].AwardXP(100);
        }

        [Fact]
        public async Task GetTopUsersAsync_ClampsLimitBelowOne_ToOne()
        {
            _mockUserRepo.Setup(r => r.GetTopUsersAsync(It.IsAny<int>())).ReturnsAsync(_users);

            var entries = await _service.GetTopUsersAsync(0);

            entries.Should().HaveCount(3);
            _mockUserRepo.Verify(r => r.GetTopUsersAsync(1), Times.Once, "limit ≤ 0 phải clamp về 1");
        }

        [Fact]
        public async Task GetTopUsersAsync_ClampsLimitAboveHundred_ToOneHundred()
        {
            _mockUserRepo.Setup(r => r.GetTopUsersAsync(It.IsAny<int>())).ReturnsAsync(_users);

            await _service.GetTopUsersAsync(10_000);

            _mockUserRepo.Verify(r => r.GetTopUsersAsync(100), Times.Once, "limit > 100 phải clamp về 100");
        }

        [Fact]
        public async Task GetTopUsersAsync_SameLimit_SecondCallUsesCache()
        {
            _mockUserRepo.Setup(r => r.GetTopUsersAsync(It.IsAny<int>())).ReturnsAsync(_users);

            var first = (await _service.GetTopUsersAsync(3)).ToList();
            var second = (await _service.GetTopUsersAsync(3)).ToList();

            first.Should().HaveCount(3);
            second.Should().HaveCount(3);
            _mockUserRepo.Verify(r => r.GetTopUsersAsync(3), Times.Once, "cùng limit phải đọc cache lần 2");
        }

        [Fact]
        public async Task GetTopUsersAsync_DifferentLimit_RefetchesFromRepository()
        {
            _mockUserRepo.Setup(r => r.GetTopUsersAsync(It.IsAny<int>())).ReturnsAsync(_users);

            await _service.GetTopUsersAsync(2);
            await _service.GetTopUsersAsync(3);

            _mockUserRepo.Verify(r => r.GetTopUsersAsync(It.IsAny<int>()), Times.Exactly(2), "khác limit → cache key khác → query lại");
        }

        [Fact]
        public async Task GetTopUsersAsync_RankSequentialFromRepositoryOrder()
        {
            _mockUserRepo.Setup(r => r.GetTopUsersAsync(It.IsAny<int>())).ReturnsAsync(_users);

            var entries = (await _service.GetTopUsersAsync(3)).ToList();

            entries.Select(e => e.Rank).Should().Equal(1, 2, 3);
            entries[0].Username.Should().Be("Alpha");
            entries[0].TotalXP.Should().Be(300);
            entries[0].Level.Should().Be(3);
        }

        [Fact]
        public async Task GetUserRankAsync_TieBreakStableViaRepository()
        {
            // Tie-break ổn định nằm ở repo (cùng XP → Id nhỏ hơn xếp trước); service chỉ truyền rank qua.
            _mockUserRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
                .ReturnsAsync(_users[0]);
            _mockUserRepo.Setup(r => r.GetUserRankAsync(It.IsAny<Guid>())).ReturnsAsync(2);

            var rank = await _service.GetUserRankAsync(Guid.NewGuid());

            rank.Rank.Should().Be(2);
            rank.TotalXP.Should().Be(300);
            rank.IsInTop.Should().BeTrue();
        }

        [Fact]
        public async Task GetUserRankAsync_OutsideTop_IsInTopFalse()
        {
            _mockUserRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
                .ReturnsAsync(_users[0]);
            _mockUserRepo.Setup(r => r.GetUserRankAsync(It.IsAny<Guid>())).ReturnsAsync(21);

            var rank = await _service.GetUserRankAsync(Guid.NewGuid());

            rank.IsInTop.Should().BeFalse();
        }

        [Fact]
        public async Task GetUserRankAsync_UserNotFound_ReturnsRankMinusOne()
        {
            _mockUserRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((User?)null);

            var rank = await _service.GetUserRankAsync(Guid.NewGuid());

            rank.Rank.Should().Be(-1);
            rank.IsInTop.Should().BeFalse();
        }
    }
}
