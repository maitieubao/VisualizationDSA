using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Common.Exceptions;
using VisualizationDSA.Application.Features.Classrooms.Commands.ReorderClassroomModuleItems;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.UnitTests.Common;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Classrooms.Commands.ReorderClassroomModuleItems;

public class ReorderClassroomModuleItemsCommandHandlerTests
{
    [Fact]
    public async Task Handle_UpdatesItemOrder_WhenValidRequest()
    {
        var ctx = TestDbContextFactory.CreateSimple("ReorderItemsValid");
        var teacherId = Guid.NewGuid();
        var classroom = new Classroom(teacherId, "C", "", "CODE");
        ctx.Classrooms.Add(classroom);
        var module = new ClassroomModule(classroom.Id, "M", "", 0);
        ctx.ClassroomModules.Add(module);
        await ctx.SaveChangesAsync();

        var lesson = new Lesson("Test Lesson", "# Content", "monaco", "{}", 10);
        ctx.Lessons.Add(lesson);
        await ctx.SaveChangesAsync();

        var item1 = new ClassroomModuleItem(
            module.Id, ModuleItemType.Lesson, lesson.Id, null, null,
            "Item A", "", 0, true);
        var item2 = new ClassroomModuleItem(
            module.Id, ModuleItemType.Lesson, lesson.Id, null, null,
            "Item B", "", 1, true);
        ctx.ClassroomModuleItems.AddRange(item1, item2);
        await ctx.SaveChangesAsync();

        var handler = new ReorderClassroomModuleItemsCommandHandler(ctx);
        var cmd = new ReorderClassroomModuleItemsCommand
        {
            ModuleId = module.Id,
            TeacherId = teacherId,
            ItemOrders = new()
            {
                new ItemOrderDto { ItemId = item2.Id, OrderIndex = 0 },
                new ItemOrderDto { ItemId = item1.Id, OrderIndex = 1 }
            }
        };

        await handler.Handle(cmd, CancellationToken.None);

        var updated = await ctx.ClassroomModuleItems.OrderBy(i => i.OrderIndex).ToListAsync();
        updated[0].OverrideTitle.Should().Be("Item B");
        updated[1].OverrideTitle.Should().Be("Item A");
    }

    [Fact]
    public async Task Handle_ThrowsUnauthorized_WhenWrongTeacher()
    {
        var ctx = TestDbContextFactory.CreateSimple("ReorderItemsUnauthorized");
        var classroom = new Classroom(Guid.NewGuid(), "C", "", "CODE");
        ctx.Classrooms.Add(classroom);
        var module = new ClassroomModule(classroom.Id, "M", "", 0);
        ctx.ClassroomModules.Add(module);
        await ctx.SaveChangesAsync();

        var handler = new ReorderClassroomModuleItemsCommandHandler(ctx);
        var cmd = new ReorderClassroomModuleItemsCommand
        {
            ModuleId = module.Id,
            TeacherId = Guid.NewGuid(),
            ItemOrders = new()
        };

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => handler.Handle(cmd, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ThrowsArgument_WhenModuleNotFound()
    {
        var ctx = TestDbContextFactory.CreateSimple("ReorderItemsModuleNotFound");
        var handler = new ReorderClassroomModuleItemsCommandHandler(ctx);
        var cmd = new ReorderClassroomModuleItemsCommand
        {
            ModuleId = Guid.NewGuid(),
            TeacherId = Guid.NewGuid(),
            ItemOrders = new()
        };

        await Assert.ThrowsAsync<ArgumentException>(() => handler.Handle(cmd, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ThrowsConflict_WhenConcurrencyOccurs()
    {
        var ctx = TestDbContextFactory.CreateSimple("ReorderItemsConflict");
        var teacherId = Guid.NewGuid();
        var classroom = new Classroom(teacherId, "C", "", "CODE");
        ctx.Classrooms.Add(classroom);
        var module = new ClassroomModule(classroom.Id, "M", "", 0);
        ctx.ClassroomModules.Add(module);
        var lesson = new Lesson("L", "C", "monaco", "{}", 5);
        ctx.Lessons.Add(lesson);
        var item = new ClassroomModuleItem(module.Id, ModuleItemType.Lesson, lesson.Id, null, null, "Item A", "", 0, true);
        ctx.ClassroomModuleItems.Add(item);
        await ctx.SaveChangesAsync();

        var conflictCtx = new ConcurrencyConflictDbContext(ctx);
        var handler = new ReorderClassroomModuleItemsCommandHandler(conflictCtx);
        var cmd = new ReorderClassroomModuleItemsCommand
        {
            ModuleId = module.Id,
            TeacherId = teacherId,
            // LS-023: itemId phải thuộc module — nếu không, validation ArgumentException chặn
            // trước khi chạm SaveChanges → không còn tới được nhánh concurrency.
            ItemOrders = new() { new ItemOrderDto { ItemId = item.Id, OrderIndex = 0 } }
        };

        await Assert.ThrowsAsync<ConflictException>(() => handler.Handle(cmd, CancellationToken.None));
    }

    // LS-023: partial reorder — item ngoài danh sách được đánh số sau cùng theo OrderIndex cũ.
    [Fact]
    public async Task Handle_RenumbersUnlistedItemsAfterListed_WhenPartialReorder()
    {
        var ctx = TestDbContextFactory.CreateSimple("ReorderItemsPartial");
        var teacherId = Guid.NewGuid();
        var classroom = new Classroom(teacherId, "C", "", "CODE");
        ctx.Classrooms.Add(classroom);
        var module = new ClassroomModule(classroom.Id, "M", "", 0);
        ctx.ClassroomModules.Add(module);
        var lesson = new Lesson("L", "C", "monaco", "{}", 5);
        ctx.Lessons.Add(lesson);
        var itemA = new ClassroomModuleItem(module.Id, ModuleItemType.Lesson, lesson.Id, null, null, "Item A", "", 0, true);
        var itemB = new ClassroomModuleItem(module.Id, ModuleItemType.Lesson, lesson.Id, null, null, "Item B", "", 1, true);
        var itemC = new ClassroomModuleItem(module.Id, ModuleItemType.Lesson, lesson.Id, null, null, "Item C", "", 2, true);
        ctx.ClassroomModuleItems.AddRange(itemA, itemB, itemC);
        await ctx.SaveChangesAsync();

        var handler = new ReorderClassroomModuleItemsCommandHandler(ctx);
        var cmd = new ReorderClassroomModuleItemsCommand
        {
            ModuleId = module.Id,
            TeacherId = teacherId,
            ItemOrders = new()
            {
                // Chỉ đưa B và C vào danh sách → A phải lùi về sau cùng.
                new ItemOrderDto { ItemId = itemC.Id, OrderIndex = 0 },
                new ItemOrderDto { ItemId = itemB.Id, OrderIndex = 1 }
            }
        };

        await handler.Handle(cmd, CancellationToken.None);

        var updated = await ctx.ClassroomModuleItems.OrderBy(i => i.OrderIndex).ToListAsync();
        updated.Should().HaveCount(3);
        updated[0].OverrideTitle.Should().Be("Item C");
        updated[1].OverrideTitle.Should().Be("Item B");
        updated[2].OverrideTitle.Should().Be("Item A");
    }

    // LS-023: duplicate itemId trong danh sách → ArgumentException (400).
    [Fact]
    public async Task Handle_ThrowsArgument_WhenDuplicateItemIds()
    {
        var ctx = TestDbContextFactory.CreateSimple("ReorderItemsDuplicate");
        var teacherId = Guid.NewGuid();
        var classroom = new Classroom(teacherId, "C", "", "CODE");
        ctx.Classrooms.Add(classroom);
        var module = new ClassroomModule(classroom.Id, "M", "", 0);
        ctx.ClassroomModules.Add(module);
        var lesson = new Lesson("L", "C", "monaco", "{}", 5);
        ctx.Lessons.Add(lesson);
        var item = new ClassroomModuleItem(module.Id, ModuleItemType.Lesson, lesson.Id, null, null, "Item A", "", 0, true);
        ctx.ClassroomModuleItems.Add(item);
        await ctx.SaveChangesAsync();

        var handler = new ReorderClassroomModuleItemsCommandHandler(ctx);
        var cmd = new ReorderClassroomModuleItemsCommand
        {
            ModuleId = module.Id,
            TeacherId = teacherId,
            ItemOrders = new()
            {
                new ItemOrderDto { ItemId = item.Id, OrderIndex = 0 },
                new ItemOrderDto { ItemId = item.Id, OrderIndex = 1 }
            }
        };

        await Assert.ThrowsAsync<ArgumentException>(() => handler.Handle(cmd, CancellationToken.None));
    }

    // LS-023: itemId của module KHÁC → ArgumentException (400) — trước đây bỏ im lặng.
    [Fact]
    public async Task Handle_ThrowsArgument_WhenItemIdFromAnotherModule()
    {
        var ctx = TestDbContextFactory.CreateSimple("ReorderItemsCrossModule");
        var teacherId = Guid.NewGuid();
        var classroom = new Classroom(teacherId, "C", "", "CODE");
        ctx.Classrooms.Add(classroom);
        var module1 = new ClassroomModule(classroom.Id, "M1", "", 0);
        var module2 = new ClassroomModule(classroom.Id, "M2", "", 1);
        ctx.ClassroomModules.AddRange(module1, module2);
        var lesson = new Lesson("L", "C", "monaco", "{}", 5);
        ctx.Lessons.Add(lesson);
        var itemInModule2 = new ClassroomModuleItem(module2.Id, ModuleItemType.Lesson, lesson.Id, null, null, "Item B", "", 0, true);
        var itemInModule1 = new ClassroomModuleItem(module1.Id, ModuleItemType.Lesson, lesson.Id, null, null, "Item A", "", 0, true);
        ctx.ClassroomModuleItems.AddRange(itemInModule1, itemInModule2);
        await ctx.SaveChangesAsync();

        var handler = new ReorderClassroomModuleItemsCommandHandler(ctx);
        var cmd = new ReorderClassroomModuleItemsCommand
        {
            ModuleId = module1.Id,
            TeacherId = teacherId,
            ItemOrders = new() { new ItemOrderDto { ItemId = itemInModule2.Id, OrderIndex = 0 } }
        };

        await Assert.ThrowsAsync<ArgumentException>(() => handler.Handle(cmd, CancellationToken.None));
    }
}
