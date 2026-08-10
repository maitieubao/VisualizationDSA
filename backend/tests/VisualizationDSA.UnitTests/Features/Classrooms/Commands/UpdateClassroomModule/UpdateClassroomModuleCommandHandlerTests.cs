using System;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using VisualizationDSA.Application.Features.Classrooms.Commands.UpdateClassroomModule;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.UnitTests.Common;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Classrooms.Commands.UpdateClassroomModule;

public class UpdateClassroomModuleCommandHandlerTests
{
    private async Task<(Guid moduleId, Guid teacherId, Guid otherTeacherId, ApplicationDbContext ctx)> Setup(string dbName = null)
    {
        var ctx = TestDbContextFactory.CreateSimple(dbName ?? "UpdateClassroomModule_" + Guid.NewGuid().ToString("N"));
        var teacherId = Guid.NewGuid();
        var otherTeacherId = Guid.NewGuid();
        var owner = new User("teacher@test.com", "teacher", "hash");
        var idProp = typeof(User).GetProperty("Id");
        idProp.SetValue(owner, teacherId);
        ctx.Users.Add(owner);
        var other = new User("other@test.com", "teacher", "hash");
        idProp.SetValue(other, otherTeacherId);
        ctx.Users.Add(other);
        var classroom = new Classroom(teacherId, "Class 1", "", "CODE1");
        ctx.Classrooms.Add(classroom);
        await ctx.SaveChangesAsync();
        var module = new ClassroomModule(classroom.Id, "Math", "Module", 1, false, null);
        ctx.ClassroomModules.Add(module);
        await ctx.SaveChangesAsync();
        return (module.Id, teacherId, otherTeacherId, ctx);
    }

    [Fact]
    public async Task Handle_UpdatesModule_WhenAuthorized()
    {
        var (moduleId, teacherId, _, ctx) = await Setup();
        var handler = new UpdateClassroomModuleCommandHandler(ctx);
        await handler.Handle(new UpdateClassroomModuleCommand { ModuleId = moduleId, TeacherId = teacherId, Title = "Updated", Description = "New", OrderIndex = 2, IsHidden = true, UnlockAt = (DateTime?)null }, CancellationToken.None);

        var module = ctx.ClassroomModules.First(m => m.Id == moduleId);
        module.Title.Should().Be("Updated");
        module.OrderIndex.Should().Be(2);
        module.IsHidden.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_ThrowsArgumentException_WhenModuleNotFound()
    {
        var (_, teacherId, _, ctx) = await Setup();
        var handler = new UpdateClassroomModuleCommandHandler(ctx);
        await Assert.ThrowsAsync<ArgumentException>(() => handler.Handle(new UpdateClassroomModuleCommand { ModuleId = Guid.NewGuid(), TeacherId = teacherId, Title = "X", Description = "", OrderIndex = 1, IsHidden = false, UnlockAt = (DateTime?)null }, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ThrowsUnauthorizedAccessException_WhenNotOwner()
    {
        var (moduleId, _, otherTeacherId, ctx) = await Setup();
        var handler = new UpdateClassroomModuleCommandHandler(ctx);
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => handler.Handle(new UpdateClassroomModuleCommand { ModuleId = moduleId, TeacherId = otherTeacherId, Title = "X", Description = "", OrderIndex = 1, IsHidden = false, UnlockAt = (DateTime?)null }, CancellationToken.None));
    }
}
