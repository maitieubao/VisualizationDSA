using System;
using System.Collections.Generic;

namespace VisualizationDSA.Domain.Entities
{
    public class ClassroomQuizAttempt
    {
        public Guid Id { get; private set; }
        public Guid ClassroomQuizId { get; private set; }
        public Guid StudentId { get; private set; }
        public int Score { get; private set; }
        public int MaxScore { get; private set; }
        public DateTime SubmittedAt { get; private set; }
        public bool IsLate { get; private set; }

        public virtual ClassroomQuiz ClassroomQuiz { get; private set; } = null!;
        public virtual User Student { get; private set; } = null!;

        private ClassroomQuizAttempt() { }

        public ClassroomQuizAttempt(Guid classroomQuizId, Guid studentId, int score, int maxScore, DateTime dueAt)
        {
            Id = Guid.NewGuid();
            ClassroomQuizId = classroomQuizId;
            StudentId = studentId;
            Score = score;
            MaxScore = maxScore;
            SubmittedAt = DateTime.UtcNow;
            
            
            IsLate = SubmittedAt > dueAt;
        }
    }
}
