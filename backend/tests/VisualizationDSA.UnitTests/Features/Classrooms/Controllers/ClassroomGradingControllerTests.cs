using System;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Services;
using VisualizationDSA.UnitTests.Common;
using VisualizationDSA.WebApi.Controllers;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Classrooms.Controllers;

// CR-012: ClassroomGradingController — analytics 200/403 (owner check trong service).
public class ClassroomGradingControllerTests
{
    static ClassroomGradingControllerTests()
    {
        TestJwtBuilder.EnsureConfigured();
    }

    private static (ClassroomGradingController Controller, Mock<IClassroomGradingService> Grading) Create(string role = "Teacher")
    {
        var grading = new Mock<IClassroomGradingService>();
        var controller = new ClassroomGradingController(grading.Object);
        var httpContext = new DefaultHttpContext();
        httpContext.Request.Headers["Authorization"] = $"Bearer {TestJwtBuilder.BuildToken(Guid.NewGuid().ToString(), role)}";
        controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
        return (controller, grading);
    }

    [Fact]
    public async Task GetClassAnalytics_Success_ReturnsOk()
    {
        var (controller, grading) = Create("Teacher");
        grading.Setup(g => g.GetClassStatisticsAsync(It.IsAny<Guid>(), It.IsAny<Guid>()))
            .ReturnsAsync(new ClassStatsDto { TotalStudents = 2, CompletionRate = 0.5 });

        var result = await controller.GetClassAnalytics(Guid.NewGuid());

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        ok.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task GetClassAnalytics_NotOwner_Returns403()
    {
        var (controller, grading) = Create("Teacher");
        grading.Setup(g => g.GetClassStatisticsAsync(It.IsAny<Guid>(), It.IsAny<Guid>()))
            .ThrowsAsync(new UnauthorizedAccessException("Classroom not found or access denied."));

        var result = await controller.GetClassAnalytics(Guid.NewGuid());

        result.Should().BeOfType<ForbidResult>();
    }

    [Fact]
    public async Task GetClassAnalytics_ClassroomNotFound_Returns403()
    {
        var (controller, grading) = Create("Teacher");
        grading.Setup(g => g.GetClassStatisticsAsync(It.IsAny<Guid>(), It.IsAny<Guid>()))
            .ThrowsAsync(new UnauthorizedAccessException("Classroom not found or access denied."));

        var result = await controller.GetClassAnalytics(Guid.NewGuid());

        result.Should().BeOfType<ForbidResult>();
    }
}
