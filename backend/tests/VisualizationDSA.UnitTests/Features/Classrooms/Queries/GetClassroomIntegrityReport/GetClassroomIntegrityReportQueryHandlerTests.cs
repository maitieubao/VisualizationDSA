using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using VisualizationDSA.Application.Features.Classrooms.Queries.GetClassroomIntegrityReport;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.UnitTests.Common;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Classrooms.Queries.GetClassroomIntegrityReport;

public class GetClassroomIntegrityReportQueryHandlerTests
{
    [Fact]
    public async Task Handle_DetectsDuplicateOrderIndex_InModules()
    {
        var ctx = TestDbContextFactory.CreateSimple("IntegrityDuplicate");
        var teacherId = Guid.NewGuid();
        var classroom = new Classroom(teacherId, "Class", "", "CODE");
        ctx.Classrooms.Add(classroom);
        // Two modules with same OrderIndex = 0
        ctx.ClassroomModules.Add(new ClassroomModule(classroom.Id, "First", "", 0));
        ctx.ClassroomModules.Add(new ClassroomModule(classroom.Id, "Second", "", 0));
        await ctx.SaveChangesAsync();

        var handler = new GetClassroomIntegrityReportQueryHandler(ctx);
        var query = new GetClassroomIntegrityReportQuery { ClassroomId = classroom.Id, TeacherId = teacherId };
        var report = await handler.Handle(query, CancellationToken.None);

        report.IsValid.Should().BeFalse();
        report.ModuleIssues.Should().Contain(m => m.Issue == "Duplicate OrderIndex");
        report.ModuleIssues.Should().Contain(m => m.Title == "First");
        report.ModuleIssues.Should().Contain(m => m.Title == "Second");
    }

    [Fact]
    public async Task Handle_ReturnsValid_WhenNoIssues()
    {
        var ctx = TestDbContextFactory.CreateSimple("IntegrityValid");
        var teacherId = Guid.NewGuid();
        var classroom = new Classroom(teacherId, "Clean", "", "CODE");
        ctx.Classrooms.Add(classroom);
        ctx.ClassroomModules.Add(new ClassroomModule(classroom.Id, "First", "", 0));
        ctx.ClassroomModules.Add(new ClassroomModule(classroom.Id, "Second", "", 1));
        await ctx.SaveChangesAsync();

        var handler = new GetClassroomIntegrityReportQueryHandler(ctx);
        var query = new GetClassroomIntegrityReportQuery { ClassroomId = classroom.Id, TeacherId = teacherId };
        var report = await handler.Handle(query, CancellationToken.None);

        report.IsValid.Should().BeTrue();
        report.ModuleIssues.Should().BeEmpty();
        report.ItemIssues.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_ThrowsUnauthorized_WhenWrongTeacher()
    {
        var ctx = TestDbContextFactory.CreateSimple("IntegrityUnauthorized");
        var classroom = new Classroom(Guid.NewGuid(), "X", "", "CODE");
        ctx.Classrooms.Add(classroom);
        await ctx.SaveChangesAsync();

        var handler = new GetClassroomIntegrityReportQueryHandler(ctx);
        var query = new GetClassroomIntegrityReportQuery { ClassroomId = classroom.Id, TeacherId = Guid.NewGuid() };

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => handler.Handle(query, CancellationToken.None));
    }
}
