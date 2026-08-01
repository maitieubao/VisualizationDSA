using MediatR;
using System;
using VisualizationDSA.Domain.Enums;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.CreateClassroomModuleItem
{
    public class CreateClassroomModuleItemCommand : IRequest<Guid>
    {
        public Guid ModuleId { get; set; }
        public Guid TeacherId { get; set; }
        public ModuleItemType ItemType { get; set; }
        public Guid? LessonId { get; set; }
        public Guid? QuizId { get; set; }
        public Guid? CodelabId { get; set; }
        public Guid? CustomLessonId { get; set; }
        public string OverrideTitle { get; set; } = string.Empty;
        public string OverrideDescription { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public bool IsRequired { get; set; } = true;
        public bool IsHidden { get; set; }
        public DateTime? UnlockAt { get; set; }
        public DateTime? DueAt { get; set; }
        public int? MaxAttempts { get; set; }
        public Guid? PrerequisiteItemId { get; set; }
        public bool IsSequential { get; set; } = true;
    }
}