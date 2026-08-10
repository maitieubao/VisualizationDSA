using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Features.Classrooms.Commands.ArchiveClassroom;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.UnitTests.Common;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Classrooms.Commands.ArchiveClassroom;

public class ArchiveClassroomCommandHandlerTests
{
    [Fact]
    public async Task Handle_ArchivesClassroom_WhenValidRequest()
    {
        var ctx = TestDbContextFactory.CreateSimple("ArchiveValid");
        var teacherId = Guid.NewGuid();
        var classroom = new Classroom(teacherId, "C", "", "CODE");
        ctx.Classrooms.Add(classroom);
        await ctx.SaveChangesAsync();

        var handler = new ArchiveClassroomCommandHandler(ctx);
        var cmd = new ArchiveClassroomCommand { TeacherId = teacherId, ClassroomId = classroom.Id };

        await handler.Handle(cmd, CancellationToken.None);

        var archived = await ctx.Classrooms.FirstAsync(c => c.Id == classroom.Id);
        archived.IsArchived.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_ThrowsUnauthorized_WhenWrongTeacher()
    {
        var ctx = TestDbContextFactory.CreateSimple("ArchiveUnauthorized");
        var classroom = new Classroom(Guid.NewGuid(), "C", "", "CODE");
        ctx.Classrooms.Add(classroom);
        await ctx.SaveChangesAsync();

        var handler = new ArchiveClassroomCommandHandler(ctx);
        var cmd = new ArchiveClassroomCommand { TeacherId = Guid.NewGuid(), ClassroomId = classroom.Id };

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => handler.Handle(cmd, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ThrowsArgument_WhenClassroomNotFound()
    {
        var ctx = TestDbContextFactory.CreateSimple("ArchiveNotFound");
        var handler = new ArchiveClassroomCommandHandler(ctx);
        var cmd = new ArchiveClassroomCommand { TeacherId = Guid.NewGuid(), ClassroomId = Guid.NewGuid() };

        await Assert.ThrowsAsync<ArgumentException>(() => handler.Handle(cmd, CancellationToken.None));
    }
}

