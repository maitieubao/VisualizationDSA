using System;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using VisualizationDSA.Application.Features.Classrooms.Queries.GetClassroomStudents;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.UnitTests.Common;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Classrooms.Queries.GetClassroomStudents;

public class GetClassroomStudentsQueryHandlerTests
{
    private async Task<(Guid classroomId, Guid studentId, Guid teacherId, ApplicationDbContext ctx)> Setup(string dbName = null)
    {
        var ctx = TestDbContextFactory.CreateSimple(dbName ?? "GetClassroomStudents_" + Guid.NewGuid().ToString("N"));
        var teacherId = Guid.NewGuid();
        var studentId = Guid.NewGuid();
        var otherTeacherId = Guid.NewGuid();
        var owner = new User("teacher@test.com", "teacher", "hash");
        var idProp = typeof(User).GetProperty("Id");
        idProp.SetValue(owner, teacherId);
        ctx.Users.Add(owner);
        var otherOwner = new User("other@test.com", "teacher", "hash");
        idProp.SetValue(otherOwner, otherTeacherId);
        ctx.Users.Add(otherOwner);
        var student = new User("student@test.com", "student", "hash");
        idProp.SetValue(student, studentId);
        ctx.Users.Add(student);
        var classroom = new Classroom(teacherId, "Class 1", "", "CODE1");
        ctx.Classrooms.Add(classroom);
        await ctx.SaveChangesAsync();
        ctx.ClassroomEnrollments.Add(new ClassroomEnrollment(classroom.Id, studentId));
        await ctx.SaveChangesAsync();
        return (classroom.Id, studentId, teacherId, ctx);
    }

    [Fact]
    public async Task Handle_ReturnsStudents_WhenAuthorized()
    {
        var (classroomId, _, teacherId, ctx) = await Setup();
        var handler = new GetClassroomStudentsQueryHandler(ctx);
        var result = await handler.Handle(new GetClassroomStudentsQuery { ClassroomId = classroomId, TeacherId = teacherId }, CancellationToken.None);
        result.Should().HaveCount(1);
    }

    [Fact]
    public async Task Handle_ThrowsArgumentException_WhenClassroomNotFound()
    {
        var (_, _, teacherId, ctx) = await Setup();
        var handler = new GetClassroomStudentsQueryHandler(ctx);
        await Assert.ThrowsAsync<ArgumentException>(() => handler.Handle(new GetClassroomStudentsQuery { ClassroomId = Guid.NewGuid(), TeacherId = teacherId }, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ThrowsUnauthorizedAccessException_WhenNotOwner()
    {
        var (classroomId, _, _, ctx) = await Setup();
        var handler = new GetClassroomStudentsQueryHandler(ctx);
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => handler.Handle(new GetClassroomStudentsQuery { ClassroomId = classroomId, TeacherId = Guid.NewGuid() }, CancellationToken.None));
    }
}
