using System;
using System.Collections.Generic;

namespace VisualizationDSA.Domain.Entities
{
    public class CustomRoadmap
    {
        public Guid Id { get; private set; }
        public Guid TeacherId { get; private set; }
        public string Name { get; private set; } = string.Empty;
        public string Description { get; private set; } = string.Empty;
        public string Tags { get; private set; } = "[]"; // JSON array
        public string? ThumbnailUrl { get; private set; }
        public string Visibility { get; private set; } = "Private"; // Private/ClassroomOnly/Public
        public string Status { get; private set; } = "Draft"; // Draft/Pending/Published/Rejected
        public string? AdminRejectReason { get; private set; }
        public Guid? ForkedFromId { get; private set; }
        public string? ForkedFromName { get; private set; }
        public DateTime CreatedAt { get; private set; }

        public virtual ICollection<CustomNode> Nodes { get; private set; } = new List<CustomNode>();

        // For EF Core
        private CustomRoadmap() { }

        public CustomRoadmap(Guid teacherId, string name, string description, string tags, string? thumbnailUrl, string visibility)
        {
            Id = Guid.NewGuid();
            TeacherId = teacherId;
            Name = name;
            Description = description;
            Tags = tags;
            ThumbnailUrl = thumbnailUrl;
            Visibility = visibility;
            Status = visibility == "Public" ? "Pending" : (visibility == "ClassroomOnly" ? "Published" : "Draft");
            CreatedAt = DateTime.UtcNow;
        }

        public void UpdateDetails(string name, string description, string tags, string? thumbnailUrl, string visibility)
        {
            Name = name;
            Description = description;
            Tags = tags;
            ThumbnailUrl = thumbnailUrl;
            Visibility = visibility;
        }

        public void Publish(string visibility)
        {
            Visibility = visibility;
            Status = visibility == "Public" ? "Pending" : (visibility == "ClassroomOnly" ? "Published" : "Draft");
        }

        public void Approve()
        {
            Status = "Published";
        }

        public void Reject(string reason)
        {
            Status = "Rejected";
            AdminRejectReason = reason;
        }
    }
}
