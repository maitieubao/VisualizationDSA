using System;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using VisualizationDSA.Application.Features.Classrooms.Commands;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.UnitTests.Common;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Classrooms.Commands.UpdateClassroomModuleItemOverride;

public class UpdateClassroomModuleItemOverrideHandlerTests
{
    private async Task<(Guid classroomId, Guid moduleItemId, Guid teacherId, ApplicationDbContext ctx)> Setup(string dbName = null)
    {
        var ctx = TestDbContextFactory.CreateSimple(dbName ?? "ModuleItemOverride_" + Guid.NewGuid().ToString("N"));
        var teacherId = Guid.NewGuid();
        var owner = new User("teacher@test.com", "teacher", "hash");
        var idProp = typeof(User).GetProperty("Id");
        idProp.SetValue(owner, teacherId);
        ctx.Users.Add(owner);
        var classroom = new Classroom(teacherId, "Class 1", "", "CODE1");
        ctx.Classrooms.Add(classroom);
        var course = new Course(teacherId, "Course", "Desc", CourseCategory.Other, CourseDifficulty.Beginner, false, "");
        ctx.Courses.Add(course);
        await ctx.SaveChangesAsync();
        var courseModule = new CourseModule(course.Id, "Mod", "Desc", 1);
        ctx.CourseModules.Add(courseModule);
        await ctx.SaveChangesAsync();
        var lesson = new Lesson("Lesson", "Content", "dsa", "{}", 10, teacherId);
        ctx.Lessons.Add(lesson);
        await ctx.SaveChangesAsync();
        var moduleItem = new ModuleItem(courseModule.Id, null, ModuleItemType.Lesson, lesson.Id, null, null, "Item", 1, true);
        ctx.ModuleItems.Add(moduleItem);
        await ctx.SaveChangesAsync();
        return (classroom.Id, moduleItem.Id, teacherId, ctx);
    }

    [Fact]
    public async Task Handle_CreatesNewOverride_WhenNoneExists()
    {
        var (classroomId, moduleItemId, teacherId, ctx) = await Setup();
        var handler = new UpdateClassroomModuleItemOverrideHandler(ctx);
        var cmd = new UpdateClassroomModuleItemOverrideCommand
        {
            ClassroomId = classroomId,
            ModuleItemId = moduleItemId,
            UserId = teacherId,
            IsHiddenForStudent = true,
            MaxAttempts = 3,
            OpenAt = DateTime.UtcNow,
            DueAt = DateTime.UtcNow.AddDays(1)
        };
        var result = await handler.Handle(cmd, CancellationToken.None);

        result.Should().BeTrue();
        ctx.ClassroomModuleItemOverrides.Should().ContainSingle(o => o.ModuleItemId == moduleItemId && o.IsHiddenForStudent == true);
    }

    [Fact]
    public async Task Handle_UpdatesExistingOverride_WhenExists()
    {
        var (classroomId, moduleItemId, teacherId, ctx) = await Setup();
        ctx.ClassroomModuleItemOverrides.Add(new ClassroomModuleItemOverride(classroomId, moduleItemId, null, null, null, false));
        await ctx.SaveChangesAsync();

        var handler = new UpdateClassroomModuleItemOverrideHandler(ctx);
        var cmd = new UpdateClassroomModuleItemOverrideCommand
        {
            ClassroomId = classroomId,
            ModuleItemId = moduleItemId,
            UserId = teacherId,
            IsHiddenForStudent = true,
            MaxAttempts = 2
        };
        await handler.Handle(cmd, CancellationToken.None);

        var ov = ctx.ClassroomModuleItemOverrides.First();
        ov.IsHiddenForStudent.Should().BeTrue();
        ov.MaxAttempts.Should().Be(2);
    }

    [Fact]
    public async Task Handle_ThrowsArgumentException_WhenClassroomNotFound()
    {
        var (_, moduleItemId, teacherId, ctx) = await Setup();
        var handler = new UpdateClassroomModuleItemOverrideHandler(ctx);
        var cmd = new UpdateClassroomModuleItemOverrideCommand { ClassroomId = Guid.NewGuid(), ModuleItemId = moduleItemId, UserId = teacherId };
        await Assert.ThrowsAsync<ArgumentException>(() => handler.Handle(cmd, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ThrowsUnauthorizedAccessException_WhenNotOwner()
    {
        var (classroomId, moduleItemId, _, ctx) = await Setup();
        var handler = new UpdateClassroomModuleItemOverrideHandler(ctx);
        var cmd = new UpdateClassroomModuleItemOverrideCommand { ClassroomId = classroomId, ModuleItemId = moduleItemId, UserId = Guid.NewGuid() };
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => handler.Handle(cmd, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ThrowsArgumentException_WhenModuleItemNotFound()
    {
        var (classroomId, _, teacherId, ctx) = await Setup();
        var handler = new UpdateClassroomModuleItemOverrideHandler(ctx);
        var cmd = new UpdateClassroomModuleItemOverrideCommand { ClassroomId = classroomId, ModuleItemId = Guid.NewGuid(), UserId = teacherId };
        await Assert.ThrowsAsync<ArgumentException>(() => handler.Handle(cmd, CancellationToken.None));
    }
}
