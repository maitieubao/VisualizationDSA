using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Features.Classrooms.Commands.DeleteClassroomModuleItem;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.UnitTests.Common;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Classrooms.Commands.DeleteClassroomModuleItem;

// LS-002: handler xÃ³a item â€” soft-delete + cascade progress/override + phÃ¢n quyá»n teacher owner.
public class DeleteClassroomModuleItemCommandHandlerTests
{
    private async Task<(Guid moduleId, Guid itemId, Guid studentId, Guid teacherId, ApplicationDbContext ctx)> Setup(string dbName)
    {
        var ctx = TestDbContextFactory.CreateSimple("DeleteClassroomItem_" + dbName);
        var teacherId = Guid.NewGuid();
        var studentId = Guid.NewGuid();
        var classroom = new Classroom(teacherId, "C", "", "CODE");
        ctx.Classrooms.Add(classroom);
        var module = new ClassroomModule(classroom.Id, "M", "", 0);
        ctx.ClassroomModules.Add(module);
        var lesson = new Lesson("L", "C", "monaco", "{}", 5);
        ctx.Lessons.Add(lesson);
        var item = new ClassroomModuleItem(module.Id, ModuleItemType.Lesson, lesson.Id, null, null, "Item", "", 0, true);
        ctx.ClassroomModuleItems.Add(item);
        await ctx.SaveChangesAsync();

        ctx.UserModuleItemProgresses.Add(new UserModuleItemProgress(studentId, item.Id, attemptNumber: 1));
        ctx.ClassroomModuleItemOverrides.Add(new ClassroomModuleItemOverride(classroom.Id, item.Id, null, null, null, true));
        await ctx.SaveChangesAsync();

        return (module.Id, item.Id, studentId, teacherId, ctx);
    }

    [Fact]
    public async Task Handle_SoftDeletesItem_AndCascadesProgressAndOverride()
    {
        var (moduleId, itemId, studentId, teacherId, ctx) = await Setup("Cascade");
        var handler = new DeleteClassroomModuleItemCommandHandler(ctx);
        var cmd = new DeleteClassroomModuleItemCommand { ModuleId = moduleId, ItemId = itemId, TeacherId = teacherId };

        await handler.Handle(cmd, CancellationToken.None);

        // Soft-delete: item vẫn còn trong DB nhưng bị query filter !IsDeleted che đi —
        // phải IgnoreQueryFilters để kiểm tra cờ IsDeleted.
        ctx.ClassroomModuleItems.IgnoreQueryFilters().Single(i => i.Id == itemId).IsDeleted.Should().BeTrue();
        ctx.UserModuleItemProgresses.Where(p => p.ModuleItemId == itemId).Should().BeEmpty();
        ctx.ClassroomModuleItemOverrides.Where(o => o.ModuleItemId == itemId).Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_ThrowsKeyNotFound_WhenItemNotInModule()
    {
        var (_, _, _, teacherId, ctx) = await Setup("ItemMissing");
        var handler = new DeleteClassroomModuleItemCommandHandler(ctx);
        var cmd = new DeleteClassroomModuleItemCommand { ModuleId = Guid.NewGuid(), ItemId = Guid.NewGuid(), TeacherId = teacherId };

        await Assert.ThrowsAsync<KeyNotFoundException>(() => handler.Handle(cmd, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ThrowsUnauthorized_WhenNotOwner()
    {
        var (moduleId, itemId, _, _, ctx) = await Setup("NotOwner");
        var handler = new DeleteClassroomModuleItemCommandHandler(ctx);
        var cmd = new DeleteClassroomModuleItemCommand { ModuleId = moduleId, ItemId = itemId, TeacherId = Guid.NewGuid() };

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => handler.Handle(cmd, CancellationToken.None));
    }
}

