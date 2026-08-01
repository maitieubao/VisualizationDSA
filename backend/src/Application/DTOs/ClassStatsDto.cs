using System;
using System.Collections.Generic;

namespace VisualizationDSA.Application.DTOs
{
    public class ClassStatsDto
    {
        public int TotalStudents { get; set; }
        public double AvgScore { get; set; }
        public double PassRate { get; set; }
        public double CompletionRate { get; set; }
        public Dictionary<Guid, string> QuizTitles { get; set; } = new();
        public Dictionary<Guid, string> CodelabTitles { get; set; } = new();
        public List<StudentScoreRow> StudentScores { get; set; } = new();
    }

    public class StudentScoreRow
    {
        public Guid StudentId { get; set; }
        public string Name { get; set; } = string.Empty;
        public Dictionary<Guid, int> ScoresPerQuiz { get; set; } = new();
        public Dictionary<Guid, int> ScoresPerCodelab { get; set; } = new();
        public int TotalXP { get; set; }
    }
}
