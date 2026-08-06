using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Interfaces;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.CreateClassroom
{
    public class CreateClassroomCommandHandler : IRequestHandler<CreateClassroomCommand, ClassroomResponseDto>
    {
        private readonly IApplicationDbContext _context;

        public CreateClassroomCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ClassroomResponseDto> Handle(CreateClassroomCommand request, CancellationToken cancellationToken)
        {
            var teacher = await _context.Users.FindAsync(new object[] { request.TeacherId }, cancellationToken);
            if (teacher == null || teacher.Role != "Teacher")
            {
                throw new UnauthorizedAccessException("Only teachers can create classrooms.");
            }

            string inviteCode;
            do
            {
                inviteCode = GenerateInviteCode();
            } while (await _context.Classrooms.AnyAsync(c => c.InviteCode == inviteCode, cancellationToken));

            var classroom = new Classroom(request.TeacherId, request.Name, request.Description, inviteCode);
            _context.Classrooms.Add(classroom);
            await _context.SaveChangesAsync(cancellationToken);

            return new ClassroomResponseDto
            {
                Id = classroom.Id,
                Name = classroom.Name,
                Description = classroom.Description,
                InviteCode = classroom.InviteCode,
                CreatedAt = classroom.CreatedAt,
                OwnerTeacherName = teacher.Username ?? teacher.Email,
                StudentCount = 0
            };
        }

        private string GenerateInviteCode()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            
            return new string(Enumerable.Repeat(chars, 6)
                .Select(s => s[System.Security.Cryptography.RandomNumberGenerator.GetInt32(chars.Length)]).ToArray());
        }
    }
}
