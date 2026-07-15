using System;
using System.Collections.Generic;

namespace VisualizationDSA.Domain.Entities
{
    public class Quiz
    {
        public Guid Id { get; private set; }
        public string Title { get; private set; }
        public string Description { get; private set; }
        public string Topic { get; private set; } // e.g., "sorting", "oop", "solid"
        public int Difficulty { get; private set; } // 1-5
        public int XPReward { get; private set; }
        
        public virtual ICollection<QuizQuestion> Questions { get; private set; }
        public virtual ICollection<QuizAttempt> Attempts { get; private set; }

        private Quiz() { }

        public Quiz(string title, string description, string topic, int difficulty, int xpReward)
        {
            Id = Guid.NewGuid();
            Title = title;
            Description = description;
            Topic = topic;
            Difficulty = difficulty;
            XPReward = xpReward;
            Questions = new List<QuizQuestion>();
            Attempts = new List<QuizAttempt>();
        }

        public void AddQuestion(string question, string[] options, int correctIndex, string explanation)
        {
            Questions.Add(new QuizQuestion(Id, question, options, correctIndex, explanation));
        }

        public void Update(string title, string description, string topic, int difficulty, int xpReward)
        {
            Title = title;
            Description = description;
            Topic = topic;
            Difficulty = difficulty;
            XPReward = xpReward;
        }

        public void ClearQuestions()
        {
            Questions.Clear();
        }
    }

    public class QuizQuestion
    {
        public Guid Id { get; private set; }
        public Guid QuizId { get; private set; }
        public string Question { get; private set; }
        public string[] Options { get; private set; }
        public int CorrectIndex { get; private set; }
        public string Explanation { get; private set; }

        private QuizQuestion() { }

        public QuizQuestion(Guid quizId, string question, string[] options, int correctIndex, string explanation)
        {
            Id = Guid.NewGuid();
            QuizId = quizId;
            Question = question;
            Options = options;
            CorrectIndex = correctIndex;
            Explanation = explanation;
        }
    }

    public class QuizAttempt
    {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }
        public Guid QuizId { get; private set; }
        public int Score { get; private set; }
        public int MaxScore { get; private set; }
        public bool Passed { get; private set; }
        public DateTime AttemptedAt { get; private set; }
        public int[] Answers { get; private set; }
        
        public virtual User User { get; private set; }
        public virtual Quiz Quiz { get; private set; }

        private QuizAttempt() { }

        public QuizAttempt(Guid userId, Guid quizId, int[] answers, int score, int maxScore)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            QuizId = quizId;
            Answers = answers;
            Score = score;
            MaxScore = maxScore;
            Passed = score >= maxScore * 0.7; // 70% to pass
            AttemptedAt = DateTime.UtcNow;
        }
    }
}
