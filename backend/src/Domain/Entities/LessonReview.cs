using System;

namespace VisualizationDSA.Domain.Entities
{
    public class LessonReview
    {
        public Guid Id { get; private set; }
        public Guid LessonId { get; private set; }
        public Guid? ReviewerAdminId { get; private set; }
        public bool? IsApproved { get; private set; }
        public string? Feedback { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? ReviewedAt { get; private set; }

        public virtual Lesson Lesson { get; private set; } = null!;
        public virtual User? ReviewerAdmin { get; private set; }

        private LessonReview() { }

        public LessonReview(Guid lessonId)
        {
            Id = Guid.NewGuid();
            LessonId = lessonId;
            CreatedAt = DateTime.UtcNow;
            IsApproved = null;
        }

        public void ProcessReview(Guid adminId, bool isApproved, string? feedback)
        {
            if (IsApproved.HasValue) throw new InvalidOperationException("This review is already processed. You cannot process it again.");

            ReviewerAdminId = adminId;
            IsApproved = isApproved;
            Feedback = feedback;
            ReviewedAt = DateTime.UtcNow;
        }
    }
}
