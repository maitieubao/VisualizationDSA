using System;
using System.Collections.Generic;

namespace VisualizationDSA.Domain.Entities
{
    public class CourseModule
    {
        public Guid Id { get; private set; }
        public Guid CourseId { get; private set; }
        public string Title { get; private set; } = string.Empty;
        public string Description { get; private set; } = string.Empty;
        public int OrderIndex { get; private set; }
        public bool IsDeleted { get; private set; }

        public virtual Course Course { get; private set; } = null!;
        public virtual ICollection<ModuleItem> Items { get; private set; }

        private CourseModule() { } 

        public CourseModule(Guid courseId, string title, string description, int orderIndex)
        {
            Id = Guid.NewGuid();
            CourseId = courseId;
            Title = string.IsNullOrWhiteSpace(title) ? throw new ArgumentException("Title cannot be empty", nameof(title)) : title;
            Description = description ?? string.Empty;
            OrderIndex = orderIndex;
            IsDeleted = false;

            Items = new HashSet<ModuleItem>();
        }

        public void Update(string title, string description, int orderIndex)
        {
            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("Title cannot be empty", nameof(title));
                
            Title = title;
            Description = description ?? string.Empty;
            OrderIndex = orderIndex;
        }

        public void Delete()
        {
            IsDeleted = true;
        }
    }
}
