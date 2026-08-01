using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;





public interface IAlgorithmStrategy
{
    string AlgorithmId { get; }
    string Name { get; }
    string Category { get; }
    AlgorithmMetadata GetMetadata();
    List<FrameDTO> Execute(int[] inputData, CancellationToken cancellationToken = default);
}
