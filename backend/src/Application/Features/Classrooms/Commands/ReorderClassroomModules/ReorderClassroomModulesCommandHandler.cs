using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Interfaces;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.ReorderClassroomModules
{
    public class ReorderClassroomModulesCommandHandler : IRequestHandler<ReorderClassroomModulesCommand>
    {
        private readonly IApplicationDbContext _context;

        public ReorderClassroomModulesCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task Handle(ReorderClassroomModulesCommand request, CancellationToken cancellationToken)
        {
            var modules = await _context.ClassroomModules
                .Where(m => m.ClassroomId == request.ClassroomId && !m.IsDeleted)
                .ToListAsync(cancellationToken);

            var classroom = await _context.Classrooms.FindAsync(new object[] { request.ClassroomId }, cancellationToken);
            if (classroom == null || classroom.OwnerTeacherId != request.TeacherId)
                throw new UnauthorizedAccessException("Only the classroom owner can reorder modules.");

            foreach (var dto in request.ModuleOrders)
            {
                var module = modules.FirstOrDefault(m => m.Id == dto.ModuleId);
                if (module != null)
                {
                    module.Update(module.Title, module.Description, dto.OrderIndex, module.IsHidden, module.UnlockAt);
                }
            }

            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}