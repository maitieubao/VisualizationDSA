using System;
using System.Collections.Generic;

namespace VisualizationDSA.Domain.Entities
{
    public class Classroom
    {
        public Guid Id { get; private set; }
        public string Name { get; private set; } = string.Empty;
        public string Description { get; private set; } = string.Empty;
        public Guid OwnerTeacherId { get; private set; }
        public Guid? CourseId { get; private set; }
        public Guid? ImportedFromCourseId { get; private set; }
        public string InviteCode { get; private set; } = string.Empty;
        public bool IsArchived { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? InviteCodeExpiresAt { get; private set; }
        public int? MaxEnrollmentCapacity { get; private set; }

        
        public virtual User OwnerTeacher { get; private set; } = null!;
        public virtual ICollection<ClassroomEnrollment> Enrollments { get; private set; }
        public virtual ICollection<ClassroomLesson> Lessons { get; private set; }
        public virtual ICollection<ClassroomModule> Modules { get; private set; }
        public virtual ICollection<ClassroomModuleItemOverride> ModuleItemOverrides { get; private set; }
        public virtual ICollection<ClassroomQuiz> Quizzes { get; private set; }
        public virtual ICollection<ClassroomAnnouncement> Announcements { get; private set; }

        private Classroom() { }

        public Classroom(Guid ownerTeacherId, string name, string description, string inviteCode, DateTime? inviteCodeExpiresAt = null, int? maxEnrollmentCapacity = null)
        {
            Id = Guid.NewGuid();
            OwnerTeacherId = ownerTeacherId;
            Name = string.IsNullOrWhiteSpace(name) ? throw new ArgumentException("Name cannot be empty.", nameof(name)) : name;
            Description = description ?? string.Empty;
            InviteCode = inviteCode;
            InviteCodeExpiresAt = inviteCodeExpiresAt;
            MaxEnrollmentCapacity = maxEnrollmentCapacity;
            IsArchived = false;
            CreatedAt = DateTime.UtcNow;

            Enrollments = new HashSet<ClassroomEnrollment>();
            Lessons = new HashSet<ClassroomLesson>();
            Modules = new HashSet<ClassroomModule>();
            ModuleItemOverrides = new HashSet<ClassroomModuleItemOverride>();
            Quizzes = new HashSet<ClassroomQuiz>();
            Announcements = new HashSet<ClassroomAnnouncement>();
        }

        public void Archive()
        {
            IsArchived = true;
        }

        public void UpdateDetails(string name, string description)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Classroom name cannot be empty.", nameof(name));
                
            Name = name;
            Description = description ?? string.Empty;
        }

        public void UpdateInviteCode(string code, DateTime? expiresAt = null)
        {
            if (string.IsNullOrWhiteSpace(code))
                throw new ArgumentException("Invite code cannot be empty.", nameof(code));
                
            InviteCode = code;
            InviteCodeExpiresAt = expiresAt;
        }

        public void UpdateCapacity(int? maxCapacity)
        {
            if (maxCapacity.HasValue && maxCapacity.Value <= 0)
                throw new ArgumentException("Max capacity must be greater than zero.", nameof(maxCapacity));
                
            MaxEnrollmentCapacity = maxCapacity;
        }

        public void SetImportedFromCourse(Guid courseId)
        {
            ImportedFromCourseId = courseId;
        }

        public void LinkToCourse(Guid courseId)
        {
            CourseId = courseId;
        }
    }
}