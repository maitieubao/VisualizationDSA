using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Interfaces;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.ArchiveClassroom
{
    public class ArchiveClassroomCommandHandler : IRequestHandler<ArchiveClassroomCommand, Unit>
    {
        private readonly IApplicationDbContext _context;

        public ArchiveClassroomCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Unit> Handle(ArchiveClassroomCommand request, CancellationToken cancellationToken)
        {
            var classroom = await _context.Classrooms
                .FirstOrDefaultAsync(c => c.Id == request.ClassroomId, cancellationToken);

            if (classroom == null)
                throw new ArgumentException("Classroom not found.");

            if (classroom.OwnerTeacherId != request.TeacherId)
                throw new UnauthorizedAccessException("Not your classroom.");

            classroom.Archive();
            await _context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}
