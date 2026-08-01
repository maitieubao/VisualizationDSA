using System;

namespace VisualizationDSA.Domain.Entities
{
    public class ClassroomLeaderboardHistory
    {
        public Guid Id { get; private set; }
        public string ClassroomId { get; private set; } = string.Empty;
        public DateTime WeekStart { get; private set; }
        public DateTime WeekEnd { get; private set; }
        public string RankingsJson { get; private set; } = "[]";
        public DateTime CreatedAt { get; private set; }

        private ClassroomLeaderboardHistory() { }

        public ClassroomLeaderboardHistory(string classroomId, DateTime weekStart, DateTime weekEnd, string rankingsJson)
        {
            Id = Guid.NewGuid();
            ClassroomId = classroomId;
            WeekStart = weekStart;
            WeekEnd = weekEnd;
            RankingsJson = rankingsJson;
            CreatedAt = DateTime.UtcNow;
        }
    }
}
