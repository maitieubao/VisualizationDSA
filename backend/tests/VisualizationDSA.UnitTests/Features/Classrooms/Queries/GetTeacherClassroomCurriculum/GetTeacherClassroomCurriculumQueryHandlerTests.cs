using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using VisualizationDSA.Application.Features.Classrooms.Queries.GetTeacherClassroomCurriculum;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.UnitTests.Common;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Classrooms.Queries.GetTeacherClassroomCurriculum;

public class GetTeacherClassroomCurriculumQueryHandlerTests
{
    [Fact]
    public async Task Handle_ReturnsCurriculum_WhenValidRequest()
    {
        var ctx = TestDbContextFactory.CreateSimple("CurriculumValid");
        var teacherId = Guid.NewGuid();
        var classroom = new Classroom(teacherId, "Math 101", "", "CODE");
        ctx.Classrooms.Add(classroom);
        var module = new ClassroomModule(classroom.Id, "Module 1", "Intro", 0);
        ctx.ClassroomModules.Add(module);
        var lesson = new Lesson("Lesson 1", "# md", "monaco", "{}", 5);
        ctx.Lessons.Add(lesson);
        await ctx.SaveChangesAsync();

        var item = new ClassroomModuleItem(
            module.Id, VisualizationDSA.Domain.Enums.ModuleItemType.Lesson,
            lesson.Id, null, null, "Override Title", "", 0, true);
        ctx.ClassroomModuleItems.Add(item);
        await ctx.SaveChangesAsync();

        var handler = new GetTeacherClassroomCurriculumQueryHandler(ctx);
        var query = new GetTeacherClassroomCurriculumQuery { ClassroomId = classroom.Id, TeacherId = teacherId };

        var result = await handler.Handle(query, CancellationToken.None);

        result.ClassroomName.Should().Be("Math 101");
        result.Modules.Should().HaveCount(1);
        result.Modules[0].Title.Should().Be("Module 1");
        result.Modules[0].Items.Should().HaveCount(1);
        result.Modules[0].Items[0].OverrideTitle.Should().Be("Override Title");
        result.Modules[0].Items[0].LessonTitle.Should().Be("Lesson 1");
    }

    [Fact]
    public async Task Handle_ThrowsUnauthorized_WhenWrongTeacher()
    {
        var ctx = TestDbContextFactory.CreateSimple("CurriculumUnauthorized");
        var classroom = new Classroom(Guid.NewGuid(), "C", "", "CODE");
        ctx.Classrooms.Add(classroom);
        await ctx.SaveChangesAsync();

        var handler = new GetTeacherClassroomCurriculumQueryHandler(ctx);
        var query = new GetTeacherClassroomCurriculumQuery { ClassroomId = classroom.Id, TeacherId = Guid.NewGuid() };

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => handler.Handle(query, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ThrowsArgument_WhenClassroomNotFound()
    {
        var ctx = TestDbContextFactory.CreateSimple("CurriculumNotFound");
        var handler = new GetTeacherClassroomCurriculumQueryHandler(ctx);
        var query = new GetTeacherClassroomCurriculumQuery { ClassroomId = Guid.NewGuid(), TeacherId = Guid.NewGuid() };

        await Assert.ThrowsAsync<ArgumentException>(() => handler.Handle(query, CancellationToken.None));
    }
}
