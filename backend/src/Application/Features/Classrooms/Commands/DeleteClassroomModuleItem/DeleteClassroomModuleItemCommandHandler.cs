using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;
using VisualizationDSA.Application.Interfaces;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.DeleteClassroomModuleItem
{
    public class DeleteClassroomModuleItemCommandHandler : IRequestHandler<DeleteClassroomModuleItemCommand>
    {
        private readonly IApplicationDbContext _context;

        public DeleteClassroomModuleItemCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task Handle(DeleteClassroomModuleItemCommand request, CancellationToken cancellationToken)
        {
            // LS-022: item/module không tồn tại → KeyNotFoundException (controller map 404).
            var item = await _context.ClassroomModuleItems
                .FirstOrDefaultAsync(i => i.Id == request.ItemId && i.ModuleId == request.ModuleId, cancellationToken)
                ?? throw new KeyNotFoundException("Item not found in this module.");

            var module = await _context.ClassroomModules.FindAsync(new object[] { item.ModuleId }, cancellationToken);
            if (module == null)
                throw new KeyNotFoundException("Module not found.");

            var classroom = await _context.Classrooms.FindAsync(new object[] { module.ClassroomId }, cancellationToken);
            if (classroom == null || classroom.OwnerTeacherId != request.TeacherId)
                throw new UnauthorizedAccessException("Only the classroom owner can delete items.");

            // LS-002: cascade dọn dữ liệu phụ thuộc trước khi soft-delete item:
            // 1. Tiến độ sinh viên (UserModuleItemProgresses ghi theo ModuleItemId).
            // 2. Override cấu hình item (ClassroomModuleItemOverrides ghi theo ModuleItemId).
            _context.UserModuleItemProgresses.RemoveRange(
                await _context.UserModuleItemProgresses
                    .Where(p => p.ModuleItemId == item.Id)
                    .ToListAsync(cancellationToken));

            _context.ClassroomModuleItemOverrides.RemoveRange(
                await _context.ClassroomModuleItemOverrides
                    .Where(o => o.ModuleItemId == item.Id)
                    .ToListAsync(cancellationToken));

            item.Delete();
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
