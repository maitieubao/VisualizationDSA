using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Features.Codelabs.Queries;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Codelabs
{
    /// <summary>
    /// Bao phủ 3 query handlers: GetCodelabsQuery (search/tag/pagination/ordering/soft-delete),
    /// GetCodelabByIdQuery (detail + not-found), GetCodelabDetailsQuery (examples parse + hints/templates mapping).
    /// </summary>
    public class CodelabQueryHandlerTests
    {
        private static ApplicationDbContext CreateDb()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new ApplicationDbContext(options);
        }

        [Fact]
        public async Task GetCodelabs_GivenSearch_ShouldMatchTitleDescriptionAndTags()
        {
            var db = CreateDb();
            db.Codelabs.AddRange(
                new Codelab("Two Sum", "find pair in array", "code", 1, 50, tags: "array,hashmap"),
                new Codelab("Binary Search", "find value", "code", 2, 80, tags: "search"),
                new Codelab("Other", "nothing here", "code", 1, 50, tags: "x"));
            await db.SaveChangesAsync();

            var handler = new GetCodelabsQueryHandler(db);

            var byTitle = await handler.Handle(new GetCodelabsQuery { Search = "Two Sum" }, CancellationToken.None);
            byTitle.Count.Should().Be(1);
            byTitle[0].Title.Should().Be("Two Sum");

            var byDescription = await handler.Handle(new GetCodelabsQuery { Search = "find pair" }, CancellationToken.None);
            byDescription.Count.Should().Be(1);
            byDescription[0].Title.Should().Be("Two Sum");

            var byTags = await handler.Handle(new GetCodelabsQuery { Search = "hashmap" }, CancellationToken.None);
            byTags.Count.Should().Be(1);
        }

        [Fact]
        public async Task GetCodelabs_GivenTagFilter_ShouldFilter()
        {
            var db = CreateDb();
            db.Codelabs.AddRange(
                new Codelab("A", "d", "code", 1, 50, tags: "array"),
                new Codelab("B", "d", "code", 1, 50, tags: "graph"),
                new Codelab("C", "d", "code", 1, 50, tags: "array,graph"));
            await db.SaveChangesAsync();

            var handler = new GetCodelabsQueryHandler(db);
            var result = await handler.Handle(new GetCodelabsQuery { Tag = "graph" }, CancellationToken.None);

            result.Count.Should().Be(2);
            result.Select(c => c.Title).Should().Contain(new[] { "B", "C" });
        }

        [Fact]
        public async Task GetCodelabs_GivenPagination_ShouldPageAndClamp()
        {
            var db = CreateDb();
            for (var i = 0; i < 5; i++)
            {
                db.Codelabs.Add(new Codelab($"Codelab {i}", "d", "code", 1, 50));
            }
            await db.SaveChangesAsync();

            var handler = new GetCodelabsQueryHandler(db);

            var page1 = await handler.Handle(new GetCodelabsQuery { Page = 1, PageSize = 2 }, CancellationToken.None);
            page1.Count.Should().Be(2);

            var page2 = await handler.Handle(new GetCodelabsQuery { Page = 2, PageSize = 2 }, CancellationToken.None);
            page2.Count.Should().Be(2);
            page2.Select(c => c.Id).Should().NotIntersectWith(page1.Select(c => c.Id));

            var page3 = await handler.Handle(new GetCodelabsQuery { Page = 3, PageSize = 2 }, CancellationToken.None);
            page3.Count.Should().Be(1);

            var clampedSize = await handler.Handle(new GetCodelabsQuery { PageSize = 500 }, CancellationToken.None);
            clampedSize.Count.Should().Be(5);

            var clampedPage = await handler.Handle(new GetCodelabsQuery { Page = -5, PageSize = 10 }, CancellationToken.None);
            clampedPage.Count.Should().Be(5);

            var tinySize = await handler.Handle(new GetCodelabsQuery { PageSize = 0 }, CancellationToken.None);
            tinySize.Count.Should().Be(1);
        }

        [Fact]
        public async Task GetCodelabs_GivenMultipleFilters_ShouldCombine()
        {
            var db = CreateDb();
            db.Codelabs.AddRange(
                new Codelab("Bubble", "sorting algorithm", "code", 1, 50, allowedLanguages: "python,csharp", tags: "sort"),
                new Codelab("Quick", "sorting algorithm", "code", 1, 50, allowedLanguages: "python", tags: "sort"),
                new Codelab("Dijkstra", "graph", "code", 3, 90, allowedLanguages: "java", tags: "graph"));
            await db.SaveChangesAsync();

            var handler = new GetCodelabsQueryHandler(db);
            var result = await handler.Handle(new GetCodelabsQuery
            {
                Search = "sort",
                Difficulty = 1,
                Language = "csharp"
            }, CancellationToken.None);

            result.Count.Should().Be(1);
            result[0].Title.Should().Be("Bubble");
        }

        [Fact]
        public async Task GetCodelabs_GivenSoftDeleted_ShouldExclude()
        {
            var db = CreateDb();
            var live = new Codelab("Live", "d", "code", 1, 50);
            var deleted = new Codelab("Deleted", "d", "code", 1, 50);
            deleted.Delete();
            db.Codelabs.AddRange(live, deleted);
            await db.SaveChangesAsync();

            var handler = new GetCodelabsQueryHandler(db);
            var result = await handler.Handle(new GetCodelabsQuery(), CancellationToken.None);

            result.Count.Should().Be(1);
            result[0].Title.Should().Be("Live");
        }

        [Fact]
        public async Task GetCodelabById_GivenMissing_ShouldThrow()
        {
            var db = CreateDb();
            var handler = new GetCodelabByIdQueryHandler(db);

            var act = async () => await handler.Handle(new GetCodelabByIdQuery { CodelabId = Guid.NewGuid() }, CancellationToken.None);

            await act.Should().ThrowAsync<ArgumentException>()
                .WithMessage("Codelab not found.");
        }

        [Fact]
        public async Task GetCodelabById_ShouldOrderChildrenByOrderIndex()
        {
            var db = CreateDb();
            var codelab = new Codelab("X", "Desc", "code", 1, 50);
            codelab.TestCases.Add(new CodelabTestCase(codelab.Id, "z", "z", false, 1, 5));
            codelab.TestCases.Add(new CodelabTestCase(codelab.Id, "a", "a", false, 1, 0));
            codelab.Hints.Add(new CodelabHint(codelab.Id, "later", false, 0, 9));
            codelab.Hints.Add(new CodelabHint(codelab.Id, "first", false, 0, 1));
            db.Codelabs.Add(codelab);
            await db.SaveChangesAsync();

            var handler = new GetCodelabByIdQueryHandler(db);
            var detail = await handler.Handle(new GetCodelabByIdQuery { CodelabId = codelab.Id }, CancellationToken.None);

            detail.TestCases.Select(tc => tc.Input).Should().Equal("a", "z");
            detail.Hints.Select(h => h.Content).Should().Equal("first", "later");
        }

        [Fact]
        public async Task GetCodelabDetails_GivenValidExamples_ShouldParse()
        {
            var db = CreateDb();
            var codelab = new Codelab(
                "X", "Desc", "code", 1, 50,
                examples: "[{\"Input\":\"2 3\",\"ExpectedOutput\":\"5\"},{\"Input\":\"1\",\"ExpectedOutput\":\"1\"}]",
                tags: "math");
            codelab.Templates.Add(new CodelabTemplate(codelab.Id, "python", "print(1)"));
            codelab.Hints.Add(new CodelabHint(codelab.Id, "hint-b", false, 3, 2));
            codelab.Hints.Add(new CodelabHint(codelab.Id, "hint-a", true, 1, 0));
            db.Codelabs.Add(codelab);
            await db.SaveChangesAsync();

            var handler = new GetCodelabDetailsQueryHandler(db);
            var dto = await handler.Handle(new GetCodelabDetailsQuery { CodelabId = codelab.Id }, CancellationToken.None);

            dto.Examples.Should().HaveCount(2);
            dto.Examples![0].Input.Should().Be("2 3");
            dto.Examples[1].ExpectedOutput.Should().Be("1");
            // Hint trả phí (XpCost > 0) KHÔNG được lộ Content qua GET — phải qua reveal-hint.
            dto.Hints.Select(h => h.Content).Should().Equal(string.Empty, string.Empty);
            dto.Hints[0].XpCost.Should().Be(1);
            dto.Hints[1].XpCost.Should().Be(3);
            dto.Templates.Should().HaveCount(1);
            dto.Templates[0].StarterCode.Should().Be("print(1)");
        }

        [Fact]
        public async Task GetCodelabDetails_GivenEmptyExamples_ShouldReturnNull()
        {
            var db = CreateDb();
            var codelab = new Codelab("X", "Desc", "code", 1, 50, examples: "");
            db.Codelabs.Add(codelab);
            await db.SaveChangesAsync();

            var handler = new GetCodelabDetailsQueryHandler(db);
            var dto = await handler.Handle(new GetCodelabDetailsQuery { CodelabId = codelab.Id }, CancellationToken.None);

            dto.Examples.Should().BeNull();
        }

        [Fact]
        public async Task GetCodelabDetails_GivenMalformedExamples_ShouldReturnNullNotThrow()
        {
            var db = CreateDb();
            var codelab = new Codelab("X", "Desc", "code", 1, 50, examples: "{not-json");
            db.Codelabs.Add(codelab);
            await db.SaveChangesAsync();

            var handler = new GetCodelabDetailsQueryHandler(db);
            var dto = await handler.Handle(new GetCodelabDetailsQuery { CodelabId = codelab.Id }, CancellationToken.None);

            dto.Examples.Should().BeNull();
        }

        [Fact]
        public async Task GetCodelabDetails_GivenMissing_ShouldThrow()
        {
            var db = CreateDb();
            var handler = new GetCodelabDetailsQueryHandler(db);

            var act = async () => await handler.Handle(new GetCodelabDetailsQuery { CodelabId = Guid.NewGuid() }, CancellationToken.None);

            await act.Should().ThrowAsync<ArgumentException>()
                .WithMessage("Codelab not found.");
        }
    }
}
