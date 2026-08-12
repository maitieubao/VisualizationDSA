using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Interfaces;
using VisualizationDSA.Domain.Enums;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.LeaveClassroom
{
    public class LeaveClassroomCommandHandler : IRequestHandler<LeaveClassroomCommand, Unit>
    {
        private readonly IApplicationDbContext _context;

        public LeaveClassroomCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Unit> Handle(LeaveClassroomCommand request, CancellationToken cancellationToken)
        {
            var enrollment = await _context.ClassroomEnrollments
                .FirstOrDefaultAsync(e => e.ClassroomId == request.ClassroomId && e.StudentId == request.StudentId, cancellationToken);

            if (enrollment == null)
                throw new ArgumentException("Bạn không tham gia lớp học này.");

            // CR-026: chỉ rời khi đang Active (Kicked/Banned/Left không có gì để rời).
            if (enrollment.Status != EnrollmentStatus.Active)
                throw new ArgumentException("Bạn không còn là học viên đang hoạt động của lớp học này.");

            enrollment.Leave();
            await _context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}
