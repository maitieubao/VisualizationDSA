using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

/// <summary>
/// Interface lõi cho mọi thuật toán trong hệ thống Plugin.
/// Tuân thủ Strategy Pattern + Open/Closed Principle (SOLID).
/// </summary>
public interface IAlgorithmStrategy
{
    string AlgorithmId { get; }
    string Name { get; }
    string Category { get; }
    AlgorithmMetadata GetMetadata();
    List<FrameDTO> Execute(int[] inputData, CancellationToken cancellationToken = default);
}
