using System;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using VisualizationDSA.Application.Features.Classrooms.Commands.CreateClassroom;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.UnitTests.Common;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Classrooms.Commands.CreateClassroom;

public class CreateClassroomCommandHandlerTests
{
    private async Task<(Guid teacherId, ApplicationDbContext ctx)> Setup(string dbName = null)
    {
        var ctx = TestDbContextFactory.CreateSimple(dbName ?? "CreateClassroom_" + Guid.NewGuid().ToString("N"));
        var teacherId = Guid.NewGuid();
        var owner = new User("teacher@test.com", "teacher", "hash");
        var idProp = typeof(User).GetProperty("Id");
        idProp.SetValue(owner, teacherId);
        owner.SetRole("Teacher");
        ctx.Users.Add(owner);
        await ctx.SaveChangesAsync();
        return (teacherId, ctx);
    }

    [Fact]
    public async Task Handle_CreatesClassroom_WhenValidTeacher()
    {
        var (teacherId, ctx) = await Setup();
        var handler = new CreateClassroomCommandHandler(ctx);
        var result = await handler.Handle(new CreateClassroomCommand { TeacherId = teacherId, Name = "My Class", Description = "My Desc" }, CancellationToken.None);

        result.Id.Should().NotBeEmpty();
        result.Name.Should().Be("My Class");
        result.StudentCount.Should().Be(0);
        ctx.Classrooms.Should().ContainSingle(c => c.Name == "My Class");
    }

    [Fact]
    public async Task Handle_ThrowsUnauthorizedAccessException_WhenUserDoesNotExist()
    {
        var (_, ctx) = await Setup();
        var handler = new CreateClassroomCommandHandler(ctx);
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => handler.Handle(new CreateClassroomCommand { TeacherId = Guid.NewGuid(), Name = "Class", Description = "" }, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ThrowsUnauthorizedAccessException_WhenUserNotTeacher()
    {
        var (teacherId, ctx) = await Setup();
        var student = new User("student@test.com", "student", "hash");
        ctx.Users.Add(student);
        await ctx.SaveChangesAsync();
        var handler = new CreateClassroomCommandHandler(ctx);
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => handler.Handle(new CreateClassroomCommand { TeacherId = student.Id, Name = "Class", Description = "" }, CancellationToken.None));
    }
}
