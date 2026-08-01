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

            _context.ClassroomEnrollments.Remove(enrollment);
            await _context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}
