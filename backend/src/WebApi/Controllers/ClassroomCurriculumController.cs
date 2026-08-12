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
using VisualizationDSA.Application.Features.Classrooms.Commands.UpdateClassroomModuleItem;
using VisualizationDSA.Application.Features.Classrooms.Commands.DeleteClassroomModuleItem;
using VisualizationDSA.Application.Features.Classrooms.Commands.ReorderClassroomModules;
using VisualizationDSA.Application.Features.Classrooms.Commands.ReorderClassroomModuleItems;
using VisualizationDSA.Application.Features.Classrooms.Commands.ImportCourseToClassroom;
using VisualizationDSA.Application.Features.Classrooms.Queries.GetTeacherClassroomCurriculum;
using VisualizationDSA.Application.Features.Classrooms.Queries.GetStudentClassroomCurriculum;
using VisualizationDSA.WebApi.Filters;
using VisualizationDSA.Domain.Enums;
using VisualizationDSA.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Features.Classrooms.Queries.GetClassroomIntegrityReport;
using VisualizationDSA.Application.Features.Classrooms.Commands.DeleteClassroomModule;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiController]
    [Route("api/v{version:apiVersion}/classrooms")]
    [RequireJwtRole]
    public class ClassroomCurriculumController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ApplicationDbContext _dbContext;

        public ClassroomCurriculumController(IMediator mediator, ApplicationDbContext dbContext)
        {
            _mediator = mediator;
            _dbContext = dbContext;
        }

        // LS-022: mọi endpoint curriculum phải catch rõ ràng — không-owner → 403,
        // không tìm thấy → 404, dữ liệu không hợp lệ → 400 (trước đây rơi vào global
        // middleware trả 401/500).
        private IActionResult HandleCurriculumError(Exception ex)
        {
            return ex switch
            {
                UnauthorizedAccessException uex => StatusCode(403, new { error = "FORBIDDEN", message = uex.Message }),
                KeyNotFoundException nfex => NotFound(new { error = "NOT_FOUND", message = nfex.Message }),
                ArgumentException aex => BadRequest(new { error = "VALIDATION_ERROR", message = aex.Message }),
                _ => throw ex
            };
        }

        [HttpGet("{classroomId:guid}/curriculum/teacher")]
        [RequireJwtRole("Teacher")]
        public async Task<IActionResult> GetTeacherCurriculum(Guid classroomId)
        {
            try
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
            catch (Exception ex) { return HandleCurriculumError(ex); }
        }

        [HttpGet("{classroomId:guid}/curriculum/student")]
        public async Task<IActionResult> GetStudentCurriculum(Guid classroomId)
        {
            try
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
            catch (Exception ex) { return HandleCurriculumError(ex); }
        }

        [HttpPost("{classroomId:guid}/modules")]
        [RequireJwtRole("Teacher")]
        public async Task<IActionResult> CreateModule(Guid classroomId, [FromBody] CreateModuleRequest request)
        {
            try
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
            catch (Exception ex) { return HandleCurriculumError(ex); }
        }

        [HttpPut("modules/{moduleId}")]
        [RequireJwtRole("Teacher")]
        public async Task<IActionResult> UpdateModule(Guid moduleId, [FromBody] UpdateModuleRequest request)
        {
            try
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
            catch (Exception ex) { return HandleCurriculumError(ex); }
        }

        [HttpDelete("modules/{moduleId}")]
        [RequireJwtRole("Teacher")]
        public async Task<IActionResult> DeleteModule(Guid moduleId)
        {
            try
            {
                var teacherIdStr = JwtHelper.ExtractSubFromToken(Request);
                if (!Guid.TryParse(teacherIdStr, out var teacherId))
                    return Unauthorized();

                // Lấy classroomId qua module (trước đây là STUB — parse token rồi trả NoContent
                // mà KHÔNG gửi command → module không bao giờ bị xóa).
                var module = await _dbContext.ClassroomModules
                    .FirstOrDefaultAsync(m => m.Id == moduleId);
                if (module == null)
                    return NotFound(new { error = "MODULE_NOT_FOUND", message = "Không tìm thấy module." });

                var command = new DeleteClassroomModuleCommand
                {
                    TeacherId = teacherId,
                    ClassroomId = module.ClassroomId,
                    ModuleId = moduleId
                };

                await _mediator.Send(command);
                return NoContent();
            }
            catch (UnauthorizedAccessException uex)
            {
                return StatusCode(403, new { error = "FORBIDDEN", message = uex.Message });
            }
            catch (ArgumentException aex)
            {
                return NotFound(new { error = "NOT_FOUND", message = aex.Message });
            }
        }

        [HttpPost("modules/{moduleId}/items")]
        [RequireJwtRole("Teacher")]
        public async Task<IActionResult> CreateModuleItem(Guid moduleId, [FromBody] CreateModuleItemRequest request)
        {
            try
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
            catch (Exception ex) { return HandleCurriculumError(ex); }
        }

        // LS-002: sửa một item (title/type/isHidden/isRequired/prerequisite) — endpoint trước đây
        // KHÔNG tồn tại → FE updateItemApi luôn 404.
        [HttpPut("modules/{moduleId}/items/{itemId:guid}")]
        [RequireJwtRole("Teacher")]
        public async Task<IActionResult> UpdateModuleItem(Guid moduleId, Guid itemId, [FromBody] UpdateModuleItemRequest request)
        {
            try
            {
                var teacherIdStr = JwtHelper.ExtractSubFromToken(Request);
                if (!Guid.TryParse(teacherIdStr, out var teacherId))
                    return Unauthorized();

                var command = new UpdateClassroomModuleItemCommand
                {
                    ModuleId = moduleId,
                    ItemId = itemId,
                    TeacherId = teacherId,
                    OverrideTitle = request.OverrideTitle,
                    OverrideDescription = request.OverrideDescription,
                    IsHidden = request.IsHidden,
                    IsRequired = request.IsRequired,
                    PrerequisiteItemId = request.PrerequisiteItemId,
                    IsSequential = request.IsSequential,
                    UnlockAt = request.UnlockAt,
                    DueAt = request.DueAt,
                    MaxAttempts = request.MaxAttempts
                };

                if (!string.IsNullOrWhiteSpace(request.ItemType))
                {
                    if (!Enum.TryParse<ModuleItemType>(request.ItemType, true, out var itemType))
                    {
                        return BadRequest(new { error = "INVALID_ITEM_TYPE", message = "ItemType must be Lesson, Quiz, or Codelab" });
                    }

                    command.ItemType = itemType;
                    command.LessonId = request.LessonId;
                    command.QuizId = request.QuizId;
                    command.CodelabId = request.CodelabId;
                }

                await _mediator.Send(command);
                return NoContent();
            }
            catch (Exception ex) { return HandleCurriculumError(ex); }
        }

        // LS-002: xóa item (soft-delete + cascade progress/override).
        [HttpDelete("modules/{moduleId}/items/{itemId:guid}")]
        [RequireJwtRole("Teacher")]
        public async Task<IActionResult> DeleteModuleItem(Guid moduleId, Guid itemId)
        {
            try
            {
                var teacherIdStr = JwtHelper.ExtractSubFromToken(Request);
                if (!Guid.TryParse(teacherIdStr, out var teacherId))
                    return Unauthorized();

                var command = new DeleteClassroomModuleItemCommand
                {
                    ModuleId = moduleId,
                    ItemId = itemId,
                    TeacherId = teacherId
                };

                await _mediator.Send(command);
                return NoContent();
            }
            catch (Exception ex) { return HandleCurriculumError(ex); }
        }

        [HttpPut("modules/{moduleId}/items/reorder")]
        [RequireJwtRole("Teacher")]
        public async Task<IActionResult> ReorderModuleItems(Guid moduleId, [FromBody] ReorderItemsRequest request)
        {
            try
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
            catch (Exception ex) { return HandleCurriculumError(ex); }
        }

        [HttpGet("{classroomId:guid}/integrity-report")]
        [RequireJwtRole("Teacher")]
        public async Task<IActionResult> GetIntegrityReport(Guid classroomId)
        {
            try
            {
                var teacherIdStr = JwtHelper.ExtractSubFromToken(Request);
                if (!Guid.TryParse(teacherIdStr, out var teacherId))
                    return Unauthorized();

                var query = new GetClassroomIntegrityReportQuery
                {
                    ClassroomId = classroomId,
                    TeacherId = teacherId
                };
                var result = await _mediator.Send(query);
                return Ok(result);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { error = "NOT_FOUND", message = "Classroom not found." });
            }
        }

        // LS-042: route thiếu :guid constraint → "modules/reorder" bị nuốt bởi
        // PUT modules/{moduleId} (moduleId không parse được → 404 route).
        [HttpPut("{classroomId:guid}/modules/reorder")]
        [RequireJwtRole("Teacher")]
        public async Task<IActionResult> ReorderModules(Guid classroomId, [FromBody] ReorderModulesRequest request)
        {
            try
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
            catch (Exception ex) { return HandleCurriculumError(ex); }
        }

        // LS-004: import khóa học vào classroom — handler đã tồn tại nhưng KHÔNG controller nào gọi
        // (FE gọi POST /classrooms/{id}/import-course → luôn 404).
        [HttpPost("{classroomId:guid}/import-course")]
        [RequireJwtRole("Teacher")]
        public async Task<IActionResult> ImportCourse(Guid classroomId, [FromBody] ImportCourseRequest request)
        {
            try
            {
                var teacherIdStr = JwtHelper.ExtractSubFromToken(Request);
                if (!Guid.TryParse(teacherIdStr, out var teacherId))
                    return Unauthorized();

                if (request.CourseId == Guid.Empty)
                    return BadRequest(new { error = "COURSE_ID_REQUIRED", message = "CourseId is required." });

                var command = new ImportCourseToClassroomCommand
                {
                    TeacherId = teacherId,
                    ClassroomId = classroomId,
                    CourseId = request.CourseId,
                    IncludeAllModules = request.IncludeAllModules,
                    SelectedModuleIds = request.SelectedModuleIds,
                    OverrideExisting = request.OverrideExisting
                };

                var classroomResult = await _mediator.Send(command);
                return Ok(new { classroomId = classroomResult });
            }
            catch (UnauthorizedAccessException uex)
            {
                return StatusCode(403, new { error = "FORBIDDEN", message = uex.Message });
            }
            catch (InvalidOperationException ioex)
            {
                return NotFound(new { error = "NOT_FOUND", message = ioex.Message });
            }
            catch (ArgumentException aex)
            {
                return BadRequest(new { error = "VALIDATION_ERROR", message = aex.Message });
            }
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

    // LS-002: body cho PUT modules/{moduleId}/items/{itemId}.
    public class UpdateModuleItemRequest
    {
        public string? ItemType { get; set; }
        public Guid? LessonId { get; set; }
        public Guid? QuizId { get; set; }
        public Guid? CodelabId { get; set; }
        public string OverrideTitle { get; set; } = string.Empty;
        public string OverrideDescription { get; set; } = string.Empty;
        public bool IsHidden { get; set; }
        public bool IsRequired { get; set; } = true;
        public Guid? PrerequisiteItemId { get; set; }
        public bool IsSequential { get; set; } = true;
        public DateTime? UnlockAt { get; set; }
        public DateTime? DueAt { get; set; }
        public int? MaxAttempts { get; set; }
    }

    // LS-004: body cho POST /{classroomId}/import-course.
    public class ImportCourseRequest
    {
        public Guid CourseId { get; set; }
        public bool IncludeAllModules { get; set; } = true;
        public List<Guid>? SelectedModuleIds { get; set; }
        public bool OverrideExisting { get; set; } = false;
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
