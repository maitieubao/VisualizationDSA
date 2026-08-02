using System;
using System.Collections.Generic;

namespace VisualizationDSA.Application.DTOs.Classroom
{
    public class StudentAnalyticsDto
    {
        public Guid StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime JoinedAt { get; set; }
        public int TotalXP { get; set; }
        public int CurrentLevel { get; set; }
        public int LessonsCompleted { get; set; }
        public DateTime? LastActiveDate { get; set; }
        public bool IsInactive { get; set; }
    }

    public class ClassroomAnalyticsDto
    {
        public string ClassroomId { get; set; } = string.Empty;
        public string ClassroomName { get; set; } = string.Empty;
        public string RoadmapName { get; set; } = string.Empty;
        public int TotalStudents { get; set; }
        public int ActiveStudents { get; set; }
        public int AverageXP { get; set; }
        public List<StudentAnalyticsDto> Students { get; set; } = new List<StudentAnalyticsDto>();
    }
}
