using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Interfaces;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.KickStudent
{
    public class KickStudentCommandHandler : IRequestHandler<KickStudentCommand, Unit>
    {
        private readonly IApplicationDbContext _context;

        public KickStudentCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Unit> Handle(KickStudentCommand request, CancellationToken cancellationToken)
        {
            var classroom = await _context.Classrooms
                .Include(c => c.Enrollments)
                .FirstOrDefaultAsync(c => c.Id == request.ClassroomId, cancellationToken);

            if (classroom == null)
                throw new ArgumentException("Classroom not found.");

            if (classroom.OwnerTeacherId != request.TeacherId)
                throw new UnauthorizedAccessException("Not your classroom.");

            var enrollment = classroom.Enrollments.FirstOrDefault(e => e.StudentId == request.StudentId);
            if (enrollment == null)
                throw new ArgumentException("Student not in this classroom.");

            // SOFT-KICK: giữ bản ghi với trạng thái Kicked (bảo toàn lịch sử + chặn join lại).
            // Trước đây Remove() xóa cứng → học viên bị kick join lại được ngay.
            enrollment.Kick(request.TeacherId, "Bị giáo viên xóa khỏi lớp");
            await _context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}
