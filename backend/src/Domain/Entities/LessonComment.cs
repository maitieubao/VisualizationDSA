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
        
        
        public bool IsEdited { get; private set; }
        public DateTime? EditedAt { get; private set; }
        public bool IsDeleted { get; private set; }

        public virtual Lesson Lesson { get; private set; } = null!;
        public virtual User User { get; private set; } = null!;
        public virtual LessonComment? ParentComment { get; private set; }
        public virtual ICollection<LessonComment> Replies { get; private set; }

        private LessonComment() { }

        public LessonComment(Guid lessonId, Guid userId, string content, Guid? parentId = null)
        {
            if (string.IsNullOrWhiteSpace(content)) throw new ArgumentException("Comment content cannot be empty.");

            Id = Guid.NewGuid();
            LessonId = lessonId;
            UserId = userId;
            Content = content;
            ParentId = parentId;
            CreatedAt = DateTime.UtcNow;
            
            IsEdited = false;
            IsDeleted = false;

            Replies = new HashSet<LessonComment>();
        }

        public void Edit(string newContent)
        {
            if (IsDeleted) throw new InvalidOperationException("Cannot edit a deleted comment.");
            if (string.IsNullOrWhiteSpace(newContent)) throw new ArgumentException("Comment content cannot be empty.");

            Content = newContent;
            IsEdited = true;
            EditedAt = DateTime.UtcNow;
        }

        public void SoftDelete()
        {
            IsDeleted = true;
            Content = "[This comment has been deleted]"; 
        }
    }
}
