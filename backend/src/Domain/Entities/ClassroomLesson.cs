using System;

namespace VisualizationDSA.Domain.Entities
{
    public class ClassroomLesson
    {
        public Guid Id { get; private set; }
        public Guid ClassroomId { get; private set; }
        public Guid LessonId { get; private set; }
        public int OrderIndex { get; private set; }
        public DateTime? UnlockAt { get; private set; }
        public bool IsVisible { get; private set; }
        
        public virtual Classroom Classroom { get; private set; } = null!;
        public virtual Lesson Lesson { get; private set; } = null!;

        private ClassroomLesson() { }

        public ClassroomLesson(Guid classroomId, Guid lessonId, int orderIndex, DateTime? unlockAt = null, bool isVisible = true)
        {
            if (orderIndex <= 0) throw new ArgumentOutOfRangeException(nameof(orderIndex), "OrderIndex must be greater than zero.");

            Id = Guid.NewGuid();
            ClassroomId = classroomId;
            LessonId = lessonId;
            OrderIndex = orderIndex;
            UnlockAt = unlockAt;
            IsVisible = isVisible;
        }

        public void Update(int orderIndex, DateTime? unlockAt, bool isVisible = true)
        {
            if (orderIndex <= 0) throw new ArgumentOutOfRangeException(nameof(orderIndex), "OrderIndex must be greater than zero.");

            OrderIndex = orderIndex;
            UnlockAt = unlockAt;
            IsVisible = isVisible;
        }

        public void SetVisibility(bool isVisible)
        {
            IsVisible = isVisible;
        }
    }
}
