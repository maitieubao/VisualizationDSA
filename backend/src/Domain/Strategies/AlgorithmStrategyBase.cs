using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

/// <summary>
/// Lớp cơ sở trừu tượng cho mọi thuật toán Strategy.
/// Kế thừa AlgorithmBase (State Recorder) và triển khai IAlgorithmStrategy.
/// </summary>
public abstract class AlgorithmStrategyBase : AlgorithmBase, IAlgorithmStrategy
{
    public abstract string AlgorithmId { get; }
    public abstract string Name { get; }
    public abstract string Category { get; }
    public abstract AlgorithmMetadata GetMetadata();
    public abstract List<FrameDTO> Execute(int[] inputData, CancellationToken cancellationToken = default);
}
