using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.UnitTests.Common;
using VisualizationDSA.WebApi.Controllers;
using Xunit;

namespace VisualizationDSA.UnitTests.Services
{
    /// <summary>
    /// F4 (FR-2.5) — Tìm kiếm bài học:
    /// GET /concepts/lessons?search= lọc Title case-insensitive (Contains);
    /// không có search → trả đủ danh sách (hành vi cũ không đổi).
    /// </summary>
    [Collection("LessonSearchTests")]
    public class LessonSearchTests
    {
        private static (LessonController Controller, ApplicationDbContext Db) Create()
        {
            var ctx = TestDbContextFactory.CreateSimple($"lessonsearch-{Guid.NewGuid():N}");
            var controller = new LessonController(ctx, new NoopProgressRuleEngine());
            controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };
            return (controller, ctx);
        }

        private static Lesson AddLesson(ApplicationDbContext db, string title)
        {
            var lesson = new Lesson(title, "content", "dsa", "{}", 10, null, null, LessonPublishStatus.Published);
            db.Lessons.Add(lesson);
            db.SaveChanges();
            return lesson;
        }

        private static JsonDocument ParseList(IActionResult result)
        {
            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            return JsonDocument.Parse(JsonSerializer.Serialize(
                ok.Value, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
        }

        [Fact]
        public async Task Search_FiltersByTitle_CaseInsensitive()
        {
            var (controller, db) = Create();
            AddLesson(db, "Thuật toán sắp xếp nổi bọt");
            AddLesson(db, "Cấu trúc dữ liệu ngăn xếp");
            AddLesson(db, "SẮP XẾP CHÈN");

            var result = await controller.SearchLessons("sắp xếp");

            using var doc = ParseList(result);
            var titles = doc.RootElement.EnumerateArray()
                .Select(e => e.GetProperty("title").GetString())
                .ToList();
            titles.Should().BeEquivalentTo(new[]
            {
                "Thuật toán sắp xếp nổi bọt",
                "SẮP XẾP CHÈN"
            });
        }

        [Fact]
        public async Task Search_NullOrBlank_ReturnsAllLessons()
        {
            var (controller, db) = Create();
            AddLesson(db, "Bài A");
            AddLesson(db, "Bài B");

            var result = await controller.SearchLessons(null);

            using var doc = ParseList(result);
            var titles = doc.RootElement.EnumerateArray()
                .Select(e => e.GetProperty("title").GetString())
                .ToList();
            titles.Should().BeEquivalentTo(new[] { "Bài A", "Bài B" });

            var blank = await controller.SearchLessons("   ");
            using var blankDoc = ParseList(blank);
            blankDoc.RootElement.GetArrayLength().Should().Be(2);
        }

        [Fact]
        public async Task Search_ExcludesSoftDeletedLessons()
        {
            var (controller, db) = Create();
            var kept = AddLesson(db, "Bài giữ lại");
            var removed = AddLesson(db, "Bài đã xóa");
            removed.Delete();
            db.SaveChanges();

            var result = await controller.SearchLessons("Bài");

            using var doc = ParseList(result);
            var titles = doc.RootElement.EnumerateArray()
                .Select(e => e.GetProperty("title").GetString())
                .ToList();
            titles.Should().ContainSingle().And.Contain("Bài giữ lại");
        }

        private sealed class NoopProgressRuleEngine : IProgressRuleEngine
        {
            public Task<bool> CanUnlockNextItemAsync(Guid userId, Guid currentModuleItemId)
                => Task.FromResult(true);

            public Task ProcessCompletionAsync(Guid userId, Guid moduleItemId)
                => Task.CompletedTask;
        }
    }
}
