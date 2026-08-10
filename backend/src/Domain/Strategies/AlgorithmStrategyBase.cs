using System.Collections.Generic;
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

    /// <summary>Chuyển mảng predecessor (parent) thành dictionary nodeIndex → parentIndex.</summary>
    /// <remarks>
    /// Không dùng `Array.IndexOf` làm key: khi 2 node cùng parent thì IndexOf trả về
    /// cùng index đầu tiên → ToDictionary ném ArgumentException "duplicate key".
    /// </remarks>
    protected static Dictionary<int, int> BuildPrevDict(int?[] prev)
    {
        var result = new Dictionary<int, int>();
        for (var i = 0; i < prev.Length; i++)
        {
            if (prev[i].HasValue)
            {
                result[i] = prev[i]!.Value;
            }
        }
        return result;
    }
}
