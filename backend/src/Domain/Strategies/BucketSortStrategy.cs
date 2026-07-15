using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

public class BucketSortStrategy : AlgorithmStrategyBase
{
    private const int MaxInputSize = 50;
    private const int BucketCount = 4;

    public override string AlgorithmId => "bucket-sort";
    public override string Name => "Bucket Sort (Sắp xếp theo xô)";
    public override string Category => "Sorting";

    public override AlgorithmMetadata GetMetadata()
    {
        return new AlgorithmMetadata
        {
            TimeComplexity = "O(N + K)",
            SpaceComplexity = "O(N + K)",
            Description = "Bucket Sort phân phối các phần tử vào 4 xô (bucket) theo phạm vi giá trị [0-25), [25-50), [50-75), [75-100]. Sắp xếp từng xô bằng Insertion Sort rồi nối lại.",
            PseudoCode = new List<string>
            {
                "bucketSort(A):",
                "  buckets[0..3] = []",
                "  for each elem in A:",
                "    idx = getBucketIndex(elem)",
                "    buckets[idx].append(elem)",
                "  for each bucket in buckets:",
                "    insertionSort(bucket)",
                "  A = flatten(buckets)"
            }
        };
    }

    public override List<FrameDTO> Execute(int[] inputData, CancellationToken cancellationToken = default)
    {
        InitializeRecorder();

        if (inputData.Length > MaxInputSize)
        {
            throw new ArgumentException(
                $"Kích thước mảng vượt quá giới hạn an toàn (tối đa {MaxInputSize} phần tử).");
        }

        int[] arr = (int[])inputData.Clone();
        List<List<int>> buckets = new();
        for (int i = 0; i < BucketCount; i++)
            buckets.Add(new List<int>());

        CaptureState(arr, 0, "Khởi tạo Bucket Sort. Chia phạm vi giá trị thành 4 xô: [0-25), [25-50), [50-75), [75-100].");

        // Phase 1: Distribute
        for (int i = 0; i < arr.Length; i++)
        {
            cancellationToken.ThrowIfCancellationRequested();
            int bucketIdx = GetBucketIndex(arr[i]);
            buckets[bucketIdx].Add(arr[i]);

            CaptureState(
                arr, 3,
                $"Phân phối A[{i}] = {arr[i]} vào Bucket {bucketIdx}.",
                compares: new List<int> { i });
        }

        // Phase 2: Sort each bucket with insertion sort
        for (int b = 0; b < BucketCount; b++)
        {
            cancellationToken.ThrowIfCancellationRequested();
            var bucket = buckets[b];
            if (bucket.Count <= 1) continue;

            CaptureState(
                arr, 5,
                $"Sắp xếp Bucket {b} ({bucket.Count} phần tử) bằng Insertion Sort.");

            for (int i = 1; i < bucket.Count; i++)
            {
                int key = bucket[i];
                int j = i - 1;
                while (j >= 0 && bucket[j] > key)
                {
                    cancellationToken.ThrowIfCancellationRequested();
                    bucket[j + 1] = bucket[j];
                    j--;
                }
                bucket[j + 1] = key;
            }

            CaptureState(
                arr, 5,
                $"Bucket {b} đã sắp xếp: [{string.Join(", ", bucket)}].");
        }

        // Phase 3: Collect
        int idx = 0;
        for (int b = 0; b < BucketCount; b++)
        {
            foreach (int val in buckets[b])
            {
                cancellationToken.ThrowIfCancellationRequested();
                arr[idx] = val;

                CaptureState(
                    arr, 7,
                    $"Thu hồi {val} từ Bucket {b} → A[{idx}].",
                    swaps: new List<int> { idx });
                idx++;
            }
        }

        CaptureState(
            arr, 0,
            "Mảng đã được sắp xếp tăng dần hoàn chỉnh!",
            sorted: Enumerable.Range(0, arr.Length).ToList());

        return _frames;
    }

    private static int GetBucketIndex(int val)
    {
        if (val < 25) return 0;
        if (val < 50) return 1;
        if (val < 75) return 2;
        return 3;
    }
}
