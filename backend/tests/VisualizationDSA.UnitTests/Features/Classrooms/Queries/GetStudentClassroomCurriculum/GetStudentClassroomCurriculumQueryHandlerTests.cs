using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using VisualizationDSA.Application.Features.Classrooms.Queries.GetStudentClassroomCurriculum;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.UnitTests.Common;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Classrooms.Queries.GetStudentClassroomCurriculum;

// LS-021: test handler curriculum phÃ­a student â€” khÃ´ng enroll â†’ Unauthorized, item áº©n bá»‹ lá»c,
// sort theo OrderIndex, map progress (attempt má»›i nháº¥t), IsUnlocked theo prerequisite,
// merge override (LS-009).
public class GetStudentClassroomCurriculumQueryHandlerTests
{
    private async Task<(Guid classroomId, Guid studentId, ApplicationDbContext ctx)> Setup(string dbName)
    {
        var ctx = TestDbContextFactory.CreateSimple("StudentCurriculum_" + dbName);
        var teacherId = Guid.NewGuid();
        var studentId = Guid.NewGuid();
        var classroom = new Classroom(teacherId, "Math 101", "", "CODE");
        ctx.Classrooms.Add(classroom);
        ctx.ClassroomEnrollments.Add(new ClassroomEnrollment(classroom.Id, studentId));
        var lesson = new Lesson("Lesson 1", "# md", "monaco", "{}", 5);
        ctx.Lessons.Add(lesson);
        await ctx.SaveChangesAsync();
        return (classroom.Id, studentId, ctx);
    }

    [Fact]
    public async Task Handle_ThrowsUnauthorized_WhenStudentNotEnrolled()
    {
        var ctx = TestDbContextFactory.CreateSimple("StudentCurriculum_NotEnrolled");
        var classroom = new Classroom(Guid.NewGuid(), "C", "", "CODE");
        ctx.Classrooms.Add(classroom);
        await ctx.SaveChangesAsync();

        var handler = new GetStudentClassroomCurriculumQueryHandler(ctx);
        var query = new GetStudentClassroomCurriculumQuery { ClassroomId = classroom.Id, StudentId = Guid.NewGuid() };

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => handler.Handle(query, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ThrowsArgument_WhenClassroomNotFound()
    {
        var ctx = TestDbContextFactory.CreateSimple("StudentCurriculum_NotFound");
        var handler = new GetStudentClassroomCurriculumQueryHandler(ctx);
        var query = new GetStudentClassroomCurriculumQuery { ClassroomId = Guid.NewGuid(), StudentId = Guid.NewGuid() };

        await Assert.ThrowsAsync<ArgumentException>(() => handler.Handle(query, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_FiltersOutHiddenItems()
    {
        var (classroomId, studentId, ctx) = await Setup("HiddenItems");
        var teacherId = ctx.Classrooms.First().OwnerTeacherId;
        var module = new ClassroomModule(classroomId, "M1", "", 0);
        ctx.ClassroomModules.Add(module);
        var lesson = new Lesson("L", "C", "monaco", "{}", 5);
        ctx.Lessons.Add(lesson);
        var visible = new ClassroomModuleItem(module.Id, ModuleItemType.Lesson, lesson.Id, null, null, "Visible", "", 0, true);
        var hidden = new ClassroomModuleItem(module.Id, ModuleItemType.Lesson, lesson.Id, null, null, "Hidden", "", 1, true, isHidden: true);
        var hiddenForStudent = new ClassroomModuleItem(module.Id, ModuleItemType.Lesson, lesson.Id, null, null, "HiddenForStudent", "", 2, true, isHiddenForStudent: true);
        ctx.ClassroomModuleItems.AddRange(visible, hidden, hiddenForStudent);
        await ctx.SaveChangesAsync();

        var handler = new GetStudentClassroomCurriculumQueryHandler(ctx);
        var query = new GetStudentClassroomCurriculumQuery { ClassroomId = classroomId, StudentId = studentId };

        var result = await handler.Handle(query, CancellationToken.None);

        var items = result.Modules.Single().Items;
        items.Should().HaveCount(1);
        items[0].OverrideTitle.Should().Be("Visible");
    }

    [Fact]
    public async Task Handle_FiltersOutHiddenModules()
    {
        var (classroomId, studentId, ctx) = await Setup("HiddenModule");
        var visibleModule = new ClassroomModule(classroomId, "Visible", "", 0);
        var hiddenModule = new ClassroomModule(classroomId, "Hidden", "", 1, isHidden: true);
        ctx.ClassroomModules.AddRange(visibleModule, hiddenModule);
        var lesson = new Lesson("L", "C", "monaco", "{}", 5);
        ctx.Lessons.Add(lesson);
        ctx.ClassroomModuleItems.Add(new ClassroomModuleItem(visibleModule.Id, ModuleItemType.Lesson, lesson.Id, null, null, "A", "", 0, true));
        ctx.ClassroomModuleItems.Add(new ClassroomModuleItem(hiddenModule.Id, ModuleItemType.Lesson, lesson.Id, null, null, "B", "", 0, true));
        await ctx.SaveChangesAsync();

        var handler = new GetStudentClassroomCurriculumQueryHandler(ctx);
        var query = new GetStudentClassroomCurriculumQuery { ClassroomId = classroomId, StudentId = studentId };

        var result = await handler.Handle(query, CancellationToken.None);

        result.Modules.Should().HaveCount(1);
        result.Modules[0].Title.Should().Be("Visible");
    }

    [Fact]
    public async Task Handle_SortsModulesAndItemsByOrderIndex()
    {
        var (classroomId, studentId, ctx) = await Setup("Sort");
        var moduleB = new ClassroomModule(classroomId, "B", "", 1);
        var moduleA = new ClassroomModule(classroomId, "A", "", 0);
        ctx.ClassroomModules.AddRange(moduleB, moduleA);
        var lesson = new Lesson("L", "C", "monaco", "{}", 5);
        ctx.Lessons.Add(lesson);
        var item2 = new ClassroomModuleItem(moduleA.Id, ModuleItemType.Lesson, lesson.Id, null, null, "Item2", "", 1, true);
        var item1 = new ClassroomModuleItem(moduleA.Id, ModuleItemType.Lesson, lesson.Id, null, null, "Item1", "", 0, true);
        ctx.ClassroomModuleItems.AddRange(item2, item1);
        await ctx.SaveChangesAsync();

        var handler = new GetStudentClassroomCurriculumQueryHandler(ctx);
        var query = new GetStudentClassroomCurriculumQuery { ClassroomId = classroomId, StudentId = studentId };

        var result = await handler.Handle(query, CancellationToken.None);

        result.Modules.Select(m => m.Title).Should().Equal("A", "B");
        result.Modules[0].Items.Select(i => i.OverrideTitle).Should().Equal("Item1", "Item2");
    }

    [Fact]
    public async Task Handle_MapsLatestAttemptProgress()
    {
        var (classroomId, studentId, ctx) = await Setup("Progress");
        var module = new ClassroomModule(classroomId, "M1", "", 0);
        ctx.ClassroomModules.Add(module);
        var lesson = new Lesson("L", "C", "monaco", "{}", 5);
        ctx.Lessons.Add(lesson);
        var item = new ClassroomModuleItem(module.Id, ModuleItemType.Lesson, lesson.Id, null, null, "Item", "", 0, true);
        ctx.ClassroomModuleItems.Add(item);
        await ctx.SaveChangesAsync();

        var attempt1 = new UserModuleItemProgress(studentId, item.Id, attemptNumber: 1);
        attempt1.UpdateProgress(0, 10, isCompleted: false);
        var attempt2 = new UserModuleItemProgress(studentId, item.Id, attemptNumber: 2);
        attempt2.UpdateProgress(0, 100, isCompleted: true);
        ctx.UserModuleItemProgresses.AddRange(attempt1, attempt2);
        await ctx.SaveChangesAsync();

        var handler = new GetStudentClassroomCurriculumQueryHandler(ctx);
        var query = new GetStudentClassroomCurriculumQuery { ClassroomId = classroomId, StudentId = studentId };

        var result = await handler.Handle(query, CancellationToken.None);

        var dto = result.Modules.Single().Items.Single();
        dto.Status.Should().Be("Completed");
        dto.ProgressPercent.Should().Be(100);
        dto.AttemptNumber.Should().Be(2);
    }

    [Fact]
    public async Task Handle_IsUnlocked_DependsOnPrerequisiteCompletion()
    {
        var (classroomId, studentId, ctx) = await Setup("Prereq");
        var module = new ClassroomModule(classroomId, "M1", "", 0);
        ctx.ClassroomModules.Add(module);
        var lesson = new Lesson("L", "C", "monaco", "{}", 5);
        ctx.Lessons.Add(lesson);
        var prereq = new ClassroomModuleItem(module.Id, ModuleItemType.Lesson, lesson.Id, null, null, "Prereq", "", 0, true);
        var locked = new ClassroomModuleItem(module.Id, ModuleItemType.Lesson, lesson.Id, null, null, "Locked", "", 1, true,
            prerequisiteItemId: prereq.Id, isSequential: true);
        ctx.ClassroomModuleItems.AddRange(prereq, locked);
        await ctx.SaveChangesAsync();

        var handler = new GetStudentClassroomCurriculumQueryHandler(ctx);
        var query = new GetStudentClassroomCurriculumQuery { ClassroomId = classroomId, StudentId = studentId };

        // ChÆ°a hoÃ n thÃ nh prerequisite â†’ khÃ³a.
        var result = await handler.Handle(query, CancellationToken.None);
        result.Modules.Single().Items.Single(i => i.OverrideTitle == "Locked").IsUnlocked.Should().BeFalse();

        // HoÃ n thÃ nh prerequisite â†’ má»Ÿ khÃ³a.
        var progress = new UserModuleItemProgress(studentId, prereq.Id, attemptNumber: 1);
        progress.UpdateProgress(0, 100, isCompleted: true);
        ctx.UserModuleItemProgresses.Add(progress);
        await ctx.SaveChangesAsync();

        result = await handler.Handle(query, CancellationToken.None);
        result.Modules.Single().Items.Single(i => i.OverrideTitle == "Locked").IsUnlocked.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_MergesOverrideIntoItem_WhenOverrideExists()
    {
        var (classroomId, studentId, ctx) = await Setup("OverrideMerge");
        var module = new ClassroomModule(classroomId, "M1", "", 0);
        ctx.ClassroomModules.Add(module);
        var lesson = new Lesson("L", "C", "monaco", "{}", 5);
        ctx.Lessons.Add(lesson);
        var item = new ClassroomModuleItem(module.Id, ModuleItemType.Lesson, lesson.Id, null, null, "Item", "", 0, true);
        ctx.ClassroomModuleItems.Add(item);
        await ctx.SaveChangesAsync();

        ctx.ClassroomModuleItemOverrides.Add(new ClassroomModuleItemOverride(
            classroomId, item.Id,
            openAt: new DateTime(2026, 9, 1, 8, 0, 0, DateTimeKind.Utc),
            dueAt: new DateTime(2026, 9, 30, 23, 59, 0, DateTimeKind.Utc),
            maxAttempts: 2,
            isHiddenForStudent: false,
            prerequisiteItemId: null,
            isSequential: false,
            isRequired: false));
        await ctx.SaveChangesAsync();

        var handler = new GetStudentClassroomCurriculumQueryHandler(ctx);
        var query = new GetStudentClassroomCurriculumQuery { ClassroomId = classroomId, StudentId = studentId };

        var result = await handler.Handle(query, CancellationToken.None);

        var dto = result.Modules.Single().Items.Single();
        dto.UnlockAt.Should().Be(new DateTime(2026, 9, 1, 8, 0, 0, DateTimeKind.Utc));
        dto.DueAt.Should().Be(new DateTime(2026, 9, 30, 23, 59, 0, DateTimeKind.Utc));
        dto.MaxAttempts.Should().Be(2);
        dto.IsSequential.Should().BeFalse();
        dto.IsRequired.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_FiltersOutItemHiddenViaOverride()
    {
        var (classroomId, studentId, ctx) = await Setup("OverrideHidden");
        var module = new ClassroomModule(classroomId, "M1", "", 0);
        ctx.ClassroomModules.Add(module);
        var lesson = new Lesson("L", "C", "monaco", "{}", 5);
        ctx.Lessons.Add(lesson);
        var hiddenViaOverride = new ClassroomModuleItem(module.Id, ModuleItemType.Lesson, lesson.Id, null, null, "HiddenByOverride", "", 0, true);
        ctx.ClassroomModuleItems.Add(hiddenViaOverride);
        await ctx.SaveChangesAsync();

        ctx.ClassroomModuleItemOverrides.Add(new ClassroomModuleItemOverride(
            classroomId, hiddenViaOverride.Id, isHiddenForStudent: true));
        await ctx.SaveChangesAsync();

        var handler = new GetStudentClassroomCurriculumQueryHandler(ctx);
        var query = new GetStudentClassroomCurriculumQuery { ClassroomId = classroomId, StudentId = studentId };

        var result = await handler.Handle(query, CancellationToken.None);

        result.Modules.Single().Items.Should().BeEmpty();
    }

    // CR-003: DTO phải chứa nội dung Lesson (contentMd/sandboxType/sandboxConfig) —
    // thiếu trước đây làm ClassroomItemPlayer render trống.
    [Fact]
    public async Task Handle_MapsLessonContentFields()
    {
        var (classroomId, studentId, ctx) = await Setup("LessonContent");
        var module = new ClassroomModule(classroomId, "M1", "", 0);
        ctx.ClassroomModules.Add(module);
        var lesson = new Lesson("Lesson 1", "# Nội dung markdown", "sorting", "{\"size\":20}", 5);
        ctx.Lessons.Add(lesson);
        var item = new ClassroomModuleItem(module.Id, ModuleItemType.Lesson, lesson.Id, null, null, "Item", "", 0, true);
        ctx.ClassroomModuleItems.Add(item);
        await ctx.SaveChangesAsync();

        var handler = new GetStudentClassroomCurriculumQueryHandler(ctx);
        var query = new GetStudentClassroomCurriculumQuery { ClassroomId = classroomId, StudentId = studentId };

        var result = await handler.Handle(query, CancellationToken.None);

        var dto = result.Modules.Single().Items.Single();
        dto.ContentMd.Should().Be("# Nội dung markdown");
        dto.ContentMarkdown.Should().Be("# Nội dung markdown");
        dto.SandboxType.Should().Be("sorting");
        dto.SandboxConfig.Should().Be("{\"size\":20}");
    }

    // CR-015: học viên bị KICK không xem được curriculum (chỉ enrollment Active được xem).
    [Fact]
    public async Task Handle_ThrowsUnauthorized_WhenEnrollmentKicked()
    {
        var (classroomId, studentId, ctx) = await Setup("KickedStudent");
        var enrollment = ctx.ClassroomEnrollments.Single();
        enrollment.Kick(Guid.NewGuid(), "violation");
        await ctx.SaveChangesAsync();

        var handler = new GetStudentClassroomCurriculumQueryHandler(ctx);
        var query = new GetStudentClassroomCurriculumQuery { ClassroomId = classroomId, StudentId = studentId };

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => handler.Handle(query, CancellationToken.None));
    }

    // CR-015: học viên tự rời lớp (Left) cũng không xem được curriculum.
    [Fact]
    public async Task Handle_ThrowsUnauthorized_WhenEnrollmentLeft()
    {
        var (classroomId, studentId, ctx) = await Setup("LeftStudent");
        var enrollment = ctx.ClassroomEnrollments.Single();
        enrollment.Leave();
        await ctx.SaveChangesAsync();

        var handler = new GetStudentClassroomCurriculumQueryHandler(ctx);
        var query = new GetStudentClassroomCurriculumQuery { ClassroomId = classroomId, StudentId = studentId };

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => handler.Handle(query, CancellationToken.None));
    }
}

