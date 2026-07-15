using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

public class MergeSortStrategy : AlgorithmStrategyBase
{
    private const int MaxInputSize = 50;

    public override string AlgorithmId => "merge-sort";
    public override string Name => "Merge Sort (Sắp xếp trộn)";
    public override string Category => "Sorting";

    public override AlgorithmMetadata GetMetadata()
    {
        return new AlgorithmMetadata
        {
            TimeComplexity = "O(N log N)",
            SpaceComplexity = "O(N)",
            Description = "Merge Sort chia đôi mảng đệ quy cho đến khi chỉ còn 1 phần tử, rồi gộp (merge) các mảng con đã sắp xếp lại thành mảng lớn hơn.",
            PseudoCode = new List<string>
            {
                "mergeSort(A, left, right):",
                "  if left >= right: return",
                "  mid = (left + right) / 2",
                "  mergeSort(A, left, mid)",
                "  mergeSort(A, mid+1, right)",
                "  merge(A, left, mid, right)",
                "merge(A, left, mid, right):",
                "  copy left/right halves",
                "  compare & merge back into A"
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

        CaptureState(arr, 0, "Khởi tạo Merge Sort — chia đôi mảng rồi gộp lại.");

        MergeSort(arr, 0, arr.Length - 1, sortedIndices, cancellationToken);

        CaptureState(
            arr, 0,
            "Mảng đã được sắp xếp tăng dần hoàn chỉnh!",
            sorted: Enumerable.Range(0, arr.Length).ToList());

        return _frames;
    }

    private void MergeSort(int[] arr, int left, int right, List<int> sortedIndices, CancellationToken ct)
    {
        if (left >= right)
        {
            CaptureState(
                arr, 1,
                $"Trường cơ sở: mảng con [{left}] gồm 1 phần tử ({arr[left]}).",
                sorted: new List<int>(sortedIndices));
            return;
        }

        ct.ThrowIfCancellationRequested();

        int mid = (left + right) / 2;

        CaptureState(
            arr, 2,
            $"Chia mảng [{left}..{right}] tại chỉ số giữa [{mid}].",
            sorted: new List<int>(sortedIndices));

        MergeSort(arr, left, mid, sortedIndices, ct);
        MergeSort(arr, mid + 1, right, sortedIndices, ct);
        Merge(arr, left, mid, right, sortedIndices, ct);
    }

    private void Merge(int[] arr, int left, int mid, int right, List<int> sortedIndices, CancellationToken ct)
    {
        int[] leftArr = arr[left..(mid + 1)];
        int[] rightArr = arr[(mid + 1)..(right + 1)];
        int i = 0, j = 0, k = left;

        while (i < leftArr.Length && j < rightArr.Length)
        {
            ct.ThrowIfCancellationRequested();

            CaptureState(
                arr, 7,
                $"So sánh L[{i}] = {leftArr[i]} với R[{j}] = {rightArr[j]}.",
                compares: new List<int> { left + i, mid + 1 + j },
                sorted: new List<int>(sortedIndices));

            if (leftArr[i] <= rightArr[j])
            {
                arr[k] = leftArr[i];
                i++;
            }
            else
            {
                arr[k] = rightArr[j];
                j++;
            }

            CaptureState(
                arr, 8,
                $"Ghi đè A[{k}] = {arr[k]}.",
                swaps: new List<int> { k },
                sorted: new List<int>(sortedIndices));
            k++;
        }

        while (i < leftArr.Length)
        {
            ct.ThrowIfCancellationRequested();
            arr[k] = leftArr[i];

            CaptureState(
                arr, 8,
                $"Sao chép phần thừa L[{i}] = {leftArr[i]} → A[{k}].",
                swaps: new List<int> { k },
                sorted: new List<int>(sortedIndices));
            i++;
            k++;
        }

        while (j < rightArr.Length)
        {
            ct.ThrowIfCancellationRequested();
            arr[k] = rightArr[j];

            CaptureState(
                arr, 8,
                $"Sao chép phần thừa R[{j}] = {rightArr[j]} → A[{k}].",
                swaps: new List<int> { k },
                sorted: new List<int>(sortedIndices));
            j++;
            k++;
        }

        for (int x = left; x <= right; x++)
        {
            if (!sortedIndices.Contains(x))
                sortedIndices.Add(x);
        }
    }
}
