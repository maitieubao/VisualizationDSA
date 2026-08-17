using System;

namespace VisualizationDSA.Domain.Entities
{
    /// <summary>
    /// F6 (FR-3.10) — Yêu thích mô phỏng:
    /// SimulationKey là id trong ALGORITHM_CATALOG (vd "bubble-sort").
    /// Mỗi người dùng chỉ yêu thích 1 lần cho mỗi simulation (unique UserId + SimulationKey).
    /// </summary>
    public class Favorite
    {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }
        public string SimulationKey { get; private set; } = string.Empty;
        public string? InputJson { get; private set; }
        public DateTime CreatedAt { get; private set; }

        public virtual User User { get; private set; } = null!;

        private Favorite() { }

        public Favorite(Guid userId, string simulationKey, string? inputJson = null)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            SimulationKey = string.IsNullOrWhiteSpace(simulationKey)
                ? throw new ArgumentException("SimulationKey cannot be empty.", nameof(simulationKey))
                : simulationKey;
            InputJson = inputJson;
            CreatedAt = DateTime.UtcNow;
        }
    }
}
