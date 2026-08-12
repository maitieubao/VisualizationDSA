using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using VisualizationDSA.Application.Features.Classrooms.Commands.UpdateClassroomModuleItem;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.UnitTests.Common;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Classrooms.Commands.UpdateClassroomModuleItem;

// LS-002: handler sá»­a item â€” title/type/áº©n/báº¯t buá»™c/prerequisite + phÃ¢n quyá»n teacher owner.
public class UpdateClassroomModuleItemCommandHandlerTests
{
    private async Task<(Guid moduleId, Guid itemId, Guid teacherId, ApplicationDbContext ctx)> Setup(string dbName)
    {
        var ctx = TestDbContextFactory.CreateSimple("UpdateClassroomItem_" + dbName);
        var teacherId = Guid.NewGuid();
        var classroom = new Classroom(teacherId, "C", "", "CODE");
        ctx.Classrooms.Add(classroom);
        var module = new ClassroomModule(classroom.Id, "M", "", 0);
        ctx.ClassroomModules.Add(module);
        var lesson = new Lesson("L", "C", "monaco", "{}", 5);
        ctx.Lessons.Add(lesson);
        var item = new ClassroomModuleItem(module.Id, ModuleItemType.Lesson, lesson.Id, null, null, "Old", "OldDesc", 0, true);
        ctx.ClassroomModuleItems.Add(item);
        await ctx.SaveChangesAsync();
        return (module.Id, item.Id, teacherId, ctx);
    }

    [Fact]
    public async Task Handle_UpdatesItemFields_WhenValidRequest()
    {
        var (moduleId, itemId, teacherId, ctx) = await Setup("Valid");
        var prereqId = Guid.NewGuid();
        var handler = new UpdateClassroomModuleItemCommandHandler(ctx);
        var cmd = new UpdateClassroomModuleItemCommand
        {
            ModuleId = moduleId,
            ItemId = itemId,
            TeacherId = teacherId,
            OverrideTitle = "New Title",
            OverrideDescription = "New Desc",
            IsHidden = true,
            IsRequired = false,
            PrerequisiteItemId = prereqId,
            IsSequential = false,
            MaxAttempts = 3
        };

        await handler.Handle(cmd, CancellationToken.None);

        var item = ctx.ClassroomModuleItems.Single();
        item.OverrideTitle.Should().Be("New Title");
        item.OverrideDescription.Should().Be("New Desc");
        item.IsHidden.Should().BeTrue();
        item.IsRequired.Should().BeFalse();
        item.PrerequisiteItemId.Should().Be(prereqId);
        item.IsSequential.Should().BeFalse();
        item.MaxAttempts.Should().Be(3);
    }

    [Fact]
    public async Task Handle_ChangesItemType_WhenItemTypeProvided()
    {
        var (moduleId, itemId, teacherId, ctx) = await Setup("ChangeType");
        var quiz = new Quiz("Q", "{}", "dsa", 3, 100);
        ctx.Quizzes.Add(quiz);
        await ctx.SaveChangesAsync();

        var handler = new UpdateClassroomModuleItemCommandHandler(ctx);
        var cmd = new UpdateClassroomModuleItemCommand
        {
            ModuleId = moduleId,
            ItemId = itemId,
            TeacherId = teacherId,
            ItemType = ModuleItemType.Quiz,
            QuizId = quiz.Id
        };

        await handler.Handle(cmd, CancellationToken.None);

        var item = ctx.ClassroomModuleItems.Single();
        item.ItemType.Should().Be(ModuleItemType.Quiz);
        item.QuizId.Should().Be(quiz.Id);
        item.LessonId.Should().BeNull();
    }

    [Fact]
    public async Task Handle_ThrowsKeyNotFound_WhenItemNotInModule()
    {
        var (_, _, teacherId, ctx) = await Setup("ItemMissing");
        var handler = new UpdateClassroomModuleItemCommandHandler(ctx);
        var cmd = new UpdateClassroomModuleItemCommand
        {
            ModuleId = Guid.NewGuid(),
            ItemId = Guid.NewGuid(),
            TeacherId = teacherId
        };

        await Assert.ThrowsAsync<KeyNotFoundException>(() => handler.Handle(cmd, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ThrowsUnauthorized_WhenNotOwner()
    {
        var (moduleId, itemId, _, ctx) = await Setup("NotOwner");
        var handler = new UpdateClassroomModuleItemCommandHandler(ctx);
        var cmd = new UpdateClassroomModuleItemCommand
        {
            ModuleId = moduleId,
            ItemId = itemId,
            TeacherId = Guid.NewGuid()
        };

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => handler.Handle(cmd, CancellationToken.None));
    }
}

