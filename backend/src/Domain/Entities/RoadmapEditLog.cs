using System;

namespace VisualizationDSA.Domain.Entities
{
    public class RoadmapEditLog
    {
        public Guid Id { get; private set; }
        public Guid RoadmapId { get; private set; }
        public Guid EditorId { get; private set; }
        public string ChangeType { get; private set; } = string.Empty; // ContentUpdate/QuizUpdate/NodeAdd/NodeDelete
        public DateTime ChangedAt { get; private set; }
        public string? Note { get; private set; }

        public virtual CustomRoadmap Roadmap { get; private set; } = null!;
        public virtual User Editor { get; private set; } = null!;

        private RoadmapEditLog() { }

        public RoadmapEditLog(Guid roadmapId, Guid editorId, string changeType, string? note = null)
        {
            Id = Guid.NewGuid();
            RoadmapId = roadmapId;
            EditorId = editorId;
            ChangeType = changeType;
            ChangedAt = DateTime.UtcNow;
            Note = note;
        }
    }
}
