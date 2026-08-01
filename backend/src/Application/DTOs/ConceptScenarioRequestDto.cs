using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Application.DTOs;




public class ConceptScenarioRequestDto
{
    [Required]
    public string ScenarioId { get; set; } = string.Empty;
}
