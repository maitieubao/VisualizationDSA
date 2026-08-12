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

    // LS-021: teacher handler — sort module/item theo OrderIndex.
    [Fact]
    public async Task Handle_SortsModulesAndItemsByOrderIndex()
    {
        var ctx = TestDbContextFactory.CreateSimple("CurriculumTeacherSort");
        var teacherId = Guid.NewGuid();
        var classroom = new Classroom(teacherId, "C", "", "CODE");
        ctx.Classrooms.Add(classroom);
        var moduleB = new ClassroomModule(classroom.Id, "B", "", 1);
        var moduleA = new ClassroomModule(classroom.Id, "A", "", 0);
        ctx.ClassroomModules.AddRange(moduleB, moduleA);
        var lesson = new Lesson("L", "# md", "monaco", "{}", 5);
        ctx.Lessons.Add(lesson);
        var item2 = new ClassroomModuleItem(moduleA.Id, VisualizationDSA.Domain.Enums.ModuleItemType.Lesson, lesson.Id, null, null, "Item2", "", 1, true);
        var item1 = new ClassroomModuleItem(moduleA.Id, VisualizationDSA.Domain.Enums.ModuleItemType.Lesson, lesson.Id, null, null, "Item1", "", 0, true);
        ctx.ClassroomModuleItems.AddRange(item2, item1);
        await ctx.SaveChangesAsync();

        var handler = new GetTeacherClassroomCurriculumQueryHandler(ctx);
        var query = new GetTeacherClassroomCurriculumQuery { ClassroomId = classroom.Id, TeacherId = teacherId };

        var result = await handler.Handle(query, CancellationToken.None);

        result.Modules.Select(m => m.Title).Should().Equal("A", "B");
        result.Modules[0].Items.Select(i => i.OverrideTitle).Should().Equal("Item1", "Item2");
    }

    // LS-021: teacher handler — item/module soft-deleted bị lọc khỏi curriculum.
    [Fact]
    public async Task Handle_FiltersOutDeletedModulesAndItems()
    {
        var ctx = TestDbContextFactory.CreateSimple("CurriculumTeacherFilter");
        var teacherId = Guid.NewGuid();
        var classroom = new Classroom(teacherId, "C", "", "CODE");
        ctx.Classrooms.Add(classroom);
        var deletedModule = new ClassroomModule(classroom.Id, "Deleted", "", 0);
        deletedModule.Delete();
        var liveModule = new ClassroomModule(classroom.Id, "Live", "", 1);
        ctx.ClassroomModules.AddRange(deletedModule, liveModule);
        var lesson = new Lesson("L", "# md", "monaco", "{}", 5);
        ctx.Lessons.Add(lesson);
        var deletedItem = new ClassroomModuleItem(liveModule.Id, VisualizationDSA.Domain.Enums.ModuleItemType.Lesson, lesson.Id, null, null, "DeletedItem", "", 0, true);
        deletedItem.Delete();
        var liveItem = new ClassroomModuleItem(liveModule.Id, VisualizationDSA.Domain.Enums.ModuleItemType.Lesson, lesson.Id, null, null, "LiveItem", "", 1, true);
        ctx.ClassroomModuleItems.AddRange(deletedItem, liveItem);
        await ctx.SaveChangesAsync();

        var handler = new GetTeacherClassroomCurriculumQueryHandler(ctx);
        var query = new GetTeacherClassroomCurriculumQuery { ClassroomId = classroom.Id, TeacherId = teacherId };

        var result = await handler.Handle(query, CancellationToken.None);

        result.Modules.Should().HaveCount(1);
        result.Modules[0].Title.Should().Be("Live");
        result.Modules[0].Items.Should().HaveCount(1);
        result.Modules[0].Items[0].OverrideTitle.Should().Be("LiveItem");
    }

    // LS-009: teacher handler merge override vào item — openAt/dueAt/maxAttempts/ẩn/required.
    [Fact]
    public async Task Handle_MergesOverrideIntoItem_WhenOverrideExists()
    {
        var ctx = TestDbContextFactory.CreateSimple("CurriculumTeacherOverride");
        var teacherId = Guid.NewGuid();
        var classroom = new Classroom(teacherId, "C", "", "CODE");
        ctx.Classrooms.Add(classroom);
        var module = new ClassroomModule(classroom.Id, "M", "", 0);
        ctx.ClassroomModules.Add(module);
        var lesson = new Lesson("L", "# md", "monaco", "{}", 5);
        ctx.Lessons.Add(lesson);
        var item = new ClassroomModuleItem(module.Id, VisualizationDSA.Domain.Enums.ModuleItemType.Lesson, lesson.Id, null, null, "Item", "", 0, true);
        ctx.ClassroomModuleItems.Add(item);
        await ctx.SaveChangesAsync();

        ctx.ClassroomModuleItemOverrides.Add(new ClassroomModuleItemOverride(
            classroom.Id, item.Id,
            openAt: new DateTime(2026, 9, 1, 8, 0, 0, DateTimeKind.Utc),
            dueAt: new DateTime(2026, 9, 30, 23, 59, 0, DateTimeKind.Utc),
            maxAttempts: 2,
            isHiddenForStudent: true,
            prerequisiteItemId: null,
            isSequential: false,
            isRequired: false));
        await ctx.SaveChangesAsync();

        var handler = new GetTeacherClassroomCurriculumQueryHandler(ctx);
        var query = new GetTeacherClassroomCurriculumQuery { ClassroomId = classroom.Id, TeacherId = teacherId };

        var result = await handler.Handle(query, CancellationToken.None);

        var dto = result.Modules.Single().Items.Single();
        dto.UnlockAt.Should().Be(new DateTime(2026, 9, 1, 8, 0, 0, DateTimeKind.Utc));
        dto.DueAt.Should().Be(new DateTime(2026, 9, 30, 23, 59, 0, DateTimeKind.Utc));
        dto.MaxAttempts.Should().Be(2);
        dto.IsHidden.Should().BeTrue();
        dto.IsSequential.Should().BeFalse();
        dto.IsRequired.Should().BeFalse();
    }
}
