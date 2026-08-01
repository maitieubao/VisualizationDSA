using MediatR;
using System.Collections.Generic;

namespace VisualizationDSA.Application.Features.Classrooms.Queries.GetStudentClassroomCurriculum
{
    public class GetStudentClassroomCurriculumQuery : IRequest<StudentClassroomCurriculumDto>
    {
        public Guid ClassroomId { get; set; }
        public Guid StudentId { get; set; }
    }

    public class StudentClassroomCurriculumDto
    {
        public Guid ClassroomId { get; set; }
        public string ClassroomName { get; set; } = string.Empty;
        public List<StudentClassroomModuleDto> Modules { get; set; } = new();
    }

    public class StudentClassroomModuleDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public bool IsHidden { get; set; }
        public DateTime? UnlockAt { get; set; }
        public List<StudentClassroomModuleItemDto> Items { get; set; } = new();
    }

    public class StudentClassroomModuleItemDto
    {
        public Guid Id { get; set; }
        public string ItemType { get; set; } = string.Empty;
        public string OverrideTitle { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public bool IsRequired { get; set; }
        public DateTime? UnlockAt { get; set; }
        public DateTime? DueAt { get; set; }
        public int? MaxAttempts { get; set; }
        public bool IsSequential { get; set; }
        public Guid? PrerequisiteItemId { get; set; }
        public Guid? LessonId { get; set; }
        public Guid? QuizId { get; set; }
        public Guid? CodelabId { get; set; }
        
        
        public string Status { get; set; } = "NotStarted";
        public double ProgressPercent { get; set; }
        public int? Score { get; set; }
        public int AttemptNumber { get; set; }
        public DateTime? CompletedAt { get; set; }
        public bool IsUnlocked { get; set; }
    }
}