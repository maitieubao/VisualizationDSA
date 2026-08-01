using System;

namespace VisualizationDSA.Domain.Entities
{
    public class LessonTheoryArticle
    {
        public Guid LessonId { get; private set; }
        public Guid TheoryArticleId { get; private set; }
        public int OrderIndex { get; private set; }
        public DateTime AddedAt { get; private set; }

        
        public virtual Lesson Lesson { get; private set; } = null!;
        public virtual TheoryArticle TheoryArticle { get; private set; } = null!;

        private LessonTheoryArticle() { }

        public LessonTheoryArticle(Guid lessonId, Guid theoryArticleId, int orderIndex)
        {
            LessonId = lessonId;
            TheoryArticleId = theoryArticleId;
            OrderIndex = orderIndex;
            AddedAt = DateTime.UtcNow;
        }

        public void UpdateOrder(int orderIndex)
        {
            OrderIndex = orderIndex;
        }
    }
}