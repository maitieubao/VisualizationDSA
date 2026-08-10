using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Features.Classrooms.Commands.CreateClassroomModuleItem;
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
}
