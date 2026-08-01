using System;
using System.Collections.Generic;

namespace VisualizationDSA.Application.DTOs.TeacherStudio
{
    public class CustomRoadmapDto
    {
        public Guid Id { get; set; }
        public Guid TeacherId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Tags { get; set; } = "[]";
        public string? ThumbnailUrl { get; set; }
        public string Visibility { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? AdminRejectReason { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<CustomNodeDto> Nodes { get; set; } = new List<CustomNodeDto>();
    }

    public class CustomNodeDto
    {
        public Guid Id { get; set; }
        public Guid RoadmapId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Difficulty { get; set; } = string.Empty;
        public string ContentJson { get; set; } = string.Empty;
        public string? VideoUrl { get; set; }
        public Guid? VisualizerId { get; set; }
        public Guid? QuizId { get; set; }
        public Guid? LabId { get; set; }
        public Guid? LeetCodeId { get; set; }
        public int SortOrder { get; set; }
        public bool IsComplete { get; set; }
        public string? OfficialApproach { get; set; }
        public string? OfficialSolution { get; set; }
        public string? ComplexityNote { get; set; }
    }

    public class CreateRoadmapDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Tags { get; set; } = "[]";
        public string? ThumbnailUrl { get; set; }
        public string Visibility { get; set; } = "Private";
    }

    public class UpdateRoadmapDto : CreateRoadmapDto { }

    public class CreateNodeDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Difficulty { get; set; } = "Medium";
        public int SortOrder { get; set; }
    }

    public class UpdateNodeContentDto
    {
        public string ContentJson { get; set; } = "[]";
        public string? VideoUrl { get; set; }
        public Guid? VisualizerId { get; set; }
    }

    public class UpdateNodePracticeDto
    {
        public Guid? QuizId { get; set; }
        public Guid? LabId { get; set; }
        public Guid? LeetCodeId { get; set; }
    }

    public class PublishRoadmapDto
    {
        public string Visibility { get; set; } = "Public"; // Public, ClassroomOnly, Private
    }

    public class RejectRoadmapDto
    {
        public string Reason { get; set; } = string.Empty;
    }
}
