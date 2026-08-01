using System;
using System.Collections.Generic;

namespace VisualizationDSA.Domain.Entities
{
    public class TheoryArticle
    {
        public Guid Id { get; private set; }
        public Guid AuthorId { get; private set; }
        public string Title { get; private set; } = string.Empty;
        public string Slug { get; private set; } = string.Empty;
        public string ContentMd { get; private set; } = string.Empty;
        public string Category { get; private set; } = string.Empty;
        public string Difficulty { get; private set; } = "Beginner";
        public string Tags { get; private set; } = string.Empty;
        public int ViewCount { get; private set; }
        public int ReadTimeMinutes { get; private set; }
        public bool IsPublished { get; private set; }
        public bool IsDeleted { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? PublishedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        
        public virtual User Author { get; private set; } = null!;
        public virtual ICollection<TheoryArticleVersion> Versions { get; private set; }

        private TheoryArticle() { }

        public TheoryArticle(Guid authorId, string title, string slug, string contentMd, string category, string difficulty, string tags, int readTimeMinutes)
        {
            Id = Guid.NewGuid();
            AuthorId = authorId;
            Title = string.IsNullOrWhiteSpace(title) ? throw new ArgumentException("Title cannot be empty", nameof(title)) : title;
            Slug = string.IsNullOrWhiteSpace(slug) ? throw new ArgumentException("Slug cannot be empty", nameof(slug)) : slug;
            ContentMd = contentMd ?? string.Empty;
            Category = category ?? string.Empty;
            Difficulty = difficulty ?? "Beginner";
            Tags = tags ?? string.Empty;
            ReadTimeMinutes = readTimeMinutes >= 0 ? readTimeMinutes : 0;
            ViewCount = 0;
            IsPublished = false;
            IsDeleted = false;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
            Versions = new HashSet<TheoryArticleVersion>();
        }

        public void Update(string title, string slug, string contentMd, string category, string difficulty, string tags, int readTimeMinutes)
        {
            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("Title cannot be empty", nameof(title));
            if (string.IsNullOrWhiteSpace(slug))
                throw new ArgumentException("Slug cannot be empty", nameof(slug));

            Title = title;
            Slug = slug;
            ContentMd = contentMd ?? string.Empty;
            Category = category ?? string.Empty;
            Difficulty = difficulty ?? "Beginner";
            Tags = tags ?? string.Empty;
            ReadTimeMinutes = readTimeMinutes >= 0 ? readTimeMinutes : 0;
            UpdatedAt = DateTime.UtcNow;
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

        public void IncrementViewCount()
        {
            ViewCount++;
        }

        public void CreateVersion(string contentMd, string changeSummary, Guid changedBy)
        {
            Versions.Add(new TheoryArticleVersion(Id, contentMd, changeSummary, changedBy));
        }

        public void Delete()
        {
            IsDeleted = true;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}