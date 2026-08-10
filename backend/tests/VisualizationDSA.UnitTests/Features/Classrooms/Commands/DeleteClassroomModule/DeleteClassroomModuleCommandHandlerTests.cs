using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Features.Classrooms.Commands.DeleteClassroomModule;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.UnitTests.Common;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Classrooms.Commands.DeleteClassroomModule;

public class DeleteClassroomModuleCommandHandlerTests
{
    [Fact]
    public async Task Handle_SoftDeletesModule_WhenValidRequest()
    {
        var ctx = TestDbContextFactory.CreateSimple("DeleteModuleValid");
        var teacherId = Guid.NewGuid();
        var classroom = new Classroom(teacherId, "Test", "", "CODE");
        ctx.Classrooms.Add(classroom);
        var module = new ClassroomModule(classroom.Id, "M", "", 0);
        ctx.ClassroomModules.Add(module);
        await ctx.SaveChangesAsync();

        var handler = new DeleteClassroomModuleCommandHandler(ctx);
        var cmd = new DeleteClassroomModuleCommand
        {
            TeacherId = teacherId,
            ClassroomId = classroom.Id,
            ModuleId = module.Id
        };

        await handler.Handle(cmd, CancellationToken.None);

        // Global query filter excludes IsDeleted, so normally not visible.
        // Bypass filter to verify the flag was set.
        var deleted = await ctx.ClassroomModules.IgnoreQueryFilters().FirstAsync(m => m.Id == module.Id);
        deleted.IsDeleted.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_ThrowsUnauthorized_WhenWrongTeacher()
    {
        var ctx = TestDbContextFactory.CreateSimple("DeleteModuleUnauthorized");
        var classroom = new Classroom(Guid.NewGuid(), "T", "", "CODE");
        ctx.Classrooms.Add(classroom);
        var module = new ClassroomModule(classroom.Id, "M", "", 0);
        ctx.ClassroomModules.Add(module);
        await ctx.SaveChangesAsync();

        var handler = new DeleteClassroomModuleCommandHandler(ctx);
        var cmd = new DeleteClassroomModuleCommand
        {
            TeacherId = Guid.NewGuid(),
            ClassroomId = classroom.Id,
            ModuleId = module.Id
        };

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => handler.Handle(cmd, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ThrowsArgument_WhenModuleNotFound()
    {
        var ctx = TestDbContextFactory.CreateSimple("DeleteModuleNotFound");
        var teacherId = Guid.NewGuid();
        var classroom = new Classroom(teacherId, "T", "", "CODE");
        ctx.Classrooms.Add(classroom);
        await ctx.SaveChangesAsync();

        var handler = new DeleteClassroomModuleCommandHandler(ctx);
        var cmd = new DeleteClassroomModuleCommand
        {
            TeacherId = teacherId,
            ClassroomId = classroom.Id,
            ModuleId = Guid.NewGuid()
        };

        await Assert.ThrowsAsync<ArgumentException>(() => handler.Handle(cmd, CancellationToken.None));
    }
}
