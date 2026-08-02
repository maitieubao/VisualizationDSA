using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using VisualizationDSA.Application.Features.Codelabs.Commands;
using VisualizationDSA.Application.Features.Codelabs.Queries;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Infrastructure.Data;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Codelabs
{
    public class CodelabCrudCommandHandlerTests
    {
        private static ApplicationDbContext CreateDb()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new ApplicationDbContext(options);
        }

        [Fact]
        public async Task CreateCodelab_WithChildren_ShouldPersistEverything()
        {
            var db = CreateDb();
            var handler = new CreateCodelabCommandHandler(db);

            var id = await handler.Handle(new CreateCodelabCommand
            {
                Title = "Bubble Sort",
                Description = "Sort array",
                InitialCode = "print('x')",
                Difficulty = 1,
                XPReward = 100,
                AllowedLanguages = "python,csharp",
                TestCases =
                {
                    new CreateCodelabTestCaseItem { Input = "5 2", ExpectedOutput = "2 5", OrderIndex = 0 },
                    new CreateCodelabTestCaseItem { Input = "3 1 2", ExpectedOutput = "1 2 3", OrderIndex = 1, IsHidden = true }
                },
                Templates =
                {
                    new CreateCodelabTemplateItem { Language = "python", StarterCode = "import sys\nprint('todo')" }
                },
                Hints =
                {
                    new CreateCodelabHintItem { Content = "Compare adjacent", IsTiered = true, XpCost = 5, OrderIndex = 0 }
                }
            }, CancellationToken.None);

            id.Should().NotBeEmpty();

            var saved = await db.Codelabs
                .Include(c => c.TestCases)
                .Include(c => c.Templates)
                .Include(c => c.Hints)
                .FirstAsync(c => c.Id == id);

            saved.Title.Should().Be("Bubble Sort");
            saved.TestCases.Count.Should().Be(2);
            saved.TestCases.Count(tc => tc.IsHidden).Should().Be(1);
            saved.Templates.Count.Should().Be(1);
            saved.Templates.First().Language.Should().Be("python");
            saved.Hints.Count.Should().Be(1);
            saved.Hints.First().XpCost.Should().Be(5);
        }

        [Fact]
        public async Task UpdateCodelab_WithChildren_ShouldReplaceChildren()
        {
            var db = CreateDb();
            var codelab = new Codelab("Old", "Desc", "code", 1, 50);
            codelab.TestCases.Add(new CodelabTestCase(codelab.Id, "1", "1", false, 1, 0));
            db.Codelabs.Add(codelab);
            await db.SaveChangesAsync();

            var handler = new UpdateCodelabCommandHandler(db);
            await handler.Handle(new UpdateCodelabCommand
            {
                CodelabId = codelab.Id,
                Title = "New Title",
                Description = "New Desc",
                InitialCode = "new code",
                Difficulty = 2,
                XPReward = 200,
                MaxRuntimeMs = 3000,
                MaxMemoryBytes = 256000000,
                AllowedLanguages = "python",
                TestCases = new System.Collections.Generic.List<CreateCodelabTestCaseItem>
                {
                    new CreateCodelabTestCaseItem { Input = "9 1", ExpectedOutput = "1 9", OrderIndex = 0 }
                },
                Templates = new System.Collections.Generic.List<CreateCodelabTemplateItem>(),
                Hints = new System.Collections.Generic.List<CreateCodelabHintItem>()
            }, CancellationToken.None);

            var saved = await db.Codelabs
                .Include(c => c.TestCases)
                .Include(c => c.Templates)
                .Include(c => c.Hints)
                .FirstAsync(c => c.Id == codelab.Id);

            saved.Title.Should().Be("New Title");
            saved.Difficulty.Should().Be(2);
            saved.TestCases.Count.Should().Be(1);
            saved.TestCases.First().Input.Should().Be("9 1");
            saved.Templates.Should().BeEmpty();
            saved.Hints.Should().BeEmpty();
        }

        [Fact]
        public async Task DeleteCodelab_ShouldSoftDeleteAndRemoveChildren()
        {
            var db = CreateDb();
            var codelab = new Codelab("X", "Desc", "code", 1, 50);
            codelab.TestCases.Add(new CodelabTestCase(codelab.Id, "1", "1", false, 1, 0));
            codelab.Hints.Add(new CodelabHint(codelab.Id, "hint", false, 0, 0));
            db.Codelabs.Add(codelab);
            await db.SaveChangesAsync();

            var handler = new DeleteCodelabCommandHandler(db);
            await handler.Handle(new DeleteCodelabCommand { CodelabId = codelab.Id }, CancellationToken.None);

            (await db.Codelabs.IgnoreQueryFilters().CountAsync(c => c.Id == codelab.Id)).Should().Be(1);
            (await db.Codelabs.CountAsync(c => c.Id == codelab.Id)).Should().Be(0);
            (await db.CodelabTestCases.CountAsync()).Should().Be(0);
            (await db.CodelabHints.CountAsync()).Should().Be(0);
        }

        [Fact]
        public async Task AddTestCase_ShouldCreateTestcase()
        {
            var db = CreateDb();
            var codelab = new Codelab("X", "Desc", "code", 1, 50);
            db.Codelabs.Add(codelab);
            await db.SaveChangesAsync();

            var handler = new AddTestCaseCommandHandler(db);
            var tcId = await handler.Handle(new AddTestCaseCommand
            {
                CodelabId = codelab.Id,
                Input = "2 3",
                ExpectedOutput = "5",
                OrderIndex = 0
            }, CancellationToken.None);

            tcId.Should().NotBeEmpty();
            (await db.CodelabTestCases.CountAsync()).Should().Be(1);
        }

        [Fact]
        public async Task RevealHint_WithXpCost_ShouldDeductUserXp()
        {
            var db = CreateDb();
            var user = new User("a@a.com", "student", "hash");
            user.AwardXP(100);
            db.Users.Add(user);

            var codelab = new Codelab("X", "Desc", "code", 1, 50);
            codelab.Hints.Add(new CodelabHint(codelab.Id, "Secret hint", true, 20, 0));
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
            result.Content.Should().Be("Secret hint");
            result.RemainingXp.Should().Be(80);

            var updatedUser = await db.Users.FindAsync(user.Id);
            updatedUser!.TotalXP.Should().Be(80);
        }

        [Fact]
        public async Task RevealHint_WithInsufficientXp_ShouldFail()
        {
            var db = CreateDb();
            var user = new User("b@b.com", "student2", "hash");
            user.AwardXP(10);
            db.Users.Add(user);

            var codelab = new Codelab("X", "Desc", "code", 1, 50);
            codelab.Hints.Add(new CodelabHint(codelab.Id, "Expensive hint", true, 50, 0));
            db.Codelabs.Add(codelab);
            await db.SaveChangesAsync();

            var handler = new RevealHintCommandHandler(db);
            var result = await handler.Handle(new RevealHintCommand
            {
                UserId = user.Id,
                CodelabId = codelab.Id,
                HintIndex = 0
            }, CancellationToken.None);

            result.Success.Should().BeFalse();
            result.Message.Should().Contain("XP");

            var updatedUser = await db.Users.FindAsync(user.Id);
            updatedUser!.TotalXP.Should().Be(10);
        }

        [Fact]
        public async Task GetCodelabs_ShouldFilterAndCountTestCases()
        {
            var db = CreateDb();
            var c1 = new Codelab("Bubble Sort", "sorting", "code", 1, 50, allowedLanguages: "python");
            c1.TestCases.Add(new CodelabTestCase(c1.Id, "1", "1", false, 1, 0));
            var c2 = new Codelab("Quick Sort", "sorting", "code", 2, 80, allowedLanguages: "csharp");
            c2.TestCases.Add(new CodelabTestCase(c2.Id, "1", "1", false, 1, 0));
            c2.TestCases.Add(new CodelabTestCase(c2.Id, "2", "2", true, 1, 1));
            db.Codelabs.AddRange(c1, c2);
            await db.SaveChangesAsync();

            var handler = new GetCodelabsQueryHandler(db);
            var all = await handler.Handle(new GetCodelabsQuery(), CancellationToken.None);
            all.Count.Should().Be(2);

            var filtered = await handler.Handle(new GetCodelabsQuery { Difficulty = 1 }, CancellationToken.None);
            filtered.Count.Should().Be(1);
            filtered[0].Title.Should().Be("Bubble Sort");

            var byLang = await handler.Handle(new GetCodelabsQuery { Language = "csharp" }, CancellationToken.None);
            byLang.Count.Should().Be(1);
            byLang[0].TestCaseCount.Should().Be(2);
        }

        [Fact]
        public async Task GetCodelabById_ShouldReturnFullDetail()
        {
            var db = CreateDb();
            var codelab = new Codelab("X", "Desc", "code", 1, 50, constraints: "N<=10", examples: "[{\"input\":\"1\",\"expectedOutput\":\"1\"}]", tags: "array");
            codelab.TestCases.Add(new CodelabTestCase(codelab.Id, "1", "1", false, 1, 0));
            codelab.Templates.Add(new CodelabTemplate(codelab.Id, "python", "print('todo')"));
            codelab.Hints.Add(new CodelabHint(codelab.Id, "Hint 1", true, 5, 0));
            db.Codelabs.Add(codelab);
            await db.SaveChangesAsync();

            var handler = new GetCodelabByIdQueryHandler(db);
            var detail = await handler.Handle(new GetCodelabByIdQuery { CodelabId = codelab.Id }, CancellationToken.None);

            detail.Constraints.Should().Be("N<=10");
            detail.TestCases.Count.Should().Be(1);
            detail.Templates.Count.Should().Be(1);
            detail.Templates[0].StarterCode.Should().Be("print('todo')");
            detail.Hints.Count.Should().Be(1);
            detail.Hints[0].IsTiered.Should().BeTrue();
        }
    }
}

