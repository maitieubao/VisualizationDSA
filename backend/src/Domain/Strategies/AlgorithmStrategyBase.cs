using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;





public abstract class AlgorithmStrategyBase : AlgorithmBase, IAlgorithmStrategy
{
    public abstract string AlgorithmId { get; }
    public abstract string Name { get; }
    public abstract string Category { get; }
    public abstract AlgorithmMetadata GetMetadata();
    public abstract List<FrameDTO> Execute(int[] inputData, CancellationToken cancellationToken = default);
}
