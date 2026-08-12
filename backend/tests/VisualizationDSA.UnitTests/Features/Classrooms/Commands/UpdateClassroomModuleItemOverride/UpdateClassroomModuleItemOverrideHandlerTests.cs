using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Features.Classrooms.Commands;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.UnitTests.Common;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Classrooms.Commands.UpdateClassroomModuleItemOverride;

public class UpdateClassroomModuleItemOverrideHandlerTests
{
    // LS-009/LS-024: override gáº¯n vÃ o ClassroomModuleItem (item cá»§a lá»›p) chá»© khÃ´ng pháº£i
    // ModuleItem (course) â€” Setup dá»±ng item trong module thuá»™c classroom.
    private async Task<(Guid classroomId, Guid moduleItemId, Guid teacherId, ApplicationDbContext ctx)> Setup(string dbName = null)
    {
        var ctx = TestDbContextFactory.CreateSimple(dbName ?? "ModuleItemOverride_" + Guid.NewGuid().ToString("N"));
        var teacherId = Guid.NewGuid();
        var classroom = new Classroom(teacherId, "Class 1", "", "CODE1");
        ctx.Classrooms.Add(classroom);
        var module = new ClassroomModule(classroom.Id, "Mod", "Desc", 1);
        ctx.ClassroomModules.Add(module);
        var lesson = new Lesson("Lesson", "Content", "dsa", "{}", 10, teacherId);
        ctx.Lessons.Add(lesson);
        var classroomItem = new ClassroomModuleItem(
            module.Id, ModuleItemType.Lesson, lesson.Id, null, null,
            "Item", "Desc", 1, true);
        ctx.ClassroomModuleItems.Add(classroomItem);
        await ctx.SaveChangesAsync();
        return (classroom.Id, classroomItem.Id, teacherId, ctx);
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

    // LS-024: teacher gÃ¡n override cho item thuá»™c CLASSROOM KHÃC â†’ cháº·n 403 (UnauuthorizedAccessException).
    [Fact]
    public async Task Handle_ThrowsUnauthorized_WhenModuleItemBelongsToAnotherClassroom()
    {
        var (classroomId, _, teacherId, ctx) = await Setup();
        var otherTeacherId = Guid.NewGuid();
        var otherClassroom = new Classroom(otherTeacherId, "Other", "", "CODE2");
        ctx.Classrooms.Add(otherClassroom);
        var otherModule = new ClassroomModule(otherClassroom.Id, "Mod2", "", 1);
        ctx.ClassroomModules.Add(otherModule);
        var lesson = new Lesson("L2", "C", "dsa", "{}", 5);
        ctx.Lessons.Add(lesson);
        var otherItem = new ClassroomModuleItem(otherModule.Id, ModuleItemType.Lesson, lesson.Id, null, null, "Other Item", "", 1, true);
        ctx.ClassroomModuleItems.Add(otherItem);
        await ctx.SaveChangesAsync();

        var handler = new UpdateClassroomModuleItemOverrideHandler(ctx);
        var cmd = new UpdateClassroomModuleItemOverrideCommand
        {
            ClassroomId = classroomId,
            ModuleItemId = otherItem.Id,
            UserId = teacherId
        };

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => handler.Handle(cmd, CancellationToken.None));
        ctx.ClassroomModuleItemOverrides.Should().BeEmpty();
    }

    // LS-024: clear override â€” gá»­i null OpenAt/DueAt/MaxAttempts pháº£i ghi Ä‘Ã¨ giÃ¡ trá»‹ cÅ© vá» null.
    [Fact]
    public async Task Handle_ClearsOverride_WhenNullDatesProvided()
    {
        var (classroomId, moduleItemId, teacherId, ctx) = await Setup();
        ctx.ClassroomModuleItemOverrides.Add(new ClassroomModuleItemOverride(
            classroomId, moduleItemId, DateTime.UtcNow, DateTime.UtcNow.AddDays(1), 5, true, null, false, false));
        await ctx.SaveChangesAsync();

        var handler = new UpdateClassroomModuleItemOverrideHandler(ctx);
        var cmd = new UpdateClassroomModuleItemOverrideCommand
        {
            ClassroomId = classroomId,
            ModuleItemId = moduleItemId,
            UserId = teacherId,
            OpenAt = null,
            DueAt = null,
            MaxAttempts = null,
            IsHiddenForStudent = false,
            PrerequisiteItemId = null,
            IsSequential = true,
            IsRequired = true
        };
        await handler.Handle(cmd, CancellationToken.None);

        var ov = ctx.ClassroomModuleItemOverrides.First();
        ov.OpenAt.Should().BeNull();
        ov.DueAt.Should().BeNull();
        ov.MaxAttempts.Should().BeNull();
        ov.IsHiddenForStudent.Should().BeFalse();
        ov.IsRequired.Should().BeTrue();
    }

    // LS-024: ghi Ä‘áº§y Ä‘á»§ field má»›i (prerequisiteItemId/isSequential/isRequired) vÃ o override.
    [Fact]
    public async Task Handle_PersistsFullOverrideFields()
    {
        var (classroomId, moduleItemId, teacherId, ctx) = await Setup();
        var prereqId = Guid.NewGuid();
        var handler = new UpdateClassroomModuleItemOverrideHandler(ctx);
        var cmd = new UpdateClassroomModuleItemOverrideCommand
        {
            ClassroomId = classroomId,
            ModuleItemId = moduleItemId,
            UserId = teacherId,
            OpenAt = DateTime.UtcNow.AddHours(1),
            MaxAttempts = 2,
            PrerequisiteItemId = prereqId,
            IsSequential = false,
            IsRequired = false
        };
        await handler.Handle(cmd, CancellationToken.None);

        var ov = ctx.ClassroomModuleItemOverrides.First();
        ov.PrerequisiteItemId.Should().Be(prereqId);
        ov.IsSequential.Should().BeFalse();
        ov.IsRequired.Should().BeFalse();
        ov.MaxAttempts.Should().Be(2);
    }

    // LS-024: xung Ä‘á»™t concurrency â†’ DbUpdateConcurrencyException lan ra (global middleware â†’ 409).
    [Fact]
    public async Task Handle_ThrowsDbUpdateConcurrency_WhenRowVersionStale()
    {
        var (classroomId, moduleItemId, teacherId, ctx) = await Setup();
        var conflictCtx = new ConcurrencyConflictDbContext(ctx);
        var handler = new UpdateClassroomModuleItemOverrideHandler(conflictCtx);
        var cmd = new UpdateClassroomModuleItemOverrideCommand
        {
            ClassroomId = classroomId,
            ModuleItemId = moduleItemId,
            UserId = teacherId,
            MaxAttempts = 3
        };

        await Assert.ThrowsAsync<DbUpdateConcurrencyException>(() => handler.Handle(cmd, CancellationToken.None));
    }
}

