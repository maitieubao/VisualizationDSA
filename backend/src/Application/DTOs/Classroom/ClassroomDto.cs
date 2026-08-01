using System;

namespace VisualizationDSA.Application.DTOs.Classroom
{
    public class ClassroomDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public Guid RoadmapId { get; set; }
        public string RoadmapName { get; set; } = string.Empty;
        public Guid TeacherId { get; set; }
        public string TeacherName { get; set; } = string.Empty;
        public string JoinCode { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int StudentCount { get; set; }
        
        // Detailed properties (can be null/empty for list view)
        public System.Collections.Generic.List<object>? Students { get; set; }
    }
}
