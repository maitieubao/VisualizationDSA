using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

public class QuickSortStrategy : AlgorithmStrategyBase
{
    private const int MaxInputSize = 50;

    public override string AlgorithmId => "quick-sort";
    public override string Name => "Quick Sort (Sắp xếp nhanh)";
    public override string Category => "Sorting";

    public override AlgorithmMetadata GetMetadata()
    {
        return new AlgorithmMetadata
        {
            TimeComplexity = "O(N log N)",
            SpaceComplexity = "O(log N)",
            Description = "Quick Sort chọn phần tử chốt (pivot), phân hoạch mảng thành hai nửa: nhỏ hơn và lớn hơn pivot, rồi đệ quy sắp xếp từng nửa.",
            PseudoCode = new List<string>
            {
                "quickSort(A, low, high):",
                "  if low < high:",
                "    pi = partition(A, low, high)",
                "    quickSort(A, low, pi - 1)",
                "    quickSort(A, pi + 1, high)",
                "partition(A, low, high):",
                "  pivot = A[high]",
                "  i = low - 1",
                "  for j from low to high-1:",
                "    if A[j] <= pivot:",
                "      i++; swap(A[i], A[j])",
                "  swap(A[i+1], A[high])",
                "  return i + 1"
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
        List<int> sortedIndices = new();

        CaptureState(arr, 0, "Khởi tạo Quick Sort — phân hoạch chia để trị.");

        QuickSort(arr, 0, arr.Length - 1, sortedIndices, cancellationToken);

        CaptureState(
            arr, 0,
            "Mảng đã được sắp xếp tăng dần hoàn chỉnh!",
            sorted: Enumerable.Range(0, arr.Length).ToList());

        return _frames;
    }

    private void QuickSort(int[] arr, int low, int high, List<int> sortedIndices, CancellationToken ct)
    {
        if (low >= high)
        {
            if (low == high && !sortedIndices.Contains(low))
            {
                sortedIndices.Add(low);
            }
            return;
        }

        ct.ThrowIfCancellationRequested();
        int pi = Partition(arr, low, high, sortedIndices, ct);
        QuickSort(arr, low, pi - 1, sortedIndices, ct);
        QuickSort(arr, pi + 1, high, sortedIndices, ct);
    }

    private int Partition(int[] arr, int low, int high, List<int> sortedIndices, CancellationToken ct)
    {
        int pivot = arr[high];

        CaptureState(
            arr, 6,
            $"Chọn Pivot = {pivot} tại index [{high}].",
            compares: new List<int> { high },
            sorted: new List<int>(sortedIndices));

        int i = low - 1;

        for (int j = low; j < high; j++)
        {
            ct.ThrowIfCancellationRequested();

            CaptureState(
                arr, 8,
                $"So sánh A[{j}] = {arr[j]} với Pivot = {pivot}.",
                compares: new List<int> { j, high },
                sorted: new List<int>(sortedIndices));

            if (arr[j] <= pivot)
            {
                i++;
                if (i != j)
                {
                    (arr[i], arr[j]) = (arr[j], arr[i]);

                    CaptureState(
                        arr, 10,
                        $"A[{j}] <= Pivot → Hoán vị A[{i}] ↔ A[{j}].",
                        swaps: new List<int> { i, j },
                        sorted: new List<int>(sortedIndices));
                }
            }
        }

        (arr[i + 1], arr[high]) = (arr[high], arr[i + 1]);
        int pivotIdx = i + 1;
        sortedIndices.Add(pivotIdx);

        CaptureState(
            arr, 11,
            $"Đặt Pivot về đúng vị trí [{pivotIdx}]. Pivot = {arr[pivotIdx]} đã yên vị.",
            swaps: new List<int> { pivotIdx, high },
            sorted: new List<int>(sortedIndices));

        return pivotIdx;
    }
}
