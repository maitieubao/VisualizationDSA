using System;
using System.Collections.Generic;

namespace VisualizationDSA.Domain.Entities
{
    public class Lesson
    {
        public Guid Id { get; private set; }
        public Guid CourseId { get; private set; }
        public string Title { get; private set; } = string.Empty;
        public string ContentMd { get; private set; } = string.Empty;
        public string? ContentBlocksJson { get; private set; } // JSON array of blocks
        public string? VideoUrl { get; private set; } // YouTube embed or HLS url
        public string? TheoryImagesJson { get; private set; } // JSON array of image URLs
        public string SandboxType { get; private set; } = string.Empty; // sorting, graph, oop, solid, patterns, system
        public string SandboxConfig { get; private set; } = "{}"; // JSON string
        public Guid? QuizId { get; private set; } // Linked quiz
        public int XPReward { get; private set; }
        public int OrderIndex { get; private set; }
        public DateTime CreatedAt { get; private set; }

        public virtual Course Course { get; private set; } = null!;
        public virtual Quiz? Quiz { get; private set; }
        public virtual ICollection<UserLessonProgress> Progresses { get; private set; } = new List<UserLessonProgress>();

        private Lesson() { }

        public Lesson(Guid courseId, string title, string contentMd, string sandboxType, string sandboxConfig, Guid? quizId, int xpReward, int orderIndex)
        {
            Id = Guid.NewGuid();
            CourseId = courseId;
            Title = title;
            ContentMd = contentMd;
            SandboxType = sandboxType;
            SandboxConfig = sandboxConfig;
            QuizId = quizId;
            XPReward = xpReward;
            OrderIndex = orderIndex;
            CreatedAt = DateTime.UtcNow;
        }

        public void Update(string title, string contentMd, string sandboxType, string sandboxConfig, Guid? quizId, int xpReward, int orderIndex)
        {
            Title = title;
            ContentMd = contentMd;
            SandboxType = sandboxType;
            SandboxConfig = sandboxConfig;
            QuizId = quizId;
            XPReward = xpReward;
            OrderIndex = orderIndex;
        }

        public void UpdateContentBlocks(string? blocksJson)
        {
            ContentBlocksJson = blocksJson;
        }

        public void SetVideoUrl(string? url)
        {
            VideoUrl = url;
        }

        public void UpdateTheoryImages(string? imagesJson)
        {
            TheoryImagesJson = imagesJson;
        }
    }
}
