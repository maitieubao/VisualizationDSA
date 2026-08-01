using System;
using VisualizationDSA.Domain.Enums;

namespace VisualizationDSA.Domain.Entities
{
    public class CodelabSubmission
    {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }
        public Guid CodelabId { get; private set; }
        public string Code { get; private set; } = string.Empty;
        public string Language { get; private set; } = string.Empty;
        
        public SubmissionStatus Status { get; private set; } = SubmissionStatus.Pending;
        public string ErrorMessage { get; private set; } = string.Empty;
        public int RuntimeMs { get; private set; }
        public int MemoryBytes { get; private set; }
        public DateTime CreatedAt { get; private set; }
        
        public int PassedCount { get; private set; }
        public int TotalCount { get; private set; }
        public int Score { get; private set; }
        public bool IsSubmit { get; private set; }
        public string PerTestCaseResultJson { get; private set; } = "[]";

        public virtual User User { get; private set; } = null!;
        public virtual Codelab Codelab { get; private set; } = null!;

        private CodelabSubmission() { }

        public CodelabSubmission(Guid userId, Guid codelabId, string code, string language, bool isSubmit)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            CodelabId = codelabId;
            Code = code;
            Language = language;
            Status = SubmissionStatus.Pending;
            IsSubmit = isSubmit;
            CreatedAt = DateTime.UtcNow;
        }

        public void UpdateResult(SubmissionStatus status, int runtimeMs, int memoryBytes, int passedCount, int totalCount, int score, string perTestCaseResultJson, string errorMessage = "")
        {
            Status = status;
            RuntimeMs = runtimeMs;
            MemoryBytes = memoryBytes;
            PassedCount = passedCount;
            TotalCount = totalCount;
            Score = score;
            PerTestCaseResultJson = perTestCaseResultJson;
            ErrorMessage = errorMessage;
        }
    }
}
