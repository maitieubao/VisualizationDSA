using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using System.Reflection;
using VisualizationDSA.Application.Features.Classrooms.Commands.JoinClassroom;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.UnitTests.Common;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Classrooms.Commands.JoinClassroom;

public class JoinClassroomCommandHandlerTests
{
    private async Task<(Classroom classroom, Guid studentId, ApplicationDbContext ctx)> Setup(Classroom classroom = null, string dbName = null)
    {
        var ctx = TestDbContextFactory.CreateSimple(dbName ?? "JoinClassroom_" + Guid.NewGuid().ToString("N"));
        var teacherId = Guid.NewGuid();
        var owner = new User("teacher@test.com", "teacher", "hash");
        // Align user Id with classroom OwnerTeacherId
        var idProp = typeof(User).GetProperty("Id");
        idProp.SetValue(owner, teacherId);
        ctx.Users.Add(owner);
        classroom = classroom ?? new Classroom(teacherId, "Math", "", "ABC123");
        ctx.Classrooms.Add(classroom);
        var student = new User("student@test.com", "student", "hash");
        var sidProp = typeof(User).GetProperty("Id");
        var studentId = Guid.NewGuid();
        sidProp.SetValue(student, studentId);
        ctx.Users.Add(student);
        await ctx.SaveChangesAsync();
        return (classroom, studentId, ctx);
    }

    [Fact]
    public async Task Handle_EnrollsStudent_WhenValidInviteCode()
    {
        var (classroom, studentId, ctx) = await Setup();
        var handler = new JoinClassroomCommandHandler(ctx);
        var cmd = new JoinClassroomCommand { StudentId = studentId, InviteCode = classroom.InviteCode };

        var result = await handler.Handle(cmd, CancellationToken.None);

        result.Should().NotBeNull();
        result.Name.Should().Be("Math");
        var enrollment = await ctx.ClassroomEnrollments.FirstOrDefaultAsync(e => e.StudentId == studentId);
        enrollment.Should().NotBeNull();
        enrollment!.Status.Should().Be(EnrollmentStatus.Active);
    }

    [Fact]
    public async Task Handle_ThrowsArgument_WhenInviteCodeInvalid()
    {
        var (_, studentId, ctx) = await Setup();
        var handler = new JoinClassroomCommandHandler(ctx);
        var cmd = new JoinClassroomCommand { StudentId = studentId, InviteCode = "WRONG" };

        await Assert.ThrowsAsync<ArgumentException>(() => handler.Handle(cmd, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ThrowsArgument_WhenClassroomArchived()
    {
        var teacherId = Guid.NewGuid();
        var classroom = new Classroom(teacherId, "Archived", "", "ARCH");
        classroom.Archive();
        var (c, studentId, ctx) = await Setup(classroom);
        var handler = new JoinClassroomCommandHandler(ctx);
        var cmd = new JoinClassroomCommand { StudentId = studentId, InviteCode = c.InviteCode };

        await Assert.ThrowsAsync<ArgumentException>(() => handler.Handle(cmd, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ThrowsArgument_WhenInviteCodeExpired()
    {
        var teacherId = Guid.NewGuid();
        var classroom = new Classroom(teacherId, "Exp", "", "EXP", DateTime.UtcNow.AddDays(-1));
        var (c, studentId, ctx) = await Setup(classroom);
        var handler = new JoinClassroomCommandHandler(ctx);
        var cmd = new JoinClassroomCommand { StudentId = studentId, InviteCode = c.InviteCode };

        await Assert.ThrowsAsync<ArgumentException>(() => handler.Handle(cmd, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ReactivatesKickedStudent_InsteadOfCreatingNewEnrollment()
    {
        var (classroom, studentId, ctx) = await Setup();
        // First enroll then kick
        var enroll = new ClassroomEnrollment(classroom.Id, studentId);
        enroll.Kick(Guid.NewGuid(), "bad");
        ctx.ClassroomEnrollments.Add(enroll);
        await ctx.SaveChangesAsync();

        var handler = new JoinClassroomCommandHandler(ctx);
        var cmd = new JoinClassroomCommand { StudentId = studentId, InviteCode = classroom.InviteCode };
        await handler.Handle(cmd, CancellationToken.None);

        var active = await ctx.ClassroomEnrollments.CountAsync(e => e.Status == EnrollmentStatus.Active);
        active.Should().Be(1); // reactivated, not duplicated
    }

    [Fact]
    public async Task Handle_ThrowsInvalidOperationException_WhenAlreadyActive()
    {
        var (classroom, studentId, ctx) = await Setup();
        ctx.ClassroomEnrollments.Add(new ClassroomEnrollment(classroom.Id, studentId));
        await ctx.SaveChangesAsync();

        var handler = new JoinClassroomCommandHandler(ctx);
        var cmd = new JoinClassroomCommand { StudentId = studentId, InviteCode = classroom.InviteCode };

        // Enrollment exists with Active status → throws InvalidOperationException
        await Assert.ThrowsAsync<InvalidOperationException>(() => handler.Handle(cmd, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ThrowsInvalidOperationException_WhenStudentBanned()
    {
        var (classroom, studentId, ctx) = await Setup(dbName: "Banned_" + Guid.NewGuid().ToString("N"));
        var enroll = new ClassroomEnrollment(classroom.Id, studentId);
        ctx.ClassroomEnrollments.Add(enroll);
        await ctx.SaveChangesAsync();
        // Set status to Banned via backing field reflection (private setter)
        var backingField = typeof(ClassroomEnrollment).GetField("<Status>k__BackingField", BindingFlags.NonPublic | BindingFlags.Instance);
        backingField.SetValue(enroll, EnrollmentStatus.Banned);
        await ctx.SaveChangesAsync();

        var handler = new JoinClassroomCommandHandler(ctx);
        var cmd = new JoinClassroomCommand { StudentId = studentId, InviteCode = classroom.InviteCode };

        await Assert.ThrowsAsync<InvalidOperationException>(() => handler.Handle(cmd, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ThrowsArgument_WhenStudentNotFound()
    {
        var (classroom, _, ctx) = await Setup();
        var handler = new JoinClassroomCommandHandler(ctx);
        var cmd = new JoinClassroomCommand { StudentId = Guid.NewGuid(), InviteCode = classroom.InviteCode };

        await Assert.ThrowsAsync<ArgumentException>(() => handler.Handle(cmd, CancellationToken.None));
    }
}

