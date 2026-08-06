using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Interfaces;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.DeleteClassroomModule
{
    public class DeleteClassroomModuleCommandHandler : IRequestHandler<DeleteClassroomModuleCommand>
    {
        private readonly IApplicationDbContext _context;

        public DeleteClassroomModuleCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task Handle(DeleteClassroomModuleCommand request, CancellationToken cancellationToken)
        {
            var classroom = await _context.Classrooms
                .FirstOrDefaultAsync(c => c.Id == request.ClassroomId, cancellationToken);

            if (classroom == null)
                throw new ArgumentException("Classroom not found.");

            if (classroom.OwnerTeacherId != request.TeacherId)
                throw new UnauthorizedAccessException("Not your classroom.");

            var module = await _context.Set<VisualizationDSA.Domain.Entities.ClassroomModule>()
                .FirstOrDefaultAsync(m => m.Id == request.ModuleId && m.ClassroomId == request.ClassroomId, cancellationToken);

            if (module == null)
                throw new ArgumentException("Module not found in this classroom.");

            // Soft-delete: giữ dữ liệu lịch sử (global query filter !IsDeleted đã loại khỏi truy vấn).
            module.Delete();
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
