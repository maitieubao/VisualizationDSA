using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Services;
using MediatR;
using VisualizationDSA.Application.Features.Classrooms.Queries;
using VisualizationDSA.Application.Features.Classrooms.Commands;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ClassroomController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IClassroomGradingService _gradingService;
        private readonly IClassroomExcelExportService _excelExportService;

        public ClassroomController(
            IMediator mediator,
            IClassroomGradingService gradingService,
            IClassroomExcelExportService excelExportService)
        {
            _mediator = mediator;
            _gradingService = gradingService;
            _excelExportService = excelExportService;
        }

        private Guid GetUserId()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            {
                throw new UnauthorizedAccessException("Invalid User Token.");
            }
            return userId;
        }

        [HttpPost]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> CreateClassroom([FromBody] CreateClassroomDto dto)
        {
            try
            {
                var teacherId = GetUserId();
                var command = new VisualizationDSA.Application.Features.Classrooms.Commands.CreateClassroom.CreateClassroomCommand
                {
                    TeacherId = teacherId,
                    Name = dto.Name,
                    Description = dto.Description
                };
                var classroom = await _mediator.Send(command);
                return CreatedAtAction(nameof(GetMyClassrooms), new { id = classroom.Id }, classroom);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { Message = ex.Message });
            }
        }

        [HttpPost("join")]
        public async Task<IActionResult> JoinClassroom([FromBody] JoinClassroomDto dto)
        {
            try
            {
                var studentId = GetUserId();
                var command = new VisualizationDSA.Application.Features.Classrooms.Commands.JoinClassroom.JoinClassroomCommand
                {
                    StudentId = studentId,
                    InviteCode = dto.InviteCode
                };
                var classroom = await _mediator.Send(command);
                return Ok(classroom);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status401Unauthorized, new { Message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { Message = ex.Message });
            }
        }

        [HttpGet("mine")]
        public async Task<IActionResult> GetMyClassrooms()
        {
            try
            {
                var userId = GetUserId();
                var role = User.FindFirstValue(ClaimTypes.Role);

                if (role == "Teacher")
                {
                    var query = new VisualizationDSA.Application.Features.Classrooms.Queries.GetTeacherClassrooms.GetTeacherClassroomsQuery { TeacherId = userId };
                    var classrooms = await _mediator.Send(query);
                    return Ok(classrooms);
                }
                else
                {
                    var query = new VisualizationDSA.Application.Features.Classrooms.Queries.GetStudentClassrooms.GetStudentClassroomsQuery { StudentId = userId };
                    var classrooms = await _mediator.Send(query);
                    return Ok(classrooms);
                }
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status401Unauthorized, new { Message = ex.Message });
            }
        }

        [HttpGet("{id}/students")]
        public async Task<IActionResult> GetStudentsInClassroom(Guid id)
        {
            try
            {
                var teacherId = GetUserId();
                var query = new VisualizationDSA.Application.Features.Classrooms.Queries.GetClassroomStudents.GetClassroomStudentsQuery
                {
                    ClassroomId = id,
                    TeacherId = teacherId
                };
                var students = await _mediator.Send(query);
                return Ok(students);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { Message = ex.Message });
            }
        }
        
        [HttpGet("{id}")]
        public async Task<IActionResult> GetClassroom(Guid id)
        {
            try
            {
                var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(userIdStr, out var userId))
                {
                    return Unauthorized();
                }

                var query = new GetClassroomDetailsQuery { ClassroomId = id, UserId = userId };
                var classroom = await _mediator.Send(query);

                if (classroom == null)
                    return NotFound(new { Message = "Classroom not found" });

                return Ok(classroom);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { Message = ex.Message });
            }
        }


        [HttpPut("{id}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> UpdateClassroom(Guid id, [FromBody] UpdateClassroomDto dto)
        {
            try
            {
                var teacherId = GetUserId();
                var command = new VisualizationDSA.Application.Features.Classrooms.Commands.UpdateClassroom.UpdateClassroomCommand
                {
                    TeacherId = teacherId,
                    ClassroomId = id,
                    Name = dto.Name,
                    Description = dto.Description
                };
                await _mediator.Send(command);
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { Message = ex.Message });
            }
        }

        [HttpPost("{id}/regenerate-code")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> RegenerateInviteCode(Guid id)
        {
            try
            {
                var teacherId = GetUserId();
                var command = new VisualizationDSA.Application.Features.Classrooms.Commands.RegenerateInviteCode.RegenerateInviteCodeCommand
                {
                    TeacherId = teacherId,
                    ClassroomId = id
                };
                var newCode = await _mediator.Send(command);
                return Ok(new { InviteCode = newCode });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { Message = ex.Message });
            }
        }

        [HttpGet("{id}/statistics")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> GetStatistics(Guid id)
        {
            try
            {
                var teacherId = GetUserId();
                var stats = await _gradingService.GetClassStatisticsAsync(id, teacherId);
                return Ok(stats);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { Message = ex.Message });
            }
        }

        [HttpGet("{id}/export-excel")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> ExportExcel(Guid id)
        {
            try
            {
                var teacherId = GetUserId();
                var fileBytes = await _excelExportService.ExportClassReportAsync(id, teacherId);
                return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"Classroom_{id}_Report.xlsx");
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { Message = ex.Message });
            }
        }

        [HttpPost("{id}/kick/{studentId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> KickStudent(Guid id, Guid studentId)
        {
            try
            {
                var teacherId = GetUserId();
                var command = new VisualizationDSA.Application.Features.Classrooms.Commands.KickStudent.KickStudentCommand
                {
                    TeacherId = teacherId,
                    ClassroomId = id,
                    StudentId = studentId
                };
                await _mediator.Send(command);
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { Message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("{id}/archive")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> ArchiveClassroom(Guid id)
        {
            try
            {
                var teacherId = GetUserId();
                var command = new VisualizationDSA.Application.Features.Classrooms.Commands.ArchiveClassroom.ArchiveClassroomCommand
                {
                    TeacherId = teacherId,
                    ClassroomId = id
                };
                await _mediator.Send(command);
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { Message = ex.Message });
            }
        }
    
        [HttpPut("{id}/override/{moduleId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> UpdateModuleItemOverride(Guid id, Guid moduleId, [FromBody] UpdateClassroomModuleItemOverrideCommand command)
        {
            try
            {
                var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(userIdStr, out var userId))
                {
                    return Unauthorized();
                }

                command.ClassroomId = id;
                command.ModuleItemId = moduleId;
                command.UserId = userId;
                
                await _mediator.Send(command);
                return Ok(new { Message = "Override updated successfully" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { Message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
        }

}
}