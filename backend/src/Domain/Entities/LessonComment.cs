using System;
using System.Collections.Generic;

namespace VisualizationDSA.Domain.Entities
{
    public class LessonComment
    {
        public Guid Id { get; private set; }
        public Guid LessonId { get; private set; }
        public Guid UserId { get; private set; }
        public string Content { get; private set; } = string.Empty;
        public DateTime CreatedAt { get; private set; }
        public Guid? ParentId { get; private set; }

        public virtual Lesson Lesson { get; private set; } = null!;
        public virtual User User { get; private set; } = null!;
        public virtual LessonComment? ParentComment { get; private set; }
        public virtual ICollection<LessonComment> Replies { get; private set; } = new List<LessonComment>();

        private LessonComment() { }

        public LessonComment(Guid lessonId, Guid userId, string content, Guid? parentId = null)
        {
            Id = Guid.NewGuid();
            LessonId = lessonId;
            UserId = userId;
            Content = content;
            ParentId = parentId;
            CreatedAt = DateTime.UtcNow;
        }
    }
}
