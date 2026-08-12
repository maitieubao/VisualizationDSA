using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using VisualizationDSA.Application.Features.Classrooms.Queries.GetTeacherClassroomCurriculum;
using VisualizationDSA.Application.Interfaces;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Application.Features.Classrooms.Queries.GetTeacherClassroomCurriculum
{
    public class GetTeacherClassroomCurriculumQueryHandler : IRequestHandler<GetTeacherClassroomCurriculumQuery, TeacherClassroomCurriculumDto>
    {
        private readonly IApplicationDbContext _context;

        public GetTeacherClassroomCurriculumQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<TeacherClassroomCurriculumDto> Handle(GetTeacherClassroomCurriculumQuery request, CancellationToken cancellationToken)
        {
            var classroom = await _context.Classrooms
                .Include(c => c.Modules.Where(m => !m.IsDeleted))
                    .ThenInclude(m => m.Items.Where(i => !i.IsDeleted))
                        .ThenInclude(i => i.Lesson)
                .Include(c => c.Modules.Where(m => !m.IsDeleted))
                    .ThenInclude(m => m.Items.Where(i => !i.IsDeleted))
                        .ThenInclude(i => i.Quiz)
                .Include(c => c.Modules.Where(m => !m.IsDeleted))
                    .ThenInclude(m => m.Items.Where(i => !i.IsDeleted))
                        .ThenInclude(i => i.Codelab)
                .FirstOrDefaultAsync(c => c.Id == request.ClassroomId, cancellationToken);

            if (classroom == null)
                throw new ArgumentException("Classroom not found.");

            if (classroom.OwnerTeacherId != request.TeacherId)
                throw new UnauthorizedAccessException("Only the classroom owner can view the curriculum.");

            // LS-009: nạp overrides của classroom — merge vào curriculum để teacher thấy đúng
            // trạng thái đã cấu hình trong OverrideSettings (openAt/dueAt/maxAttempts/ẩn/...).
            var overrides = await _context.ClassroomModuleItemOverrides
                .Where(o => o.ClassroomId == request.ClassroomId)
                .ToListAsync(cancellationToken);

            var overrideDict = overrides.ToDictionary(o => o.ModuleItemId);

            // Lọc lại module trong projection (InMemory provider không áp dụng filtered Include).
            var modules = classroom.Modules
                .Where(m => !m.IsDeleted)
                .OrderBy(m => m.OrderIndex)
                .Select(m => new TeacherClassroomModuleDto
                {
                    Id = m.Id,
                    Title = m.Title,
                    Description = m.Description,
                    OrderIndex = m.OrderIndex,
                    IsHidden = m.IsHidden,
                    UnlockAt = m.UnlockAt,
                    Items = m.Items
                        .Where(i => !i.IsDeleted)
                        .OrderBy(i => i.OrderIndex)
                        .Select(i => MapItem(i, overrideDict))
                        .ToList()
                })
                .ToList();

            return new TeacherClassroomCurriculumDto
            {
                ClassroomId = classroom.Id,
                ClassroomName = classroom.Name,
                Modules = modules
            };
        }

        private TeacherClassroomModuleItemDto MapItem(ClassroomModuleItem item, Dictionary<Guid, ClassroomModuleItemOverride> overrideDict)
        {
            var itemOverride = overrideDict.GetValueOrDefault(item.Id);

            var dto = new TeacherClassroomModuleItemDto
            {
                Id = item.Id,
                ItemType = item.ItemType.ToString(),
                OverrideTitle = item.OverrideTitle,
                OverrideDescription = item.OverrideDescription,
                OrderIndex = item.OrderIndex,
                IsRequired = itemOverride?.IsRequired ?? item.IsRequired,
                IsHidden = item.IsHidden || (itemOverride?.IsHiddenForStudent ?? false),
                UnlockAt = itemOverride?.OpenAt ?? item.UnlockAt,
                DueAt = itemOverride?.DueAt ?? item.DueAt,
                MaxAttempts = itemOverride?.MaxAttempts ?? item.MaxAttempts,
                IsSequential = itemOverride?.IsSequential ?? item.IsSequential,
                PrerequisiteItemId = itemOverride?.PrerequisiteItemId ?? item.PrerequisiteItemId,
                LessonId = item.LessonId,
                QuizId = item.QuizId,
                CodelabId = item.CodelabId
            };

            if (item.Lesson != null)
            {
                dto.LessonTitle = item.Lesson.Title;
                dto.LessonSandboxType = item.Lesson.SandboxType;
            }
            if (item.Quiz != null)
            {
                dto.QuizTitle = item.Quiz.Title;
            }
            if (item.Codelab != null)
            {
                dto.CodelabTitle = item.Codelab.Title;
            }

            return dto;
        }
    }
}
