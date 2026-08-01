using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using VisualizationDSA.Application.Interfaces;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.UpdateClassroomModule
{
    public class UpdateClassroomModuleCommandHandler : IRequestHandler<UpdateClassroomModuleCommand>
    {
        private readonly IApplicationDbContext _context;

        public UpdateClassroomModuleCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task Handle(UpdateClassroomModuleCommand request, CancellationToken cancellationToken)
        {
            var module = await _context.ClassroomModules.FindAsync(new object[] { request.ModuleId }, cancellationToken);
            if (module == null)
                throw new ArgumentException("Module not found.");

            var classroom = await _context.Classrooms.FindAsync(new object[] { module.ClassroomId }, cancellationToken);
            if (classroom == null || classroom.OwnerTeacherId != request.TeacherId)
                throw new UnauthorizedAccessException("Only the classroom owner can update modules.");

            module.Update(request.Title, request.Description, request.OrderIndex, request.IsHidden, request.UnlockAt);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}