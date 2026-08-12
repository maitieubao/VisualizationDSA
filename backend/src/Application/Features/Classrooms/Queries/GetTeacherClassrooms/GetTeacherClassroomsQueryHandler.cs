using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Interfaces;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Application.Features.Classrooms.Queries.GetTeacherClassrooms
{
    public class GetTeacherClassroomsQueryHandler : IRequestHandler<GetTeacherClassroomsQuery, IEnumerable<ClassroomResponseDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetTeacherClassroomsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ClassroomResponseDto>> Handle(GetTeacherClassroomsQuery request, CancellationToken cancellationToken)
        {
            var classrooms = await _context.Classrooms
                .Include(c => c.Enrollments)
                .Include(c => c.OwnerTeacher)
                .Where(c => c.OwnerTeacherId == request.TeacherId && !c.IsArchived)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync(cancellationToken);

            var result = new List<ClassroomResponseDto>();
            foreach (var c in classrooms)
            {
                result.Add(new ClassroomResponseDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    InviteCode = c.InviteCode,
                    CreatedAt = c.CreatedAt,
                    OwnerTeacherName = c.OwnerTeacher?.Username ?? c.OwnerTeacher?.Email ?? "Unknown",
                    StudentCount = c.Enrollments.Count,
                    Role = "Teacher"
                });
            }
            return result;
        }
    }
}
