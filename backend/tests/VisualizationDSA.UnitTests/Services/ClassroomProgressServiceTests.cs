using System;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Infrastructure.Services;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.UnitTests.Common;
using Xunit;

namespace VisualizationDSA.UnitTests.Services;

// LS-008: /my-progress pháº£i chá»‹u Ä‘Æ°á»£c nhiá»u attempt (PK composite) â€” gom theo ModuleItemId
// vÃ  láº¥y attempt má»›i nháº¥t thay vÃ¬ ToDictionary Ä‘á»• trÃ¹ng key â†’ 500.
public class ClassroomProgressServiceTests
{
    private async Task<(Guid classroomId, Guid studentId, Guid itemId, ApplicationDbContext ctx)> Setup(string dbName)
    {
        var ctx = TestDbContextFactory.CreateSimple("ProgressService_" + dbName);
        var teacherId = Guid.NewGuid();
        var studentId = Guid.NewGuid();
        var classroom = new Classroom(teacherId, "C", "", "CODE");
        ctx.Classrooms.Add(classroom);
        ctx.ClassroomEnrollments.Add(new ClassroomEnrollment(classroom.Id, studentId));
        var module = new ClassroomModule(classroom.Id, "M", "", 0);
        ctx.ClassroomModules.Add(module);
        var lesson = new Lesson("L", "C", "monaco", "{}", 5);
        ctx.Lessons.Add(lesson);
        var item = new ClassroomModuleItem(module.Id, ModuleItemType.Lesson, lesson.Id, null, null, "Item", "", 0, true);
        ctx.ClassroomModuleItems.Add(item);
        await ctx.SaveChangesAsync();
        return (classroom.Id, studentId, item.Id, ctx);
    }

    [Fact]
    public async Task GetProgressSummary_WithMultipleAttempts_DoesNotThrow_AndUsesLatestAttempt()
    {
        var (classroomId, studentId, itemId, ctx) = await Setup("MultiAttempt");

        var attempt1 = new UserModuleItemProgress(studentId, itemId, attemptNumber: 1);
        attempt1.UpdateProgress(0, 25, isCompleted: false);
        var attempt2 = new UserModuleItemProgress(studentId, itemId, attemptNumber: 2);
        attempt2.UpdateProgress(0, 100, isCompleted: true);
        ctx.UserModuleItemProgresses.AddRange(attempt1, attempt2);
        await ctx.SaveChangesAsync();

        var service = new ClassroomProgressService(ctx, new ClassroomUnlockRuleEngine(ctx));

        var summary = await service.GetProgressSummaryAsync(classroomId, studentId);

        summary.Should().NotBeNull();
        summary.TotalItems.Should().Be(1);
        summary.CompletedItems.Should().Be(1);
        var itemProgress = summary.Modules.Single().Items.Single();
        itemProgress.Status.Should().Be("Completed");
        itemProgress.ProgressPercent.Should().Be(100);
    }

    [Fact]
    public async Task GetProgressSummary_ThrowsUnauthorized_WhenNotEnrolled()
    {
        var (classroomId, _, _, ctx) = await Setup("NotEnrolled");
        var service = new ClassroomProgressService(ctx, new ClassroomUnlockRuleEngine(ctx));

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => service.GetProgressSummaryAsync(classroomId, Guid.NewGuid()));
    }

    [Fact]
    public async Task GetProgressSummary_HidesItemsAndModulesHiddenByTeacher()
    {
        var (classroomId, studentId, _, ctx) = await Setup("Hidden");
        var visibleModule = new ClassroomModule(classroomId, "Visible", "", 0);
        var hiddenModule = new ClassroomModule(classroomId, "Hidden", "", 1, isHidden: true);
        ctx.ClassroomModules.AddRange(visibleModule, hiddenModule);
        var lesson = new Lesson("L", "C", "monaco", "{}", 5);
        ctx.Lessons.Add(lesson);
        ctx.ClassroomModuleItems.Add(new ClassroomModuleItem(visibleModule.Id, ModuleItemType.Lesson, lesson.Id, null, null, "A", "", 0, true));
        ctx.ClassroomModuleItems.Add(new ClassroomModuleItem(hiddenModule.Id, ModuleItemType.Lesson, lesson.Id, null, null, "B", "", 0, true));
        ctx.ClassroomModuleItems.Add(new ClassroomModuleItem(visibleModule.Id, ModuleItemType.Lesson, lesson.Id, null, null, "HiddenItem", "", 1, true, isHidden: true));
        await ctx.SaveChangesAsync();

        var service = new ClassroomProgressService(ctx, new ClassroomUnlockRuleEngine(ctx));

        var summary = await service.GetProgressSummaryAsync(classroomId, studentId);

        // Module "M" (từ Setup) + "Visible" hiển thị; "Hidden" (IsHidden) bị loại.
        summary.Modules.Select(m => m.ModuleTitle).Should().NotContain("Hidden");
        summary.Modules.SelectMany(m => m.Items).Select(i => i.Title).Should().NotContain("HiddenItem");
        summary.Modules.SelectMany(m => m.Items).Select(i => i.Title).Should().NotContain("B");
    }

    // CR-033: LockedItems tách khỏi NotStartedItems — item mở khóa nhưng chưa bắt đầu
    // không còn bị gộp vào "Đã khóa".
    [Fact]
    public async Task GetProgressSummary_SplitsNotStartedFromLockedItems()
    {
        var (classroomId, studentId, _, ctx) = await Setup("SplitLocked");
        // Module 2: mở khóa có điều kiện — chưa hoàn thành required item của module 1 → khóa.
        var module2 = new ClassroomModule(classroomId, "Module2", "", 1);
        ctx.ClassroomModules.Add(module2);
        var lesson = new Lesson("L", "C", "monaco", "{}", 5);
        ctx.Lessons.Add(lesson);
        // item của module Setup (module 0) là required nhưng chưa hoàn thành → module2 khóa.
        ctx.ClassroomModuleItems.Add(new ClassroomModuleItem(module2.Id, ModuleItemType.Lesson, lesson.Id, null, null, "LockedItem", "", 0, true));
        await ctx.SaveChangesAsync();

        var service = new ClassroomProgressService(ctx, new ClassroomUnlockRuleEngine(ctx));

        var summary = await service.GetProgressSummaryAsync(classroomId, studentId);

        // Item module 0: mở khóa + NotStarted. Item module 2: Locked.
        summary.NotStartedItems.Should().Be(1);
        summary.LockedItems.Should().Be(1);
        summary.TotalItems.Should().Be(2);
    }

    // CR-039: Start/Update/Complete phải thao tác attempt MỚI NHẤT (không ghi đè attempt cũ).
    [Fact]
    public async Task StartItemAsync_PicksLatestAttempt()
    {
        var (classroomId, studentId, itemId, ctx) = await Setup("LatestAttempt");
        var attempt1 = new UserModuleItemProgress(studentId, itemId, attemptNumber: 1);
        attempt1.UpdateProgress(0, 100, isCompleted: true);
        // attempt 2 là mới nhất, chưa bắt đầu — Start phải tác động vào attempt này.
        var attempt2 = new UserModuleItemProgress(studentId, itemId, attemptNumber: 2);
        ctx.UserModuleItemProgresses.AddRange(attempt1, attempt2);
        await ctx.SaveChangesAsync();

        var service = new ClassroomProgressService(ctx, new ClassroomUnlockRuleEngine(ctx));
        var result = await service.StartItemAsync(classroomId, itemId, studentId);

        result.Success.Should().BeTrue();
        // attempt 2 được chuyển InProgress; attempt 1 (Completed) không bị đụng tới.
        var latest = ctx.UserModuleItemProgresses.Single(p => p.AttemptNumber == 2);
        latest.Status.Should().Be("InProgress");
        var old = ctx.UserModuleItemProgresses.Single(p => p.AttemptNumber == 1);
        old.Status.Should().Be("Completed");
        old.ProgressPercent.Should().Be(100);
    }

    // CR-041: ProgressPercent bị clamp trong [0,100] — scrollPercent âm/>100 không lọt vào DB.
    [Fact]
    public async Task UpdateProgressAsync_ClampsScrollPercent()
    {
        var (classroomId, studentId, itemId, ctx) = await Setup("Clamp");
        var service = new ClassroomProgressService(ctx, new ClassroomUnlockRuleEngine(ctx));

        await service.UpdateProgressAsync(classroomId, itemId, studentId, 5, 150.0);
        await service.UpdateProgressAsync(classroomId, itemId, studentId, 1, -30.0);

        var latest = ctx.UserModuleItemProgresses
            .OrderByDescending(p => p.AttemptNumber)
            .First();
        latest.ProgressPercent.Should().Be(0); // -30 bị clamp về 0
    }

    // CR-036: Start/Update/Complete không enroll phải ném UnauthorizedAccessException (403).
    [Fact]
    public async Task StartItemAsync_NotEnrolled_ThrowsUnauthorized()
    {
        var (classroomId, _, itemId, ctx) = await Setup("NotEnrolledStart");
        var service = new ClassroomProgressService(ctx, new ClassroomUnlockRuleEngine(ctx));

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => service.StartItemAsync(classroomId, itemId, Guid.NewGuid()));
    }

    [Fact]
    public async Task UpdateProgressAsync_NotEnrolled_ThrowsUnauthorized()
    {
        var (classroomId, _, itemId, ctx) = await Setup("NotEnrolledUpdate");
        var service = new ClassroomProgressService(ctx, new ClassroomUnlockRuleEngine(ctx));

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => service.UpdateProgressAsync(classroomId, itemId, Guid.NewGuid(), 1, 50));
    }

    [Fact]
    public async Task CompleteItemAsync_NotEnrolled_ThrowsUnauthorized()
    {
        var (classroomId, _, itemId, ctx) = await Setup("NotEnrolledComplete");
        var service = new ClassroomProgressService(ctx, new ClassroomUnlockRuleEngine(ctx));

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => service.CompleteItemAsync(classroomId, itemId, Guid.NewGuid()));
    }
}

