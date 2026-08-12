using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Features.Classrooms.Commands.LeaveClassroom;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.UnitTests.Common;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Classrooms.Commands.LeaveClassroom;

// CR-026: học viên tự rời lớp — chỉ đổi trạng thái Left (KHÔNG xóa dữ liệu tiến độ),
// rời rồi vẫn được join lại (khác với Kicked).
public class LeaveClassroomCommandHandlerTests
{
    private async Task<(Guid classroomId, Guid studentId, ApplicationDbContext ctx)> Setup(string dbName)
    {
        var ctx = TestDbContextFactory.CreateSimple("LeaveClassroom_" + dbName);
        var teacherId = Guid.NewGuid();
        var studentId = Guid.NewGuid();
        var classroom = new Classroom(teacherId, "C", "", "CODE");
        ctx.Classrooms.Add(classroom);
        await ctx.SaveChangesAsync();
        ctx.ClassroomEnrollments.Add(new ClassroomEnrollment(classroom.Id, studentId));
        await ctx.SaveChangesAsync();
        return (classroom.Id, studentId, ctx);
    }

    [Fact]
    public async Task Handle_SetsEnrollmentToLeft_KeepsProgressData()
    {
        var (classroomId, studentId, ctx) = await Setup("Happy");
        var handler = new LeaveClassroomCommandHandler(ctx);

        await handler.Handle(new LeaveClassroomCommand { ClassroomId = classroomId, StudentId = studentId }, CancellationToken.None);

        var enrollment = await ctx.ClassroomEnrollments.SingleAsync();
        enrollment.Status.Should().Be(EnrollmentStatus.Left);
    }

    [Fact]
    public async Task Handle_ThrowsArgument_WhenNotEnrolled()
    {
        var (classroomId, _, ctx) = await Setup("NotEnrolled");
        var handler = new LeaveClassroomCommandHandler(ctx);

        await Assert.ThrowsAsync<ArgumentException>(
            () => handler.Handle(new LeaveClassroomCommand { ClassroomId = classroomId, StudentId = Guid.NewGuid() }, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ThrowsArgument_WhenAlreadyLeft()
    {
        var (classroomId, studentId, ctx) = await Setup("AlreadyLeft");
        var enrollment = await ctx.ClassroomEnrollments.SingleAsync();
        enrollment.Leave();
        await ctx.SaveChangesAsync();

        var handler = new LeaveClassroomCommandHandler(ctx);

        await Assert.ThrowsAsync<ArgumentException>(
            () => handler.Handle(new LeaveClassroomCommand { ClassroomId = classroomId, StudentId = studentId }, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ThrowsArgument_WhenKicked()
    {
        var (classroomId, studentId, ctx) = await Setup("Kicked");
        var enrollment = await ctx.ClassroomEnrollments.SingleAsync();
        enrollment.Kick(Guid.NewGuid(), "bad");
        await ctx.SaveChangesAsync();

        var handler = new LeaveClassroomCommandHandler(ctx);

        await Assert.ThrowsAsync<ArgumentException>(
            () => handler.Handle(new LeaveClassroomCommand { ClassroomId = classroomId, StudentId = studentId }, CancellationToken.None));
    }
}
