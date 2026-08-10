using System;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using VisualizationDSA.Application.Features.Classrooms.Queries.GetTeacherClassrooms;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.UnitTests.Common;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Classrooms.Queries.GetTeacherClassrooms;

public class GetTeacherClassroomsQueryHandlerTests
{
    private async Task<(Guid teacherId, ApplicationDbContext ctx)> Setup(string dbName = null)
    {
        var ctx = TestDbContextFactory.CreateSimple(dbName ?? "GetTeacherClassrooms_" + Guid.NewGuid().ToString("N"));
        var teacherId = Guid.NewGuid();
        var owner = new User("teacher@test.com", "teacher", "hash");
        var idProp = typeof(User).GetProperty("Id");
        idProp.SetValue(owner, teacherId);
        ctx.Users.Add(owner);
        ctx.Classrooms.Add(new Classroom(teacherId, "Class 1", "Desc 1", "CODE1"));
        ctx.Classrooms.Add(new Classroom(teacherId, "Class 2", "Desc 2", "CODE2"));
        await ctx.SaveChangesAsync();
        return (teacherId, ctx);
    }

    [Fact]
    public async Task Handle_ReturnsOnlyActiveClassrooms_ForTeacherId()
    {
        var (teacherId, ctx) = await Setup();
        var archived = new Classroom(teacherId, "Archived", "Desc", "ARC123");
        archived.Archive();
        ctx.Classrooms.Add(archived);
        await ctx.SaveChangesAsync();

        var handler = new GetTeacherClassroomsQueryHandler(ctx);
        var result = await handler.Handle(new GetTeacherClassroomsQuery { TeacherId = teacherId }, CancellationToken.None);

        result.Should().HaveCount(2);
        result.Should().NotContain(c => c.Name == "Archived");
    }

    [Fact]
    public async Task Handle_ReturnsEmpty_WhenTeacherHasNoClassrooms()
    {
        var (_, ctx) = await Setup();
        var handler = new GetTeacherClassroomsQueryHandler(ctx);
        var result = await handler.Handle(new GetTeacherClassroomsQuery { TeacherId = Guid.NewGuid() }, CancellationToken.None);
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_ReturnsOrderedByCreatedAtDescending()
    {
        var (teacherId, ctx) = await Setup();
        var handler = new GetTeacherClassroomsQueryHandler(ctx);
        var result = await handler.Handle(new GetTeacherClassroomsQuery { TeacherId = teacherId }, CancellationToken.None);
        var dates = result.Select(c => c.CreatedAt).ToList();
        dates.Should().BeInDescendingOrder();
    }
}
