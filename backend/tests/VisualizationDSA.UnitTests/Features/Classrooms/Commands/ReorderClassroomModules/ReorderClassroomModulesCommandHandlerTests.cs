using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Common.Exceptions;
using VisualizationDSA.Application.Features.Classrooms.Commands.ReorderClassroomModules;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.UnitTests.Common;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Classrooms.Commands.ReorderClassroomModules;

public class ReorderClassroomModulesCommandHandlerTests
{
    [Fact]
    public async Task Handle_UpdatesOrderIndex_WhenValidRequest()
    {
        var ctx = TestDbContextFactory.CreateSimple("ReorderModulesValid");
        var teacherId = Guid.NewGuid();
        var classroom = new Classroom(teacherId, "Test Class", "", "CODE123");
        ctx.Classrooms.Add(classroom);
        var m1 = new ClassroomModule(classroom.Id, "Module A", "", 0);
        var m2 = new ClassroomModule(classroom.Id, "Module B", "", 1);
        ctx.ClassroomModules.AddRange(m1, m2);
        await ctx.SaveChangesAsync();

        var handler = new ReorderClassroomModulesCommandHandler(ctx);
        var cmd = new ReorderClassroomModulesCommand
        {
            ClassroomId = classroom.Id,
            TeacherId = teacherId,
            ModuleOrders = new()
            {
                new ModuleOrderDto { ModuleId = m2.Id, OrderIndex = 0 },
                new ModuleOrderDto { ModuleId = m1.Id, OrderIndex = 1 }
            }
        };

        await handler.Handle(cmd, CancellationToken.None);

        var updated = await ctx.ClassroomModules.OrderBy(m => m.OrderIndex).ToListAsync();
        updated[0].Title.Should().Be("Module B");
        updated[1].Title.Should().Be("Module A");
    }

    [Fact]
    public async Task Handle_ThrowsUnauthorized_WhenWrongTeacher()
    {
        var ctx = TestDbContextFactory.CreateSimple("ReorderModulesUnauthorized");
        var classroom = new Classroom(Guid.NewGuid(), "Test", "", "CODE");
        ctx.Classrooms.Add(classroom);
        var m = new ClassroomModule(classroom.Id, "M", "", 0);
        ctx.ClassroomModules.Add(m);
        await ctx.SaveChangesAsync();

        var handler = new ReorderClassroomModulesCommandHandler(ctx);
        var cmd = new ReorderClassroomModulesCommand
        {
            ClassroomId = classroom.Id,
            TeacherId = Guid.NewGuid(),
            ModuleOrders = new() { new ModuleOrderDto { ModuleId = m.Id, OrderIndex = 0 } }
        };

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => handler.Handle(cmd, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ThrowsConflict_WhenConcurrencyOccurs()
    {
        // Use concurrency-stub context to simulate stale RowVersion without real Sqlite
        var ctx = TestDbContextFactory.CreateSimple("ReorderModulesConflict");
        var teacherId = Guid.NewGuid();
        var classroom = new Classroom(teacherId, "Test", "", "CODE");
        ctx.Classrooms.Add(classroom);
        var m = new ClassroomModule(classroom.Id, "M", "", 0);
        ctx.ClassroomModules.Add(m);
        await ctx.SaveChangesAsync();

        var conflictCtx = new ConcurrencyConflictDbContext(ctx);
        var handler = new ReorderClassroomModulesCommandHandler(conflictCtx);
        var cmd = new ReorderClassroomModulesCommand
        {
            ClassroomId = classroom.Id,
            TeacherId = teacherId,
            ModuleOrders = new() { new ModuleOrderDto { ModuleId = m.Id, OrderIndex = 1 } }
        };

        await Assert.ThrowsAsync<ConflictException>(() => handler.Handle(cmd, CancellationToken.None));
    }
}
