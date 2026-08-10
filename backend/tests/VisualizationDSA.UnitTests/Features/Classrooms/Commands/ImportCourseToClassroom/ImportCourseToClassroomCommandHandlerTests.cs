using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using VisualizationDSA.Application.Features.Classrooms.Commands.ImportCourseToClassroom;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.UnitTests.Common;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Classrooms.Commands.ImportCourseToClassroom;

public class ImportCourseToClassroomCommandHandlerTests
{
    private async Task<(Guid classroomId, Guid courseId, Guid teacherId, ApplicationDbContext ctx)> SetupCourse(string dbName = null)
    {
        var ctx = TestDbContextFactory.CreateSimple(dbName ?? "ImportCourse_" + Guid.NewGuid().ToString("N"));
        var teacherId = Guid.NewGuid();
        var owner = new User("teacher@test.com", "teacher", "hash");
        var idProp = typeof(User).GetProperty("Id");
        idProp.SetValue(owner, teacherId);
        ctx.Users.Add(owner);
        var classroom = new Classroom(teacherId, "Class 1", "", "CODE1");
        ctx.Classrooms.Add(classroom);
        await ctx.SaveChangesAsync();

        var course = new Course(teacherId, "Course Title", "Desc", CourseCategory.Other, CourseDifficulty.Beginner, false, "");
        ctx.Courses.Add(course);
        await ctx.SaveChangesAsync();
        var module = new CourseModule(course.Id, "Module 1", "Module desc", 1);
        ctx.CourseModules.Add(module);
        await ctx.SaveChangesAsync();
        var lesson = new Lesson("Lesson 1", "Content", "dsa", "{}", 10, teacherId);
        ctx.Lessons.Add(lesson);
        await ctx.SaveChangesAsync();
        var item = new ModuleItem(module.Id, null, ModuleItemType.Lesson, lesson.Id, null, null, "My Lesson", 1, true);
        ctx.ModuleItems.Add(item);
        await ctx.SaveChangesAsync();

        return (classroom.Id, course.Id, teacherId, ctx);
    }

    [Fact]
    public async Task Handle_ImportsCourse_WhenValid()
    {
        var (classroomId, courseId, teacherId, ctx) = await SetupCourse();
        var handler = new ImportCourseToClassroomCommandHandler(ctx);
        var cmd = new ImportCourseToClassroomCommand { ClassroomId = classroomId, CourseId = courseId, TeacherId = teacherId, IncludeAllModules = true, OverrideExisting = false, SelectedModuleIds = new List<Guid>() };
        var result = await handler.Handle(cmd, CancellationToken.None);

        result.Should().Be(classroomId);
        ctx.ClassroomModules.Should().ContainSingle(m => m.ClassroomId == classroomId);
        ctx.ClassroomModuleItems.Should().ContainSingle(i => i.ModuleId == ctx.ClassroomModules.First().Id);
    }

    [Fact]
    public async Task Handle_ThrowsInvalidOperationException_WhenClassroomNotFound()
    {
        var (_, courseId, teacherId, ctx) = await SetupCourse();
        var handler = new ImportCourseToClassroomCommandHandler(ctx);
        await Assert.ThrowsAsync<InvalidOperationException>(() => handler.Handle(new ImportCourseToClassroomCommand { ClassroomId = Guid.NewGuid(), CourseId = courseId, TeacherId = teacherId, IncludeAllModules = false, OverrideExisting = false, SelectedModuleIds = new List<Guid>() }, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ThrowsUnauthorizedAccessException_WhenNotOwner()
    {
        var (classroomId, courseId, _, ctx) = await SetupCourse();
        var handler = new ImportCourseToClassroomCommandHandler(ctx);
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => handler.Handle(new ImportCourseToClassroomCommand { ClassroomId = classroomId, CourseId = courseId, TeacherId = Guid.NewGuid(), IncludeAllModules = false, OverrideExisting = false, SelectedModuleIds = new List<Guid>() }, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ThrowsInvalidOperationException_WhenCourseNotFound()
    {
        var (classroomId, _, teacherId, ctx) = await SetupCourse();
        var handler = new ImportCourseToClassroomCommandHandler(ctx);
        await Assert.ThrowsAsync<InvalidOperationException>(() => handler.Handle(new ImportCourseToClassroomCommand { ClassroomId = classroomId, CourseId = Guid.NewGuid(), TeacherId = teacherId, IncludeAllModules = false, OverrideExisting = false, SelectedModuleIds = new List<Guid>() }, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_OverridesExistingModules_WhenOverrideExistingTrue()
    {
        var (classroomId, courseId, teacherId, ctx) = await SetupCourse();
        ctx.ClassroomModules.Add(new ClassroomModule(classroomId, "Old Module", "Desc", 1, false, null));
        await ctx.SaveChangesAsync();
        var handler = new ImportCourseToClassroomCommandHandler(ctx);
        var cmd = new ImportCourseToClassroomCommand { ClassroomId = classroomId, CourseId = courseId, TeacherId = teacherId, IncludeAllModules = true, OverrideExisting = true, SelectedModuleIds = new List<Guid>() };
        await handler.Handle(cmd, CancellationToken.None);

        var module = ctx.ClassroomModules.First(m => m.Title == "Module 1");
        module.IsDeleted.Should().BeFalse();
    }
}
