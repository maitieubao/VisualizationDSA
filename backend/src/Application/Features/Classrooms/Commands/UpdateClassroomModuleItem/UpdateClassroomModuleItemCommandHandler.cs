using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;
using VisualizationDSA.Application.Interfaces;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.UpdateClassroomModuleItem
{
    public class UpdateClassroomModuleItemCommandHandler : IRequestHandler<UpdateClassroomModuleItemCommand>
    {
        private readonly IApplicationDbContext _context;

        public UpdateClassroomModuleItemCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task Handle(UpdateClassroomModuleItemCommand request, CancellationToken cancellationToken)
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
                throw new UnauthorizedAccessException("Only the classroom owner can update items.");

            // LS-002: đổi kiểu item (Lesson/Quiz/Codelab) nếu giáo viên chỉ định — có re-validate FK.
            if (request.ItemType.HasValue)
            {
                item.UpdateItemType(
                    request.ItemType.Value,
                    request.LessonId,
                    request.QuizId,
                    request.CodelabId);
            }

            item.UpdateItemContent(
                request.OverrideTitle,
                request.OverrideDescription,
                request.IsRequired,
                request.IsHidden,
                request.PrerequisiteItemId,
                request.IsSequential,
                request.UnlockAt,
                request.DueAt,
                request.MaxAttempts);

            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
