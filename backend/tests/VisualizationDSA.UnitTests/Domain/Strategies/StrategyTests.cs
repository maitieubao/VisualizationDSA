using FluentAssertions;
using VisualizationDSA.Domain.Strategies;
using Xunit;

namespace VisualizationDSA.UnitTests.Domain.Strategies;

public class SortingStrategyTests
{
    [Theory]
    [InlineData(typeof(BubbleSortStrategy), "bubble-sort")]
    [InlineData(typeof(SelectionSortStrategy), "selection-sort")]
    [InlineData(typeof(InsertionSortStrategy), "insertion-sort")]
    [InlineData(typeof(QuickSortStrategy), "quick-sort")]
    [InlineData(typeof(MergeSortStrategy), "merge-sort")]
    [InlineData(typeof(HeapSortStrategy), "heap-sort")]
    [InlineData(typeof(RadixSortStrategy), "radix-sort")]
    [InlineData(typeof(CountingSortStrategy), "counting-sort")]
    [InlineData(typeof(BucketSortStrategy), "bucket-sort")]
    public void GetMetadata_ReturnsCorrectAlgorithmId(Type strategyType, string expectedId)
    {
        var strategy = (IAlgorithmStrategy)Activator.CreateInstance(strategyType)!;
        var metadata = strategy.GetMetadata();

        strategy.AlgorithmId.Should().Be(expectedId);
        metadata.TimeComplexity.Should().NotBeNullOrWhiteSpace();
        metadata.SpaceComplexity.Should().NotBeNullOrWhiteSpace();
        metadata.Description.Should().NotBeNullOrWhiteSpace();
        metadata.PseudoCode.Should().NotBeEmpty();
    }

    [Theory]
    [InlineData(typeof(BubbleSortStrategy))]
    [InlineData(typeof(SelectionSortStrategy))]
    [InlineData(typeof(InsertionSortStrategy))]
    [InlineData(typeof(QuickSortStrategy))]
    [InlineData(typeof(MergeSortStrategy))]
    [InlineData(typeof(HeapSortStrategy))]
    [InlineData(typeof(RadixSortStrategy))]
    [InlineData(typeof(CountingSortStrategy))]
    [InlineData(typeof(BucketSortStrategy))]
    public void Execute_SortsArrayCorrectly(Type strategyType)
    {
        var strategy = (IAlgorithmStrategy)Activator.CreateInstance(strategyType)!;
        int[] input = { 5, 3, 8, 1, 9, 2, 7 };

        var frames = strategy.Execute(input);

        frames.Should().NotBeEmpty();
        var lastFrame = frames.Last();
        lastFrame.DataState.Should().BeInAscendingOrder();
    }

    [Theory]
    [InlineData(typeof(BubbleSortStrategy))]
    [InlineData(typeof(SelectionSortStrategy))]
    [InlineData(typeof(InsertionSortStrategy))]
    [InlineData(typeof(QuickSortStrategy))]
    [InlineData(typeof(MergeSortStrategy))]
    [InlineData(typeof(HeapSortStrategy))]
    [InlineData(typeof(RadixSortStrategy))]
    [InlineData(typeof(CountingSortStrategy))]
    [InlineData(typeof(BucketSortStrategy))]
    public void Execute_DoesNotModifyOriginalArray(Type strategyType)
    {
        var strategy = (IAlgorithmStrategy)Activator.CreateInstance(strategyType)!;
        int[] input = { 5, 3, 8, 1, 9 };
        int[] original = (int[])input.Clone();

        strategy.Execute(input);

        input.Should().Equal(original);
    }

    [Theory]
    [InlineData(typeof(BubbleSortStrategy))]
    [InlineData(typeof(SelectionSortStrategy))]
    [InlineData(typeof(InsertionSortStrategy))]
    [InlineData(typeof(QuickSortStrategy))]
    [InlineData(typeof(RadixSortStrategy))]
    [InlineData(typeof(BucketSortStrategy))]
    public void Execute_HandlesEmptyArray_NoException(Type strategyType)
    {
        var strategy = (IAlgorithmStrategy)Activator.CreateInstance(strategyType)!;

        Action act = () => strategy.Execute(Array.Empty<int>());
        act.Should().NotThrow();
    }

    [Theory]
    [InlineData(typeof(BubbleSortStrategy))]
    [InlineData(typeof(SelectionSortStrategy))]
    [InlineData(typeof(InsertionSortStrategy))]
    [InlineData(typeof(QuickSortStrategy))]
    [InlineData(typeof(MergeSortStrategy))]
    [InlineData(typeof(HeapSortStrategy))]
    [InlineData(typeof(RadixSortStrategy))]
    [InlineData(typeof(CountingSortStrategy))]
    [InlineData(typeof(BucketSortStrategy))]
    public void Execute_HandlesSingleElement(Type strategyType)
    {
        var strategy = (IAlgorithmStrategy)Activator.CreateInstance(strategyType)!;

        var frames = strategy.Execute(new[] { 42 });

        frames.Should().NotBeEmpty();
        frames.Last().DataState.Should().Equal(42);
    }

    [Theory]
    [InlineData(typeof(BubbleSortStrategy))]
    [InlineData(typeof(SelectionSortStrategy))]
    [InlineData(typeof(InsertionSortStrategy))]
    [InlineData(typeof(QuickSortStrategy))]
    [InlineData(typeof(MergeSortStrategy))]
    [InlineData(typeof(HeapSortStrategy))]
    [InlineData(typeof(RadixSortStrategy))]
    [InlineData(typeof(CountingSortStrategy))]
    [InlineData(typeof(BucketSortStrategy))]
    public void Execute_HandlesAlreadySorted(Type strategyType)
    {
        var strategy = (IAlgorithmStrategy)Activator.CreateInstance(strategyType)!;
        int[] input = { 1, 2, 3, 4, 5 };

        var frames = strategy.Execute(input);

        frames.Should().NotBeEmpty();
        frames.Last().DataState.Should().Equal(1, 2, 3, 4, 5);
    }

    [Theory]
    [InlineData(typeof(BubbleSortStrategy))]
    [InlineData(typeof(SelectionSortStrategy))]
    [InlineData(typeof(InsertionSortStrategy))]
    [InlineData(typeof(QuickSortStrategy))]
    [InlineData(typeof(MergeSortStrategy))]
    [InlineData(typeof(HeapSortStrategy))]
    [InlineData(typeof(RadixSortStrategy))]
    [InlineData(typeof(CountingSortStrategy))]
    [InlineData(typeof(BucketSortStrategy))]
    public void Execute_HandlesReverseSorted(Type strategyType)
    {
        var strategy = (IAlgorithmStrategy)Activator.CreateInstance(strategyType)!;
        int[] input = { 5, 4, 3, 2, 1 };

        var frames = strategy.Execute(input);

        frames.Should().NotBeEmpty();
        frames.Last().DataState.Should().BeInAscendingOrder();
    }
}

public class SearchStrategyTests
{
    [Theory]
    [InlineData(typeof(LinearSearchStrategy), "linear-search")]
    [InlineData(typeof(BinarySearchStrategy), "binary-search")]
    public void GetMetadata_ReturnsCorrectAlgorithmId(Type strategyType, string expectedId)
    {
        var strategy = (IAlgorithmStrategy)Activator.CreateInstance(strategyType)!;
        var metadata = strategy.GetMetadata();

        strategy.AlgorithmId.Should().Be(expectedId);
        metadata.TimeComplexity.Should().NotBeNullOrWhiteSpace();
        metadata.PseudoCode.Should().NotBeEmpty();
    }

    [Theory]
    [InlineData(typeof(LinearSearchStrategy))]
    [InlineData(typeof(BinarySearchStrategy))]
    public void Execute_ReturnsFrames(Type strategyType)
    {
        var strategy = (IAlgorithmStrategy)Activator.CreateInstance(strategyType)!;
        int[] input = { 1, 3, 5, 7, 9, 11, 13 };

        var frames = strategy.Execute(input);

        frames.Should().NotBeEmpty();
    }
}

public class DataStructureStrategyTests
{
    [Theory]
    [InlineData(typeof(StackStrategy), "stack")]
    [InlineData(typeof(QueueStrategy), "queue")]
    [InlineData(typeof(BSTStrategy), "bst")]
    public void GetMetadata_ReturnsCorrectAlgorithmId(Type strategyType, string expectedId)
    {
        var strategy = (IAlgorithmStrategy)Activator.CreateInstance(strategyType)!;
        var metadata = strategy.GetMetadata();

        strategy.AlgorithmId.Should().Be(expectedId);
        metadata.PseudoCode.Should().NotBeEmpty();
    }

    [Theory]
    [InlineData(typeof(StackStrategy))]
    [InlineData(typeof(QueueStrategy))]
    [InlineData(typeof(BSTStrategy))]
    public void Execute_ReturnsFrames(Type strategyType)
    {
        var strategy = (IAlgorithmStrategy)Activator.CreateInstance(strategyType)!;
        int[] input = { 10, 20, 30, 40, 50 };

        var frames = strategy.Execute(input);

        frames.Should().NotBeEmpty();
    }
}

public class GraphStrategyTests
{
    [Theory]
    [InlineData(typeof(BFSStrategy), "bfs")]
    [InlineData(typeof(DFSStrategy), "dfs")]
    [InlineData(typeof(DijkstraStrategy), "dijkstra")]
    [InlineData(typeof(BellmanFordStrategy), "bellman-ford")]
    [InlineData(typeof(KruskalStrategy), "kruskal")]
    [InlineData(typeof(PrimStrategy), "prim")]
    [InlineData(typeof(AStarStrategy), "a-star")]
    public void GetMetadata_ReturnsCorrectAlgorithmId(Type strategyType, string expectedId)
    {
        var strategy = (IAlgorithmStrategy)Activator.CreateInstance(strategyType)!;
        var metadata = strategy.GetMetadata();

        strategy.AlgorithmId.Should().Be(expectedId);
        metadata.PseudoCode.Should().NotBeEmpty();
    }

    [Theory]
    [InlineData(typeof(BFSStrategy))]
    [InlineData(typeof(DFSStrategy))]
    [InlineData(typeof(DijkstraStrategy))]
    public void Execute_ReturnsFrames(Type strategyType)
    {
        var strategy = (IAlgorithmStrategy)Activator.CreateInstance(strategyType)!;
        int[] input = { 50, 30, 70, 20, 40, 60, 80 };

        var frames = strategy.Execute(input);

        frames.Should().NotBeEmpty();
    }

    [Theory]
    [InlineData(typeof(KruskalStrategy))]
    [InlineData(typeof(BellmanFordStrategy))]
    [InlineData(typeof(PrimStrategy))]
    [InlineData(typeof(AStarStrategy))]
    public void Execute_ReturnsFrames_GraphAlgorithms(Type strategyType)
    {
        var strategy = (IAlgorithmStrategy)Activator.CreateInstance(strategyType)!;
        int[] input = { 100, 200, 300, 400, 500, 600, 700, 800, 900 };

        var frames = strategy.Execute(input);

        frames.Should().NotBeEmpty();
        foreach (var frame in frames)
        {
            if (frame.Predecessors == null) continue;
            var keys = frame.Predecessors.Keys.ToList();
            keys.Distinct().Should().HaveCount(keys.Count, $"Predecessors của {strategy.AlgorithmId} chứa key trùng lặp");
        }
    }
}

public class OtherStrategyTests
{
    [Theory]
    [InlineData(typeof(SlidingWindowStrategy), "sliding-window")]
    [InlineData(typeof(MonotonicStackStrategy), "monotonic-stack")]
    public void GetMetadata_ReturnsCorrectAlgorithmId(Type strategyType, string expectedId)
    {
        var strategy = (IAlgorithmStrategy)Activator.CreateInstance(strategyType)!;
        var metadata = strategy.GetMetadata();

        strategy.AlgorithmId.Should().Be(expectedId);
        metadata.PseudoCode.Should().NotBeEmpty();
    }

    [Theory]
    [InlineData(typeof(SlidingWindowStrategy))]
    [InlineData(typeof(MonotonicStackStrategy))]
    public void Execute_ReturnsFrames(Type strategyType)
    {
        var strategy = (IAlgorithmStrategy)Activator.CreateInstance(strategyType)!;
        int[] input = { 1, 3, 2, 6, -1, 4, 1, 8, 2 };

        var frames = strategy.Execute(input);

        frames.Should().NotBeEmpty();
    }
}
