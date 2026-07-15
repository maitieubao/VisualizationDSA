using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

public class CountingSortStrategy : AlgorithmStrategyBase
{
    private const int MaxInputSize = 50;

    public override string AlgorithmId => "counting-sort";
    public override string Name => "Counting Sort (Sắp xếp đếm)";
    public override string Category => "Sorting";

    public override AlgorithmMetadata GetMetadata()
    {
        return new AlgorithmMetadata
        {
            TimeComplexity = "O(N + K)",
            SpaceComplexity = "O(K)",
            Description = "Counting Sort đếm tần suất xuất hiện của mỗi giá trị, tính tổng cộng dồn (prefix sum), rồi đặt phần tử vào đúng vị trí trong mảng kết quả. Ổn định (Stable).",
            PseudoCode = new List<string>
            {
                "countingSort(A):",
                "  min = min(A), max = max(A)",
                "  count[0..max-min] = 0",
                "  for each elem in A:",
                "    count[elem - min]++",
                "  for i from 1 to K:",
                "    count[i] += count[i-1]",
                "  for i from N-1 downto 0:",
                "    count[A[i] - min]--",
                "    output[count[A[i]-min]] = A[i]",
                "  A = output"
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
        int n = arr.Length;
        int minVal = arr.Min();
        int maxVal = arr.Max();
        int range = maxVal - minVal + 1;
        int[] count = new int[range];

        CaptureState(arr, 0, $"Khởi tạo Counting Sort. Phạm vi giá trị: [{minVal}..{maxVal}], K = {range}.");

        // Phase 1: Count frequencies
        for (int i = 0; i < n; i++)
        {
            cancellationToken.ThrowIfCancellationRequested();
            int idx = arr[i] - minVal;
            count[idx]++;

            CaptureState(
                arr, 3,
                $"Đếm phần tử A[{i}] = {arr[i]}. Count[{arr[i]} - {minVal}] = Count[{idx}] = {count[idx]}.",
                compares: new List<int> { i });
        }

        // Phase 2: Prefix sums
        CaptureState(arr, 5, "Bắt đầu tính tổng cộng dồn (Prefix Sum).");

        for (int i = 1; i < range; i++)
        {
            cancellationToken.ThrowIfCancellationRequested();
            count[i] += count[i - 1];
        }

        CaptureState(arr, 5, "Tổng cộng dồn hoàn tất.");

        // Phase 3: Build output (right-to-left for stability)
        int[] output = new int[n];

        CaptureState(arr, 7, "Bắt đầu dựng mảng kết quả. Duyệt từ phải sang trái (Stable Sort).");

        for (int i = n - 1; i >= 0; i--)
        {
            cancellationToken.ThrowIfCancellationRequested();
            int idx = arr[i] - minVal;
            count[idx]--;
            int outputIdx = count[idx];
            output[outputIdx] = arr[i];

            CaptureState(
                output, 9,
                $"Đặt A[{i}] = {arr[i]} vào Output[{outputIdx}].",
                swaps: new List<int> { outputIdx });
        }

        CaptureState(
            output, 0,
            "Mảng đã được sắp xếp tăng dần hoàn chỉnh!",
            sorted: Enumerable.Range(0, n).ToList());

        return _frames;
    }
}
