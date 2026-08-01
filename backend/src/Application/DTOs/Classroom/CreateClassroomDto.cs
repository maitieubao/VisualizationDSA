using System;

namespace VisualizationDSA.Application.DTOs.Classroom
{
    public class CreateClassroomDto
    {
        public string Name { get; set; } = string.Empty;
        public Guid RoadmapId { get; set; }
    }
}
