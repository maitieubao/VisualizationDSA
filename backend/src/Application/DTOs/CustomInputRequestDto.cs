using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Application.DTOs;

public class CustomInputRequestDto
{
    [Required]
    public string AlgorithmId { get; set; } = string.Empty;

    [Required]
    public string RawInput { get; set; } = string.Empty;
}
