using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Application.DTOs;

/// <summary>
/// DTO chung cho yêu cầu thực thi kịch bản concept (SOLID, Design Patterns, DI Container).
/// </summary>
public class ConceptScenarioRequestDto
{
    [Required]
    public string ScenarioId { get; set; } = string.Empty;
}
