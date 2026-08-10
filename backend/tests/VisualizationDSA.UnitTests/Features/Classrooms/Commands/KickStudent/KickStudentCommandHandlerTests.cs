using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Features.Classrooms.Commands.KickStudent;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.UnitTests.Common;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Classrooms.Commands.KickStudent;

public class KickStudentCommandHandlerTests
{
    [Fact]
    public async Task Handle_KicksStudent_WhenValidRequest()
    {
        var ctx = TestDbContextFactory.CreateSimple("KickValid_" + Guid.NewGuid().ToString("N"));
        var teacherId = Guid.NewGuid();
        var studentId = Guid.NewGuid();
        var classroom = new Classroom(teacherId, "C", "", "CODE");
        ctx.Classrooms.Add(classroom);
        ctx.ClassroomEnrollments.Add(new ClassroomEnrollment(classroom.Id, studentId));
        await ctx.SaveChangesAsync();

        var handler = new KickStudentCommandHandler(ctx);
        var cmd = new KickStudentCommand { TeacherId = teacherId, ClassroomId = classroom.Id, StudentId = studentId };

        await handler.Handle(cmd, CancellationToken.None);

        var enrollment = await ctx.ClassroomEnrollments.FirstAsync(e => e.StudentId == studentId);
        enrollment.Status.Should().Be(EnrollmentStatus.Kicked);
    }

    [Fact]
    public async Task Handle_ThrowsUnauthorized_WhenWrongTeacher()
    {
        var ctx = TestDbContextFactory.CreateSimple("KickUnauthorized_" + Guid.NewGuid().ToString("N"));
        var classroom = new Classroom(Guid.NewGuid(), "C", "", "CODE");
        ctx.Classrooms.Add(classroom);
        await ctx.SaveChangesAsync();

        var handler = new KickStudentCommandHandler(ctx);
        var cmd = new KickStudentCommand { TeacherId = Guid.NewGuid(), ClassroomId = classroom.Id, StudentId = Guid.NewGuid() };

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => handler.Handle(cmd, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ThrowsArgument_WhenStudentNotInClassroom()
    {
        var ctx = TestDbContextFactory.CreateSimple("KickNotFound_" + Guid.NewGuid().ToString("N"));
        var teacherId = Guid.NewGuid();
        var classroom = new Classroom(teacherId, "C", "", "CODE");
        ctx.Classrooms.Add(classroom);
        await ctx.SaveChangesAsync();

        var handler = new KickStudentCommandHandler(ctx);
        var cmd = new KickStudentCommand { TeacherId = teacherId, ClassroomId = classroom.Id, StudentId = Guid.NewGuid() };

        await Assert.ThrowsAsync<ArgumentException>(() => handler.Handle(cmd, CancellationToken.None));
    }
}
