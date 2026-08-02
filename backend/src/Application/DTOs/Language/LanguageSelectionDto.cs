using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Application.DTOs.Language
{
    public class LanguageSelectionDto
    {
        [Required]
        [MaxLength(20)]
        public string Language { get; set; } = string.Empty;
    }
}
