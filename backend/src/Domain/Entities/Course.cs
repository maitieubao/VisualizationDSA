using System;
using System.Collections.Generic;

namespace VisualizationDSA.Domain.Entities
{
    public class Course
    {
        public Guid Id { get; private set; }
        public Guid TeacherId { get; private set; }
        public string Title { get; private set; } = string.Empty;
        public string Description { get; private set; } = string.Empty;
        public string Category { get; private set; } = string.Empty; // SORTING, GRAPH, OOP, SOLID, PATTERNS, SYSTEM_DESIGN
        public string Difficulty { get; private set; } = "Medium"; // Easy, Medium, Hard
        public bool IsPremium { get; private set; }
        public string CoverImageUrl { get; private set; } = string.Empty;
        public bool IsPublished { get; private set; }
        public DateTime CreatedAt { get; private set; }

        public virtual User Teacher { get; private set; } = null!;
        public virtual ICollection<Lesson> Lessons { get; private set; } = new List<Lesson>();

        private Course() { }

        public Course(Guid teacherId, string title, string description, string category, string difficulty, bool isPremium, string coverImageUrl)
        {
            Id = Guid.NewGuid();
            TeacherId = teacherId;
            Title = title;
            Description = description;
            Category = category;
            Difficulty = difficulty;
            IsPremium = isPremium;
            CoverImageUrl = coverImageUrl;
            IsPublished = true;
            CreatedAt = DateTime.UtcNow;
        }

        public void Update(string title, string description, string category, string difficulty, bool isPremium, string coverImageUrl, bool isPublished)
        {
            Title = title;
            Description = description;
            Category = category;
            Difficulty = difficulty;
            IsPremium = isPremium;
            CoverImageUrl = coverImageUrl;
            IsPublished = isPublished;
        }
    }
}
