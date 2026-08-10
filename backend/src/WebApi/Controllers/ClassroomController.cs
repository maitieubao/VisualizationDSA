using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Services;
using MediatR;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.Application.Features.Classrooms.Queries;
using VisualizationDSA.Application.Features.Classrooms.Commands;

using VisualizationDSA.WebApi.Filters;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiController]
    [Route("api/v{version:apiVersion}/classrooms")]
    [RequireJwtRole]
    public class ClassroomController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IClassroomGradingService _gradingService;
        private readonly IClassroomExcelExportService _excelExportService;
        private readonly ApplicationDbContext _dbContext;

        public ClassroomController(
            IMediator mediator,
            IClassroomGradingService gradingService,
            IClassroomExcelExportService excelExportService,
            ApplicationDbContext dbContext)
        {
            _mediator = mediator;
            _gradingService = gradingService;
            _excelExportService = excelExportService;
            _dbContext = dbContext;
        }

        private Guid GetUserId()
        {
            var userIdStr = JwtHelper.ExtractSubFromToken(Request);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            {
                throw new UnauthorizedAccessException("Invalid User Token.");
            }
            return userId;
        }

        [HttpPost]
        [RequireJwtRole("Teacher")]
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
                    // Chuẩn hóa invite code (mã sinh ra viết hoa — nhập thường vẫn khớp).
                    InviteCode = (dto.InviteCode ?? string.Empty).Trim().ToUpperInvariant()
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
                var role = JwtHelper.ExtractRoleFromToken(Request);

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

        [HttpGet("{id:guid}/students")]
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
        
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetClassroom(Guid id)
        {
            try
            {
                var userIdStr = JwtHelper.ExtractSubFromToken(Request);
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


        [HttpPut("{id:guid}")]
        [RequireJwtRole("Teacher")]
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

        [HttpPost("{id:guid}/regenerate-code")]
        [RequireJwtRole("Teacher")]
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

        [HttpGet("{id:guid}/statistics")]
        [RequireJwtRole("Teacher")]
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

        [HttpGet("{id:guid}/export-excel")]
        [RequireJwtRole("Teacher")]
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

        [HttpPost("{id:guid}/kick/{studentId:guid}")]
        [RequireJwtRole("Teacher")]
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

        [HttpPost("{id:guid}/archive")]
        [RequireJwtRole("Teacher")]
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

        [HttpDelete("{id:guid}")]
        [RequireJwtRole("Teacher")]
        public async Task<IActionResult> DeleteClassroom(Guid id)
        {
            try
            {
                var teacherId = GetUserId();

                var classroom = await _dbContext.Classrooms
                    .Include(c => c.Enrollments)
                    .Include(c => c.Announcements)
                    .Include(c => c.Quizzes)
                    .Include(c => c.Lessons)
                    .Include(c => c.Modules)
                        .ThenInclude(m => m.Items)
                    .Include(c => c.ModuleItemOverrides)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (classroom == null)
                    return NotFound(new { Message = "Classroom not found." });

                if (classroom.OwnerTeacherId != teacherId)
                    throw new UnauthorizedAccessException("Bạn không có quyền xóa lớp học này.");

                // T3-GUARD: Cascade delete theo thứ tự FK để tránh orphan/referential integrity errors.
                // 1. ClassroomQuizAttempts (nếu có)
                await _dbContext.ClassroomQuizAttempts
                    .Where(a => classroom.Quizzes.Select(q => q.Id).Contains(a.ClassroomQuizId))
                    .ExecuteDeleteAsync();

                // 2. ClassroomQuizzes
                _dbContext.ClassroomQuizzes.RemoveRange(classroom.Quizzes);

                // 3. ClassroomLessons
                _dbContext.ClassroomLessons.RemoveRange(classroom.Lessons);

                // 4. ClassroomModuleItemOverrides
                _dbContext.ClassroomModuleItemOverrides.RemoveRange(classroom.ModuleItemOverrides);

                // 5. ClassroomModuleItems → ClassroomModules
                foreach (var module in classroom.Modules)
                {
                    _dbContext.ClassroomModuleItems.RemoveRange(module.Items);
                    _dbContext.ClassroomModules.Remove(module);
                }

                // 6. Announcements
                _dbContext.ClassroomAnnouncements.RemoveRange(classroom.Announcements);

                // 7. Enrollments (student enrollments)
                _dbContext.ClassroomEnrollments.RemoveRange(classroom.Enrollments);

                // 8. Classroom chính
                _dbContext.Classrooms.Remove(classroom);

                await _dbContext.SaveChangesAsync();

                return Ok(new { message = $"Đã xóa lớp học \"{classroom.Name}\" thành công!", classroomId = id });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { Message = ex.Message });
            }
        }
        [HttpPut("{id:guid}/override/{moduleId:guid}")]
        [RequireJwtRole("Teacher")]
        public async Task<IActionResult> UpdateModuleItemOverride(Guid id, Guid moduleId, [FromBody] UpdateClassroomModuleItemOverrideCommand command)
        {
            try
            {
                var userIdStr = JwtHelper.ExtractSubFromToken(Request);
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