using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Application.Features.Classrooms.Commands.ArchiveClassroom;
using VisualizationDSA.Application.Features.Classrooms.Commands.JoinClassroom;
using VisualizationDSA.Application.Features.Classrooms.Commands.KickStudent;
using VisualizationDSA.Application.Features.Classrooms.Commands.LeaveClassroom;
using VisualizationDSA.Application.Features.Classrooms.Commands.RegenerateInviteCode;
using VisualizationDSA.Application.Features.Classrooms.Queries.GetStudentClassrooms;
using VisualizationDSA.Application.Features.Classrooms.Queries.GetTeacherClassrooms;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.UnitTests.Common;
using VisualizationDSA.WebApi.Controllers;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Classrooms.Controllers;

// CR-012: controller Classroom — join/regenerate/kick/archive/statistics/mine/leave
// + mapping lỗi (message thường, không phải Message — CR-032).
public class ClassroomControllerTests
{
    static ClassroomControllerTests()
    {
        TestJwtBuilder.EnsureConfigured();
    }

    private static (ClassroomController Controller, Mock<IMediator> Mediator, Mock<IClassroomGradingService> Grading, ApplicationDbContext Db) Create(string role = "Student")
    {
        var db = TestDbContextFactory.CreateSimple("ClassroomCtrl_" + Guid.NewGuid().ToString("N"));
        var mediator = new Mock<IMediator>();
        var grading = new Mock<IClassroomGradingService>();
        var controller = new ClassroomController(mediator.Object, grading.Object, new Mock<IClassroomExcelExportService>().Object, db);
        var httpContext = new DefaultHttpContext();
        httpContext.Request.Headers["Authorization"] = $"Bearer {TestJwtBuilder.BuildToken(Guid.NewGuid().ToString(), role)}";
        controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
        return (controller, mediator, grading, db);
    }

    private static ObjectResult AsObject(IActionResult result) => result.Should().BeAssignableTo<ObjectResult>().Which;

    // ---------- join ----------

    [Fact]
    public async Task JoinClassroom_Success_Returns200()
    {
        var (controller, mediator, _, _) = Create();
        mediator.Setup(m => m.Send(It.IsAny<JoinClassroomCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ClassroomResponseDto { Id = Guid.NewGuid(), Name = "Math", Role = "Student" });

        var result = await controller.JoinClassroom(new JoinClassroomDto { InviteCode = "ABC123" });

        result.Should().BeOfType<OkObjectResult>();
        mediator.Verify(m => m.Send(
            It.Is<JoinClassroomCommand>(c => c.InviteCode == "ABC123"),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task JoinClassroom_NormalizesInviteCodeToUpper()
    {
        var (controller, mediator, _, _) = Create();
        mediator.Setup(m => m.Send(It.IsAny<JoinClassroomCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ClassroomResponseDto());

        await controller.JoinClassroom(new JoinClassroomDto { InviteCode = "abc123" });

        mediator.Verify(m => m.Send(
            It.Is<JoinClassroomCommand>(c => c.InviteCode == "ABC123"),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task JoinClassroom_InvalidCode_Returns400()
    {
        var (controller, mediator, _, _) = Create();
        mediator.Setup(m => m.Send(It.IsAny<JoinClassroomCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new ArgumentException("Invalid or expired invite code."));

        var result = await controller.JoinClassroom(new JoinClassroomDto { InviteCode = "XXXXXX" });

        var status = AsObject(result);
        status.StatusCode.Should().Be(400);
        status.Value.Should().Match<object>(v => v.GetType().GetProperty("message") != null);
    }

    [Fact]
    public async Task JoinClassroom_AlreadyEnrolled_Returns409()
    {
        var (controller, mediator, _, _) = Create();
        mediator.Setup(m => m.Send(It.IsAny<JoinClassroomCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Already enrolled in this classroom."));

        var result = await controller.JoinClassroom(new JoinClassroomDto { InviteCode = "ABC123" });

        AsObject(result).StatusCode.Should().Be(409);
    }

    [Fact]
    public async Task JoinClassroom_BadToken_Returns401()
    {
        var (controller, mediator, _, _) = Create();
        mediator.Setup(m => m.Send(It.IsAny<JoinClassroomCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new UnauthorizedAccessException("Invalid User Token."));

        var result = await controller.JoinClassroom(new JoinClassroomDto { InviteCode = "ABC123" });

        AsObject(result).StatusCode.Should().Be(401);
    }

    // ---------- mine ----------

    [Fact]
    public async Task GetMyClassrooms_StudentRole_ReturnsStudentList()
    {
        var (controller, mediator, _, _) = Create("Student");
        mediator.Setup(m => m.Send(It.IsAny<GetStudentClassroomsQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new[] { new ClassroomResponseDto { Name = "C1", Role = "Student" } });

        var result = await controller.GetMyClassrooms();

        result.Should().BeOfType<OkObjectResult>();
        mediator.Verify(m => m.Send(It.IsAny<GetStudentClassroomsQuery>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetMyClassrooms_TeacherRole_ReturnsTeacherList()
    {
        var (controller, mediator, _, _) = Create("Teacher");
        mediator.Setup(m => m.Send(It.IsAny<GetTeacherClassroomsQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new[] { new ClassroomResponseDto { Name = "C1", Role = "Teacher" } });

        var result = await controller.GetMyClassrooms();

        result.Should().BeOfType<OkObjectResult>();
        mediator.Verify(m => m.Send(It.IsAny<GetTeacherClassroomsQuery>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    // ---------- regenerate ----------

    [Fact]
    public async Task RegenerateInviteCode_Success_ReturnsNewCode()
    {
        var (controller, mediator, _, _) = Create("Teacher");
        mediator.Setup(m => m.Send(It.IsAny<RegenerateInviteCodeCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("ZZZ999");

        var result = await controller.RegenerateInviteCode(Guid.NewGuid());

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var value = ok.Value.Should().BeAssignableTo<object>().Subject;
        value.GetType().GetProperty("InviteCode")!.GetValue(value).Should().Be("ZZZ999");
    }

    [Fact]
    public async Task RegenerateInviteCode_NotOwner_Returns403()
    {
        var (controller, mediator, _, _) = Create("Teacher");
        mediator.Setup(m => m.Send(It.IsAny<RegenerateInviteCodeCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new UnauthorizedAccessException("Not your classroom."));

        var result = await controller.RegenerateInviteCode(Guid.NewGuid());

        AsObject(result).StatusCode.Should().Be(403);
    }

    // ---------- kick ----------

    [Fact]
    public async Task KickStudent_Success_ReturnsNoContent()
    {
        var (controller, mediator, _, _) = Create("Teacher");
        var classroomId = Guid.NewGuid();
        var studentId = Guid.NewGuid();
        mediator.Setup(m => m.Send(It.IsAny<KickStudentCommand>(), It.IsAny<CancellationToken>()))
            .Returns(Task.FromResult(Unit.Value));

        var result = await controller.KickStudent(classroomId, studentId);

        result.Should().BeOfType<NoContentResult>();
        mediator.Verify(m => m.Send(
            It.Is<KickStudentCommand>(c => c.ClassroomId == classroomId && c.StudentId == studentId),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task KickStudent_StudentNotInClassroom_Returns400()
    {
        var (controller, mediator, _, _) = Create("Teacher");
        mediator.Setup(m => m.Send(It.IsAny<KickStudentCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new ArgumentException("Student not in this classroom."));

        var result = await controller.KickStudent(Guid.NewGuid(), Guid.NewGuid());

        AsObject(result).StatusCode.Should().Be(400);
    }

    // ---------- archive ----------

    [Fact]
    public async Task ArchiveClassroom_Success_ReturnsNoContent()
    {
        var (controller, mediator, _, _) = Create("Teacher");
        mediator.Setup(m => m.Send(It.IsAny<ArchiveClassroomCommand>(), It.IsAny<CancellationToken>()))
            .Returns(Task.FromResult(Unit.Value));

        var result = await controller.ArchiveClassroom(Guid.NewGuid());

        result.Should().BeOfType<NoContentResult>();
    }

    [Fact]
    public async Task ArchiveClassroom_NotOwner_Returns403()
    {
        var (controller, mediator, _, _) = Create("Teacher");
        mediator.Setup(m => m.Send(It.IsAny<ArchiveClassroomCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new UnauthorizedAccessException("Not your classroom."));

        var result = await controller.ArchiveClassroom(Guid.NewGuid());

        AsObject(result).StatusCode.Should().Be(403);
    }

    // ---------- statistics ----------

    [Fact]
    public async Task GetStatistics_Success_ReturnsOk()
    {
        var (controller, _, grading, _) = Create("Teacher");
        grading.Setup(g => g.GetClassStatisticsAsync(It.IsAny<Guid>(), It.IsAny<Guid>()))
            .ReturnsAsync(new ClassStatsDto { TotalStudents = 3 });

        var result = await controller.GetStatistics(Guid.NewGuid());

        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetStatistics_NotOwner_Returns403()
    {
        var (controller, _, grading, _) = Create("Teacher");
        grading.Setup(g => g.GetClassStatisticsAsync(It.IsAny<Guid>(), It.IsAny<Guid>()))
            .ThrowsAsync(new UnauthorizedAccessException("Classroom not found or access denied."));

        var result = await controller.GetStatistics(Guid.NewGuid());

        AsObject(result).StatusCode.Should().Be(403);
    }

    // ---------- leave (CR-026) ----------

    [Fact]
    public async Task LeaveClassroom_Success_ReturnsOk_AndSendsCommand()
    {
        var (controller, mediator, _, _) = Create("Student");
        var classroomId = Guid.NewGuid();
        mediator.Setup(m => m.Send(It.IsAny<LeaveClassroomCommand>(), It.IsAny<CancellationToken>()))
            .Returns(Task.FromResult(Unit.Value));

        var result = await controller.LeaveClassroom(classroomId);

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        ok.StatusCode.Should().Be(200);
        mediator.Verify(m => m.Send(
            It.Is<LeaveClassroomCommand>(c => c.ClassroomId == classroomId),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task LeaveClassroom_NotEnrolled_Returns400()
    {
        var (controller, mediator, _, _) = Create("Student");
        mediator.Setup(m => m.Send(It.IsAny<LeaveClassroomCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new ArgumentException("Bạn không tham gia lớp học này."));

        var result = await controller.LeaveClassroom(Guid.NewGuid());

        AsObject(result).StatusCode.Should().Be(400);
    }
}
