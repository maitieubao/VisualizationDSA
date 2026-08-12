using System;
using System.Threading.Tasks;
using FluentAssertions;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.Infrastructure.Services;
using VisualizationDSA.UnitTests.Common;
using Xunit;

namespace VisualizationDSA.UnitTests.Services;

// LS-010: unlock engine — item ẩn KHÔNG tính vào requiredItems (trước đây item ẩn chặn
// mở khóa → khóa vĩnh viễn); module không có required item = mở.
public class ClassroomUnlockRuleEngineTests
{
    private async Task<(Guid classroomId, Guid prevModuleId, Guid nextModuleId, Guid studentId, ApplicationDbContext ctx)> Setup(string dbName)
    {
        var ctx = TestDbContextFactory.CreateSimple("UnlockEngine_" + dbName);
        var teacherId = Guid.NewGuid();
        var studentId = Guid.NewGuid();
        var classroom = new Classroom(teacherId, "C", "", "CODE");
        ctx.Classrooms.Add(classroom);
        ctx.ClassroomEnrollments.Add(new ClassroomEnrollment(classroom.Id, studentId));
        var prevModule = new ClassroomModule(classroom.Id, "Prev", "", 0);
        var nextModule = new ClassroomModule(classroom.Id, "Next", "", 1);
        ctx.ClassroomModules.AddRange(prevModule, nextModule);
        var lesson = new Lesson("L", "C", "monaco", "{}", 5);
        ctx.Lessons.Add(lesson);
        await ctx.SaveChangesAsync();
        return (classroom.Id, prevModule.Id, nextModule.Id, studentId, ctx);
    }

    private ClassroomModuleItem MakeItem(Guid moduleId, Guid lessonId, string title, int order, bool isRequired = true, bool isHidden = false)
        => new ClassroomModuleItem(moduleId, ModuleItemType.Lesson, lessonId, null, null, title, "", order, isRequired, isHidden: isHidden);

    [Fact]
    public async Task IsModuleLocked_IgnoresHiddenRequiredItems_InPreviousModule()
    {
        var (classroomId, prevModuleId, nextModuleId, studentId, ctx) = await Setup("HiddenRequired");
        var lesson = ctx.Lessons.Single();

        // Module trước chỉ có 1 item required NHƯNG bị ẩn → không chặn mở khóa module sau.
        var hiddenRequired = MakeItem(prevModuleId, lesson.Id, "HiddenRequired", 0, isRequired: true, isHidden: true);
        ctx.ClassroomModuleItems.Add(hiddenRequired);
        await ctx.SaveChangesAsync();

        var engine = new ClassroomUnlockRuleEngine(ctx);

        var locked = await engine.IsModuleLockedAsync(classroomId, nextModuleId, studentId);

        locked.Should().BeFalse();
    }

    [Fact]
    public async Task IsModuleLocked_True_WhenPreviousModuleHasUncompletedVisibleRequiredItems()
    {
        var (classroomId, prevModuleId, nextModuleId, studentId, ctx) = await Setup("VisibleRequired");
        var lesson = ctx.Lessons.Single();
        var visibleRequired = MakeItem(prevModuleId, lesson.Id, "VisibleRequired", 0, isRequired: true);
        ctx.ClassroomModuleItems.Add(visibleRequired);
        await ctx.SaveChangesAsync();

        var engine = new ClassroomUnlockRuleEngine(ctx);

        var locked = await engine.IsModuleLockedAsync(classroomId, nextModuleId, studentId);

        locked.Should().BeTrue();
    }

    [Fact]
    public async Task IsModuleLocked_False_WhenPreviousModuleHasNoRequiredItems()
    {
        var (classroomId, prevModuleId, nextModuleId, studentId, ctx) = await Setup("NoRequired");
        var lesson = ctx.Lessons.Single();

        // Module trước chỉ chứa item không-required → không chặn module sau (isModuleCompleted).
        ctx.ClassroomModuleItems.Add(MakeItem(prevModuleId, lesson.Id, "Optional", 0, isRequired: false));
        await ctx.SaveChangesAsync();

        var engine = new ClassroomUnlockRuleEngine(ctx);

        var locked = await engine.IsModuleLockedAsync(classroomId, nextModuleId, studentId);

        locked.Should().BeFalse();
    }

    [Fact]
    public async Task IsItemUnlocked_False_WhenModuleHidden()
    {
        var (classroomId, _, nextModuleId, studentId, ctx) = await Setup("HiddenModule");
        var lesson = ctx.Lessons.Single();
        var item = MakeItem(nextModuleId, lesson.Id, "Item", 0);
        ctx.ClassroomModuleItems.Add(item);
        var nextModule = ctx.ClassroomModules.Find(nextModuleId);
        nextModule.ToggleHidden();
        await ctx.SaveChangesAsync();

        var engine = new ClassroomUnlockRuleEngine(ctx);

        var unlocked = await engine.IsItemUnlockedAsync(classroomId, item.Id, studentId);

        unlocked.Should().BeFalse();
    }

    [Fact]
    public async Task IsItemUnlocked_True_WhenNoPrerequisiteAndPreviousModuleClear()
    {
        var (classroomId, prevModuleId, nextModuleId, studentId, ctx) = await Setup("Unlocked");
        var lesson = ctx.Lessons.Single();

        // Module trước có item required nhưng student đã hoàn thành → module sau mở.
        var prevItem = MakeItem(prevModuleId, lesson.Id, "Prev", 0, isRequired: true);
        ctx.ClassroomModuleItems.Add(prevItem);
        var nextItem = MakeItem(nextModuleId, lesson.Id, "Next", 0);
        ctx.ClassroomModuleItems.Add(nextItem);
        var progress = new UserModuleItemProgress(studentId, prevItem.Id, attemptNumber: 1);
        progress.UpdateProgress(0, 100, isCompleted: true);
        ctx.UserModuleItemProgresses.Add(progress);
        await ctx.SaveChangesAsync();

        var engine = new ClassroomUnlockRuleEngine(ctx);

        var unlocked = await engine.IsItemUnlockedAsync(classroomId, nextItem.Id, studentId);

        unlocked.Should().BeTrue();
    }

    // CR-018: GetUnlockedItemIdsAsync gom 1 batch — kick/banned/left không được unlock nào.
    [Fact]
    public async Task GetUnlockedItemIds_KickedStudent_ReturnsEmpty()
    {
        var (classroomId, prevModuleId, _, studentId, ctx) = await Setup("KickedUnlock");
        var lesson = ctx.Lessons.Single();
        ctx.ClassroomModuleItems.Add(MakeItem(prevModuleId, lesson.Id, "A", 0));
        await ctx.SaveChangesAsync();

        var enrollment = ctx.ClassroomEnrollments.Single();
        enrollment.Kick(Guid.NewGuid(), "bad");
        await ctx.SaveChangesAsync();

        var engine = new ClassroomUnlockRuleEngine(ctx);

        var unlocked = await engine.GetUnlockedItemIdsAsync(classroomId, studentId);

        unlocked.Should().BeEmpty();
    }

    [Fact]
    public async Task GetUnlockedItemIds_SequentialItem_UnlocksAfterPrerequisiteDone()
    {
        var (classroomId, prevModuleId, nextModuleId, studentId, ctx) = await Setup("SequentialBatch");
        var lesson = ctx.Lessons.Single();
        var prereq = MakeItem(prevModuleId, lesson.Id, "Prereq", 0, isRequired: true);
        var next = new ClassroomModuleItem(nextModuleId, ModuleItemType.Lesson, lesson.Id, null, null, "Next", "", 0, true,
            prerequisiteItemId: null, isSequential: true);
        ctx.ClassroomModuleItems.Add(prereq);
        ctx.ClassroomModuleItems.Add(next);
        await ctx.SaveChangesAsync();

        var engine = new ClassroomUnlockRuleEngine(ctx);

        // Chưa hoàn thành required item module trước → next khóa.
        var before = await engine.GetUnlockedItemIdsAsync(classroomId, studentId);
        before.Should().NotContain(next.Id);

        // Hoàn thành → next mở.
        var progress = new UserModuleItemProgress(studentId, prereq.Id, attemptNumber: 1);
        progress.UpdateProgress(0, 100, isCompleted: true);
        ctx.UserModuleItemProgresses.Add(progress);
        await ctx.SaveChangesAsync();

        var after = await engine.GetUnlockedItemIdsAsync(classroomId, studentId);
        after.Should().Contain(next.Id);
    }

    // CR-040: GetModuleLockStatusesAsync trả trạng thái toàn bộ module trong 1 lần gọi.
    [Fact]
    public async Task GetModuleLockStatuses_ReturnsAllModules_WithCorrectFlags()
    {
        var (classroomId, prevModuleId, nextModuleId, studentId, ctx) = await Setup("ModuleBatch");
        var lesson = ctx.Lessons.Single();
        var prevItem = MakeItem(prevModuleId, lesson.Id, "PrevReq", 0, isRequired: true);
        ctx.ClassroomModuleItems.Add(prevItem);
        await ctx.SaveChangesAsync();

        var engine = new ClassroomUnlockRuleEngine(ctx);

        var statuses = await engine.GetModuleLockStatusesAsync(classroomId, studentId);

        statuses.Should().ContainKey(prevModuleId);
        statuses.Should().ContainKey(nextModuleId);
        statuses[prevModuleId].Should().BeFalse();   // module đầu không khóa
        statuses[nextModuleId].Should().BeTrue();    // required chưa hoàn thành → khóa
    }
}
