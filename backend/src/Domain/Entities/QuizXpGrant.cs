using System;

namespace VisualizationDSA.Domain.Entities
{
    /// <summary>Ghi nhận XP đã cấp cho quiz KHÔNG phải Guid (bank in-memory) — chống farm XP khi submit lặp lại.</summary>
    public class QuizXpGrant
    {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }
        public string QuizKey { get; private set; } = string.Empty;
        public DateTime GrantedAt { get; private set; }

        private QuizXpGrant() { }

        public QuizXpGrant(Guid userId, string quizKey)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            QuizKey = quizKey;
            GrantedAt = DateTime.UtcNow;
        }
    }
}
