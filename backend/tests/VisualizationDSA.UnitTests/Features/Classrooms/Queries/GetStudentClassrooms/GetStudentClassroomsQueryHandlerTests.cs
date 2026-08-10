using System;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using VisualizationDSA.Application.Features.Classrooms.Queries.GetStudentClassrooms;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.UnitTests.Common;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Classrooms.Queries.GetStudentClassrooms;

public class GetStudentClassroomsQueryHandlerTests
{
    private async Task<(Guid studentId, ApplicationDbContext ctx)> Setup(string dbName = null)
    {
        var ctx = TestDbContextFactory.CreateSimple(dbName ?? "GetStudentClassrooms_" + Guid.NewGuid().ToString("N"));
        var teacherId = Guid.NewGuid();
        var studentId = Guid.NewGuid();
        var owner = new User("teacher@test.com", "teacher", "hash");
        var idProp = typeof(User).GetProperty("Id");
        idProp.SetValue(owner, teacherId);
        ctx.Users.Add(owner);
        var student = new User("student@test.com", "student", "hash");
        idProp.SetValue(student, studentId);
        ctx.Users.Add(student);
        var classroom = new Classroom(teacherId, "Class 1", "", "CODE1");
        ctx.Classrooms.Add(classroom);
        await ctx.SaveChangesAsync();
        ctx.ClassroomEnrollments.Add(new ClassroomEnrollment(classroom.Id, studentId));
        await ctx.SaveChangesAsync();
        return (studentId, ctx);
    }

    [Fact]
    public async Task Handle_ReturnsClassrooms_WithActiveEnrollmentsOnly()
    {
        var (studentId, ctx) = await Setup();
        var classroom = ctx.Classrooms.First();
        var secondClassroom = new Classroom(classroom.OwnerTeacherId, "Class 2", "", "CODE2");
        ctx.Classrooms.Add(secondClassroom);
        await ctx.SaveChangesAsync();
        // Add a second student with Kicked status
        var kickedStudent = new User("kicked@test.com", "student", "hash");
        var sidProp = typeof(User).GetProperty("Id");
        sidProp.SetValue(kickedStudent, Guid.NewGuid());
        ctx.Users.Add(kickedStudent);
        await ctx.SaveChangesAsync();
        var enroll = new ClassroomEnrollment(secondClassroom.Id, kickedStudent.Id);
        // Kick via reflection
        var statusField = typeof(ClassroomEnrollment).GetField("<Status>k__BackingField", BindingFlags.NonPublic | BindingFlags.Instance);
        statusField.SetValue(enroll, EnrollmentStatus.Kicked);
        ctx.ClassroomEnrollments.Add(enroll);
        await ctx.SaveChangesAsync();

        var handler = new GetStudentClassroomsQueryHandler(ctx);
        var result = (await handler.Handle(new GetStudentClassroomsQuery { StudentId = studentId }, CancellationToken.None)).ToList();

        result.Should().ContainSingle();
        result[0].Name.Should().Be("Class 1");
        result[0].InviteCode.Should().BeNull(); // Security: no invite code for students
    }

    [Fact]
    public async Task Handle_ReturnsEmpty_WhenStudentHasNoEnrollments()
    {
        var (_, ctx) = await Setup();
        var handler = new GetStudentClassroomsQueryHandler(ctx);
        var result = await handler.Handle(new GetStudentClassroomsQuery { StudentId = Guid.NewGuid() }, CancellationToken.None);
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_ExcludesArchivedClassrooms()
    {
        var (studentId, ctx) = await Setup();
        var classroom = ctx.Classrooms.First();
        var archivedClassroom = new Classroom(classroom.OwnerTeacherId, "Archived Class", "", "ARC1");
        ctx.Classrooms.Add(archivedClassroom);
        await ctx.SaveChangesAsync();
        ctx.ClassroomEnrollments.Add(new ClassroomEnrollment(archivedClassroom.Id, studentId));
        await ctx.SaveChangesAsync();
        archivedClassroom.Archive();
        await ctx.SaveChangesAsync();

        var handler = new GetStudentClassroomsQueryHandler(ctx);
        var result = await handler.Handle(new GetStudentClassroomsQuery { StudentId = studentId }, CancellationToken.None);
        result.Should().ContainSingle(c => c.Name == "Class 1");
    }
}
