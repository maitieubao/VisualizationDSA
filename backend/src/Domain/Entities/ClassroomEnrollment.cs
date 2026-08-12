using System;
using VisualizationDSA.Domain.Enums;

namespace VisualizationDSA.Domain.Entities
{
    public class ClassroomEnrollment
    {
        public Guid Id { get; private set; }
        public Guid ClassroomId { get; private set; }
        public Guid StudentId { get; private set; }
        public DateTime JoinedAt { get; private set; }
        public EnrollmentStatus Status { get; private set; }
        public DateTime? StatusChangedAt { get; private set; }
        public Guid? StatusChangedByUserId { get; private set; }
        public string? StatusChangeReason { get; private set; }

        
        public virtual Classroom Classroom { get; private set; } = null!;
        public virtual User Student { get; private set; } = null!;

        private ClassroomEnrollment() { } 

        public ClassroomEnrollment(Guid classroomId, Guid studentId)
        {
            Id = Guid.NewGuid();
            ClassroomId = classroomId;
            StudentId = studentId;
            JoinedAt = DateTime.UtcNow;
            Status = EnrollmentStatus.Active;
        }

        public void Kick(Guid kickedByUserId, string reason)
        {
            if (string.IsNullOrWhiteSpace(reason))
                throw new ArgumentException("Kick reason is required.", nameof(reason));

            Status = EnrollmentStatus.Kicked;
            StatusChangedAt = DateTime.UtcNow;
            StatusChangedByUserId = kickedByUserId;
            StatusChangeReason = reason;
        }

        // CR-026: học viên tự rời lớp — chỉ chuyển trạng thái Left (không xóa dữ liệu tiến độ),
        // Left vẫn được phép join lại sau này.
        public void Leave()
        {
            if (Status != EnrollmentStatus.Active)
                throw new InvalidOperationException("Chỉ học viên đang hoạt động mới có thể rời lớp.");

            Status = EnrollmentStatus.Left;
            StatusChangedAt = DateTime.UtcNow;
            StatusChangedByUserId = null;
            StatusChangeReason = "Học viên tự rời lớp";
        }
        
        public void Reactivate()
        {
            Status = EnrollmentStatus.Active;
            StatusChangedAt = DateTime.UtcNow;
            StatusChangedByUserId = null;
            StatusChangeReason = null;
        }
    }
}
