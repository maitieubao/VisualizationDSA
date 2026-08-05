using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using VisualizationDSA.Application.Interfaces;
using VisualizationDSA.Domain.Enums;

namespace VisualizationDSA.Application.Features.Classrooms.Queries
{
    public class GetClassroomDetailsQuery : IRequest<ClassroomDetailsDto>
    {
        public Guid ClassroomId { get; set; }
        public Guid UserId { get; set; }
    }

    public class ClassroomDetailsDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
        public Guid OwnerTeacherId { get; set; }
        public string OwnerTeacherName { get; set; } = string.Empty;
        public Guid? CourseId { get; set; }
        public bool IsOwner { get; set; }
        public bool IsEnrolled { get; set; }
        public List<CourseModuleDto> Modules { get; set; } = new List<CourseModuleDto>();
    }

    public class CourseModuleDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public List<ModuleItemDto> Items { get; set; } = new List<ModuleItemDto>();
    }

    public class ModuleItemDto
    {
        public Guid Id { get; set; }
        public ModuleItemType ItemType { get; set; }
        public Guid? ReferenceId { get; set; }
        public string Title { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public bool IsRequired { get; set; }
        
        
        public DateTime? OpenAt { get; set; }
        public DateTime? DueAt { get; set; }
        public int? MaxAttempts { get; set; }
        public bool IsHiddenForStudent { get; set; }
    }

    public class GetClassroomDetailsHandler : IRequestHandler<GetClassroomDetailsQuery, ClassroomDetailsDto>
    {
        private readonly IApplicationDbContext _context;

        public GetClassroomDetailsHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ClassroomDetailsDto> Handle(GetClassroomDetailsQuery request, CancellationToken cancellationToken)
        {
            var classroom = await _context.Classrooms
                .Include(c => c.Enrollments)
                .Include(c => c.OwnerTeacher)
                .FirstOrDefaultAsync(c => c.Id == request.ClassroomId, cancellationToken);

            if (classroom == null) return null;

            var isOwner = classroom.OwnerTeacherId == request.UserId;
            var isEnrolled = classroom.Enrollments.Any(e => e.StudentId == request.UserId && e.Status == EnrollmentStatus.Active);

            if (!isOwner && !isEnrolled)
            {
                throw new UnauthorizedAccessException("You don't have access to this classroom");
            }

            var dto = new ClassroomDetailsDto
            {
                Id = classroom.Id,
                Name = classroom.Name,
                // Invite code CHỈ trả cho chủ sở hữu — học viên có thể phát tán code ra ngoài.
                Code = isOwner ? classroom.InviteCode : null,
                OwnerTeacherId = classroom.OwnerTeacherId,
                OwnerTeacherName = classroom.OwnerTeacher?.Username ?? "Unknown",
                CourseId = classroom.CourseId,
                IsOwner = isOwner,
                IsEnrolled = isEnrolled
            };

            
            if (classroom.CourseId.HasValue)
            {
                var modules = await _context.CourseModules
                    .Include(m => m.Items)
                    .Where(m => m.CourseId == classroom.CourseId.Value)
                    .OrderBy(m => m.OrderIndex)
                    .ToListAsync(cancellationToken);

                var overrides = await _context.ClassroomModuleItemOverrides
                    .Where(o => o.ClassroomId == classroom.Id)
                    .ToListAsync(cancellationToken);

                var overridesDict = overrides.ToDictionary(o => o.ModuleItemId);

                foreach (var module in modules)
                {
                    var moduleDto = new CourseModuleDto
                    {
                        Id = module.Id,
                        Title = module.Title,
                        OrderIndex = module.OrderIndex
                    };

                    foreach (var item in module.Items.OrderBy(i => i.OrderIndex))
                    {
                        overridesDict.TryGetValue(item.Id, out var itemOverride);

                        
                        if (!isOwner && itemOverride?.IsHiddenForStudent == true)
                        {
                            continue;
                        }

                        moduleDto.Items.Add(new ModuleItemDto
                        {
                            Id = item.Id,
                            ItemType = item.ItemType,
                            ReferenceId = item.ItemType == ModuleItemType.Lesson ? item.LessonId : (item.ItemType == ModuleItemType.Quiz ? item.QuizId : item.CodelabId),
                            Title = !string.IsNullOrEmpty(item.OverrideTitle) ? item.OverrideTitle : "Item",
                            OrderIndex = item.OrderIndex,
                            IsRequired = item.IsRequired,
                            OpenAt = itemOverride?.OpenAt,
                            DueAt = itemOverride?.DueAt,
                            MaxAttempts = itemOverride?.MaxAttempts,
                            IsHiddenForStudent = itemOverride?.IsHiddenForStudent ?? false
                        });
                    }

                    if (moduleDto.Items.Any() || isOwner)
                    {
                        dto.Modules.Add(moduleDto);
                    }
                }
            }

            return dto;
        }
    }
}
