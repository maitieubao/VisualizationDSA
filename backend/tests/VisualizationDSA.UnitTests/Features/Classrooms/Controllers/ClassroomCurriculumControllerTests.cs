using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using VisualizationDSA.Application.Features.Classrooms.Commands.CreateClassroomModuleItem;
using VisualizationDSA.Application.Features.Classrooms.Commands.DeleteClassroomModuleItem;
using VisualizationDSA.Application.Features.Classrooms.Commands.ImportCourseToClassroom;
using VisualizationDSA.Application.Features.Classrooms.Commands.ReorderClassroomModuleItems;
using VisualizationDSA.Application.Features.Classrooms.Commands.UpdateClassroomModuleItem;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.UnitTests.Common;
using VisualizationDSA.WebApi.Controllers;
using Xunit;

namespace VisualizationDSA.UnitTests.Features.Classrooms.Controllers;

// LS-022: controller curriculum pháº£i tá»± catch rÃµ rÃ ng (khÃ´ng rÆ¡i vÃ o global middleware 401/500):
// khÃ´ng-owner â†’ 403, item khÃ´ng thuá»™c classroom â†’ 404, ArgumentException â†’ 400.
// Äá»“ng thá»i cover endpoint má»›i LS-002 (PUT/DELETE items) + LS-004 (import-course) + LS-042 (modules/reorder).
public class ClassroomCurriculumControllerTests
{
    static ClassroomCurriculumControllerTests()
    {
        TestJwtBuilder.EnsureConfigured();
    }

    private static (ClassroomCurriculumController Controller, Mock<IMediator> Mediator, ApplicationDbContext Db) Create()
    {
        var db = TestDbContextFactory.CreateSimple("CurriculumController_" + Guid.NewGuid().ToString("N"));
        var mediator = new Mock<IMediator>();
        var controller = new ClassroomCurriculumController(mediator.Object, db);
        var httpContext = new DefaultHttpContext();
        httpContext.Request.Headers["Authorization"] = $"Bearer {TestJwtBuilder.BuildToken(Guid.NewGuid().ToString(), "Teacher")}";
        controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
        return (controller, mediator, db);
    }

    // ---------- LS-022: mapping lá»—i ----------

    [Fact]
    public async Task CreateModuleItem_OwnerMismatch_Returns403()
    {
        var (controller, mediator, _) = Create();
        mediator.Setup(m => m.Send(It.IsAny<CreateClassroomModuleItemCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new UnauthorizedAccessException("Only the classroom owner can add items."));

        var result = await controller.CreateModuleItem(Guid.NewGuid(), new CreateModuleItemRequest { ItemType = "Lesson", LessonId = Guid.NewGuid() });

        var status = result.Should().BeOfType<ObjectResult>().Subject;
        status.StatusCode.Should().Be(403);
    }

    [Fact]
    public async Task UpdateModuleItem_ItemNotInModule_Returns404()
    {
        var (controller, mediator, _) = Create();
        mediator.Setup(m => m.Send(It.IsAny<UpdateClassroomModuleItemCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new KeyNotFoundException("Item not found in this module."));

        var result = await controller.UpdateModuleItem(Guid.NewGuid(), Guid.NewGuid(), new UpdateModuleItemRequest());

        var notFound = result.Should().BeOfType<NotFoundObjectResult>().Subject;
        notFound.StatusCode.Should().Be(404);
    }

    [Fact]
    public async Task CreateModuleItem_InvalidPayload_Returns400()
    {
        var (controller, mediator, _) = Create();
        mediator.Setup(m => m.Send(It.IsAny<CreateClassroomModuleItemCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new ArgumentException("LessonId or CustomLessonId required for Lesson type."));

        var result = await controller.CreateModuleItem(Guid.NewGuid(), new CreateModuleItemRequest { ItemType = "Lesson" });

        var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequest.StatusCode.Should().Be(400);
    }

    // ---------- LS-002: PUT/DELETE items ----------

    [Fact]
    public async Task UpdateModuleItem_Success_ReturnsNoContent_AndSendsCommand()
    {
        var (controller, mediator, _) = Create();
        var moduleId = Guid.NewGuid();
        var itemId = Guid.NewGuid();
        mediator.Setup(m => m.Send(It.IsAny<UpdateClassroomModuleItemCommand>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var request = new UpdateModuleItemRequest
        {
            OverrideTitle = "New title",
            IsHidden = true,
            IsRequired = false,
            PrerequisiteItemId = Guid.NewGuid(),
            IsSequential = false
        };
        var result = await controller.UpdateModuleItem(moduleId, itemId, request);

        result.Should().BeOfType<NoContentResult>();
        mediator.Verify(m => m.Send(
            It.Is<UpdateClassroomModuleItemCommand>(c =>
                c.ModuleId == moduleId && c.ItemId == itemId &&
                c.OverrideTitle == "New title" && c.IsHidden && !c.IsRequired && !c.IsSequential),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteModuleItem_Success_ReturnsNoContent_AndSendsCommand()
    {
        var (controller, mediator, db) = Create();
        var teacherId = Guid.NewGuid();
        var classroom = new Classroom(teacherId, "C", "", "CODE");
        db.Classrooms.Add(classroom);
        var module = new ClassroomModule(classroom.Id, "M", "", 0);
        db.ClassroomModules.Add(module);
        var lesson = new Lesson("L", "C", "monaco", "{}", 5);
        db.Lessons.Add(lesson);
        var item = new ClassroomModuleItem(module.Id, ModuleItemType.Lesson, lesson.Id, null, null, "Item", "", 0, true);
        db.ClassroomModuleItems.Add(item);
        db.SaveChanges();
        mediator.Setup(m => m.Send(It.IsAny<DeleteClassroomModuleItemCommand>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var result = await controller.DeleteModuleItem(module.Id, item.Id);

        result.Should().BeOfType<NoContentResult>();
        mediator.Verify(m => m.Send(
            It.Is<DeleteClassroomModuleItemCommand>(c => c.ModuleId == module.Id && c.ItemId == item.Id),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    // ---------- LS-004: import-course ----------

    [Fact]
    public async Task ImportCourse_Success_ReturnsOk_AndSendsCommand()
    {
        var (controller, mediator, _) = Create();
        var classroomId = Guid.NewGuid();
        var courseId = Guid.NewGuid();
        mediator.Setup(m => m.Send(It.IsAny<ImportCourseToClassroomCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(classroomId);

        var result = await controller.ImportCourse(classroomId, new ImportCourseRequest { CourseId = courseId, OverrideExisting = true });

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        ok.StatusCode.Should().Be(200);
        mediator.Verify(m => m.Send(
            It.Is<ImportCourseToClassroomCommand>(c =>
                c.ClassroomId == classroomId && c.CourseId == courseId && c.OverrideExisting),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ImportCourse_ClassroomNotFound_Returns404()
    {
        var (controller, mediator, _) = Create();
        mediator.Setup(m => m.Send(It.IsAny<ImportCourseToClassroomCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Classroom not found."));

        var result = await controller.ImportCourse(Guid.NewGuid(), new ImportCourseRequest { CourseId = Guid.NewGuid() });

        var notFound = result.Should().BeOfType<NotFoundObjectResult>().Subject;
        notFound.StatusCode.Should().Be(404);
    }

    [Fact]
    public async Task ImportCourse_NotOwner_Returns403()
    {
        var (controller, mediator, _) = Create();
        mediator.Setup(m => m.Send(It.IsAny<ImportCourseToClassroomCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new UnauthorizedAccessException("You do not own this classroom."));

        var result = await controller.ImportCourse(Guid.NewGuid(), new ImportCourseRequest { CourseId = Guid.NewGuid() });

        var status = result.Should().BeOfType<ObjectResult>().Subject;
        status.StatusCode.Should().Be(403);
    }

    // ---------- LS-042: modules/reorder vá»›i :guid constraint ----------

    [Fact]
    public async Task ReorderModules_Success_ReturnsNoContent()
    {
        var (controller, mediator, _) = Create();
        var classroomId = Guid.NewGuid();
        var moduleId = Guid.NewGuid();
        mediator.Setup(m => m.Send(It.IsAny<VisualizationDSA.Application.Features.Classrooms.Commands.ReorderClassroomModules.ReorderClassroomModulesCommand>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var result = await controller.ReorderModules(classroomId, new ReorderModulesRequest
        {
            ModuleOrders = new List<VisualizationDSA.Application.Features.Classrooms.Commands.ReorderClassroomModules.ModuleOrderDto>
            {
                new() { ModuleId = moduleId, OrderIndex = 0 }
            }
        });

        result.Should().BeOfType<NoContentResult>();
        mediator.Verify(m => m.Send(
            It.Is<VisualizationDSA.Application.Features.Classrooms.Commands.ReorderClassroomModules.ReorderClassroomModulesCommand>(c =>
                c.ClassroomId == classroomId && c.ModuleOrders.Count == 1 && c.ModuleOrders[0].ModuleId == moduleId),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    // ---------- LS-022: reorder items mapping lá»—i ----------

    [Fact]
    public async Task ReorderModuleItems_CrossModuleItem_Returns400()
    {
        var (controller, mediator, _) = Create();
        mediator.Setup(m => m.Send(It.IsAny<ReorderClassroomModuleItemsCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new ArgumentException("ItemOrders contains an item that does not belong to this module."));

        var result = await controller.ReorderModuleItems(Guid.NewGuid(), new ReorderItemsRequest
        {
            ItemOrders = new List<ItemOrderDto> { new() { ItemId = Guid.NewGuid(), OrderIndex = 0 } }
        });

        var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequest.StatusCode.Should().Be(400);
    }
}

