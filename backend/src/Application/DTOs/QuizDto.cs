using System;
using System.Collections.Generic;

namespace VisualizationDSA.Application.DTOs
{
    public class QuizDto
    {
        public Guid Id { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required string Topic { get; set; }
        public int Difficulty { get; set; }
        public int XPReward { get; set; }
        public required List<QuizQuestionDto> Questions { get; set; }
    }

    public class QuizQuestionDto
    {
        public Guid Id { get; set; }
        public required string Question { get; set; }
        public required string[] Options { get; set; }
        public required string Explanation { get; set; }
        // Note: CorrectIndex is NOT included to prevent cheating
    }

    public class QuizAttemptRequest
    {
        public Guid QuizId { get; set; }
        public required int[] Answers { get; set; } // Selected option indices
    }

    public class QuizAttemptResult
    {
        public int Score { get; set; }
        public int MaxScore { get; set; }
        public bool Passed { get; set; }
        public int XPEarned { get; set; }
        public required List<QuestionResult> QuestionResults { get; set; }
    }

    public class QuestionResult
    {
        public Guid QuestionId { get; set; }
        public bool IsCorrect { get; set; }
        public int CorrectIndex { get; set; }
        public required string Explanation { get; set; }
    }
}

