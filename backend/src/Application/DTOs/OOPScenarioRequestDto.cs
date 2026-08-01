using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Application.DTOs;




public class OOPScenarioRequestDto
{
    
    
    
    [Required]
    public string ScenarioId { get; set; } = string.Empty;
}
