using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Application.DTOs;

/// <summary>
/// DTO cho yêu cầu thực thi kịch bản System Design từ client.
/// </summary>
public class SystemDesignRequestDto
{
    /// <summary>
    /// Mã kịch bản: "round-robin-lb", "server-failover", "db-replication", "full-demo".
    /// </summary>
    [Required]
    public string ScenarioId { get; set; } = string.Empty;

    /// <summary>
    /// Độ trễ sao chép tùy chỉnh (ms). Mặc định 1000ms.
    /// </summary>
    [Range(100, 5000)]
    public int ReplicationLagMs { get; set; } = 1000;
}
