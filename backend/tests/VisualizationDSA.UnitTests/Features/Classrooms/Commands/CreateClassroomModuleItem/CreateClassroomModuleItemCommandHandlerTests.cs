using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using VisualizationDSA.Application.Features.Classrooms.Commands.CreateClassroomModuleItem;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.UnitTests.Common;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Classrooms.Commands.CreateClassroomModuleItem;

public class CreateClassroomModuleItemCommandHandlerTests
{
    private async Task<(Guid moduleId, Guid lessonId)> SetupModuleWithLesson(ApplicationDbContext ctx, Guid teacherId)
    {
        var classroom = new Classroom(teacherId, "C", "", "CODE");
        ctx.Classrooms.Add(classroom);
        var module = new ClassroomModule(classroom.Id, "M", "", 0);
        ctx.ClassroomModules.Add(module);
        var lesson = new Lesson("Test Lesson", "# Content", "monaco", "{}", 10);
        ctx.Lessons.Add(lesson);
        await ctx.SaveChangesAsync();
        return (module.Id, lesson.Id);
    }

    [Fact]
    public async Task Handle_CreatesLessonItem_WhenValidRequest()
    {
        var ctx = TestDbContextFactory.CreateSimple("CreateItemLesson");
        var teacherId = Guid.NewGuid();
        var (moduleId, lessonId) = await SetupModuleWithLesson(ctx, teacherId);

        var handler = new CreateClassroomModuleItemCommandHandler(ctx);
        var cmd = new CreateClassroomModuleItemCommand
        {
            ModuleId = moduleId,
            TeacherId = teacherId,
            ItemType = ModuleItemType.Lesson,
            LessonId = lessonId,
            OverrideTitle = "Item Title"
        };

        var itemId = await handler.Handle(cmd, CancellationToken.None);
        var item = await ctx.ClassroomModuleItems.FindAsync(itemId);
        item.Should().NotBeNull();
        item!.ItemType.Should().Be(ModuleItemType.Lesson);
        item.OverrideTitle.Should().Be("Item Title");
    }

    // LS-006: request.IsHidden phải ghi vào IsHidden (không rơi vào isHiddenForStudent).
    [Fact]
    public async Task Handle_StoresIsHidden_IntoIsHiddenField_NotIsHiddenForStudent()
    {
        var ctx = TestDbContextFactory.CreateSimple("CreateItemHidden");
        var teacherId = Guid.NewGuid();
        var (moduleId, lessonId) = await SetupModuleWithLesson(ctx, teacherId);

        var handler = new CreateClassroomModuleItemCommandHandler(ctx);
        var cmd = new CreateClassroomModuleItemCommand
        {
            ModuleId = moduleId,
            TeacherId = teacherId,
            ItemType = ModuleItemType.Lesson,
            LessonId = lessonId,
            OverrideTitle = "Hidden Item",
            IsHidden = true
        };

        var itemId = await handler.Handle(cmd, CancellationToken.None);
        var item = await ctx.ClassroomModuleItems.FindAsync(itemId);
        item.Should().NotBeNull();
        item!.IsHidden.Should().BeTrue();
        item.IsHiddenForStudent.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_CreatesCustomLesson_WhenCustomLessonIdProvided()
    {
        var ctx = TestDbContextFactory.CreateSimple("CreateItemCustomLesson");
        var teacherId = Guid.NewGuid();
        var classroom = new Classroom(teacherId, "C", "", "CODE");
        ctx.Classrooms.Add(classroom);
        var module = new ClassroomModule(classroom.Id, "M", "", 0);
        ctx.ClassroomModules.Add(module);
        await ctx.SaveChangesAsync();

        var handler = new CreateClassroomModuleItemCommandHandler(ctx);
        var cmd = new CreateClassroomModuleItemCommand
        {
            ModuleId = module.Id,
            TeacherId = teacherId,
            ItemType = ModuleItemType.Lesson,
            CustomLessonId = Guid.NewGuid(),
            OverrideTitle = "Custom",
            OverrideDescription = "Desc"
        };

        var itemId = await handler.Handle(cmd, CancellationToken.None);
        var item = await ctx.ClassroomModuleItems.FindAsync(itemId);
        item.Should().NotBeNull();
        item!.LessonId.Should().NotBeNull();
    }

    [Fact]
    public async Task Handle_ThrowsArgument_WhenLessonIdMissing()
    {
        var ctx = TestDbContextFactory.CreateSimple("CreateItemNoLesson");
        var teacherId = Guid.NewGuid();
        var classroom = new Classroom(teacherId, "C", "", "CODE");
        ctx.Classrooms.Add(classroom);
        var module = new ClassroomModule(classroom.Id, "M", "", 0);
        ctx.ClassroomModules.Add(module);
        await ctx.SaveChangesAsync();

        var handler = new CreateClassroomModuleItemCommandHandler(ctx);
        var cmd = new CreateClassroomModuleItemCommand
        {
            ModuleId = module.Id,
            TeacherId = teacherId,
            ItemType = ModuleItemType.Lesson,
            OverrideTitle = "X"
        };

        await Assert.ThrowsAsync<ArgumentException>(() => handler.Handle(cmd, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ThrowsArgument_WhenQuizIdMissing()
    {
        var ctx = TestDbContextFactory.CreateSimple("CreateItemNoQuiz");
        var teacherId = Guid.NewGuid();
        var classroom = new Classroom(teacherId, "C", "", "CODE");
        ctx.Classrooms.Add(classroom);
        var module = new ClassroomModule(classroom.Id, "M", "", 0);
        ctx.ClassroomModules.Add(module);
        await ctx.SaveChangesAsync();

        var handler = new CreateClassroomModuleItemCommandHandler(ctx);
        var cmd = new CreateClassroomModuleItemCommand
        {
            ModuleId = module.Id,
            TeacherId = teacherId,
            ItemType = ModuleItemType.Quiz,
            OverrideTitle = "X"
        };

        await Assert.ThrowsAsync<ArgumentException>(() => handler.Handle(cmd, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_CreatesQuizItem_WhenQuizIdProvided()
    {
        var ctx = TestDbContextFactory.CreateSimple("CreateItemQuiz");
        var teacherId = Guid.NewGuid();
        var classroom = new Classroom(teacherId, "C", "", "CODE");
        ctx.Classrooms.Add(classroom);
        var module = new ClassroomModule(classroom.Id, "M", "", 0);
        ctx.ClassroomModules.Add(module);
        await ctx.SaveChangesAsync();

        var handler = new CreateClassroomModuleItemCommandHandler(ctx);
        var cmd = new CreateClassroomModuleItemCommand
        {
            ModuleId = module.Id,
            TeacherId = teacherId,
            ItemType = ModuleItemType.Quiz,
            QuizId = Guid.NewGuid(),
            OverrideTitle = "Quiz Item"
        };

        var itemId = await handler.Handle(cmd, CancellationToken.None);
        var item = await ctx.ClassroomModuleItems.FindAsync(itemId);
        item.Should().NotBeNull();
        item!.ItemType.Should().Be(ModuleItemType.Quiz);
    }

    [Fact]
    public async Task Handle_ThrowsArgument_WhenModuleNotFound()
    {
        var ctx = TestDbContextFactory.CreateSimple("CreateItemModuleNotFound");
        var handler = new CreateClassroomModuleItemCommandHandler(ctx);
        var cmd = new CreateClassroomModuleItemCommand
        {
            ModuleId = Guid.NewGuid(),
            TeacherId = Guid.NewGuid(),
            ItemType = ModuleItemType.Lesson,
            LessonId = Guid.NewGuid(),
            OverrideTitle = "X"
        };

        await Assert.ThrowsAsync<ArgumentException>(() => handler.Handle(cmd, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ThrowsUnauthorized_WhenWrongTeacher()
    {
        var ctx = TestDbContextFactory.CreateSimple("CreateItemUnauthorized");
        var classroom = new Classroom(Guid.NewGuid(), "C", "", "CODE");
        ctx.Classrooms.Add(classroom);
        var module = new ClassroomModule(classroom.Id, "M", "", 0);
        ctx.ClassroomModules.Add(module);
        await ctx.SaveChangesAsync();

        var handler = new CreateClassroomModuleItemCommandHandler(ctx);
        var cmd = new CreateClassroomModuleItemCommand
        {
            ModuleId = module.Id,
            TeacherId = Guid.NewGuid(),
            ItemType = ModuleItemType.Quiz,
            QuizId = Guid.NewGuid(),
            OverrideTitle = "X"
        };

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => handler.Handle(cmd, CancellationToken.None));
    }

    // ── C2: notification "bài mới" cho học viên trong lớp ──

    [Fact]
    public async Task Handle_NotifiesActiveStudents_WhenNewItemAdded()
    {
        var ctx = TestDbContextFactory.CreateSimple("CreateItemNotify");
        var teacherId = Guid.NewGuid();
        var (moduleId, lessonId) = await SetupModuleWithLesson(ctx, teacherId);

        // 2 học viên active + 1 bị kick — chỉ active nhận notification.
        var s1 = new User("s1@test.com", "s1", "h");
        var s2 = new User("s2@test.com", "s2", "h");
        var s3 = new User("s3@test.com", "s3", "h");
        ctx.Users.AddRange(s1, s2, s3);
        await ctx.SaveChangesAsync();

        var classroom = await ctx.Classrooms.FirstAsync(c => c.Id == ctx.ClassroomModules.Single(m => m.Id == moduleId).ClassroomId);
        ctx.ClassroomEnrollments.Add(new ClassroomEnrollment(classroom.Id, s1.Id));
        ctx.ClassroomEnrollments.Add(new ClassroomEnrollment(classroom.Id, s2.Id));
        var kicked = new ClassroomEnrollment(classroom.Id, s3.Id);
        ctx.ClassroomEnrollments.Add(kicked);
        kicked.Kick(Guid.NewGuid(), "test"); // s3 bị kick
        await ctx.SaveChangesAsync();

        var notifier = new Mock<INotificationService>();
        var handler = new CreateClassroomModuleItemCommandHandler(ctx, notifier.Object);
        var cmd = new CreateClassroomModuleItemCommand
        {
            ModuleId = moduleId,
            TeacherId = teacherId,
            ItemType = ModuleItemType.Lesson,
            LessonId = lessonId,
            OverrideTitle = "Bài mới số 1"
        };

        var itemId = await handler.Handle(cmd, CancellationToken.None);
        itemId.Should().NotBeEmpty();

        // 2 học viên active nhận 1 notification mỗi người; học viên bị kick không nhận.
        notifier.Verify(n => n.NotifyUserAsync(s1.Id, It.Is<string>(c => c.Contains("Bài mới số 1")), It.IsAny<string>()), Times.Once);
        notifier.Verify(n => n.NotifyUserAsync(s2.Id, It.Is<string>(c => c.Contains("Bài mới số 1")), It.IsAny<string>()), Times.Once);
        notifier.Verify(n => n.NotifyUserAsync(s3.Id, It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task Handle_NoNotification_WhenItemHiddenFromStudents()
    {
        var ctx = TestDbContextFactory.CreateSimple("CreateItemNotifyHidden");
        var teacherId = Guid.NewGuid();
        var (moduleId, lessonId) = await SetupModuleWithLesson(ctx, teacherId);

        var s1 = new User("sh@test.com", "sh", "h");
        ctx.Users.Add(s1);
        await ctx.SaveChangesAsync();
        var classroom = await ctx.Classrooms.FirstAsync();
        ctx.ClassroomEnrollments.Add(new ClassroomEnrollment(classroom.Id, s1.Id));
        await ctx.SaveChangesAsync();

        var notifier = new Mock<INotificationService>();
        var handler = new CreateClassroomModuleItemCommandHandler(ctx, notifier.Object);
        var cmd = new CreateClassroomModuleItemCommand
        {
            ModuleId = moduleId,
            TeacherId = teacherId,
            ItemType = ModuleItemType.Lesson,
            LessonId = lessonId,
            OverrideTitle = "Ẩn với học viên",
            IsHidden = true
        };

        await handler.Handle(cmd, CancellationToken.None);

        notifier.Verify(n => n.NotifyUserAsync(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }
}
