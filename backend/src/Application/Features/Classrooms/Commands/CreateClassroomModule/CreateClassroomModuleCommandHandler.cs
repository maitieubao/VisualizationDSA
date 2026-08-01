using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using VisualizationDSA.Application.Interfaces;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.CreateClassroomModule
{
    public class CreateClassroomModuleCommandHandler : IRequestHandler<CreateClassroomModuleCommand, Guid>
    {
        private readonly IApplicationDbContext _context;

        public CreateClassroomModuleCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Guid> Handle(CreateClassroomModuleCommand request, CancellationToken cancellationToken)
        {
            var classroom = await _context.Classrooms.FindAsync(new object[] { request.ClassroomId }, cancellationToken);
            if (classroom == null)
                throw new ArgumentException("Classroom not found.");

            if (classroom.OwnerTeacherId != request.TeacherId)
                throw new UnauthorizedAccessException("Only the classroom owner can create modules.");

            var module = new ClassroomModule(request.ClassroomId, request.Title, request.Description, request.OrderIndex, false, request.UnlockAt);

            _context.ClassroomModules.Add(module);
            await _context.SaveChangesAsync(cancellationToken);

            return module.Id;
        }
    }
}