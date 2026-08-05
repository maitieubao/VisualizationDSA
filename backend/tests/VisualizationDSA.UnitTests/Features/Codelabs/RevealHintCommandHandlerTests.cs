using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Features.Codelabs.Commands;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Codelabs
{
    /// <summary>
    /// Bao phủ các edge case còn thiếu của RevealHintCommandHandler:
    /// not-found codelab/hint/user, hint miễn phí, thứ tự hint theo OrderIndex.
    /// </summary>
    public class RevealHintCommandHandlerTests
    {
        private static ApplicationDbContext CreateDb()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new ApplicationDbContext(options);
        }

        [Fact]
        public async Task Handle_GivenMissingCodelab_ShouldReturnFailure()
        {
            var db = CreateDb();
            var handler = new RevealHintCommandHandler(db);

            var result = await handler.Handle(new RevealHintCommand
            {
                UserId = Guid.NewGuid(),
                CodelabId = Guid.NewGuid(),
                HintIndex = 0
            }, CancellationToken.None);

            result.Success.Should().BeFalse();
            result.Message.Should().Be("Codelab not found.");
        }

        [Fact]
        public async Task Handle_GivenNegativeHintIndex_ShouldReturnFailure()
        {
            var db = CreateDb();
            var codelab = new Codelab("X", "Desc", "code", 1, 50);
            codelab.Hints.Add(new CodelabHint(codelab.Id, "h", false, 0, 0));
            db.Codelabs.Add(codelab);
            await db.SaveChangesAsync();

            var handler = new RevealHintCommandHandler(db);
            var result = await handler.Handle(new RevealHintCommand
            {
                UserId = Guid.NewGuid(),
                CodelabId = codelab.Id,
                HintIndex = -1
            }, CancellationToken.None);

            result.Success.Should().BeFalse();
            result.Message.Should().Be("Hint not found.");
        }

        [Fact]
        public async Task Handle_GivenOutOfRangeHintIndex_ShouldReturnFailure()
        {
            var db = CreateDb();
            var codelab = new Codelab("X", "Desc", "code", 1, 50);
            codelab.Hints.Add(new CodelabHint(codelab.Id, "h", false, 0, 0));
            db.Codelabs.Add(codelab);
            await db.SaveChangesAsync();

            var handler = new RevealHintCommandHandler(db);
            var result = await handler.Handle(new RevealHintCommand
            {
                UserId = Guid.NewGuid(),
                CodelabId = codelab.Id,
                HintIndex = 5
            }, CancellationToken.None);

            result.Success.Should().BeFalse();
            result.Message.Should().Be("Hint not found.");
        }

        [Fact]
        public async Task Handle_GivenMissingUser_ShouldReturnFailure()
        {
            var db = CreateDb();
            var codelab = new Codelab("X", "Desc", "code", 1, 50);
            codelab.Hints.Add(new CodelabHint(codelab.Id, "h", false, 0, 0));
            db.Codelabs.Add(codelab);
            await db.SaveChangesAsync();

            var handler = new RevealHintCommandHandler(db);
            var result = await handler.Handle(new RevealHintCommand
            {
                UserId = Guid.NewGuid(),
                CodelabId = codelab.Id,
                HintIndex = 0
            }, CancellationToken.None);

            result.Success.Should().BeFalse();
            result.Message.Should().Be("User not found.");
        }

        [Fact]
        public async Task Handle_GivenFreeHint_ShouldRevealWithoutXpChange()
        {
            var db = CreateDb();
            var user = new User("free@test.com", "student", "hash");
            user.AwardXP(200);
            db.Users.Add(user);

            var codelab = new Codelab("X", "Desc", "code", 1, 50);
            codelab.Hints.Add(new CodelabHint(codelab.Id, "Free hint", false, 0, 0));
            db.Codelabs.Add(codelab);
            await db.SaveChangesAsync();

            var handler = new RevealHintCommandHandler(db);
            var result = await handler.Handle(new RevealHintCommand
            {
                UserId = user.Id,
                CodelabId = codelab.Id,
                HintIndex = 0
            }, CancellationToken.None);

            result.Success.Should().BeTrue();
            result.XpCost.Should().Be(0);
            result.RemainingXp.Should().Be(200);
            result.Content.Should().Be("Free hint");
        }

        [Fact]
        public async Task Handle_GivenUnorderedHints_ShouldPickByOrderIndexNotInsertion()
        {
            var db = CreateDb();
            var user = new User("order@test.com", "student", "hash");
            user.AwardXP(1000);
            db.Users.Add(user);

            var codelab = new Codelab("X", "Desc", "code", 1, 50);
            codelab.Hints.Add(new CodelabHint(codelab.Id, "inserted-second", true, 10, 5));
            codelab.Hints.Add(new CodelabHint(codelab.Id, "inserted-first", true, 10, 1));
            db.Codelabs.Add(codelab);
            await db.SaveChangesAsync();

            var handler = new RevealHintCommandHandler(db);
            var result = await handler.Handle(new RevealHintCommand
            {
                UserId = user.Id,
                CodelabId = codelab.Id,
                HintIndex = 0
            }, CancellationToken.None);

            result.Success.Should().BeTrue();
            result.Content.Should().Be("inserted-first");
        }
    }
}
