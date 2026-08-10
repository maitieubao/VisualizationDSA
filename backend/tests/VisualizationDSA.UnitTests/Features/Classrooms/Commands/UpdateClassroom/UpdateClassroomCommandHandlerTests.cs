using System;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using VisualizationDSA.Application.Features.Classrooms.Commands.UpdateClassroom;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.UnitTests.Common;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Classrooms.Commands.UpdateClassroom;

public class UpdateClassroomCommandHandlerTests
{
    private async Task<(Guid classroomId, Guid teacherId, Guid otherTeacherId, ApplicationDbContext ctx)> Setup(string dbName = null)
    {
        var ctx = TestDbContextFactory.CreateSimple(dbName ?? "UpdateClassroom_" + Guid.NewGuid().ToString("N"));
        var teacherId = Guid.NewGuid();
        var otherTeacherId = Guid.NewGuid();
        var owner = new User("teacher@test.com", "teacher", "hash");
        var idProp = typeof(User).GetProperty("Id");
        idProp.SetValue(owner, teacherId);
        ctx.Users.Add(owner);
        var other = new User("other@test.com", "teacher", "hash");
        idProp.SetValue(other, otherTeacherId);
        ctx.Users.Add(other);
        var classroom = new Classroom(teacherId, "Class 1", "Desc", "CODE1");
        ctx.Classrooms.Add(classroom);
        await ctx.SaveChangesAsync();
        return (classroom.Id, teacherId, otherTeacherId, ctx);
    }

    [Fact]
    public async Task Handle_UpdatesDetails_WhenAuthorized()
    {
        var (classroomId, teacherId, _, ctx) = await Setup();
        var handler = new UpdateClassroomCommandHandler(ctx);
        await handler.Handle(new UpdateClassroomCommand { ClassroomId = classroomId, TeacherId = teacherId, Name = "Updated", Description = "New Desc" }, CancellationToken.None);

        var classroom = ctx.Classrooms.First(c => c.Id == classroomId);
        classroom.Name.Should().Be("Updated");
        classroom.Description.Should().Be("New Desc");
    }

    [Fact]
    public async Task Handle_ThrowsArgumentException_WhenClassroomNotFound()
    {
        var (_, teacherId, _, ctx) = await Setup();
        var handler = new UpdateClassroomCommandHandler(ctx);
        await Assert.ThrowsAsync<ArgumentException>(() => handler.Handle(new UpdateClassroomCommand { ClassroomId = Guid.NewGuid(), TeacherId = teacherId, Name = "X", Description = "" }, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ThrowsUnauthorizedAccessException_WhenNotOwner()
    {
        var (classroomId, _, otherTeacherId, ctx) = await Setup();
        var handler = new UpdateClassroomCommandHandler(ctx);
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => handler.Handle(new UpdateClassroomCommand { ClassroomId = classroomId, TeacherId = otherTeacherId, Name = "X", Description = "" }, CancellationToken.None));
    }
}
