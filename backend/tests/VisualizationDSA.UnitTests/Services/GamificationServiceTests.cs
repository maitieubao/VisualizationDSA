using FluentAssertions;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Interfaces;
using VisualizationDSA.Infrastructure.Services;
using Xunit;

namespace VisualizationDSA.UnitTests.Services
{
    public class GamificationServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly Mock<IUserRepository> _mockUserRepo;
        private readonly GamificationService _service;

        public GamificationServiceTests()
        {
            _mockUow = new Mock<IUnitOfWork>();
            _mockUserRepo = new Mock<IUserRepository>();
            _mockUow.Setup(u => u.Users).Returns(_mockUserRepo.Object);
            _service = new GamificationService(_mockUow.Object);
        }

        [Fact]
        public async Task AwardXPAsync_ShouldIncreaseUserXpAndRecordActivity()
        {
            
            var userId = Guid.NewGuid();
            var user = new User("test@email.com", "testuser", "hashed_password");
            _mockUserRepo.Setup(r => r.GetByIdAsync(userId)).ReturnsAsync(user);

            
            await _service.AwardXPAsync(userId, 150, "Completed Quiz");

            
            user.TotalXP.Should().Be(150);
            user.CurrentLevel.Should().Be(2); 
            user.LastActivityDate.Should().NotBeNull();
            _mockUow.Verify(u => u.CommitAsync(), Times.Once);
        }

        [Fact]
        public async Task GetUserProgressAsync_ShouldCalculateProgressCorrectly()
        {
            
            var userId = Guid.NewGuid();
            var domainModel = new UserProgressDomainModel
            {
                TotalXP = 150,
                CurrentLevel = 2,
                StreakDays = 0,
                IsPremium = false,
                CompletedModuleIds = new List<string>(),
                Badges = new List<UserBadgeDomainModel>()
            };
            
            _mockUserRepo.Setup(r => r.GetUserProgressDomainModelAsync(userId)).ReturnsAsync(domainModel);

            
            var progress = await _service.GetUserProgressAsync(userId);

            
            progress.TotalXP.Should().Be(150);
            progress.CurrentLevel.Should().Be(2);
            progress.XpToNextLevel.Should().Be(150); 
            progress.LevelProgressPercent.Should().Be(25); 
        }

        [Fact]
        public async Task CheckAndAwardBadgesAsync_ShouldAwardBadgeWhenCriteriaMet()
        {
            
            var userId = Guid.NewGuid();
            var user = new User("test@email.com", "testuser", "hashed_password");
            user.CompleteModule("sorting-bubble");

            var mockBadgeRepo = new Mock<IRepository<Badge>>();
            var badgeList = new List<Badge>
            {
                new Badge("Sorting Wizard", "Completed sorting module", "⚡", "#3b82f6", "{'sortingCompleted': 1}")
            };
            
            _mockUow.Setup(u => u.Badges).Returns(mockBadgeRepo.Object);
            mockBadgeRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(badgeList);
            _mockUserRepo.Setup(r => r.GetByIdWithDetailsAsync(userId, It.IsAny<bool>())).ReturnsAsync(user);

            
            var awardedBadges = await _service.CheckAndAwardBadgesAsync(userId);

            
            awardedBadges.Should().ContainSingle();
            awardedBadges.First().Name.Should().Be("Sorting Wizard");
            user.UserBadges.Should().ContainSingle(ub => ub.BadgeId == awardedBadges.First().Id);
            _mockUow.Verify(u => u.CommitAsync(), Times.Once);
        }
    }
}
