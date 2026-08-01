using System;

namespace VisualizationDSA.Domain.Entities
{
    public class ClassroomAnnouncement
    {
        public Guid Id { get; private set; }
        public Guid ClassroomId { get; private set; }
        public Guid AuthorId { get; private set; }
        public string Title { get; private set; } = string.Empty;
        public string ContentMd { get; private set; } = string.Empty;
        public bool IsPublished { get; private set; }
        public bool IsPinned { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? PublishedAt { get; private set; }

        
        public virtual Classroom Classroom { get; private set; } = null!;
        public virtual User Author { get; private set; } = null!;

        private ClassroomAnnouncement() { }

        public ClassroomAnnouncement(Guid classroomId, Guid authorId, string title, string contentMd, bool isPinned = false)
        {
            Id = Guid.NewGuid();
            ClassroomId = classroomId;
            AuthorId = authorId;
            Title = string.IsNullOrWhiteSpace(title) ? throw new ArgumentException("Title cannot be empty", nameof(title)) : title;
            ContentMd = contentMd ?? string.Empty;
            IsPublished = true;
            IsPinned = isPinned;
            CreatedAt = DateTime.UtcNow;
            PublishedAt = DateTime.UtcNow;
        }

        public void Update(string title, string contentMd, bool isPinned)
        {
            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("Title cannot be empty", nameof(title));

            Title = title;
            ContentMd = contentMd ?? string.Empty;
            IsPinned = isPinned;
        }

        public void Publish()
        {
            IsPublished = true;
            PublishedAt = DateTime.UtcNow;
        }

        public void Unpublish()
        {
            IsPublished = false;
            PublishedAt = null;
        }

        public void Pin() => IsPinned = true;
        public void Unpin() => IsPinned = false;
    }
}