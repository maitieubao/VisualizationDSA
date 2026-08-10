using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using VisualizationDSA.Application.Interfaces;

namespace VisualizationDSA.Application.Features.Classrooms.Queries.GetClassroomIntegrityReport
{
    public class GetClassroomIntegrityReportQueryHandler : IRequestHandler<GetClassroomIntegrityReportQuery, ClassroomIntegrityReportDto>
    {
        private readonly IApplicationDbContext _context;

        public GetClassroomIntegrityReportQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ClassroomIntegrityReportDto> Handle(GetClassroomIntegrityReportQuery request, CancellationToken cancellationToken)
        {
            var classroom = await _context.Classrooms
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == request.ClassroomId, cancellationToken);

            if (classroom == null)
                throw new KeyNotFoundException("Classroom not found.");

            if (classroom.OwnerTeacherId != request.TeacherId)
                throw new UnauthorizedAccessException("Only the classroom owner can view the integrity report.");

            var modules = await _context.ClassroomModules
                .AsNoTracking()
                .Where(m => m.ClassroomId == request.ClassroomId)
                .ToListAsync(cancellationToken);

            var moduleIssues = new List<ModuleIntegrityIssueDto>();
            var moduleOrderCounts = modules.GroupBy(m => m.OrderIndex).Where(g => g.Count() > 1).Select(g => g.Key).ToList();
            foreach (var m in modules)
            {
                if (moduleOrderCounts.Contains(m.OrderIndex))
                    moduleIssues.Add(new ModuleIntegrityIssueDto
                    {
                        Id = m.Id,
                        Title = m.Title,
                        OrderIndex = m.OrderIndex,
                        Issue = "Duplicate OrderIndex"
                    });
            }

            var items = await _context.ClassroomModuleItems
                .AsNoTracking()
                .Where(i => modules.Select(m => m.Id).Contains(i.ModuleId))
                .ToListAsync(cancellationToken);

            var itemIssues = new List<ModuleItemIntegrityIssueDto>();
            var itemOrderCounts = items.GroupBy(i => new { i.ModuleId, i.OrderIndex }).Where(g => g.Count() > 1);
            var duplicateKeys = itemOrderCounts.Select(g => g.Key).ToHashSet();
            foreach (var item in items)
            {
                if (duplicateKeys.Contains(new { item.ModuleId, item.OrderIndex }))
                    itemIssues.Add(new ModuleItemIntegrityIssueDto
                    {
                        Id = item.Id,
                        ModuleId = item.ModuleId,
                        Title = item.OverrideTitle,
                        OrderIndex = item.OrderIndex,
                        Issue = "Duplicate OrderIndex within module"
                    });
            }

            var orphanModules = modules.Where(m => m.IsDeleted && !m.IsDeleted).ToList();
            foreach (var m in modules.Where(m => m.IsDeleted))
            {
                moduleIssues.Add(new ModuleIntegrityIssueDto
                {
                    Id = m.Id,
                    Title = m.Title,
                    OrderIndex = m.OrderIndex,
                    Issue = "Soft-deleted module still present in result"
                });
            }

            var report = new ClassroomIntegrityReportDto
            {
                ClassroomId = classroom.Id,
                ClassroomName = classroom.Name,
                ModuleIssues = moduleIssues,
                ItemIssues = itemIssues,
                IsValid = moduleIssues.Count == 0 && itemIssues.Count == 0
            };

            return report;
        }
    }
}
