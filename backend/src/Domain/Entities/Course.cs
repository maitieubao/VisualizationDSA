using System;
using System.Collections.Generic;
using VisualizationDSA.Domain.Enums;

namespace VisualizationDSA.Domain.Entities
{
    public class Course
    {
        public Guid Id { get; private set; }
        public Guid TeacherId { get; private set; }
        public string Title { get; private set; } = string.Empty;
        public string Description { get; private set; } = string.Empty;
        public CourseCategory Category { get; private set; }
        public CourseDifficulty Difficulty { get; private set; }
        public bool IsPremium { get; private set; }
        public string CoverImageUrl { get; private set; } = string.Empty;
        public bool IsPublished { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public bool IsDeleted { get; private set; }

        public virtual User Teacher { get; private set; } = null!;
        public virtual ICollection<CourseModule> Modules { get; private set; }

        private Course() { }

        public Course(Guid teacherId, string title, string description, CourseCategory category, CourseDifficulty difficulty, bool isPremium, string coverImageUrl)
        {
            Id = Guid.NewGuid();
            TeacherId = teacherId;
            Title = string.IsNullOrWhiteSpace(title) ? throw new ArgumentException("Title cannot be empty", nameof(title)) : title;
            Description = description ?? string.Empty;
            Category = category;
            Difficulty = difficulty;
            IsPremium = isPremium;
            CoverImageUrl = coverImageUrl ?? string.Empty;
            IsPublished = false; 
            CreatedAt = DateTime.UtcNow;
            IsDeleted = false;

            Modules = new HashSet<CourseModule>();
        }

        public void UpdateMetadata(string title, string description, string coverImageUrl)
        {
            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("Title cannot be empty", nameof(title));

            Title = title;
            Description = description ?? string.Empty;
            CoverImageUrl = coverImageUrl ?? string.Empty;
        }

        public void ChangeCategory(CourseCategory category)
        {
            Category = category;
        }

        public void ChangeDifficulty(CourseDifficulty difficulty)
        {
            Difficulty = difficulty;
        }

        public void SetPremium(bool isPremium)
        {
            IsPremium = isPremium;
        }

        public void Publish()
        {
            IsPublished = true;
        }

        public void Unpublish()
        {
            IsPublished = false;
        }

        public void Delete()
        {
            IsDeleted = true;
        }
    }
}
