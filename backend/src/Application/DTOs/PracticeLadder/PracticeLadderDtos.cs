using System;
using System.Collections.Generic;

namespace VisualizationDSA.Application.DTOs.PracticeLadder
{
    public class PracticeStatusDto
    {
        public string NodeId { get; set; } = string.Empty;
        public Guid SessionId { get; set; }
        public bool QuizPassed { get; set; }
        public int? QuizScore { get; set; }
        public bool LabPassed { get; set; }
        public int? LabScore { get; set; }
        public bool LeetcodePassed { get; set; }
        public int? LeetcodeScore { get; set; }
        public int? NodeFinalScore { get; set; }
        public int? PreviousBestScore { get; set; }
    }

    public class QuizAnswerDto
    {
        public Guid QuestionId { get; set; }
        public int SelectedOptionIndex { get; set; } // Changed from Guid to int based on spec: answers: [0, 2, 1...]
    }

    public class QuizSubmitRequestDto
    {
        public Guid SessionId { get; set; }
        public List<int> Answers { get; set; } = new(); // Spec says "answers: [0, 2, 1]"
    }

    public class QuizSubmitResponseDto
    {
        public bool Passed { get; set; }
        public int Score { get; set; }
        public int CorrectCount { get; set; }
        public int TotalCount { get; set; }
        public string? NextStep { get; set; }
        public string? Message { get; set; }
    }

    public class LabSubmitRequestDto
    {
        public Guid SessionId { get; set; }
        public List<string> Operations { get; set; } = new();
    }

    public class LabSubmitResponseDto
    {
        public bool Passed { get; set; }
        public int Score { get; set; }
        public int CorrectSteps { get; set; }
        public int TotalSteps { get; set; }
        public string? NextStep { get; set; }
        public int? WrongAt { get; set; }
        public string? ExpectedOperation { get; set; }
        public string? YourOperation { get; set; }
    }

    public class LeetCodeSubmitRequestDto
    {
        public Guid SessionId { get; set; }
        public string SourceCode { get; set; } = string.Empty;
        public string Language { get; set; } = "cpp"; // cpp | java | python | js
    }

    public class LeetCodeSubmitResponseDto
    {
        public string Result { get; set; } = string.Empty; // AC, WA, CE, TLE
        public int PassedTestcases { get; set; }
        public int TotalTestcases { get; set; }
        public int Score { get; set; }
        public int RuntimeMs { get; set; }
        public int MemoryKb { get; set; }
        public int Percentile { get; set; }
        public bool Passed { get; set; }
        public int? FailedTestcase { get; set; }
        public string? Expected { get; set; }
        public string? Got { get; set; }
        public int? TimeLimitMs { get; set; }
        public int? ActualMs { get; set; }
        public string? CompilerOutput { get; set; }
        public bool IsFatal { get; set; }
    }

    public class HintRequestDto
    {
        public Guid SessionId { get; set; }
        public string Step { get; set; } = "LeetCode"; // Quiz | Lab | LeetCode
        public string HintType { get; set; } = "hint1"; // hint1 | hint_token | hint2 | debug | optimize | explain_visual
    }

    public class HintResponseDto
    {
        public string Hint { get; set; } = string.Empty;
        public int? RemainingAiRequests { get; set; }
        public int CooldownSeconds { get; set; }
    }
}
