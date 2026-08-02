using System;

namespace VisualizationDSA.Domain.Entities
{
    public class ClassroomMember
    {
        public string ClassroomId { get; private set; }
        public Guid StudentId { get; private set; }
        public DateTime JoinedAt { get; private set; }
        
        // Navigation properties
        public Classroom Classroom { get; private set; } = null!;
        public User Student { get; private set; } = null!;

        protected ClassroomMember() { } // For EF Core

        public ClassroomMember(string classroomId, Guid studentId)
        {
            ClassroomId = classroomId;
            StudentId = studentId;
            JoinedAt = DateTime.UtcNow;
        }
    }
}
