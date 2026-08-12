using MediatR;
using System;
using VisualizationDSA.Domain.Enums;

namespace VisualizationDSA.Application.Features.Classrooms.Commands.UpdateClassroomModuleItem
{
    // LS-002: sửa một ClassroomModuleItem (title/description/type/ẩn/bắt buộc/điều kiện mở khóa).
    public class UpdateClassroomModuleItemCommand : IRequest
    {
        public Guid ModuleId { get; set; }
        public Guid ItemId { get; set; }
        public Guid TeacherId { get; set; }

        public ModuleItemType? ItemType { get; set; }
        public Guid? LessonId { get; set; }
        public Guid? QuizId { get; set; }
        public Guid? CodelabId { get; set; }
        public string OverrideTitle { get; set; } = string.Empty;
        public string OverrideDescription { get; set; } = string.Empty;
        public bool IsHidden { get; set; }
        public bool IsRequired { get; set; } = true;
        public Guid? PrerequisiteItemId { get; set; }
        public bool IsSequential { get; set; } = true;
        public DateTime? UnlockAt { get; set; }
        public DateTime? DueAt { get; set; }
        public int? MaxAttempts { get; set; }
    }
}
