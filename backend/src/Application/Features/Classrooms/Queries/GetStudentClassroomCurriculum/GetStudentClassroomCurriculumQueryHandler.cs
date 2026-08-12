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
            // Kiểm tra classroom tồn tại TRƯỚC khi kiểm tra enrollment (tránh leak trạng thái
            // enrollment khi classroom không tồn tại — classroom thiếu → ArgumentException).
            var classroom = await _context.Classrooms
                .Include(c => c.Modules.Where(m => !m.IsDeleted && !m.IsHidden))
                    .ThenInclude(m => m.Items.Where(i => !i.IsDeleted && !i.IsHidden && !i.IsHiddenForStudent))
                        .ThenInclude(i => i.Lesson)
                .Include(c => c.Modules.Where(m => !m.IsDeleted && !m.IsHidden))
                    .ThenInclude(m => m.Items.Where(i => !i.IsDeleted && !i.IsHidden && !i.IsHiddenForStudent))
                        .ThenInclude(i => i.Quiz)
                .Include(c => c.Modules.Where(m => !m.IsDeleted && !m.IsHidden))
                    .ThenInclude(m => m.Items.Where(i => !i.IsDeleted && !i.IsHidden && !i.IsHiddenForStudent))
                        .ThenInclude(i => i.Codelab)
                .FirstOrDefaultAsync(c => c.Id == request.ClassroomId, cancellationToken);

            if (classroom == null)
                throw new ArgumentException("Classroom not found.");

            // CR-015: chỉ học viên có enrollment ACTIVE mới xem được curriculum — học viên bị
            // kick/banned/left phải nhận 403 thay vì vẫn xem được bài + tiến độ.
            var enrollment = await _context.ClassroomEnrollments
                .FirstOrDefaultAsync(e => e.ClassroomId == request.ClassroomId
                    && e.StudentId == request.StudentId
                    && e.Status == VisualizationDSA.Domain.Enums.EnrollmentStatus.Active, cancellationToken);

            if (enrollment == null)
                throw new UnauthorizedAccessException("Student is not enrolled in this classroom.");

            // LS-009: nạp overrides của classroom — merge vào curriculum (openAt/dueAt/maxAttempts/
            // prerequisite/sequential/required/ẩn) và lọc item bị ẩn qua override.
            var overrides = await _context.ClassroomModuleItemOverrides
                .Where(o => o.ClassroomId == request.ClassroomId)
                .ToListAsync(cancellationToken);

            var overrideDict = overrides.ToDictionary(o => o.ModuleItemId);
            var hiddenViaOverride = overrides
                .Where(o => o.IsHiddenForStudent)
                .Select(o => o.ModuleItemId)
                .ToHashSet();

            var itemIds = classroom.Modules
                .SelectMany(m => m.Items.Where(i => !i.IsDeleted && !i.IsHidden && !i.IsHiddenForStudent && !hiddenViaOverride.Contains(i.Id)))
                .Select(i => i.Id)
                .ToList();

            var progress = await _context.UserModuleItemProgresses
                .Where(p => p.UserId == request.StudentId && itemIds.Contains(p.ModuleItemId))
                .ToListAsync(cancellationToken);

            // LS-008: PK composite (UserId, ModuleItemId, AttemptNumber) — gom theo ModuleItemId
            // và lấy attempt mới nhất (trước đây ToDictionary đổ trùng key → 500 /my-progress).
            var progressDict = progress
                .GroupBy(p => p.ModuleItemId)
                .ToDictionary(
                    g => g.Key,
                    g => g.OrderByDescending(p => p.AttemptNumber).First()
                );

            // Lọc lại module trong projection (InMemory provider không áp dụng filtered Include).
            var modules = classroom.Modules
                .Where(m => !m.IsDeleted && !m.IsHidden)
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
                        .Where(i => !i.IsDeleted && !i.IsHidden && !i.IsHiddenForStudent && !hiddenViaOverride.Contains(i.Id))
                        .OrderBy(i => i.OrderIndex)
                        .Select(i => MapStudentItem(i, progressDict, overrideDict))
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

        private StudentClassroomModuleItemDto MapStudentItem(
            ClassroomModuleItem item,
            Dictionary<Guid, UserModuleItemProgress> progressDict,
            Dictionary<Guid, ClassroomModuleItemOverride> overrideDict)
        {
            var itemOverride = overrideDict.GetValueOrDefault(item.Id);

            var dto = new StudentClassroomModuleItemDto
            {
                Id = item.Id,
                ItemType = item.ItemType.ToString(),
                OverrideTitle = string.IsNullOrEmpty(item.OverrideTitle) ?
                    (item.Lesson?.Title ?? item.Quiz?.Title ?? item.Codelab?.Title ?? "Unknown") :
                    item.OverrideTitle,
                OrderIndex = item.OrderIndex,
                IsRequired = itemOverride?.IsRequired ?? item.IsRequired,
                UnlockAt = itemOverride?.OpenAt ?? item.UnlockAt,
                DueAt = itemOverride?.DueAt ?? item.DueAt,
                MaxAttempts = itemOverride?.MaxAttempts ?? item.MaxAttempts,
                IsSequential = itemOverride?.IsSequential ?? item.IsSequential,
                PrerequisiteItemId = itemOverride?.PrerequisiteItemId ?? item.PrerequisiteItemId,
                LessonId = item.LessonId,
                QuizId = item.QuizId,
                CodelabId = item.CodelabId,
                // CR-003: nạp nội dung Lesson cho player render (contentMd + sandbox).
                ContentMd = item.Lesson?.ContentMd,
                ContentMarkdown = item.Lesson?.ContentMd,
                SandboxType = item.Lesson?.SandboxType,
                SandboxConfig = item.Lesson?.SandboxConfig
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

            dto.IsUnlocked = CheckIfUnlocked(dto, progressDict);

            return dto;
        }

        private bool CheckIfUnlocked(StudentClassroomModuleItemDto dto, Dictionary<Guid, UserModuleItemProgress> progressDict)
        {
            if (!dto.IsSequential || dto.PrerequisiteItemId == null)
                return true;

            if (progressDict.TryGetValue(dto.PrerequisiteItemId.Value, out var prereqProgress))
            {
                return prereqProgress.Status == "Completed";
            }

            return false;
        }
    }
}
