using System;

namespace VisualizationDSA.Domain.Entities
{
    /// <summary>
    /// F9 (FR-2.10) — Node trong Learning Path.
    /// Node liên kết tới Lesson hiện có qua LessonId (nullable) để người học vào học bài tương ứng.
    /// OrderIndex xác định thứ tự mở khóa tuần tự (unique theo từng lộ trình).
    /// </summary>
    public class LearningPathNode
    {
        public Guid Id { get; private set; }
        public Guid LearningPathId { get; private set; }
        public Guid? LessonId { get; private set; }
        public int OrderIndex { get; private set; }
        public string Title { get; private set; } = string.Empty;
        public DateTime CreatedAt { get; private set; }

        public virtual LearningPath LearningPath { get; private set; } = null!;
        public virtual Lesson? Lesson { get; private set; }

        private LearningPathNode() { }

        public LearningPathNode(Guid learningPathId, int orderIndex, string title, Guid? lessonId = null)
        {
            Id = Guid.NewGuid();
            LearningPathId = learningPathId;
            OrderIndex = orderIndex;
            Title = string.IsNullOrWhiteSpace(title)
                ? throw new ArgumentException("Title cannot be empty.", nameof(title))
                : title;
            LessonId = lessonId;
            CreatedAt = DateTime.UtcNow;
        }
    }
}
