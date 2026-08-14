using System;
using System.Linq;
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
    /// Bao phủ toàn bộ 9 handlers con: Add/Update/Delete TestCase, Template, Hint
    /// — gồm cả nhánh thành công và nhánh not-found.
    /// </summary>
    public class CodelabChildCommandHandlerTests
    {
        private static ApplicationDbContext CreateDb()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new ApplicationDbContext(options);
        }

        // ==================== TestCase ====================

        [Fact]
        public async Task AddTestCase_GivenMissingCodelab_ShouldThrow()
        {
            var db = CreateDb();
            var handler = new AddTestCaseCommandHandler(db);

            var act = async () => await handler.Handle(new AddTestCaseCommand
            {
                CodelabId = Guid.NewGuid(),
                Input = "1",
                ExpectedOutput = "1"
            }, CancellationToken.None);

            await act.Should().ThrowAsync<ArgumentException>()
                .WithMessage("Codelab not found.");
        }

        [Fact]
        public async Task UpdateTestCase_ShouldUpdateAllFields()
        {
            var db = CreateDb();
            var codelab = new Codelab("X", "Desc", "code", 1, 50);
            var testCase = new CodelabTestCase(codelab.Id, "1", "1", false, 1, 0);
            codelab.TestCases.Add(testCase);
            db.Codelabs.Add(codelab);
            await db.SaveChangesAsync();

            var handler = new UpdateTestCaseCommandHandler(db);
            await handler.Handle(new UpdateTestCaseCommand
            {
                CodelabId = codelab.Id,
                TestCaseId = testCase.Id,
                Input = "9 9",
                ExpectedOutput = "18",
                IsHidden = true,
                ScoreWeight = 3,
                OrderIndex = 7
            }, CancellationToken.None);

            var saved = await db.CodelabTestCases.FindAsync(testCase.Id);
            saved!.Input.Should().Be("9 9");
            saved.ExpectedOutput.Should().Be("18");
            saved.IsHidden.Should().BeTrue();
            saved.ScoreWeight.Should().Be(3);
            saved.OrderIndex.Should().Be(7);
        }

        [Fact]
        public async Task UpdateTestCase_GivenMissing_ShouldThrow()
        {
            var db = CreateDb();
            var handler = new UpdateTestCaseCommandHandler(db);

            var act = async () => await handler.Handle(new UpdateTestCaseCommand
            {
                TestCaseId = Guid.NewGuid(),
                Input = "1",
                ExpectedOutput = "1"
            }, CancellationToken.None);

            await act.Should().ThrowAsync<ArgumentException>()
                .WithMessage("Test case not found.");
        }

        [Fact]
        public async Task DeleteTestCase_ShouldRemoveOnlyMatchingRow()
        {
            var db = CreateDb();
            var codelab = new Codelab("X", "Desc", "code", 1, 50);
            var toDelete = new CodelabTestCase(codelab.Id, "1", "1", false, 1, 0);
            var toKeep = new CodelabTestCase(codelab.Id, "2", "2", false, 1, 1);
            codelab.TestCases.Add(toDelete);
            codelab.TestCases.Add(toKeep);
            db.Codelabs.Add(codelab);
            await db.SaveChangesAsync();

            var handler = new DeleteTestCaseCommandHandler(db);
            await handler.Handle(new DeleteTestCaseCommand
            {
                CodelabId = codelab.Id,
                TestCaseId = toDelete.Id
            }, CancellationToken.None);

            (await db.CodelabTestCases.CountAsync()).Should().Be(1);
            (await db.CodelabTestCases.FindAsync(toKeep.Id)).Should().NotBeNull();
        }

        [Fact]
        public async Task DeleteTestCase_GivenWrongCodelabId_ShouldThrow()
        {
            var db = CreateDb();
            var codelab = new Codelab("X", "Desc", "code", 1, 50);
            var testCase = new CodelabTestCase(codelab.Id, "1", "1", false, 1, 0);
            codelab.TestCases.Add(testCase);
            db.Codelabs.Add(codelab);
            await db.SaveChangesAsync();

            var handler = new DeleteTestCaseCommandHandler(db);
            var act = async () => await handler.Handle(new DeleteTestCaseCommand
            {
                CodelabId = Guid.NewGuid(),
                TestCaseId = testCase.Id
            }, CancellationToken.None);

            await act.Should().ThrowAsync<ArgumentException>()
                .WithMessage("Test case not found.");
            (await db.CodelabTestCases.CountAsync()).Should().Be(1);
        }

        // ==================== Template ====================

        [Fact]
        public async Task AddTemplate_ShouldCreateTemplate()
        {
            var db = CreateDb();
            var codelab = new Codelab("X", "Desc", "code", 1, 50);
            db.Codelabs.Add(codelab);
            await db.SaveChangesAsync();

            var handler = new AddTemplateCommandHandler(db);
            var templateId = await handler.Handle(new AddTemplateCommand
            {
                CodelabId = codelab.Id,
                Language = "python",
                StarterCode = "def solve(): pass"
            }, CancellationToken.None);

            templateId.Should().NotBeEmpty();
            var saved = await db.CodelabTemplates.FindAsync(templateId);
            saved!.Language.Should().Be("python");
            saved.BoilerplateCode.Should().Be("def solve(): pass");
            saved.CodelabId.Should().Be(codelab.Id);
        }

        [Fact]
        public async Task AddTemplate_GivenMissingCodelab_ShouldThrow()
        {
            var db = CreateDb();
            var handler = new AddTemplateCommandHandler(db);

            var act = async () => await handler.Handle(new AddTemplateCommand
            {
                CodelabId = Guid.NewGuid(),
                Language = "python",
                StarterCode = "x"
            }, CancellationToken.None);

            await act.Should().ThrowAsync<ArgumentException>()
                .WithMessage("Codelab not found.");
        }

        [Fact]
        public async Task UpdateTemplate_ShouldUpdateLanguageAndCode()
        {
            var db = CreateDb();
            var codelab = new Codelab("X", "Desc", "code", 1, 50);
            var template = new CodelabTemplate(codelab.Id, "python", "old");
            codelab.Templates.Add(template);
            db.Codelabs.Add(codelab);
            await db.SaveChangesAsync();

            var handler = new UpdateTemplateCommandHandler(db);
            await handler.Handle(new UpdateTemplateCommand
            {
                CodelabId = codelab.Id,
                TemplateId = template.Id,
                Language = "csharp",
                StarterCode = "class Program {}"
            }, CancellationToken.None);

            var saved = await db.CodelabTemplates.FindAsync(template.Id);
            saved!.Language.Should().Be("csharp");
            saved.BoilerplateCode.Should().Be("class Program {}");
        }

        [Fact]
        public async Task UpdateTemplate_GivenMissing_ShouldThrow()
        {
            var db = CreateDb();
            var handler = new UpdateTemplateCommandHandler(db);

            var act = async () => await handler.Handle(new UpdateTemplateCommand
            {
                TemplateId = Guid.NewGuid(),
                Language = "python",
                StarterCode = "x"
            }, CancellationToken.None);

            await act.Should().ThrowAsync<ArgumentException>()
                .WithMessage("Template not found.");
        }

        [Fact]
        public async Task DeleteTemplate_ShouldRemoveRow()
        {
            var db = CreateDb();
            var codelab = new Codelab("X", "Desc", "code", 1, 50);
            var template = new CodelabTemplate(codelab.Id, "python", "code");
            codelab.Templates.Add(template);
            db.Codelabs.Add(codelab);
            await db.SaveChangesAsync();

            var handler = new DeleteTemplateCommandHandler(db);
            await handler.Handle(new DeleteTemplateCommand
            {
                CodelabId = codelab.Id,
                TemplateId = template.Id
            }, CancellationToken.None);

            (await db.CodelabTemplates.CountAsync()).Should().Be(0);
        }

        [Fact]
        public async Task DeleteTemplate_GivenMissing_ShouldThrow()
        {
            var db = CreateDb();
            var handler = new DeleteTemplateCommandHandler(db);

            var act = async () => await handler.Handle(new DeleteTemplateCommand
            {
                CodelabId = Guid.NewGuid(),
                TemplateId = Guid.NewGuid()
            }, CancellationToken.None);

            await act.Should().ThrowAsync<ArgumentException>()
                .WithMessage("Template not found.");
        }

        // ==================== Hint ====================

        [Fact]
        public async Task AddHint_ShouldCreateHint()
        {
            var db = CreateDb();
            var codelab = new Codelab("X", "Desc", "code", 1, 50);
            db.Codelabs.Add(codelab);
            await db.SaveChangesAsync();

            var handler = new AddHintCommandHandler(db);
            var hintId = await handler.Handle(new AddHintCommand
            {
                CodelabId = codelab.Id,
                Content = "Think simple",
                IsTiered = true,
                XpCost = 10,
                OrderIndex = 3
            }, CancellationToken.None);

            hintId.Should().NotBeEmpty();
            var saved = await db.CodelabHints.FindAsync(hintId);
            saved!.Content.Should().Be("Think simple");
            saved.IsTiered.Should().BeTrue();
            saved.XpCost.Should().Be(10);
            saved.OrderIndex.Should().Be(3);
        }

        [Fact]
        public async Task AddHint_GivenMissingCodelab_ShouldThrow()
        {
            var db = CreateDb();
            var handler = new AddHintCommandHandler(db);

            var act = async () => await handler.Handle(new AddHintCommand
            {
                CodelabId = Guid.NewGuid(),
                Content = "x"
            }, CancellationToken.None);

            await act.Should().ThrowAsync<ArgumentException>()
                .WithMessage("Codelab not found.");
        }

        [Fact]
        public async Task UpdateHint_ShouldUpdateAllFields()
        {
            var db = CreateDb();
            var codelab = new Codelab("X", "Desc", "code", 1, 50);
            var hint = new CodelabHint(codelab.Id, "old", false, 5, 0);
            codelab.Hints.Add(hint);
            db.Codelabs.Add(codelab);
            await db.SaveChangesAsync();

            var handler = new UpdateHintCommandHandler(db);
            await handler.Handle(new UpdateHintCommand
            {
                CodelabId = codelab.Id,
                HintId = hint.Id,
                Content = "new hint",
                IsTiered = true,
                XpCost = 20,
                OrderIndex = 9
            }, CancellationToken.None);

            var saved = await db.CodelabHints.FindAsync(hint.Id);
            saved!.Content.Should().Be("new hint");
            saved.IsTiered.Should().BeTrue();
            saved.XpCost.Should().Be(20);
            saved.OrderIndex.Should().Be(9);
        }

        [Fact]
        public async Task UpdateHint_GivenMissing_ShouldThrow()
        {
            var db = CreateDb();
            var handler = new UpdateHintCommandHandler(db);

            var act = async () => await handler.Handle(new UpdateHintCommand
            {
                HintId = Guid.NewGuid(),
                Content = "x"
            }, CancellationToken.None);

            await act.Should().ThrowAsync<ArgumentException>()
                .WithMessage("Hint not found.");
        }

        [Fact]
        public async Task DeleteHint_ShouldRemoveOnlyMatchingRow()
        {
            var db = CreateDb();
            var codelab = new Codelab("X", "Desc", "code", 1, 50);
            var toDelete = new CodelabHint(codelab.Id, "a", false, 0, 0);
            var toKeep = new CodelabHint(codelab.Id, "b", false, 0, 1);
            codelab.Hints.Add(toDelete);
            codelab.Hints.Add(toKeep);
            db.Codelabs.Add(codelab);
            await db.SaveChangesAsync();

            var handler = new DeleteHintCommandHandler(db);
            await handler.Handle(new DeleteHintCommand
            {
                CodelabId = codelab.Id,
                HintId = toDelete.Id
            }, CancellationToken.None);

            (await db.CodelabHints.CountAsync()).Should().Be(1);
            (await db.CodelabHints.FindAsync(toKeep.Id)).Should().NotBeNull();
        }

        [Fact]
        public async Task DeleteHint_GivenWrongCodelabId_ShouldThrow()
        {
            var db = CreateDb();
            var codelab = new Codelab("X", "Desc", "code", 1, 50);
            var hint = new CodelabHint(codelab.Id, "a", false, 0, 0);
            codelab.Hints.Add(hint);
            db.Codelabs.Add(codelab);
            await db.SaveChangesAsync();

            var handler = new DeleteHintCommandHandler(db);
            var act = async () => await handler.Handle(new DeleteHintCommand
            {
                CodelabId = Guid.NewGuid(),
                HintId = hint.Id
            }, CancellationToken.None);

            await act.Should().ThrowAsync<ArgumentException>()
                .WithMessage("Hint not found.");
        }
    }
}
