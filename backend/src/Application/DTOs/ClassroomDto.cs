using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Application.DTOs
{
    public class CreateClassroomDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class JoinClassroomDto
    {
        [Required]
        public string? InviteCode { get; set; }
    }

    public class ClassroomResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Guid OwnerTeacherId { get; set; }
        public string OwnerTeacherName { get; set; } = string.Empty;
        public string? InviteCode { get; set; }
        public bool IsArchived { get; set; }
        public DateTime CreatedAt { get; set; }
        public int StudentCount { get; set; }
        // CR-042: vai trò của người gọi đối với lớp học ("Teacher"/"Student") — FE dùng
        // hiển thị badge trong MyClassroomsView.
        public string Role { get; set; } = string.Empty;
    }

    public class UpdateClassroomDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class UpdateClassroomLessonDto
    {
        public int OrderIndex { get; set; }
        public DateTime UnlockAt { get; set; }
    }

    public class ClassroomLessonItemDto
    {
        public Guid Id { get; set; }
        public Guid LessonId { get; set; }
        public string Title { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public DateTime UnlockAt { get; set; }
    }

    public class ClassroomQuizItemDto
    {
        public Guid Id { get; set; }
        public Guid QuizId { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime OpenAt { get; set; }
        public DateTime DueAt { get; set; }
        public int MaxAttempts { get; set; }
    }

    public class ClassroomDetailDto : ClassroomResponseDto
    {
        public List<ClassroomLessonItemDto> Lessons { get; set; } = new();
        public List<ClassroomQuizItemDto> Quizzes { get; set; } = new();
    }
}
