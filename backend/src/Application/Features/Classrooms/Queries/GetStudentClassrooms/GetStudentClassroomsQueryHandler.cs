using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Interfaces;
using VisualizationDSA.Domain.Enums;

namespace VisualizationDSA.Application.Features.Classrooms.Queries.GetStudentClassrooms
{
    public class GetStudentClassroomsQueryHandler : IRequestHandler<GetStudentClassroomsQuery, IEnumerable<ClassroomResponseDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetStudentClassroomsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ClassroomResponseDto>> Handle(GetStudentClassroomsQuery request, CancellationToken cancellationToken)
        {
            var enrollments = await _context.ClassroomEnrollments
                .Include(e => e.Classroom)
                    .ThenInclude(c => c.Enrollments)
                .Include(e => e.Classroom)
                    .ThenInclude(c => c.OwnerTeacher)
                .Where(e => e.StudentId == request.StudentId && e.Status == EnrollmentStatus.Active && !e.Classroom.IsArchived)
                .ToListAsync(cancellationToken);

            var result = new List<ClassroomResponseDto>();
            foreach (var e in enrollments)
            {
                result.Add(new ClassroomResponseDto
                {
                    Id = e.Classroom.Id,
                    Name = e.Classroom.Name,
                    Description = e.Classroom.Description,
                    InviteCode = e.Classroom.InviteCode,
                    CreatedAt = e.Classroom.CreatedAt,
                    OwnerTeacherName = e.Classroom.OwnerTeacher?.Username ?? e.Classroom.OwnerTeacher?.Email ?? "Unknown",
                    StudentCount = e.Classroom.Enrollments.Count
                });
            }
            return result;
        }
    }
}
