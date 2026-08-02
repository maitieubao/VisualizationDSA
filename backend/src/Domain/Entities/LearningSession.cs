using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VisualizationDSA.Domain.Entities
{
    public class LearningSession
    {
        [Key]
        public Guid Id { get; private set; }

        public Guid UserId { get; private set; }

        [Required]
        [MaxLength(255)]
        public string NodeId { get; private set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string CurrentStep { get; private set; } = "Theory"; // Theory, Sandbox, Quiz, Lab, LeetCode

        public int? QuizScore { get; private set; }
        public int? LabScore { get; private set; }
        public int? LeetCodeScore { get; private set; }

        public DateTime ExpiresAt { get; private set; }
        public DateTime CreatedAt { get; private set; }

        [ForeignKey("UserId")]
        public virtual User User { get; private set; } = null!;

        private LearningSession() { }

        public LearningSession(Guid userId, string nodeId)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            NodeId = nodeId;
            CurrentStep = "Theory";
            CreatedAt = DateTime.UtcNow;
            ExpiresAt = CreatedAt.AddMinutes(30);
        }

        public void UpdateStep(string step)
        {
            CurrentStep = step;
        }

        public void RecordQuizPass(int score)
        {
            QuizScore = score;
            CurrentStep = "Lab";
        }

        public void RecordLabPass(int score)
        {
            LabScore = score;
            CurrentStep = "LeetCode";
        }

        public void RecordLeetCodePass(int score)
        {
            LeetCodeScore = score;
        }

        public bool IsExpired()
        {
            return DateTime.UtcNow > ExpiresAt;
        }
    }
}
