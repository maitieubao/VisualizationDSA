using System;

namespace VisualizationDSA.Domain.Entities
{
    /// <summary>Ghi nhận việc người dùng đã mở gợi ý trả phí — chống trừ XP trùng lặp khi mở lại.</summary>
    public class CodelabHintReveal
    {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }
        public Guid CodelabHintId { get; private set; }
        public DateTime RevealedAt { get; private set; }

        public virtual CodelabHint CodelabHint { get; private set; } = null!;

        private CodelabHintReveal() { }

        public CodelabHintReveal(Guid userId, Guid codelabHintId)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            CodelabHintId = codelabHintId;
            RevealedAt = DateTime.UtcNow;
        }
    }
}
