using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Application.DTOs;




public class SystemDesignRequestDto
{
    
    
    
    [Required]
    public string ScenarioId { get; set; } = string.Empty;

    
    
    
    [Range(100, 5000)]
    public int ReplicationLagMs { get; set; } = 1000;
}
