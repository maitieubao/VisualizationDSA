using System;
using System.Collections.Generic;
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
using VisualizationDSA.Application.Features.Classrooms.Commands.ImportCourseToClassroom;
using VisualizationDSA.Application.Features.Lessons.Commands.CreateDraftLesson;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.UnitTests.Common;
using VisualizationDSA.WebApi.Controllers;
using Xunit;

namespace VisualizationDSA.UnitTests.Features
{
    /// <summary>
    /// TC-011/TC-023/TC-025: Teacher Panel backend —
    /// CreateDraftLesson tạo ModuleItem Quiz khi có QuizId, LessonController OrderIndex *1000,
    /// ImportCourseToClassroom transaction + course ownership.
    /// </summary>
    public class TeacherPanelBackendTests
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
            // Sinh Guid ổn định theo seed cho test.
            using var sha = System.Security.Cryptography.SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(seed));
            var guid = new byte[16];
            Array.Copy(bytes, guid, 16);
            return new Guid(guid);
        }

        private static void SetUserProperty(object entity, string property, Guid value)
        {
            entity.GetType().GetProperty(property)!.SetValue(entity, value);
        }

        // EnsureCreated KHÔNG áp dụng defaultValue RowVersion từ migration (schema vs model lệch) →
        // INSERT ClassroomModule/Item thiếu RowVersion văng NOT NULL. DROP + CREATE lại 2 bảng
        // kèm DEFAULT để handler import chạy được trên SQLite test (PRAGMA writable_schema không
        // được SQLite thực thi cho column default).
        private static void PatchRowVersionDefaults(Microsoft.Data.Sqlite.SqliteConnection connection)
        {
            string? moduleDdl = null, itemDdl = null;
            var moduleIndexes = new List<string>();
            var itemIndexes = new List<string>();

            using (var read = connection.CreateCommand())
            {
                read.CommandText = "SELECT type, name, sql FROM sqlite_master WHERE sql IS NOT NULL";
                using var reader = read.ExecuteReader();
                while (reader.Read())
                {
                    var kind = reader.GetString(0);
                    var name = reader.GetString(1);
                    var sql = reader.GetString(2);
                    if (kind == "table" && name == "ClassroomModules") moduleDdl = sql;
                    if (kind == "table" && name == "ClassroomModuleItems") itemDdl = sql;
                    if (kind == "index" && name.StartsWith("IX_ClassroomModules_")) moduleIndexes.Add(sql);
                    if (kind == "index" && name.StartsWith("IX_ClassroomModuleItems_")) itemIndexes.Add(sql);
                }
            }

            moduleDdl = moduleDdl!.Replace("\"RowVersion\" BLOB NOT NULL", "\"RowVersion\" BLOB NOT NULL DEFAULT X'0000000000000000'");
            itemDdl = itemDdl!.Replace("\"RowVersion\" BLOB NOT NULL", "\"RowVersion\" BLOB NOT NULL DEFAULT X'0000000000000000'");

            using var cmd = connection.CreateCommand();
            cmd.CommandText = "PRAGMA foreign_keys=OFF;"
                + "DROP TABLE \"ClassroomModuleItems\";"
                + "DROP TABLE \"ClassroomModules\";"
                + moduleDdl + ";"
                + itemDdl + ";"
                + string.Join(";", moduleIndexes.Concat(itemIndexes).Select(i => i + ";"))
                + "PRAGMA foreign_keys=ON;";
            cmd.ExecuteNonQuery();
        }

        // ---------- TC-011: CreateDraftLesson tạo ModuleItem Quiz ----------

        [Fact]
        public async Task CreateDraftLesson_WithQuizId_CreatesQuizModuleItem()
        {
            var ctx = TestDbContextFactory.CreateSimple("CDL_Quiz_" + Guid.NewGuid().ToString("N"));
            var teacherId = FixedId("teacher-a");
            var otherTeacherId = FixedId("teacher-b");
            var course = new Course(teacherId, "Course", "Desc", CourseCategory.Other, CourseDifficulty.Beginner, false, "");
            ctx.Courses.Add(course);
            await ctx.SaveChangesAsync();
            var module = new CourseModule(course.Id, "Module 1", "", 1000);
            ctx.CourseModules.Add(module);
            await ctx.SaveChangesAsync();
            var quiz = new Quiz("Quiz 1", "", "sorting", 3, 50, teacherId);
            quiz.AddQuestion("Q?", new[] { "A", "B" }, 0, "E");
            ctx.Quizzes.Add(quiz);
            await ctx.SaveChangesAsync();

            var handler = new CreateDraftLessonCommandHandler(ctx);
            var lessonId = await handler.Handle(new CreateDraftLessonCommand
            {
                TeacherId = teacherId,
                CourseId = course.Id,
                ModuleId = module.Id,
                Title = "Bài mới",
                QuizId = quiz.Id,
                OrderIndex = 2
            }, CancellationToken.None);

            lessonId.Should().NotBeEmpty();
            var items = ctx.ModuleItems.Where(i => !i.IsDeleted).OrderBy(i => i.OrderIndex).ToList();
            items.Should().HaveCount(2);
            var lessonItem = items.Single(i => i.ItemType == ModuleItemType.Lesson);
            lessonItem.LessonId.Should().Be(lessonId);
            lessonItem.OrderIndex.Should().Be(2000); // OrderIndex * 1000

            var quizItem = items.Single(i => i.ItemType == ModuleItemType.Quiz);
            quizItem.QuizId.Should().Be(quiz.Id);
            quizItem.OrderIndex.Should().Be(2500); // ngay sau lesson: 2000 + 500
        }

        [Fact]
        public async Task CreateDraftLesson_WithoutQuizId_CreatesOnlyLessonItem()
        {
            var ctx = TestDbContextFactory.CreateSimple("CDL_NoQuiz_" + Guid.NewGuid().ToString("N"));
            var teacherId = FixedId("teacher-a");
            var course = new Course(teacherId, "Course", "Desc", CourseCategory.Other, CourseDifficulty.Beginner, false, "");
            ctx.Courses.Add(course);
            await ctx.SaveChangesAsync();
            var module = new CourseModule(course.Id, "Module 1", "", 1000);
            ctx.CourseModules.Add(module);
            await ctx.SaveChangesAsync();

            var handler = new CreateDraftLessonCommandHandler(ctx);
            var lessonId = await handler.Handle(new CreateDraftLessonCommand
            {
                TeacherId = teacherId,
                CourseId = course.Id,
                ModuleId = module.Id,
                Title = "Bài không quiz"
            }, CancellationToken.None);

            ctx.ModuleItems.Count().Should().Be(1);
            ctx.ModuleItems.Single().ItemType.Should().Be(ModuleItemType.Lesson);
            ctx.ModuleItems.Single().LessonId.Should().Be(lessonId);
        }

        [Fact]
        public async Task CreateDraftLesson_QuizOfAnotherTeacher_ThrowsUnauthorized()
        {
            var ctx = TestDbContextFactory.CreateSimple("CDL_OtherQuiz_" + Guid.NewGuid().ToString("N"));
            var teacherId = FixedId("teacher-a");
            var otherTeacherId = FixedId("teacher-b");
            var course = new Course(teacherId, "Course", "Desc", CourseCategory.Other, CourseDifficulty.Beginner, false, "");
            ctx.Courses.Add(course);
            await ctx.SaveChangesAsync();
            var module = new CourseModule(course.Id, "Module 1", "", 1000);
            ctx.CourseModules.Add(module);
            await ctx.SaveChangesAsync();
            var otherQuiz = new Quiz("Quiz của thầy B", "", "sorting", 3, 50, otherTeacherId);
            ctx.Quizzes.Add(otherQuiz);
            await ctx.SaveChangesAsync();

            var handler = new CreateDraftLessonCommandHandler(ctx);
            var act = async () => await handler.Handle(new CreateDraftLessonCommand
            {
                TeacherId = teacherId,
                CourseId = course.Id,
                ModuleId = module.Id,
                Title = "Bài 1",
                QuizId = otherQuiz.Id
            }, CancellationToken.None);

            await act.Should().ThrowAsync<UnauthorizedAccessException>();
        }

        // ---------- TC-023: LessonController OrderIndex *1000 ----------

        [Fact]
        public async Task UpdateLesson_OrderIndex_MultipliedBy1000()
        {
            var ctx = TestDbContextFactory.CreateSimple("LessonOrder_" + Guid.NewGuid().ToString("N"));
            var teacherId = FixedId("teacher-a");
            var course = new Course(teacherId, "Course", "Desc", CourseCategory.Other, CourseDifficulty.Beginner, false, "");
            ctx.Courses.Add(course);
            await ctx.SaveChangesAsync();
            var module = new CourseModule(course.Id, "Module 1", "", 1000);
            ctx.CourseModules.Add(module);
            await ctx.SaveChangesAsync();
            var lesson = new Lesson("Bài", "Nội dung", "dsa", "{}", 20, teacherId);
            ctx.Lessons.Add(lesson);
            await ctx.SaveChangesAsync();
            var item = new ModuleItem(module.Id, null, ModuleItemType.Lesson, lesson.Id, null, null, "Bài", 1000, true);
            ctx.ModuleItems.Add(item);
            await ctx.SaveChangesAsync();

            var controller = new LessonController(ctx, Mock.Of<IProgressRuleEngine>());
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = $"Bearer {CreateToken(teacherId.ToString())}";
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };

            var result = await controller.UpdateLesson(lesson.Id, new CreateLessonDto
            {
                Title = "Bài", ContentMd = "Nội dung", SandboxType = "dsa", SandboxConfig = "{}",
                XPReward = 20, OrderIndex = 3, ModuleId = module.Id
            });

            result.Should().BeOfType<OkObjectResult>();
            ctx.Entry(item).Reload();
            item.OrderIndex.Should().Be(3000, "OrderIndex phải cùng thang đo *1000 với CreateDraftLesson");
        }

        [Fact]
        public async Task UpdateLesson_OrderIndexZero_PreservesExistingOrder()
        {
            var ctx = TestDbContextFactory.CreateSimple("LessonOrderZero_" + Guid.NewGuid().ToString("N"));
            var teacherId = FixedId("teacher-a");
            var course = new Course(teacherId, "Course", "Desc", CourseCategory.Other, CourseDifficulty.Beginner, false, "");
            ctx.Courses.Add(course);
            await ctx.SaveChangesAsync();
            var module = new CourseModule(course.Id, "Module 1", "", 1000);
            ctx.CourseModules.Add(module);
            await ctx.SaveChangesAsync();
            var lesson = new Lesson("Bài", "Nội dung", "dsa", "{}", 20, teacherId);
            ctx.Lessons.Add(lesson);
            await ctx.SaveChangesAsync();
            var item = new ModuleItem(module.Id, null, ModuleItemType.Lesson, lesson.Id, null, null, "Bài", 5000, true);
            ctx.ModuleItems.Add(item);
            await ctx.SaveChangesAsync();

            var controller = new LessonController(ctx, Mock.Of<IProgressRuleEngine>());
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = $"Bearer {CreateToken(teacherId.ToString())}";
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };

            var result = await controller.UpdateLesson(lesson.Id, new CreateLessonDto
            {
                Title = "Bài", ContentMd = "Nội dung", SandboxType = "dsa", SandboxConfig = "{}",
                XPReward = 20, OrderIndex = 0, ModuleId = module.Id
            });

            result.Should().BeOfType<OkObjectResult>();
            ctx.Entry(item).Reload();
            item.OrderIndex.Should().Be(5000, "OrderIndex = 0 nghĩa là giữ nguyên thứ tự cũ");
        }

        // ---------- TC-025: ImportCourseToClassroom transaction + ownership ----------

        [Fact]
        public async Task ImportCourse_OtherTeachersCourse_ThrowsUnauthorized()
        {
            var (ctx, connection) = TestSqliteDbContext.Create();
            try
            {
                var teacherA = FixedId("teacher-a");
                var teacherB = FixedId("teacher-b");
                var userA = new User("ta@test.com", "ta", "hash");
                SetUserProperty(userA, "Id", teacherA);
                var userB = new User("tb@test.com", "tb", "hash");
                SetUserProperty(userB, "Id", teacherB);
                ctx.Users.AddRange(userA, userB);
                await ctx.SaveChangesAsync();

                var classroom = new Classroom(teacherA, "Class A", "", "CODE1");
                ctx.Classrooms.Add(classroom);
                var courseB = new Course(teacherB, "Khóa của B", "Desc", CourseCategory.Other, CourseDifficulty.Beginner, false, "");
                ctx.Courses.Add(courseB);
                await ctx.SaveChangesAsync();

                var handler = new ImportCourseToClassroomCommandHandler(ctx);
                var act = async () => await handler.Handle(new ImportCourseToClassroomCommand
                {
                    TeacherId = teacherA,
                    ClassroomId = classroom.Id,
                    CourseId = courseB.Id,
                    IncludeAllModules = true
                }, CancellationToken.None);

                // TC-025: teacher A không được import khóa học của teacher B.
                await act.Should().ThrowAsync<UnauthorizedAccessException>();
                ctx.ClassroomModules.Count().Should().Be(0);
                ctx.Entry(classroom).Reload();
                classroom.ImportedFromCourseId.Should().BeNull();
                classroom.CourseId.Should().BeNull();
            }
            finally
            {
                connection.Dispose();
            }
        }

        [Fact]
        public async Task ImportCourse_MidwayFailure_RollsBackAllChanges()
        {
            var (ctx, connection) = TestSqliteDbContext.Create();
            PatchRowVersionDefaults(connection);
            try
            {
                var teacherA = FixedId("teacher-a");
                var userA = new User("ta@test.com", "ta", "hash");
                SetUserProperty(userA, "Id", teacherA);
                ctx.Users.Add(userA);
                await ctx.SaveChangesAsync();

                var classroom = new Classroom(teacherA, "Class A", "", "CODE1");
                ctx.Classrooms.Add(classroom);
                // Classroom đã có module OrderIndex=1 → module import (OrderIndex=1) sẽ vi phạm
                // unique index (ClassroomId, OrderIndex) → lỗi giữa chừng.
                ctx.ClassroomModules.Add(new ClassroomModule(classroom.Id, "Module cũ", "", 1, false, null));
                await ctx.SaveChangesAsync();

                var course = new Course(teacherA, "Khóa A", "Desc", CourseCategory.Other, CourseDifficulty.Beginner, false, "");
                ctx.Courses.Add(course);
                await ctx.SaveChangesAsync();
                var module = new CourseModule(course.Id, "Module 1", "", 1);
                ctx.CourseModules.Add(module);
                await ctx.SaveChangesAsync();
                var lesson = new Lesson("Lesson 1", "Content", "dsa", "{}", 10, teacherA);
                ctx.Lessons.Add(lesson);
                await ctx.SaveChangesAsync();
                var item = new ModuleItem(module.Id, null, ModuleItemType.Lesson, lesson.Id, null, null, "L1", 1, true);
                ctx.ModuleItems.Add(item);
                await ctx.SaveChangesAsync();

                var handler = new ImportCourseToClassroomCommandHandler(ctx);
                var act = async () => await handler.Handle(new ImportCourseToClassroomCommand
                {
                    TeacherId = teacherA,
                    ClassroomId = classroom.Id,
                    CourseId = course.Id,
                    IncludeAllModules = true
                }, CancellationToken.None);

                await act.Should().ThrowAsync<DbUpdateException>();

                // TC-025: transaction rollback — không để lại module/item dở dang.
                ctx.ClassroomModules.Count().Should().Be(1, "chỉ còn module cũ — module mới phải bị rollback");
                ctx.ClassroomModuleItems.Count().Should().Be(0);
                ctx.Entry(classroom).Reload();
                classroom.ImportedFromCourseId.Should().BeNull();
                classroom.CourseId.Should().BeNull();
            }
            finally
            {
                connection.Dispose();
            }
        }
    }
}
