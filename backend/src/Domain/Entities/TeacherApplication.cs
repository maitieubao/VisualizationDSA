using System;

namespace VisualizationDSA.Domain.Entities
{
    public class TeacherApplication
    {
        public Guid      Id           { get; private set; }
        public Guid      UserId       { get; private set; }
        public string    SchoolName   { get; private set; } = string.Empty;
        public string    CvUrl        { get; private set; } = string.Empty;
        public string    Reason       { get; private set; } = string.Empty;
        public string    Status       { get; private set; } = "Pending"; // Pending / Approved / Rejected
        public string?   RejectReason { get; private set; }
        public DateTime  CreatedAt    { get; private set; }
        public DateTime? ReviewedAt   { get; private set; }
        public Guid?     ReviewedBy   { get; private set; }

        public virtual User User { get; private set; } = null!;

        private TeacherApplication() { } // EF Core constructor

        public TeacherApplication(Guid userId, string schoolName, string cvUrl, string reason)
        {
            Id           = Guid.NewGuid();
            UserId       = userId;
            SchoolName   = schoolName;
            CvUrl        = cvUrl;
            Reason       = reason;
            Status       = "Pending";
            CreatedAt    = DateTime.UtcNow;
        }

        public void Approve(Guid reviewerId)
        {
            Status     = "Approved";
            ReviewedAt = DateTime.UtcNow;
            ReviewedBy = reviewerId;
        }

        public void Reject(Guid reviewerId, string rejectReason)
        {
            Status       = "Rejected";
            RejectReason = rejectReason;
            ReviewedAt   = DateTime.UtcNow;
            ReviewedBy   = reviewerId;
        }
    }
}
