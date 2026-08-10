using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using VisualizationDSA.Application.Common.Exceptions;
using VisualizationDSA.Application.Interfaces;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.ReorderClassroomModuleItems
{
    public class ReorderClassroomModuleItemsCommandHandler : IRequestHandler<ReorderClassroomModuleItemsCommand>
    {
        private readonly IApplicationDbContext _context;

        public ReorderClassroomModuleItemsCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task Handle(ReorderClassroomModuleItemsCommand request, CancellationToken cancellationToken)
        {
            var module = await _context.ClassroomModules.FindAsync(new object[] { request.ModuleId }, cancellationToken);
            if (module == null)
                throw new ArgumentException("Module not found.");

            var classroom = await _context.Classrooms.FindAsync(new object[] { module.ClassroomId }, cancellationToken);
            if (classroom == null || classroom.OwnerTeacherId != request.TeacherId)
                throw new UnauthorizedAccessException("Only the classroom owner can reorder items.");

            var items = await _context.ClassroomModuleItems
                .Where(i => i.ModuleId == request.ModuleId && !i.IsDeleted)
                .ToListAsync(cancellationToken);

            foreach (var dto in request.ItemOrders)
            {
                var item = items.FirstOrDefault(i => i.Id == dto.ItemId);
                if (item != null)
                {
                    item.Update(item.OverrideTitle, item.OverrideDescription, dto.OrderIndex, item.IsRequired, item.IsHidden, item.UnlockAt, item.DueAt, item.MaxAttempts);
                }
            }

            try
            {
                await _context.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateConcurrencyException)
            {
                throw new ConflictException("The module items were modified by another user. Please refresh and try again.");
            }
        }
    }
}