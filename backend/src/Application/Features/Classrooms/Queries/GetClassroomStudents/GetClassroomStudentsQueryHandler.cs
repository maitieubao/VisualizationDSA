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

namespace VisualizationDSA.Application.Features.Classrooms.Queries.GetClassroomStudents
{
    public class GetClassroomStudentsQueryHandler : IRequestHandler<GetClassroomStudentsQuery, IEnumerable<UserDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetClassroomStudentsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<UserDto>> Handle(GetClassroomStudentsQuery request, CancellationToken cancellationToken)
        {
            var classroom = await _context.Classrooms
                .Include(c => c.Enrollments)
                    .ThenInclude(e => e.Student)
                .FirstOrDefaultAsync(c => c.Id == request.ClassroomId, cancellationToken);

            if (classroom == null)
            {
                throw new ArgumentException("Classroom not found.");
            }

            if (classroom.OwnerTeacherId != request.TeacherId)
            {
                throw new UnauthorizedAccessException("Not your classroom.");
            }

            var students = classroom.Enrollments
                .Where(e => e.Status == EnrollmentStatus.Active)
                .Select(e => e.Student)
                .Where(s => s != null) 
                .Select(s => new UserDto
                {
                    Id = s.Id,
                    Username = s.Username,
                    Email = s.Email,
                    Role = s.Role,
                    TotalXP = s.TotalXP
                })
                .ToList();

            return students;
        }
    }
}
