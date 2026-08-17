using System;

namespace VisualizationDSA.Domain.Entities
{
    /// <summary>
    /// F5 (FR-2.6) — Ghi chú bài học:
    /// mỗi người dùng có tối đa 1 ghi chú cho mỗi bài học (unique UserId + LessonId).
    /// </summary>
    public class LessonNote
    {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }
        public Guid LessonId { get; private set; }
        public string ContentHtml { get; private set; } = string.Empty;
        public DateTime UpdatedAt { get; private set; }

        public virtual User User { get; private set; } = null!;
        public virtual Lesson Lesson { get; private set; } = null!;

        private LessonNote() { }

        public LessonNote(Guid userId, Guid lessonId, string contentHtml)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            LessonId = lessonId;
            ContentHtml = contentHtml ?? string.Empty;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateContent(string contentHtml)
        {
            ContentHtml = contentHtml ?? string.Empty;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
