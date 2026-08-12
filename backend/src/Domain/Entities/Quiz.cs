using System;
using System.Collections.Generic;
using System.Linq;

namespace VisualizationDSA.Domain.Entities
{
    public class Quiz
    {
        public Guid Id { get; private set; }
        public string Title { get; private set; }
        public string Description { get; private set; }
        public string Topic { get; private set; } 
        public int Difficulty { get; private set; } 
        public int XPReward { get; private set; }
        public bool IsDeleted { get; private set; }

        // TC-021: giáo viên tạo quiz sở hữu nó — teacher khác (hoặc admin) quản lý quiz này
        // phải qua gate IsOwnerOrAdmin. Seed quiz (CreatedByTeacherId = null) là nội dung chung.
        public Guid? CreatedByTeacherId { get; private set; }
        
        public virtual ICollection<QuizQuestion> Questions { get; private set; }
        public virtual ICollection<QuizAttempt> Attempts { get; private set; }

        private Quiz() { }

        public Quiz(string title, string description, string topic, int difficulty, int xpReward, Guid? createdByTeacherId = null)
        {
            Id = Guid.NewGuid();
            Title = title;
            Description = description;
            Topic = topic;
            Difficulty = difficulty;
            XPReward = xpReward;
            CreatedByTeacherId = createdByTeacherId;
            Questions = new List<QuizQuestion>();
            Attempts = new List<QuizAttempt>();
        }

        // Trả về entity vừa tạo để caller (controller) có thể Add() tường minh vào DbContext:
        // QuizQuestion.Id là key client-generated — nếu chỉ thêm vào collection, DetectChanges
        // coi entity là "đã tồn tại" (state Unchanged/Modified) → UPDATE 0 row → concurrency 500.
        public QuizQuestion AddQuestion(string question, string[] options, int correctIndex, string explanation)
        {
            var quizQuestion = new QuizQuestion(Id, question, options, correctIndex, explanation);
            Questions.Add(quizQuestion);
            return quizQuestion;
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

        // TC-001: xóa 1 câu hỏi con trong CRUD câu hỏi (trả false nếu không tồn tại).
        public bool RemoveQuestion(Guid questionId)
        {
            var existing = Questions.FirstOrDefault(q => q.Id == questionId);
            if (existing == null) return false;
            Questions.Remove(existing);
            return true;
        }

        // TC-022: xóa mềm — giữ nguyên attempt history + bằng chứng XP của học viên
        // (trước đây Remove cascade xóa sạch QuizAttempt → mất điểm + XP ledger).
        public void Delete()
        {
            IsDeleted = true;
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

        // TC-001: cập nhật nội dung câu hỏi con (giữ nguyên Id — attempt history trỏ theo QuizQuestion).
        public void Update(string question, string[] options, int correctIndex, string explanation)
        {
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

        // PR-002: quiz DB có Guid thật; quiz bank (in-memory, không có row trong Quizzes)
        // dùng QuizId = null + QuizKey/QuizTitle làm reference để lịch sử hiển thị đầy đủ.
        public Guid? QuizId { get; private set; }
        public string? QuizKey { get; private set; }
        public string? QuizTitle { get; private set; }

        public int Score { get; private set; }
        public int MaxScore { get; private set; }
        public bool Passed { get; private set; }
        public DateTime AttemptedAt { get; private set; }
        public int[] Answers { get; private set; }
        
        public virtual User User { get; private set; }
        public virtual Quiz? Quiz { get; private set; }

        private QuizAttempt() { }

        public QuizAttempt(Guid userId, Guid quizId, int[] answers, int score, int maxScore)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            QuizId = quizId;
            Answers = answers;
            Score = score;
            MaxScore = maxScore;
            Passed = score >= maxScore * 0.7; 
            AttemptedAt = DateTime.UtcNow;
        }

        // PR-002: attempt cho quiz bank — không có QuizId (Guid), lưu key + title làm reference.
        public QuizAttempt(Guid userId, string quizKey, string quizTitle, int[] answers, int score, int maxScore)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            QuizId = null;
            QuizKey = quizKey;
            QuizTitle = quizTitle;
            Answers = answers;
            Score = score;
            MaxScore = maxScore;
            Passed = score >= maxScore * 0.7; 
            AttemptedAt = DateTime.UtcNow;
        }
    }
}
