using System;
using VisualizationDSA.Domain.Enums;

namespace VisualizationDSA.Domain.Entities
{
    public class ClassroomModuleItem
    {
        public Guid Id { get; private set; }
        public Guid ModuleId { get; private set; }
        public ModuleItemType ItemType { get; private set; }
        
        public Guid? LessonId { get; private set; }
        public Guid? QuizId { get; private set; }
        public Guid? CodelabId { get; private set; }
        
        public string OverrideTitle { get; private set; } = string.Empty;
        public string OverrideDescription { get; private set; } = string.Empty;
        public int OrderIndex { get; private set; }
        public bool IsRequired { get; private set; }
        public bool IsHidden { get; private set; }
        public bool IsDeleted { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public byte[] RowVersion { get; private set; } = new byte[8];

        
        public DateTime? UnlockAt { get; private set; }
        public DateTime? DueAt { get; private set; }
        public int? MaxAttempts { get; private set; }
        public bool IsHiddenForStudent { get; private set; }
        public Guid? PrerequisiteItemId { get; private set; }
        public bool IsSequential { get; private set; }

        
        public virtual ClassroomModule Module { get; private set; } = null!;
        public virtual Lesson? Lesson { get; private set; }
        public virtual Quiz? Quiz { get; private set; }
        public virtual Codelab? Codelab { get; private set; }

        private ClassroomModuleItem() { }

        public ClassroomModuleItem(
            Guid moduleId, 
            ModuleItemType itemType, 
            Guid? lessonId, 
            Guid? quizId, 
            Guid? codelabId,
            string overrideTitle,
            string overrideDescription,
            int orderIndex, 
            bool isRequired,
            DateTime? unlockAt = null,
            DateTime? dueAt = null,
            int? maxAttempts = null,
            bool isHiddenForStudent = false,
            Guid? prerequisiteItemId = null,
            bool isSequential = true,
            bool isHidden = false)
        {
            
            var fkCount = (lessonId.HasValue ? 1 : 0) + (quizId.HasValue ? 1 : 0) + (codelabId.HasValue ? 1 : 0);
            if (fkCount != 1)
                throw new ArgumentException("ClassroomModuleItem must reference exactly one of: Lesson, Quiz, or Codelab.");

            
            if (itemType == ModuleItemType.Lesson && !lessonId.HasValue)
                throw new ArgumentException("ItemType is Lesson but LessonId is null.");
            if (itemType == ModuleItemType.Quiz && !quizId.HasValue)
                throw new ArgumentException("ItemType is Quiz but QuizId is null.");
            if (itemType == ModuleItemType.Codelab && !codelabId.HasValue)
                throw new ArgumentException("ItemType is Codelab but CodelabId is null.");

            Id = Guid.NewGuid();
            ModuleId = moduleId;
            ItemType = itemType;
            LessonId = lessonId;
            QuizId = quizId;
            CodelabId = codelabId;
            OverrideTitle = overrideTitle ?? string.Empty;
            OverrideDescription = overrideDescription ?? string.Empty;
            OrderIndex = orderIndex;
            IsRequired = isRequired;
            IsHidden = isHidden;
            IsDeleted = false;
            CreatedAt = DateTime.UtcNow;
            UnlockAt = unlockAt;
            DueAt = dueAt;
            MaxAttempts = maxAttempts;
            IsHiddenForStudent = isHiddenForStudent;
            PrerequisiteItemId = prerequisiteItemId;
            IsSequential = isSequential;
        }

        public void Update(string overrideTitle, string overrideDescription, int orderIndex, bool isRequired, bool isHidden, DateTime? unlockAt, DateTime? dueAt, int? maxAttempts)
        {
            OverrideTitle = overrideTitle ?? string.Empty;
            OverrideDescription = overrideDescription ?? string.Empty;
            OrderIndex = orderIndex;
            IsRequired = isRequired;
            IsHidden = isHidden;
            UnlockAt = unlockAt;
            DueAt = dueAt;
            MaxAttempts = maxAttempts;
        }

        // LS-002: cập nhật nội dung item từ giáo viên (title/description + điều kiện học tập).
        // PrerequisiteItemId/IsSequential không nằm trong Update cũ — tách riêng để không
        // làm đổi hành vi của các call-site reorder.
        public void UpdateItemContent(
            string overrideTitle,
            string overrideDescription,
            bool isRequired,
            bool isHidden,
            Guid? prerequisiteItemId,
            bool isSequential,
            DateTime? unlockAt,
            DateTime? dueAt,
            int? maxAttempts)
        {
            OverrideTitle = overrideTitle ?? string.Empty;
            OverrideDescription = overrideDescription ?? string.Empty;
            IsRequired = isRequired;
            IsHidden = isHidden;
            PrerequisiteItemId = prerequisiteItemId;
            IsSequential = isSequential;
            UnlockAt = unlockAt;
            DueAt = dueAt;
            MaxAttempts = maxAttempts;
        }

        public void UpdateOverrideSettings(
            DateTime? unlockAt, 
            DateTime? dueAt, 
            int? maxAttempts, 
            bool isHiddenForStudent,
            Guid? prerequisiteItemId,
            bool isSequential)
        {
            UnlockAt = unlockAt;
            DueAt = dueAt;
            MaxAttempts = maxAttempts;
            IsHiddenForStudent = isHiddenForStudent;
            PrerequisiteItemId = prerequisiteItemId;
            IsSequential = isSequential;
        }

        public void UpdateItemType(ModuleItemType itemType, Guid? lessonId, Guid? quizId, Guid? codelabId)
        {
            var fkCount = (lessonId.HasValue ? 1 : 0) + (quizId.HasValue ? 1 : 0) + (codelabId.HasValue ? 1 : 0);
            if (fkCount != 1)
                throw new ArgumentException("Must reference exactly one of: Lesson, Quiz, or Codelab.");

            if (itemType == ModuleItemType.Lesson && !lessonId.HasValue)
                throw new ArgumentException("ItemType is Lesson but LessonId is null.");
            if (itemType == ModuleItemType.Quiz && !quizId.HasValue)
                throw new ArgumentException("ItemType is Quiz but QuizId is null.");
            if (itemType == ModuleItemType.Codelab && !codelabId.HasValue)
                throw new ArgumentException("ItemType is Codelab but CodelabId is null.");

            ItemType = itemType;
            LessonId = lessonId;
            QuizId = quizId;
            CodelabId = codelabId;
        }

        public void Delete()
        {
            IsDeleted = true;
        }
    }
}