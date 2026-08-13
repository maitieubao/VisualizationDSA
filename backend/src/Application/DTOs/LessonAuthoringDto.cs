using System;
using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Application.DTOs
{
    public class CreateDraftLessonDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;
    }

    public class PublishToClassroomDto
    {
        [Required]
        public Guid ClassroomId { get; set; }
        [Required]
        public int OrderIndex { get; set; }
        public DateTime? UnlockAt { get; set; }
    }

    public class SaveDraftLessonDto
    {
        public string Title { get; set; } = string.Empty;
        public string ContentMd { get; set; } = string.Empty;
        public string SandboxType { get; set; } = string.Empty;
        public string SandboxConfig { get; set; } = "{}";
        public Guid? QuizId { get; set; }
        // A1.1: codelab gắn vào bài (bước 4 Lesson Study) — null = gỡ bỏ codelab.
        public Guid? CodelabId { get; set; }
        // A1.2: trạng thái xuất bản từ authoring tool — chỉ nhận Draft/Private/Published.
        public string PublishStatus { get; set; } = "Draft";
        public int XPReward { get; set; }
        public int OrderIndex { get; set; }
    }

    public class ReviewDecisionDto
    {
        [Required]
        public bool IsApproved { get; set; }
        public string? Feedback { get; set; }
    }
}
