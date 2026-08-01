using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Application.DTOs;




public class AlgorithmRequestDto
{
    [Required]
    public string AlgorithmId { get; set; } = string.Empty;

    [Required]
    public string DataType { get; set; } = "array";

    [Required]
    [MinLength(1)]
    public int[] InputData { get; set; } = Array.Empty<int>();
}
