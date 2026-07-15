using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Application.DTOs;

/// <summary>
/// DTO cho yêu cầu thực thi kịch bản OOP Concepts từ client.
/// </summary>
public class OOPScenarioRequestDto
{
    /// <summary>
    /// Mã kịch bản OOP: "encapsulation", "inheritance", "polymorphism", "abstraction".
    /// </summary>
    [Required]
    public string ScenarioId { get; set; } = string.Empty;
}
