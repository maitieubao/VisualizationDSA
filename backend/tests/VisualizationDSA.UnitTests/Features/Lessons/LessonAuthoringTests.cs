using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Features.Lessons.Commands.CreateDraftLesson;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.UnitTests.Common;
using VisualizationDSA.WebApi.Controllers;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Lessons
{
    /// <summary>
    /// A1.1/A1.2 — Lesson Authoring Tool backend:
    /// CodelabId + PublishStatus qua CreateDraftLesson/UpdateLesson/GetLessonById,
    /// quyền sở hữu codelab và gate hiển thị bài Draft theo role.
    /// </summary>
    public class LessonAuthoringTests
    {
        private static string CreateToken(string userId, string role = "Teacher")
        {
            var header = JwtSigningConfig.Base64UrlEncode(Encoding.UTF8.GetBytes("{\"alg\":\"HS256\",\"typ\":\"JWT\"}"));
            var payloadJson = JsonSerializer.Serialize(new
            {
                sub = userId,
                role,
                iss = JwtSigningConfig.Issuer ?? "VisualizationDSA",
                aud = JwtSigningConfig.Audience ?? "VisualizationDSA-Client",
                exp = DateTimeOffset.UtcNow.AddMinutes(15).ToUnixTimeSeconds()
            });
            var payload = JwtSigningConfig.Base64UrlEncode(Encoding.UTF8.GetBytes(payloadJson));
            var signature = JwtSigningConfig.Base64UrlEncode(
                HMACSHA256.HashData(JwtSigningConfig.Key, Encoding.UTF8.GetBytes($"{header}.{payload}"))
            );
            return $"{header}.{payload}.{signature}";
        }

        private static Guid FixedId(string seed)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(seed));
            var guid = new byte[16];
            Array.Copy(bytes, guid, 16);
            return new Guid(guid);
        }

        private static void SetUserProperty(object entity, string property, Guid value)
        {
            entity.GetType().GetProperty(property)!.SetValue(entity, value);
        }

        private static (ApplicationDbContext Ctx, Guid TeacherId, Guid CourseId, Guid ModuleId) SeedCourse()
        {
            var ctx = TestDbContextFactory.CreateSimple("LA_" + Guid.NewGuid().ToString("N"));
            var teacherId = FixedId("teacher-a");
            var course = new Course(teacherId, "Course", "Desc", CourseCategory.Other, CourseDifficulty.Beginner, false, "");
            ctx.Courses.Add(course);
            ctx.SaveChanges();
            var module = new CourseModule(course.Id, "Module 1", "", 1000);
            ctx.CourseModules.Add(module);
            ctx.SaveChanges();
            return (ctx, teacherId, course.Id, module.Id);
        }

        private static LessonController CreateController(ApplicationDbContext ctx, string userId, string role = "Teacher")
        {
            var controller = new LessonController(ctx, Mock.Of<IProgressRuleEngine>());
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = $"Bearer {CreateToken(userId, role)}";
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
            return controller;
        }

        // ---------- A1.1: CreateDraftLesson + CodelabId ----------

        [Fact]
        public async Task CreateDraftLesson_WithOwnCodelab_RoundtripsCodelabIdAndPublishStatus()
        {
            var (ctx, teacherId, courseId, moduleId) = SeedCourse();
            var codelab = new Codelab("Sum Two", "Tính tổng", "int Solve() {}", 1, 20, ownerId: teacherId);
            ctx.Codelabs.Add(codelab);
            await ctx.SaveChangesAsync();

            var handler = new CreateDraftLessonCommandHandler(ctx);
            var lessonId = await handler.Handle(new CreateDraftLessonCommand
            {
                TeacherId = teacherId,
                CourseId = courseId,
                ModuleId = moduleId,
                Title = "Bài gắn codelab",
                CodelabId = codelab.Id,
                PublishStatus = "Private"
            }, CancellationToken.None);

            lessonId.Should().NotBeEmpty();
            var lesson = ctx.Lessons.Single(l => l.Id == lessonId);
            lesson.CodelabId.Should().Be(codelab.Id, "codelab của chính teacher phải được gắn và lưu roundtrip");
            lesson.PublishStatus.Should().Be(LessonPublishStatus.PrivateToClassroom, "PublishStatus='Private' phải map sang PrivateToClassroom");
        }

        [Fact]
        public async Task CreateDraftLesson_WithSharedCodelab_Allowed()
        {
            var (ctx, teacherId, courseId, moduleId) = SeedCourse();
            // OwnerId null = codelab dùng chung (seed/legacy) — mọi teacher được gắn.
            var sharedCodelab = new Codelab("Shared", "Mô tả", "int Solve() {}", 2, 30);
            ctx.Codelabs.Add(sharedCodelab);
            await ctx.SaveChangesAsync();

            var handler = new CreateDraftLessonCommandHandler(ctx);
            var lessonId = await handler.Handle(new CreateDraftLessonCommand
            {
                TeacherId = teacherId,
                CourseId = courseId,
                ModuleId = moduleId,
                Title = "Bài dùng codelab chung",
                CodelabId = sharedCodelab.Id
            }, CancellationToken.None);

            ctx.Lessons.Single(l => l.Id == lessonId).CodelabId.Should().Be(sharedCodelab.Id);
        }

        [Fact]
        public async Task CreateDraftLesson_CodelabOfAnotherTeacher_ThrowsUnauthorized()
        {
            var (ctx, teacherId, courseId, moduleId) = SeedCourse();
            var otherTeacherId = FixedId("teacher-b");
            var otherCodelab = new Codelab("Của thầy B", "Mô tả", "int Solve() {}", 3, 40, ownerId: otherTeacherId);
            ctx.Codelabs.Add(otherCodelab);
            await ctx.SaveChangesAsync();

            var handler = new CreateDraftLessonCommandHandler(ctx);
            var act = async () => await handler.Handle(new CreateDraftLessonCommand
            {
                TeacherId = teacherId,
                CourseId = courseId,
                ModuleId = moduleId,
                Title = "Bài",
                CodelabId = otherCodelab.Id
            }, CancellationToken.None);

            await act.Should().ThrowAsync<UnauthorizedAccessException>();
            ctx.Lessons.Count().Should().Be(0, "không được tạo bài khi codelab của teacher khác");
        }

        [Fact]
        public async Task CreateDraftLesson_CodelabNotFound_ThrowsArgumentException()
        {
            var (ctx, teacherId, courseId, moduleId) = SeedCourse();

            var handler = new CreateDraftLessonCommandHandler(ctx);
            var act = async () => await handler.Handle(new CreateDraftLessonCommand
            {
                TeacherId = teacherId,
                CourseId = courseId,
                ModuleId = moduleId,
                Title = "Bài",
                CodelabId = Guid.NewGuid()
            }, CancellationToken.None);

            await act.Should().ThrowAsync<ArgumentException>();
        }

        // ---------- A1.2: PublishStatus validation ----------

        [Fact]
        public async Task CreateDraftLesson_InvalidPublishStatus_ThrowsArgumentException()
        {
            var (ctx, teacherId, courseId, moduleId) = SeedCourse();

            var handler = new CreateDraftLessonCommandHandler(ctx);
            var act = async () => await handler.Handle(new CreateDraftLessonCommand
            {
                TeacherId = teacherId,
                CourseId = courseId,
                ModuleId = moduleId,
                Title = "Bài",
                PublishStatus = "Secret"
            }, CancellationToken.None);

            await act.Should().ThrowAsync<ArgumentException>();
        }

        [Fact]
        public void CreateDraftLessonValidator_InvalidPublishStatus_FailsValidation()
        {
            var command = new CreateDraftLessonCommand
            {
                TeacherId = Guid.NewGuid(),
                CourseId = Guid.NewGuid(),
                Title = "Bài",
                PublishStatus = "Secret"
            };

            var result = new CreateDraftLessonCommandValidator().Validate(command);
            result.IsValid.Should().BeFalse();
        }

        [Fact]
        public async Task UpdateLesson_InvalidPublishStatus_Returns400()
        {
            var (ctx, teacherId, courseId, _) = SeedCourse();
            var lesson = new Lesson("Bài", "Nội dung", "dsa", "{}", 20, teacherId);
            ctx.Lessons.Add(lesson);
            await ctx.SaveChangesAsync();
            ctx.ModuleItems.Add(new ModuleItem(
                ctx.CourseModules.Single().Id, null, ModuleItemType.Lesson, lesson.Id, null, null, "Bài", 1000, true));
            await ctx.SaveChangesAsync();

            var controller = CreateController(ctx, teacherId.ToString());
            var result = await controller.UpdateLesson(lesson.Id, new SaveDraftLessonDto
            {
                Title = "Bài",
                ContentMd = "Nội dung",
                SandboxType = "dsa",
                SandboxConfig = "{}",
                XPReward = 20,
                PublishStatus = "Secret"
            });

            result.Should().BeOfType<BadRequestObjectResult>();
            ctx.Entry(lesson).Reload();
            lesson.PublishStatus.Should().Be(LessonPublishStatus.Draft, "trạng thái không hợp lệ không được lưu");
        }

        [Fact]
        public async Task UpdateLesson_WithOwnCodelab_UpdatesLessonAndStatus()
        {
            var (ctx, teacherId, _, _) = SeedCourse();
            var lesson = new Lesson("Bài", "Nội dung", "dsa", "{}", 20, teacherId);
            ctx.Lessons.Add(lesson);
            await ctx.SaveChangesAsync();
            ctx.ModuleItems.Add(new ModuleItem(
                ctx.CourseModules.Single().Id, null, ModuleItemType.Lesson, lesson.Id, null, null, "Bài", 1000, true));
            await ctx.SaveChangesAsync();

            var codelab = new Codelab("Sum Two", "Tính tổng", "int Solve() {}", 1, 20, ownerId: teacherId);
            ctx.Codelabs.Add(codelab);
            await ctx.SaveChangesAsync();

            var controller = CreateController(ctx, teacherId.ToString());
            var result = await controller.UpdateLesson(lesson.Id, new SaveDraftLessonDto
            {
                Title = "Bài đã sửa",
                ContentMd = "Nội dung mới",
                SandboxType = "dsa",
                SandboxConfig = "{}",
                XPReward = 25,
                CodelabId = codelab.Id,
                PublishStatus = "Published"
            });

            result.Should().BeOfType<OkObjectResult>();
            ctx.Entry(lesson).Reload();
            lesson.Title.Should().Be("Bài đã sửa");
            lesson.CodelabId.Should().Be(codelab.Id);
            lesson.PublishStatus.Should().Be(LessonPublishStatus.Published);
        }

        [Fact]
        public async Task UpdateLesson_CodelabOfAnotherTeacher_Returns403()
        {
            var (ctx, teacherId, _, _) = SeedCourse();
            var lesson = new Lesson("Bài", "Nội dung", "dsa", "{}", 20, teacherId);
            ctx.Lessons.Add(lesson);
            await ctx.SaveChangesAsync();
            ctx.ModuleItems.Add(new ModuleItem(
                ctx.CourseModules.Single().Id, null, ModuleItemType.Lesson, lesson.Id, null, null, "Bài", 1000, true));
            await ctx.SaveChangesAsync();

            var otherCodelab = new Codelab("Của thầy B", "Mô tả", "int Solve() {}", 1, 20, ownerId: FixedId("teacher-b"));
            ctx.Codelabs.Add(otherCodelab);
            await ctx.SaveChangesAsync();

            var controller = CreateController(ctx, teacherId.ToString());
            var result = await controller.UpdateLesson(lesson.Id, new SaveDraftLessonDto
            {
                Title = "Bài",
                ContentMd = "Nội dung",
                SandboxType = "dsa",
                SandboxConfig = "{}",
                XPReward = 20,
                CodelabId = otherCodelab.Id
            });

            result.Should().BeOfType<ObjectResult>().Which.StatusCode.Should().Be(403);
            ctx.Entry(lesson).Reload();
            lesson.CodelabId.Should().BeNull();
        }

        [Fact]
        public async Task UpdateLesson_WithNullCodelabId_DetachesExistingCodelab()
        {
            var (ctx, teacherId, _, _) = SeedCourse();
            var codelab = new Codelab("Sum Two", "Tính tổng", "int Solve() {}", 1, 20, ownerId: teacherId);
            ctx.Codelabs.Add(codelab);
            await ctx.SaveChangesAsync();
            var lesson = new Lesson("Bài", "Nội dung", "dsa", "{}", 20, teacherId, codelab.Id, LessonPublishStatus.Draft);
            ctx.Lessons.Add(lesson);
            await ctx.SaveChangesAsync();
            ctx.ModuleItems.Add(new ModuleItem(
                ctx.CourseModules.Single().Id, null, ModuleItemType.Lesson, lesson.Id, null, null, "Bài", 1000, true));
            await ctx.SaveChangesAsync();

            var controller = CreateController(ctx, teacherId.ToString());
            var result = await controller.UpdateLesson(lesson.Id, new SaveDraftLessonDto
            {
                Title = "Bài",
                ContentMd = "Nội dung",
                SandboxType = "dsa",
                SandboxConfig = "{}",
                XPReward = 20,
                CodelabId = null
            });

            result.Should().BeOfType<OkObjectResult>();
            ctx.Entry(lesson).Reload();
            lesson.CodelabId.Should().BeNull("DTO không gửi codelab nghĩa là gỡ codelab khỏi bài");
        }

        // ---------- A1.2: GetLessonById + codelab payload + role gate ----------

        [Fact]
        public async Task GetLessonById_WithCodelab_ReturnsFullCodelabPayload()
        {
            var ctx = TestDbContextFactory.CreateSimple("LA_GET_" + Guid.NewGuid().ToString("N"));
            var teacherId = FixedId("teacher-a");
            var teacherUser = new User("ta@test.com", "ta", "hash");
            SetUserProperty(teacherUser, "Id", teacherId);
            ctx.Users.Add(teacherUser);
            var course = new Course(teacherId, "Course", "Desc", CourseCategory.Other, CourseDifficulty.Beginner, false, "");
            ctx.Courses.Add(course);
            ctx.SaveChanges();
            var module = new CourseModule(course.Id, "Module 1", "", 1000);
            ctx.CourseModules.Add(module);
            ctx.SaveChanges();

            var codelab = new Codelab(
                "Sum Two", "Tính tổng hai số", "int Solve() {}", 2, 50,
                maxRuntimeMs: 1500, maxMemoryBytes: 64000000,
                allowedLanguages: "csharp,python", constraints: "n<=10^5", examples: "1 2 -> 3", tags: "sum",
                ownerId: teacherId);
            ctx.Codelabs.Add(codelab);
            await ctx.SaveChangesAsync();
            ctx.CodelabTestCases.AddRange(
                new CodelabTestCase(codelab.Id, "1 2", "3", isHidden: false, scoreWeight: 1, orderIndex: 1),
                new CodelabTestCase(codelab.Id, "100 200", "300", isHidden: true, scoreWeight: 2, orderIndex: 2));
            ctx.CodelabTemplates.Add(new CodelabTemplate(codelab.Id, "csharp", "class Solution { }"));
            ctx.CodelabHints.AddRange(
                new CodelabHint(codelab.Id, "Cộng đơn giản", isTiered: false, xpCost: 0, orderIndex: 1),
                new CodelabHint(codelab.Id, "Gợi ý trả phí", isTiered: true, xpCost: 10, orderIndex: 2));
            await ctx.SaveChangesAsync();

            var lesson = new Lesson("Bài gắn codelab", "Nội dung", "dsa", "{}", 20, teacherId, codelab.Id, LessonPublishStatus.Draft);
            ctx.Lessons.Add(lesson);
            await ctx.SaveChangesAsync();
            ctx.ModuleItems.Add(new ModuleItem(module.Id, null, ModuleItemType.Lesson, lesson.Id, null, null, "Bài", 1000, true));
            await ctx.SaveChangesAsync();

            var controller = CreateController(ctx, teacherId.ToString());
            var result = await controller.GetLessonById(lesson.Id);

            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            // API thật serialize theo camelCase (MVC options) — test mô phỏng đúng shape FE nhận.
            var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            using var doc = JsonDocument.Parse(JsonSerializer.Serialize(ok.Value, jsonOptions));
            var root = doc.RootElement;

            root.GetProperty("codelabId").GetGuid().Should().Be(codelab.Id);
            root.GetProperty("publishStatus").GetString().Should().Be("Draft");

            var codelabNode = root.GetProperty("codelab");
            codelabNode.GetProperty("codelabId").GetGuid().Should().Be(codelab.Id);
            codelabNode.GetProperty("title").GetString().Should().Be("Sum Two");
            codelabNode.GetProperty("description").GetString().Should().Be("Tính tổng hai số");
            codelabNode.GetProperty("initialCode").GetString().Should().Be("int Solve() {}");
            codelabNode.GetProperty("timeLimitMs").GetInt32().Should().Be(1500);
            codelabNode.GetProperty("difficulty").GetInt32().Should().Be(2);

            var testCases = codelabNode.GetProperty("testCases").EnumerateArray().ToList();
            testCases.Should().HaveCount(2, "payload phải chứa đủ test case để FE render bước 4");
            var publicTc = testCases.Single(t => !t.GetProperty("isHidden").GetBoolean());
            publicTc.GetProperty("expectedOutput").GetString().Should().Be("3");
            var hiddenTc = testCases.Single(t => t.GetProperty("isHidden").GetBoolean());
            hiddenTc.GetProperty("expectedOutput").GetString().Should().BeEmpty("test ẩn không lộ đáp án");

            var templates = codelabNode.GetProperty("templates").EnumerateArray().ToList();
            templates.Should().HaveCount(1);
            templates[0].GetProperty("language").GetString().Should().Be("csharp");
            templates[0].GetProperty("starterCode").GetString().Should().Be("class Solution { }");

            var hints = codelabNode.GetProperty("hints").EnumerateArray().ToList();
            hints.Should().HaveCount(2);
            hints.Single(h => h.GetProperty("xpCost").GetInt32() == 0).GetProperty("content").GetString().Should().Be("Cộng đơn giản");
            hints.Single(h => h.GetProperty("xpCost").GetInt32() == 10).GetProperty("content").GetString().Should().BeEmpty("gợi ý trả phí không lộ nội dung");
        }

        [Fact]
        public async Task GetLessonById_WithoutCodelab_ReturnsNullPayload()
        {
            var (ctx, teacherId, _, _) = SeedCourse();
            var teacherUser = new User("ta@test.com", "ta", "hash");
            SetUserProperty(teacherUser, "Id", teacherId);
            ctx.Users.Add(teacherUser);
            await ctx.SaveChangesAsync();
            var lesson = new Lesson("Bài không codelab", "Nội dung", "dsa", "{}", 20, teacherId);
            ctx.Lessons.Add(lesson);
            await ctx.SaveChangesAsync();
            ctx.ModuleItems.Add(new ModuleItem(
                ctx.CourseModules.Single().Id, null, ModuleItemType.Lesson, lesson.Id, null, null, "Bài", 1000, true));
            await ctx.SaveChangesAsync();

            var controller = CreateController(ctx, teacherId.ToString());
            var result = await controller.GetLessonById(lesson.Id);

            var ok = result.Should().BeOfType<OkObjectResult>().Subject;
            var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            using var doc = JsonDocument.Parse(JsonSerializer.Serialize(ok.Value, jsonOptions));
            var root = doc.RootElement;
            root.GetProperty("codelabId").ValueKind.Should().Be(JsonValueKind.Null);
            root.GetProperty("codelab").ValueKind.Should().Be(JsonValueKind.Null);
        }

        [Fact]
        public async Task GetLessonById_StudentCannotViewDraftOfAnotherTeacher_Returns404()
        {
            var (ctx, teacherId, _, _) = SeedCourse();
            var teacherUser = new User("ta@test.com", "ta", "hash");
            SetUserProperty(teacherUser, "Id", teacherId);
            ctx.Users.Add(teacherUser);
            await ctx.SaveChangesAsync();
            var lesson = new Lesson("Bài Draft của thầy A", "Nội dung", "dsa", "{}", 20, teacherId, null, LessonPublishStatus.Draft);
            ctx.Lessons.Add(lesson);
            await ctx.SaveChangesAsync();
            ctx.ModuleItems.Add(new ModuleItem(
                ctx.CourseModules.Single().Id, null, ModuleItemType.Lesson, lesson.Id, null, null, "Bài", 1000, true));
            await ctx.SaveChangesAsync();

            var studentId = FixedId("student-1");
            var student = new User("sv@test.com", "sv", "hash");
            SetUserProperty(student, "Id", studentId);
            ctx.Users.Add(student);
            await ctx.SaveChangesAsync();

            var controller = CreateController(ctx, studentId.ToString(), role: "Student");
            var result = await controller.GetLessonById(lesson.Id);

            var notFound = result.Should().BeOfType<NotFoundObjectResult>().Subject;
            var error = notFound.Value!.GetType().GetProperty("error")!.GetValue(notFound.Value) as string;
            error.Should().Be("LESSON_NOT_FOUND", "student không được xem bài Draft của teacher khác");
        }

        [Fact]
        public async Task GetLessonById_PublishedLessonVisibleToStudent()
        {
            var (ctx, teacherId, _, _) = SeedCourse();
            var teacherUser = new User("ta@test.com", "ta", "hash");
            SetUserProperty(teacherUser, "Id", teacherId);
            ctx.Users.Add(teacherUser);
            await ctx.SaveChangesAsync();
            ctx.Courses.Single().Publish();
            await ctx.SaveChangesAsync();
            var lesson = new Lesson("Bài Published", "Nội dung", "dsa", "{}", 20, teacherId, null, LessonPublishStatus.Published);
            ctx.Lessons.Add(lesson);
            await ctx.SaveChangesAsync();
            ctx.ModuleItems.Add(new ModuleItem(
                ctx.CourseModules.Single().Id, null, ModuleItemType.Lesson, lesson.Id, null, null, "Bài", 1000, true));
            await ctx.SaveChangesAsync();

            var studentId = FixedId("student-1");
            var student = new User("sv@test.com", "sv", "hash");
            SetUserProperty(student, "Id", studentId);
            ctx.Users.Add(student);
            await ctx.SaveChangesAsync();

            var controller = CreateController(ctx, studentId.ToString(), role: "Student");
            var result = await controller.GetLessonById(lesson.Id);

            result.Should().BeOfType<OkObjectResult>();
        }
    }
}
