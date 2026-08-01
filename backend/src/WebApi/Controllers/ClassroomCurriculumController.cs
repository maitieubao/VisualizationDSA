using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VisualizationDSA.Application.Features.Classrooms.Commands.CreateClassroomModule;
using VisualizationDSA.Application.Features.Classrooms.Commands.UpdateClassroomModule;
using VisualizationDSA.Application.Features.Classrooms.Commands.CreateClassroomModuleItem;
using VisualizationDSA.Application.Features.Classrooms.Commands.ReorderClassroomModules;
using VisualizationDSA.Application.Features.Classrooms.Commands.ReorderClassroomModuleItems;
using VisualizationDSA.Application.Features.Classrooms.Queries.GetTeacherClassroomCurriculum;
using VisualizationDSA.Application.Features.Classrooms.Queries.GetStudentClassroomCurriculum;
using VisualizationDSA.WebApi.Filters;
using VisualizationDSA.Domain.Enums;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiController]
    [Route("api/v1/classrooms")]
    [Authorize]
    public class ClassroomCurriculumController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ClassroomCurriculumController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("{classroomId}/curriculum/teacher")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> GetTeacherCurriculum(Guid classroomId)
        {
            var teacherIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (!Guid.TryParse(teacherIdStr, out var teacherId))
                return Unauthorized();

            var query = new GetTeacherClassroomCurriculumQuery 
            { 
                ClassroomId = classroomId, 
                TeacherId = teacherId 
            };
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{classroomId}/curriculum/student")]
        public async Task<IActionResult> GetStudentCurriculum(Guid classroomId)
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (!Guid.TryParse(userIdStr, out var studentId))
                return Unauthorized();

            var query = new GetStudentClassroomCurriculumQuery 
            { 
                ClassroomId = classroomId, 
                StudentId = studentId 
            };
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpPost("{classroomId}/modules")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> CreateModule(Guid classroomId, [FromBody] CreateModuleRequest request)
        {
            var teacherIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (!Guid.TryParse(teacherIdStr, out var teacherId))
                return Unauthorized();

            var command = new CreateClassroomModuleCommand
            {
                ClassroomId = classroomId,
                TeacherId = teacherId,
                Title = request.Title,
                Description = request.Description,
                OrderIndex = request.OrderIndex,
                UnlockAt = request.UnlockAt
            };

            var moduleId = await _mediator.Send(command);
            return Ok(new { moduleId });
        }

        [HttpPut("modules/{moduleId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> UpdateModule(Guid moduleId, [FromBody] UpdateModuleRequest request)
        {
            var teacherIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (!Guid.TryParse(teacherIdStr, out var teacherId))
                return Unauthorized();

            var command = new UpdateClassroomModuleCommand
            {
                ModuleId = moduleId,
                TeacherId = teacherId,
                Title = request.Title,
                Description = request.Description,
                OrderIndex = request.OrderIndex,
                IsHidden = request.IsHidden,
                UnlockAt = request.UnlockAt
            };

            await _mediator.Send(command);
            return NoContent();
        }

        [HttpDelete("modules/{moduleId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> DeleteModule(Guid moduleId)
        {
            var teacherIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (!Guid.TryParse(teacherIdStr, out var teacherId))
                return Unauthorized();

            
            return NoContent();
        }

        [HttpPost("modules/{moduleId}/items")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> CreateModuleItem(Guid moduleId, [FromBody] CreateModuleItemRequest request)
        {
            var teacherIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (!Guid.TryParse(teacherIdStr, out var teacherId))
                return Unauthorized();

            if (!Enum.TryParse<ModuleItemType>(request.ItemType, true, out var itemType))
            {
                return BadRequest(new { error = "INVALID_ITEM_TYPE", message = "ItemType must be Lesson, Quiz, or Codelab" });
            }

            var command = new CreateClassroomModuleItemCommand
            {
                ModuleId = moduleId,
                TeacherId = teacherId,
                ItemType = itemType,
                LessonId = request.LessonId,
                QuizId = request.QuizId,
                CodelabId = request.CodelabId,
                CustomLessonId = request.CustomLessonId,
                OverrideTitle = request.OverrideTitle,
                OverrideDescription = request.OverrideDescription,
                OrderIndex = request.OrderIndex,
                IsRequired = request.IsRequired,
                IsHidden = request.IsHidden,
                UnlockAt = request.UnlockAt,
                DueAt = request.DueAt,
                MaxAttempts = request.MaxAttempts,
                PrerequisiteItemId = request.PrerequisiteItemId,
                IsSequential = request.IsSequential
            };

            var itemId = await _mediator.Send(command);
            return Ok(new { itemId });
        }

        [HttpPut("modules/{moduleId}/items/reorder")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> ReorderModuleItems(Guid moduleId, [FromBody] ReorderItemsRequest request)
        {
            var teacherIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (!Guid.TryParse(teacherIdStr, out var teacherId))
                return Unauthorized();

            var command = new ReorderClassroomModuleItemsCommand
            {
                ModuleId = moduleId,
                TeacherId = teacherId,
                ItemOrders = request.ItemOrders.Select(x => new ItemOrderDto
                {
                    ItemId = x.ItemId,
                    OrderIndex = x.OrderIndex
                }).ToList()
            };

            await _mediator.Send(command);
            return NoContent();
        }

[HttpPut("classrooms/{classroomId}/modules/reorder")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> ReorderModules(Guid classroomId, [FromBody] ReorderModulesRequest request)
        {
            var teacherIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (!Guid.TryParse(teacherIdStr, out var teacherId))
                return Unauthorized();

            var command = new ReorderClassroomModulesCommand
            {
                ClassroomId = classroomId,
                TeacherId = teacherId,
                ModuleOrders = request.ModuleOrders.Select(x => new ModuleOrderDto
                {
                    ModuleId = x.ModuleId,
                    OrderIndex = x.OrderIndex
                }).ToList()
            };

            await _mediator.Send(command);
            return NoContent();
        }
    }

    public class CreateModuleRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public DateTime? UnlockAt { get; set; }
    }

    public class UpdateModuleRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public bool IsHidden { get; set; }
        public DateTime? UnlockAt { get; set; }
    }

    public class CreateModuleItemRequest
    {
        public string ItemType { get; set; } = "Lesson";
        public Guid? LessonId { get; set; }
        public Guid? QuizId { get; set; }
        public Guid? CodelabId { get; set; }
        public Guid? CustomLessonId { get; set; }
        public string OverrideTitle { get; set; } = string.Empty;
        public string OverrideDescription { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public bool IsRequired { get; set; } = true;
        public bool IsHidden { get; set; }
        public DateTime? UnlockAt { get; set; }
        public DateTime? DueAt { get; set; }
        public int? MaxAttempts { get; set; }
        public Guid? PrerequisiteItemId { get; set; }
        public bool IsSequential { get; set; } = true;
    }

    public class ReorderItemsRequest
    {
        public List<VisualizationDSA.Application.Features.Classrooms.Commands.ReorderClassroomModuleItems.ItemOrderDto> ItemOrders { get; set; } = new();
    }

    public class ReorderModulesRequest
    {
        public List<VisualizationDSA.Application.Features.Classrooms.Commands.ReorderClassroomModules.ModuleOrderDto> ModuleOrders { get; set; } = new();
    }
}