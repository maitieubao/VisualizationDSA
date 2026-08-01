using System;
using VisualizationDSA.Domain.Enums;

namespace VisualizationDSA.Domain.Entities
{
    public class ModuleItem
    {
        public Guid Id { get; private set; }
        public Guid ModuleId { get; private set; }
        public Guid? ClassroomId { get; private set; } 
        public ModuleItemType ItemType { get; private set; }
        
        public Guid? LessonId { get; private set; }
        public Guid? QuizId { get; private set; }
        public Guid? CodelabId { get; private set; }
        
        public string OverrideTitle { get; private set; } = string.Empty;
        public int OrderIndex { get; private set; } 
        public bool IsRequired { get; private set; }
        public bool IsDeleted { get; private set; }

        public virtual CourseModule Module { get; private set; } = null!;
        public virtual Lesson? Lesson { get; private set; }
        public virtual Quiz? Quiz { get; private set; }
        public virtual Codelab? Codelab { get; private set; }

        private ModuleItem() { } 

        public ModuleItem(Guid moduleId, Guid? classroomId, ModuleItemType itemType, Guid? lessonId, Guid? quizId, Guid? codelabId, string overrideTitle, int orderIndex, bool isRequired)
        {
            
            var fkCount = (lessonId.HasValue ? 1 : 0) + (quizId.HasValue ? 1 : 0) + (codelabId.HasValue ? 1 : 0);
            if (fkCount != 1)
                throw new ArgumentException("ModuleItem must reference exactly one of: Lesson, Quiz, or Codelab.");

            
            if (itemType == ModuleItemType.Lesson && !lessonId.HasValue)
                throw new ArgumentException("ItemType is Lesson but LessonId is null.");
            if (itemType == ModuleItemType.Quiz && !quizId.HasValue)
                throw new ArgumentException("ItemType is Quiz but QuizId is null.");
            if (itemType == ModuleItemType.Codelab && !codelabId.HasValue)
                throw new ArgumentException("ItemType is Codelab but CodelabId is null.");

            Id = Guid.NewGuid();
            ModuleId = moduleId;
            ClassroomId = classroomId;
            ItemType = itemType;
            
            LessonId = lessonId;
            QuizId = quizId;
            CodelabId = codelabId;
            
            OverrideTitle = overrideTitle ?? string.Empty;
            OrderIndex = orderIndex;
            IsRequired = isRequired;
            IsDeleted = false;
        }

        public void Update(string overrideTitle, int orderIndex, bool isRequired)
        {
            OverrideTitle = overrideTitle ?? string.Empty;
            OrderIndex = orderIndex;
            IsRequired = isRequired;
        }

        public void UpdateQuizId(Guid? quizId)
        {
            QuizId = quizId;
        }

        public void Delete()
        {
            IsDeleted = true;
        }
    }
}
