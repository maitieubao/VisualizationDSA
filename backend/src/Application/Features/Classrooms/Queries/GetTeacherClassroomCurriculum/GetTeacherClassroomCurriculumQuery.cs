using MediatR;

namespace VisualizationDSA.Application.Features.Classrooms.Queries.GetTeacherClassroomCurriculum
{
    public record GetTeacherClassroomCurriculumQuery : IRequest<TeacherClassroomCurriculumDto>
    {
        public Guid ClassroomId { get; init; }
        public Guid TeacherId { get; init; }
    }

    public class TeacherClassroomCurriculumDto
    {
        public Guid ClassroomId { get; set; }
        public string ClassroomName { get; set; } = string.Empty;
        public List<TeacherClassroomModuleDto> Modules { get; set; } = new();
    }

    public class TeacherClassroomModuleDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public bool IsHidden { get; set; }
        public DateTime? UnlockAt { get; set; }
        public List<TeacherClassroomModuleItemDto> Items { get; set; } = new();
    }

    public class TeacherClassroomModuleItemDto
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