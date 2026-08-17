using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.UnitTests.Common;
using VisualizationDSA.WebApi.Controllers;
using Xunit;

namespace VisualizationDSA.UnitTests.Services
{
    /// <summary>
    /// F5 (FR-2.6) — Ghi chú bài học: upsert theo user + lesson (unique UserId+LessonId),
    /// GET/DELETE chỉ thao tác trên ghi chú của người dùng hiện tại.
    /// </summary>
    public class LessonNotesControllerTests
    {
        static LessonNotesControllerTests()
        {
            TestJwtBuilder.EnsureConfigured();
        }

        private static (LessonNotesController Controller, F567TestDbContext Db, User User, Lesson Lesson) Create()
        {
            var (db, _) = F567TestDbContext.Create();
            var user = new User("note-user@test.dev", "noteuser", "hash");
            var lesson = new Lesson("Bài Bubble Sort", "content", "dsa", "{}", 10);
            db.Users.Add(user);
            db.Lessons.Add(lesson);
            db.SaveChanges();

            var controller = new LessonNotesController(db);
            SetUser(controller, user.Id);
            return (controller, db, user, lesson);
        }

        private static void SetUser(LessonNotesController controller, Guid userId)
        {
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = $"Bearer {TestJwtBuilder.BuildToken(userId.ToString(), "Student")}";
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
        }

        [Fact]
        public async Task Upsert_CreatesThenUpdates_WithoutDuplicate()
        {
            var (controller, db, user, lesson) = Create();

            var create = await controller.UpsertNote(lesson.Id, new UpsertLessonNoteDto("<p>Ghi chú đầu</p>"));
            create.Should().BeOfType<OkObjectResult>();
            db.Set<LessonNote>().Count(n => n.UserId == user.Id && n.LessonId == lesson.Id).Should().Be(1);

            var update = await controller.UpsertNote(lesson.Id, new UpsertLessonNoteDto("<p>Ghi chú đã sửa</p>"));
            update.Should().BeOfType<OkObjectResult>();
            var notes = db.Set<LessonNote>().Where(n => n.UserId == user.Id && n.LessonId == lesson.Id).ToList();
            notes.Should().ContainSingle();
            notes[0].ContentHtml.Should().Be("<p>Ghi chú đã sửa</p>");
        }

        [Fact]
        public async Task GetNote_ReturnsOnlyCurrentUsersNote()
        {
            var (controller, db, user, lesson) = Create();
            var otherUser = new User("other@test.dev", "other", "hash");
            db.Users.Add(otherUser);
            db.SaveChanges();

            db.Set<LessonNote>().Add(new LessonNote(otherUser.Id, lesson.Id, "<p>Của người khác</p>"));
            db.Set<LessonNote>().Add(new LessonNote(user.Id, lesson.Id, "<p>Của tôi</p>"));
            db.SaveChanges();

            var result = await controller.GetNote(lesson.Id);
            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            using var doc = JsonDocument.Parse(JsonSerializer.Serialize(ok.Value, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
            doc.RootElement.GetProperty("note").GetProperty("contentHtml").GetString().Should().Be("<p>Của tôi</p>");
        }

        [Fact]
        public async Task Delete_RemovesOnlyCurrentUsersNote()
        {
            var (controller, db, user, lesson) = Create();
            var otherUser = new User("other2@test.dev", "other2", "hash");
            db.Users.Add(otherUser);
            db.SaveChanges();

            db.Set<LessonNote>().Add(new LessonNote(otherUser.Id, lesson.Id, "<p>Người khác</p>"));
            db.Set<LessonNote>().Add(new LessonNote(user.Id, lesson.Id, "<p>Của tôi</p>"));
            db.SaveChanges();

            var result = await controller.DeleteNote(lesson.Id);
            result.Should().BeOfType<OkObjectResult>();
            db.Set<LessonNote>().Count(n => n.UserId == user.Id && n.LessonId == lesson.Id).Should().Be(0);
            db.Set<LessonNote>().Count(n => n.UserId == otherUser.Id && n.LessonId == lesson.Id).Should().Be(1);
        }

        [Fact]
        public async Task Upsert_OnMissingLesson_ReturnsNotFound()
        {
            var (controller, db, user, _) = Create();
            var missingLessonId = Guid.NewGuid();

            var result = await controller.UpsertNote(missingLessonId, new UpsertLessonNoteDto("<p>Ghi chú</p>"));

            var notFound = result.Should().BeOfType<NotFoundObjectResult>().Subject;
            using var doc = JsonDocument.Parse(JsonSerializer.Serialize(notFound.Value, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
            doc.RootElement.GetProperty("error").GetString().Should().Be("LESSON_NOT_FOUND");
            db.Set<LessonNote>().Count(n => n.UserId == user.Id).Should().Be(0);
        }
    }
}
