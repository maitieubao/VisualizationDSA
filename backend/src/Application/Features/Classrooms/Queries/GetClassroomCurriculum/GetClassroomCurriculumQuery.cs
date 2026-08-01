using MediatR;
using System.Collections.Generic;

namespace VisualizationDSA.Application.Features.Classrooms.Queries.GetClassroomCurriculum
{
    public class GetClassroomCurriculumQuery : IRequest<ClassroomCurriculumDto>
    {
        public Guid ClassroomId { get; set; }
        public Guid TeacherId { get; set; }
    }

    public class ClassroomCurriculumDto
    {
        public Guid ClassroomId { get; set; }
        public string ClassroomName { get; set; } = string.Empty;
        public List<ClassroomModuleDto> Modules { get; set; } = new();
    }

    public class ClassroomModuleDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public bool IsHidden { get; set; }
        public DateTime? UnlockAt { get; set; }
        public List<ClassroomModuleItemDto> Items { get; set; } = new();
    }

    public class ClassroomModuleItemDto
    {
        public Guid Id { get; set; }
        public string ItemType { get; set; } = string.Empty;
        public string OverrideTitle { get; set; } = string.Empty;
        public string OverrideDescription { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public bool IsRequired { get; set; }
        public bool IsHidden { get; set; }
        public DateTime? UnlockAt { get; set; }
        public DateTime? DueAt { get; set; }
        public int? MaxAttempts { get; set; }
        public bool IsSequential { get; set; }
        public Guid? PrerequisiteItemId { get; set; }
        
        
        public Guid? LessonId { get; set; }
        public string? LessonTitle { get; set; }
        public string? LessonSandboxType { get; set; }
        public Guid? QuizId { get; set; }
        public string? QuizTitle { get; set; }
        public Guid? CodelabId { get; set; }
        public string? CodelabTitle { get; set; }
    }
}