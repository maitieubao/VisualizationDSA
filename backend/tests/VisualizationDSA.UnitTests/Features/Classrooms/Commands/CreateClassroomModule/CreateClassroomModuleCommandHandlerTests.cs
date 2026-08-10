using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Features.Classrooms.Commands.CreateClassroomModule;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.UnitTests.Common;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Classrooms.Commands.CreateClassroomModule;

public class CreateClassroomModuleCommandHandlerTests
{
    [Fact]
    public async Task Handle_CreatesModule_WhenValidRequest()
    {
        var ctx = TestDbContextFactory.CreateSimple("CreateModuleValid");
        var teacherId = Guid.NewGuid();
        var classroom = new Classroom(teacherId, "C", "", "CODE");
        ctx.Classrooms.Add(classroom);
        await ctx.SaveChangesAsync();

        var handler = new CreateClassroomModuleCommandHandler(ctx);
        var cmd = new CreateClassroomModuleCommand
        {
            ClassroomId = classroom.Id,
            TeacherId = teacherId,
            Title = "New Module",
            Description = "Desc",
            OrderIndex = 0,
            UnlockAt = null
        };

        var moduleId = await handler.Handle(cmd, CancellationToken.None);

        var module = await ctx.ClassroomModules.FindAsync(moduleId);
        module.Should().NotBeNull();
        module!.Title.Should().Be("New Module");
        module.Description.Should().Be("Desc");
        module.OrderIndex.Should().Be(0);
    }

    [Fact]
    public async Task Handle_ThrowsArgument_WhenClassroomNotFound()
    {
        var ctx = TestDbContextFactory.CreateSimple("CreateModuleNotFound");
        var handler = new CreateClassroomModuleCommandHandler(ctx);
        var cmd = new CreateClassroomModuleCommand
        {
            ClassroomId = Guid.NewGuid(),
            TeacherId = Guid.NewGuid(),
            Title = "X",
            OrderIndex = 0
        };

        await Assert.ThrowsAsync<ArgumentException>(() => handler.Handle(cmd, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ThrowsUnauthorized_WhenWrongTeacher()
    {
        var ctx = TestDbContextFactory.CreateSimple("CreateModuleUnauthorized");
        var classroom = new Classroom(Guid.NewGuid(), "C", "", "CODE");
        ctx.Classrooms.Add(classroom);
        await ctx.SaveChangesAsync();

        var handler = new CreateClassroomModuleCommandHandler(ctx);
        var cmd = new CreateClassroomModuleCommand
        {
            ClassroomId = classroom.Id,
            TeacherId = Guid.NewGuid(),
            Title = "X",
            OrderIndex = 0
        };

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => handler.Handle(cmd, CancellationToken.None));
    }
}

