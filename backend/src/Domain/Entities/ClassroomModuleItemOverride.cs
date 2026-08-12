using System;

namespace VisualizationDSA.Domain.Entities
{
    public class ClassroomModuleItemOverride
    {
        public Guid Id { get; private set; }
        public Guid ClassroomId { get; private set; }
        public Guid ModuleItemId { get; private set; }
        
        public DateTime? OpenAt { get; private set; }
        public DateTime? DueAt { get; private set; }
        public int? MaxAttempts { get; private set; }
        public bool IsHiddenForStudent { get; private set; }
        public Guid? PrerequisiteItemId { get; private set; }
        public bool IsSequential { get; private set; }
        public bool IsRequired { get; private set; } = true;

        public virtual Classroom Classroom { get; private set; } = null!;
        public virtual ClassroomModuleItem ModuleItem { get; private set; } = null!;

        private ClassroomModuleItemOverride() { }

        public ClassroomModuleItemOverride(Guid classroomId, Guid moduleItemId, DateTime? openAt = null, DateTime? dueAt = null, int? maxAttempts = null, bool isHiddenForStudent = false, Guid? prerequisiteItemId = null, bool isSequential = true, bool isRequired = true)
        {
            Id = Guid.NewGuid();
            ClassroomId = classroomId;
            ModuleItemId = moduleItemId;
            OpenAt = openAt;
            DueAt = dueAt;
            MaxAttempts = maxAttempts;
            IsHiddenForStudent = isHiddenForStudent;
            PrerequisiteItemId = prerequisiteItemId;
            IsSequential = isSequential;
            IsRequired = isRequired;
        }

        public void Update(DateTime? openAt, DateTime? dueAt, int? maxAttempts, bool isHiddenForStudent, Guid? prerequisiteItemId = null, bool isSequential = true, bool isRequired = true)
        {
            OpenAt = openAt;
            DueAt = dueAt;
            MaxAttempts = maxAttempts;
            IsHiddenForStudent = isHiddenForStudent;
            PrerequisiteItemId = prerequisiteItemId;
            IsSequential = isSequential;
            IsRequired = isRequired;
        }
    }
}