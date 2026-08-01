using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using VisualizationDSA.Application.Features.Classrooms.Queries.GetClassroomCurriculum;
using VisualizationDSA.Application.Interfaces;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Application.Features.Classrooms.Queries.GetClassroomCurriculum
{
    public class GetClassroomCurriculumQueryHandler : IRequestHandler<GetClassroomCurriculumQuery, ClassroomCurriculumDto>
    {
        private readonly IApplicationDbContext _context;

        public GetClassroomCurriculumQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ClassroomCurriculumDto> Handle(GetClassroomCurriculumQuery request, CancellationToken cancellationToken)
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

            var modules = classroom.Modules
                .OrderBy(m => m.OrderIndex)
                .Select(m => new ClassroomModuleDto
                {
                    Id = m.Id,
                    Title = m.Title,
                    Description = m.Description,
                    OrderIndex = m.OrderIndex,
                    IsHidden = m.IsHidden,
                    UnlockAt = m.UnlockAt,
                    Items = m.Items
                        .OrderBy(i => i.OrderIndex)
                        .Select(i => MapItem(i))
                        .ToList()
                })
                .ToList();

            return new ClassroomCurriculumDto
            {
                ClassroomId = classroom.Id,
                ClassroomName = classroom.Name,
                Modules = modules
            };
        }

        private ClassroomModuleItemDto MapItem(ClassroomModuleItem item)
        {
            var dto = new ClassroomModuleItemDto
            {
                Id = item.Id,
                ItemType = item.ItemType.ToString(),
                OverrideTitle = item.OverrideTitle,
                OverrideDescription = item.OverrideDescription,
                OrderIndex = item.OrderIndex,
                IsRequired = item.IsRequired,
                IsHidden = item.IsHidden,
                UnlockAt = item.UnlockAt,
                DueAt = item.DueAt,
                MaxAttempts = item.MaxAttempts,
                IsSequential = item.IsSequential,
                PrerequisiteItemId = item.PrerequisiteItemId,
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