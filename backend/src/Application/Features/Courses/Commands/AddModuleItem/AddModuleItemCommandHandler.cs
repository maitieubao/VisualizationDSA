using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Application.Interfaces;

namespace VisualizationDSA.Application.Features.Courses.Commands.AddModuleItem
{
    public class AddModuleItemCommandHandler : IRequestHandler<AddModuleItemCommand, Guid>
    {
        private readonly IApplicationDbContext _context;

        public AddModuleItemCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Guid> Handle(AddModuleItemCommand request, CancellationToken cancellationToken)
        {
            var module = await _context.CourseModules
                .Include(m => m.Items)
                .FirstOrDefaultAsync(m => m.Id == request.ModuleId, cancellationToken);

            if (module == null) throw new Exception("Module not found");

            var moduleItem = new ModuleItem(
                request.ModuleId,
                null,
                request.ItemType,
                request.LessonId,
                request.QuizId,
                request.CodelabId,
                request.OverrideTitle,
                request.OrderIndex,
                request.IsRequired
            );

            module.Items.Add(moduleItem);
            await _context.SaveChangesAsync(cancellationToken);

            return moduleItem.Id;
        }
    }
}