using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using VisualizationDSA.Application.Features.Classrooms.Queries.GetStudentClassroomCurriculum;
using VisualizationDSA.Application.Interfaces;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Application.Features.Classrooms.Queries.GetStudentClassroomCurriculum
{
    public class GetStudentClassroomCurriculumQueryHandler : IRequestHandler<GetStudentClassroomCurriculumQuery, StudentClassroomCurriculumDto>
    {
        private readonly IApplicationDbContext _context;

        public GetStudentClassroomCurriculumQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<StudentClassroomCurriculumDto> Handle(GetStudentClassroomCurriculumQuery request, CancellationToken cancellationToken)
        {
            var enrollment = await _context.ClassroomEnrollments
                .FirstOrDefaultAsync(e => e.ClassroomId == request.ClassroomId && e.StudentId == request.StudentId, cancellationToken);

            if (enrollment == null)
                throw new UnauthorizedAccessException("Student is not enrolled in this classroom.");

            var classroom = await _context.Classrooms
                .Include(c => c.Modules.Where(m => !m.IsDeleted))
                    .ThenInclude(m => m.Items.Where(i => !i.IsDeleted && !i.IsHiddenForStudent))
                        .ThenInclude(i => i.Lesson)
                .Include(c => c.Modules.Where(m => !m.IsDeleted))
                    .ThenInclude(m => m.Items.Where(i => !i.IsDeleted && !i.IsHiddenForStudent))
                        .ThenInclude(i => i.Quiz)
                .Include(c => c.Modules.Where(m => !m.IsDeleted))
                    .ThenInclude(m => m.Items.Where(i => !i.IsDeleted && !i.IsHiddenForStudent))
                        .ThenInclude(i => i.Codelab)
                .FirstOrDefaultAsync(c => c.Id == request.ClassroomId, cancellationToken);

            if (classroom == null)
                throw new ArgumentException("Classroom not found.");

            
            var itemIds = classroom.Modules
                .SelectMany(m => m.Items.Where(i => !i.IsDeleted && !i.IsHiddenForStudent))
                .Select(i => i.Id)
                .ToList();

            var progress = await _context.UserModuleItemProgresses
                .Where(p => p.UserId == request.StudentId && itemIds.Contains(p.ModuleItemId))
                .ToListAsync(cancellationToken);

            var progressDict = progress
                .GroupBy(p => p.ModuleItemId)
                .ToDictionary(
                    g => g.Key,
                    g => g.OrderByDescending(p => p.AttemptNumber).First()
                );

            var modules = classroom.Modules
                .OrderBy(m => m.OrderIndex)
                .Select(m => new StudentClassroomModuleDto
                {
                    Id = m.Id,
                    Title = m.Title,
                    Description = m.Description,
                    OrderIndex = m.OrderIndex,
                    IsHidden = m.IsHidden,
                    UnlockAt = m.UnlockAt,
                    Items = m.Items
                        .Where(i => !i.IsDeleted && !i.IsHiddenForStudent)
                        .OrderBy(i => i.OrderIndex)
                        .Select(i => MapStudentItem(i, progressDict))
                        .ToList()
                })
                .ToList();

            return new StudentClassroomCurriculumDto
            {
                ClassroomId = classroom.Id,
                ClassroomName = classroom.Name,
                Modules = modules
            };
        }

        private StudentClassroomModuleItemDto MapStudentItem(ClassroomModuleItem item, Dictionary<Guid, UserModuleItemProgress> progressDict)
        {
            var dto = new StudentClassroomModuleItemDto
            {
                Id = item.Id,
                ItemType = item.ItemType.ToString(),
                OverrideTitle = string.IsNullOrEmpty(item.OverrideTitle) ? 
                    (item.Lesson?.Title ?? item.Quiz?.Title ?? item.Codelab?.Title ?? "Unknown") : 
                    item.OverrideTitle,
                OrderIndex = item.OrderIndex,
                IsRequired = item.IsRequired,
                UnlockAt = item.UnlockAt,
                DueAt = item.DueAt,
                MaxAttempts = item.MaxAttempts,
                IsSequential = item.IsSequential,
                PrerequisiteItemId = item.PrerequisiteItemId,
                LessonId = item.LessonId,
                QuizId = item.QuizId,
                CodelabId = item.CodelabId
            };

            if (progressDict.TryGetValue(item.Id, out var itemProgress))
            {
                dto.Status = itemProgress.Status;
                dto.CompletedAt = itemProgress.CompletedAt;
                dto.ProgressPercent = itemProgress.ProgressPercent;
                dto.Score = itemProgress.Score;
                dto.AttemptNumber = itemProgress.AttemptNumber;
            }
            else
            {
                dto.Status = "NotStarted";
                dto.ProgressPercent = 0;
            }

            
            dto.IsUnlocked = CheckIfUnlocked(item, progressDict);

            return dto;
        }

        private bool CheckIfUnlocked(ClassroomModuleItem item, Dictionary<Guid, UserModuleItemProgress> progressDict)
        {
            if (!item.IsSequential || item.PrerequisiteItemId == null)
                return true;

            if (progressDict.TryGetValue(item.PrerequisiteItemId.Value, out var prereqProgress))
            {
                return prereqProgress.Status == "Completed";
            }

            return false;
        }
    }
}