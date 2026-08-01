using System;
using System.Collections.Generic;

namespace VisualizationDSA.Domain.Entities
{
    public class ClassroomQuiz
    {
        public Guid Id { get; private set; }
        public Guid ClassroomId { get; private set; }
        public Guid QuizId { get; private set; }
        public DateTime OpenAt { get; private set; }
        public DateTime DueAt { get; private set; }
        public int MaxAttempts { get; private set; }
        public bool IsArchived { get; private set; }
        
        
        public virtual Classroom Classroom { get; private set; } = null!;
        public virtual Quiz Quiz { get; private set; } = null!;
        public virtual ICollection<ClassroomQuizAttempt> Attempts { get; private set; }

        private ClassroomQuiz() { } 

        public ClassroomQuiz(Guid classroomId, Guid quizId, DateTime openAt, DateTime dueAt, int maxAttempts)
        {
            if (dueAt <= openAt) throw new ArgumentException("DueAt must be strictly after OpenAt.");
            if (maxAttempts <= 0) throw new ArgumentOutOfRangeException(nameof(maxAttempts), "MaxAttempts must be at least 1.");

            Id = Guid.NewGuid();
            ClassroomId = classroomId;
            QuizId = quizId;
            OpenAt = openAt;
            DueAt = dueAt;
            MaxAttempts = maxAttempts;
            IsArchived = false;

            Attempts = new HashSet<ClassroomQuizAttempt>();
        }

        public void Update(DateTime openAt, DateTime dueAt, int maxAttempts)
        {
            if (dueAt <= openAt) throw new ArgumentException("DueAt must be strictly after OpenAt.");
            if (maxAttempts <= 0) throw new ArgumentOutOfRangeException(nameof(maxAttempts), "MaxAttempts must be at least 1.");

            OpenAt = openAt;
            DueAt = dueAt;
            MaxAttempts = maxAttempts;
        }

        public void Archive()
        {
            IsArchived = true;
        }
    }
}
