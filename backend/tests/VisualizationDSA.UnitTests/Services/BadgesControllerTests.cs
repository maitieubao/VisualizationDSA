using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Interfaces;
using VisualizationDSA.UnitTests.Common;
using VisualizationDSA.WebApi.Controllers;
using Xunit;

namespace VisualizationDSA.UnitTests.Services
{
    /// <summary>
    /// GM-046: spec BadgesController — danh sách ĐẦY ĐỦ huy hiệu (mở + khóa) theo GM-009,
    /// id chuẩn hoá first-steps..., 401 khi token hỏng (GM-036).
    /// </summary>
    [Collection("AdminControllerTests")]
    public class BadgesControllerTests
    {
        static BadgesControllerTests()
        {
            TestJwtBuilder.EnsureConfigured();
        }

        private readonly List<Badge> _catalog = new()
        {
            new Badge("First Steps", "Hoàn thành bài trắc nghiệm đầu tiên", "🎯", "#22c55e", "{ 'quizCompleted': 1 }"),
            new Badge("Sorting Wizard", "Hoàn thành 4 thuật toán sắp xếp", "⚡", "#3b82f6", "{ 'sortingCompleted': 4 }"),
        };

        private (BadgesController Controller, Mock<IUnitOfWork> Uow, Mock<IGamificationService> Gam, User User) Create(
            List<Guid> earnedBadgeIds, bool withAuth = true)
        {
            var uow = new Mock<IUnitOfWork>();
            var gam = new Mock<IGamificationService>();

            var badgeRepo = new Mock<IRepository<Badge>>();
            badgeRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(_catalog);
            uow.Setup(u => u.Badges).Returns(badgeRepo.Object);

            var user = new User("badge@test.dev", "badgeuser", "hashed");
            var userRepo = new Mock<IUserRepository>();
            foreach (var badgeId in earnedBadgeIds)
            {
                user.UserBadges.Add(new UserBadge(user.Id, badgeId));
            }
            userRepo.Setup(r => r.GetByIdWithDetailsAsync(user.Id, It.IsAny<bool>())).ReturnsAsync(user);
            uow.Setup(u => u.Users).Returns(userRepo.Object);

            gam.Setup(g => g.CheckAndAwardBadgesAsync(It.IsAny<Guid>()))
               .ReturnsAsync(Array.Empty<Badge>());

            var controller = new BadgesController(uow.Object, gam.Object);
            var httpContext = new DefaultHttpContext();
            if (withAuth)
            {
                httpContext.Request.Headers["Authorization"] = $"Bearer {TestJwtBuilder.BuildToken(user.Id.ToString(), "Student")}";
            }
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
            return (controller, uow, gam, user);
        }

        [Fact]
        public async Task GetAll_ReturnsAllBadges_AllowAnonymous()
        {
            var (controller, _, _, _) = Create(new List<Guid>(), withAuth: false);

            var result = await controller.GetAll();
            var ok = result.Result.Should().BeOfType<OkObjectResult>().Subject;

            var badges = ((IEnumerable<Badge>)ok.Value!).ToList();
            badges.Should().HaveCount(2);
        }

        [Fact]
        public async Task GetMyBadges_ReturnsFullCatalog_WithUnlockStatus()
        {
            var (controller, _, _, _) = Create(new List<Guid> { _catalog[0].Id });

            var result = await controller.GetMyBadges();
            var ok = result.Result.Should().BeOfType<OkObjectResult>().Subject;

            var badges = ((IEnumerable<BadgeStatusDto>)ok.Value!).ToList();
            badges.Should().HaveCount(2, "phải trả danh sách ĐẦY ĐỦ (mở + khóa) — GM-009");
            var firstSteps = badges.Single(b => b.Name == "First Steps");
            firstSteps.Id.Should().Be("first-steps", "id phải chuẩn hoá theo backend (GM-009)");
            firstSteps.IsUnlocked.Should().BeTrue();
            firstSteps.EarnedAt.Should().NotBeNull();
            badges.Single(b => b.Name == "Sorting Wizard").IsUnlocked.Should().BeFalse();
            badges.Single(b => b.Name == "Sorting Wizard").EarnedAt.Should().BeNull();
        }

        [Fact]
        public async Task CheckNewBadges_ReturnsFullCatalog_NewBadgeUnlocked()
        {
            var (controller, _, gam, user) = Create(new List<Guid>());

            // Mô phỏng service vừa trao "First Steps" — thêm badge vào user trong cùng DbContext
            // (hành vi thật của CheckAndAwardBadgesAsync: mutate UserBadges rồi commit).
            gam.Setup(g => g.CheckAndAwardBadgesAsync(It.IsAny<Guid>()))
               .Callback<Guid>(_ => user.UserBadges.Add(new UserBadge(user.Id, _catalog[0].Id)))
               .ReturnsAsync(new[] { _catalog[0] });

            var result = await controller.CheckNewBadges();
            var ok = result.Result.Should().BeOfType<OkObjectResult>().Subject;

            var badges = ((IEnumerable<BadgeStatusDto>)ok.Value!).ToList();
            badges.Should().HaveCount(2, "sau khi check phải trả danh sách ĐẦY ĐỦ (GM-009)");
            badges.Single(b => b.Name == "First Steps").IsUnlocked.Should().BeTrue();
            badges.Single(b => b.Name == "Sorting Wizard").IsUnlocked.Should().BeFalse();
        }

        [Fact]
        public async Task GetMyBadges_InvalidToken_Returns401()
        {
            var (controller, _, _, _) = Create(new List<Guid>());
            controller.Request.Headers["Authorization"] = $"Bearer {TestJwtBuilder.BuildToken("not-a-guid", "Student")}";

            var result = await controller.GetMyBadges();
            result.Result.Should().BeOfType<UnauthorizedObjectResult>();
        }
    }
}
