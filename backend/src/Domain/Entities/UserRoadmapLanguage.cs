using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VisualizationDSA.Domain.Entities
{
    public enum ProgrammingLanguage
    {
        Cpp,
        Java,
        Python,
        JavaScript
    }

    public class UserRoadmapLanguage
    {
        [Key]
        public Guid Id { get; private set; }

        public Guid UserId { get; private set; }

        [Required]
        [MaxLength(100)]
        public string RoadmapId { get; private set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Language { get; private set; } = ProgrammingLanguage.Cpp.ToString();

        [ForeignKey("UserId")]
        public virtual User User { get; private set; } = null!;

        private UserRoadmapLanguage() { }

        public UserRoadmapLanguage(Guid userId, string roadmapId, string language)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            RoadmapId = roadmapId;
            Language = language;
        }

        public void UpdateLanguage(string language)
        {
            Language = language;
        }
    }
}
