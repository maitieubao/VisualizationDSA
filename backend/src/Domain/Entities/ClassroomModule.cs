using System;
using System.Collections.Generic;

namespace VisualizationDSA.Domain.Entities
{
    public class ClassroomModule
    {
        public Guid Id { get; private set; }
        public Guid ClassroomId { get; private set; }
        public string Title { get; private set; } = string.Empty;
        public string Description { get; private set; } = string.Empty;
        public int OrderIndex { get; private set; }
        public bool IsDeleted { get; private set; }
        public bool IsHidden { get; private set; }
        public DateTime? UnlockAt { get; private set; }
        public DateTime CreatedAt { get; private set; }

        
        public virtual Classroom Classroom { get; private set; } = null!;
        public virtual ICollection<ClassroomModuleItem> Items { get; private set; }

        private ClassroomModule() { }

        public ClassroomModule(Guid classroomId, string title, string description, int orderIndex, bool isHidden = false, DateTime? unlockAt = null)
        {
            Id = Guid.NewGuid();
            ClassroomId = classroomId;
            Title = string.IsNullOrWhiteSpace(title) ? throw new ArgumentException("Title cannot be empty", nameof(title)) : title;
            Description = description ?? string.Empty;
            OrderIndex = orderIndex;
            IsDeleted = false;
            IsHidden = isHidden;
            UnlockAt = unlockAt;
            CreatedAt = DateTime.UtcNow;
            Items = new HashSet<ClassroomModuleItem>();
        }

        public void Update(string title, string description, int orderIndex, bool isHidden, DateTime? unlockAt = null)
        {
            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("Title cannot be empty", nameof(title));
                
            Title = title;
            Description = description ?? string.Empty;
            OrderIndex = orderIndex;
            IsHidden = isHidden;
            UnlockAt = unlockAt;
        }

        public void Delete()
        {
            IsDeleted = true;
        }

        public void ToggleHidden()
        {
            IsHidden = !IsHidden;
        }
    }
}