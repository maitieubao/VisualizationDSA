using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

public class RadixSortStrategy : AlgorithmStrategyBase
{
    private const int MaxInputSize = 50;

    public override string AlgorithmId => "radix-sort";
    public override string Name => "Radix Sort (Sắp xếp theo cơ số)";
    public override string Category => "Sorting";

    public override AlgorithmMetadata GetMetadata()
    {
        return new AlgorithmMetadata
        {
            TimeComplexity = "O(d × N)",
            SpaceComplexity = "O(N + k)",
            Description = "Radix Sort sắp xếp các phần tử bằng cách xử lý từng chữ số (digit) từ hàng đơn vị đến hàng cao nhất. Sử dụng Counting Sort ổn định làm thủ tục con cho mỗi hàng.",
            PseudoCode = new List<string>
            {
                "radixSort(A):",
                "  maxVal = max(A)",
                "  for exp = 1; maxVal/exp > 0; exp *= 10:",
                "    countingSortByDigit(A, exp)",
                "countingSortByDigit(A, exp):",
                "  buckets[0..9] = []",
                "  for each elem in A:",
                "    digit = (elem / exp) % 10",
                "    buckets[digit].append(elem)",
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
        int maxVal = arr.Length > 0 ? arr.Max() : 0;
        if (maxVal <= 0) maxVal = 1;

        CaptureState(arr, 0, "Khởi tạo Radix Sort — sắp xếp theo chữ số từ hàng đơn vị.");

        for (int exp = 1; maxVal / exp > 0; exp *= 10)
        {
            cancellationToken.ThrowIfCancellationRequested();

            CaptureState(
                arr, 2,
                $"Bắt đầu sắp xếp theo chữ số hàng {exp}.");

            CountingSortByDigit(arr, exp, cancellationToken);

            CaptureState(
                arr, 2,
                $"Hoàn thành sắp xếp hàng {exp}. Kết quả: [{string.Join(", ", arr)}].");
        }

        CaptureState(
            arr, 0,
            "Mảng đã được sắp xếp tăng dần hoàn chỉnh!",
            sorted: Enumerable.Range(0, arr.Length).ToList());

        return _frames;
    }

    private void CountingSortByDigit(int[] arr, int exp, CancellationToken ct)
    {
        int n = arr.Length;
        int[] output = new int[n];
        int[] count = new int[10];

        for (int i = 0; i < n; i++)
        {
            ct.ThrowIfCancellationRequested();
            int digit = (arr[i] / exp) % 10;
            count[digit]++;

            CaptureState(
                arr, 6,
                $"Đưa {arr[i]} vào Hộp [{digit}] (chữ số hàng {exp}). Count[{digit}] = {count[digit]}.",
                compares: new List<int> { i });
        }

        for (int i = 1; i < 10; i++)
        {
            count[i] += count[i - 1];
        }

        for (int i = n - 1; i >= 0; i--)
        {
            ct.ThrowIfCancellationRequested();
            int digit = (arr[i] / exp) % 10;
            count[digit]--;
            output[count[digit]] = arr[i];
        }

        for (int i = 0; i < n; i++)
        {
            arr[i] = output[i];
        }
    }
}
