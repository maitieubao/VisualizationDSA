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

            // LS-023: validate itemId trùng lặp + itemId không thuộc module (bỏ im lặng → 400).
            var duplicateIds = request.ItemOrders
                .GroupBy(d => d.ItemId)
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .ToList();
            if (duplicateIds.Count > 0)
                throw new ArgumentException("ItemOrders contains duplicate item ids.");

            foreach (var dto in request.ItemOrders)
            {
                if (items.All(i => i.Id != dto.ItemId))
                    throw new ArgumentException("ItemOrders contains an item that does not belong to this module.");
            }

            // LS-023: đánh số lại TOÀN BỘ items theo thứ tự danh sách (bỏ qua OrderIndex client gửi —
            // tránh duplicate order). Item ngoài danh sách giữ vị trí sau cùng theo OrderIndex cũ.
            var orderByItemId = new Dictionary<System.Guid, int>();
            int nextOrder = 0;
            foreach (var dto in request.ItemOrders)
            {
                orderByItemId[dto.ItemId] = nextOrder++;
            }

            foreach (var item in items.Where(i => !orderByItemId.ContainsKey(i.Id)).OrderBy(i => i.OrderIndex))
            {
                orderByItemId[item.Id] = nextOrder++;
            }

            // 2 pha đổi số để không vi phạm unique index (ModuleId, OrderIndex) ở DB thật:
            // pha 1 gán giá trị lớn phân biệt, pha 2 gán thứ tự cuối cùng.
            foreach (var item in items)
            {
                item.Update(item.OverrideTitle, item.OverrideDescription, (orderByItemId[item.Id] + 1) * 1000, item.IsRequired, item.IsHidden, item.UnlockAt, item.DueAt, item.MaxAttempts);
            }

            try
            {
                await _context.SaveChangesAsync(cancellationToken);

                foreach (var item in items)
                {
                    item.Update(item.OverrideTitle, item.OverrideDescription, orderByItemId[item.Id], item.IsRequired, item.IsHidden, item.UnlockAt, item.DueAt, item.MaxAttempts);
                }

                await _context.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateConcurrencyException)
            {
                throw new ConflictException("The module items were modified by another user. Please refresh and try again.");
            }
        }
    }
}
