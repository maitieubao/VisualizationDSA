using System;

namespace VisualizationDSA.Application.DTOs
{
    public class LearningSessionDto
    {
        public Guid SessionId { get; set; }
        public string NodeId { get; set; } = string.Empty;
        public string CurrentStep { get; set; } = string.Empty;
        public int? QuizScore { get; set; }
        public int? LabScore { get; set; }
        public int? LeetCodeScore { get; set; }
        public DateTime ExpiresAt { get; set; }
        public double RemainingSeconds { get; set; }
    }

    public class EnterNodeResponseDto
    {
        public bool Resumed { get; set; }
        public Guid SessionId { get; set; }
        public string CurrentStep { get; set; } = string.Empty;
        public int Hearts { get; set; }
        public int MaxHearts { get; set; }
        public int? QuizScore { get; set; }
        public int? LabScore { get; set; }
    }

    public class UpdateStepRequestDto
    {
        public string Step { get; set; } = string.Empty;
    }

    public class UpdateStepResponseDto
    {
        public bool Success { get; set; }
        public string CurrentStep { get; set; } = string.Empty;
    }
}
