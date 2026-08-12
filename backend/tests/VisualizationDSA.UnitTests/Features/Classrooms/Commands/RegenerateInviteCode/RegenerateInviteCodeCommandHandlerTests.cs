using System;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using VisualizationDSA.Application.Features.Classrooms.Commands.RegenerateInviteCode;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.UnitTests.Common;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Classrooms.Commands.RegenerateInviteCode;

public class RegenerateInviteCodeCommandHandlerTests
{
    private async Task<(Guid classroomId, Guid teacherId, ApplicationDbContext ctx)> Setup(string dbName = null)
    {
        var ctx = TestDbContextFactory.CreateSimple(dbName ?? "RegenerateInviteCode_" + Guid.NewGuid().ToString("N"));
        var teacherId = Guid.NewGuid();
        var owner = new User("teacher@test.com", "teacher", "hash");
        var idProp = typeof(User).GetProperty("Id");
        idProp.SetValue(owner, teacherId);
        ctx.Users.Add(owner);
        var classroom = new Classroom(teacherId, "Class 1", "", "OLDCODE");
        ctx.Classrooms.Add(classroom);
        await ctx.SaveChangesAsync();
        return (classroom.Id, teacherId, ctx);
    }

    [Fact]
    public async Task Handle_RegeneratesInviteCode_WhenAuthorized()
    {
        var (classroomId, teacherId, ctx) = await Setup();
        var handler = new RegenerateInviteCodeCommandHandler(ctx);
        var newCode = await handler.Handle(new RegenerateInviteCodeCommand { ClassroomId = classroomId, TeacherId = teacherId }, CancellationToken.None);

        newCode.Should().NotBe("OLDCODE");
        var classroom = ctx.Classrooms.First(c => c.Id == classroomId);
        classroom.InviteCode.Should().Be(newCode);
    }

    [Fact]
    public async Task Handle_ThrowsArgumentException_WhenClassroomNotFound()
    {
        var (_, teacherId, ctx) = await Setup();
        var handler = new RegenerateInviteCodeCommandHandler(ctx);
        await Assert.ThrowsAsync<ArgumentException>(() => handler.Handle(new RegenerateInviteCodeCommand { ClassroomId = Guid.NewGuid(), TeacherId = teacherId }, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ThrowsUnauthorizedAccessException_WhenNotOwner()
    {
        var (classroomId, _, ctx) = await Setup();
        var handler = new RegenerateInviteCodeCommandHandler(ctx);
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => handler.Handle(new RegenerateInviteCodeCommand { ClassroomId = classroomId, TeacherId = Guid.NewGuid() }, CancellationToken.None));
    }

    // CR-034: regenerate phải gia hạn hạn dùng mã mời (30 ngày từ lúc cấp mới).
    [Fact]
    public async Task Handle_RefreshesInviteCodeExpiry()
    {
        var (classroomId, teacherId, ctx) = await Setup("RegenExpiry");
        var handler = new RegenerateInviteCodeCommandHandler(ctx);

        await handler.Handle(new RegenerateInviteCodeCommand { ClassroomId = classroomId, TeacherId = teacherId }, CancellationToken.None);

        var classroom = ctx.Classrooms.Single(c => c.Id == classroomId);
        classroom.InviteCodeExpiresAt.Should().NotBeNull();
        classroom.InviteCodeExpiresAt!.Value.Should().BeCloseTo(DateTime.UtcNow.AddDays(30), TimeSpan.FromMinutes(2));
    }
}
