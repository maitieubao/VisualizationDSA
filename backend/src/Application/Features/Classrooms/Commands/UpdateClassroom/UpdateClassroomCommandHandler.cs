using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Interfaces;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.UpdateClassroom
{
    public class UpdateClassroomCommandHandler : IRequestHandler<UpdateClassroomCommand, Unit>
    {
        private readonly IApplicationDbContext _context;

        public UpdateClassroomCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Unit> Handle(UpdateClassroomCommand request, CancellationToken cancellationToken)
        {
            var classroom = await _context.Classrooms
                .FirstOrDefaultAsync(c => c.Id == request.ClassroomId, cancellationToken);

            if (classroom == null)
                throw new ArgumentException("Classroom not found.");

            if (classroom.OwnerTeacherId != request.TeacherId)
                throw new UnauthorizedAccessException("Not your classroom.");

            classroom.UpdateDetails(request.Name, request.Description);
            await _context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}
