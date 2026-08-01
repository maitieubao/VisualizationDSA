using System;
using System.Collections.Generic;

namespace VisualizationDSA.Domain.Entities
{
    public class Classroom
    {
        public string Id { get; private set; }
        public string Name { get; private set; }
        public Guid RoadmapId { get; private set; }
        public Guid TeacherId { get; private set; }
        public string JoinCode { get; private set; }
        public DateTime CreatedAt { get; private set; }

        // Navigation properties
        public Course Roadmap { get; private set; } = null!;
        public User Teacher { get; private set; } = null!;
        public ICollection<ClassroomMember> Members { get; private set; } = new List<ClassroomMember>();

        protected Classroom() { } // For EF Core

        public Classroom(string name, Guid roadmapId, Guid teacherId)
        {
            Id = Guid.NewGuid().ToString();
            Name = name;
            RoadmapId = roadmapId;
            TeacherId = teacherId;
            JoinCode = GenerateJoinCode();
            CreatedAt = DateTime.UtcNow;
        }

        private static string GenerateJoinCode()
        {
            // Create a random 6-character alphanumeric string
            var random = new Random();
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var result = new char[6];
            for (int i = 0; i < 6; i++)
            {
                result[i] = chars[random.Next(chars.Length)];
            }
            return new string(result);
        }
    }
}
