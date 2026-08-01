using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Interfaces;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.JoinClassroom
{
    public class JoinClassroomCommandHandler : IRequestHandler<JoinClassroomCommand, ClassroomResponseDto>
    {
        private readonly IApplicationDbContext _context;

        public JoinClassroomCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ClassroomResponseDto> Handle(JoinClassroomCommand request, CancellationToken cancellationToken)
        {
            var classroom = await _context.Classrooms
                .Include(c => c.Enrollments)
                .Include(c => c.OwnerTeacher)
                .FirstOrDefaultAsync(c => c.InviteCode == request.InviteCode && !c.IsArchived, cancellationToken);

            if (classroom == null)
            {
                throw new ArgumentException("Invalid or expired invite code.");
            }

            var student = await _context.Users.FindAsync(new object[] { request.StudentId }, cancellationToken);
            if (student == null)
            {
                throw new ArgumentException("User not found.");
            }

            if (classroom.Enrollments.Any(e => e.StudentId == request.StudentId))
            {
                throw new InvalidOperationException("Already enrolled in this classroom.");
            }

            var enrollment = new ClassroomEnrollment(classroom.Id, request.StudentId);
            _context.ClassroomEnrollments.Add(enrollment);
            await _context.SaveChangesAsync(cancellationToken);

            return new ClassroomResponseDto
            {
                Id = classroom.Id,
                Name = classroom.Name,
                Description = classroom.Description,
                InviteCode = classroom.InviteCode,
                CreatedAt = classroom.CreatedAt,
                OwnerTeacherName = classroom.OwnerTeacher?.Username ?? classroom.OwnerTeacher?.Email ?? "Unknown",
                StudentCount = classroom.Enrollments.Count
            };
        }
    }
}
