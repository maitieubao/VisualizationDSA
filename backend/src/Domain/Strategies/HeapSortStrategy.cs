using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

public class HeapSortStrategy : AlgorithmStrategyBase
{
    private const int MaxInputSize = 50;

    public override string AlgorithmId => "heap-sort";
    public override string Name => "Heap Sort (Sắp xếp đống)";
    public override string Category => "Sorting";

    public override AlgorithmMetadata GetMetadata()
    {
        return new AlgorithmMetadata
        {
            TimeComplexity = "O(N log N)",
            SpaceComplexity = "O(1)",
            Description = "Heap Sort xây dựng Max-Heap từ mảng, sau đó lần lượt lấy phần tử lớn nhất (root) đặt vào cuối mảng và tái cấu trúc heap.",
            PseudoCode = new List<string>
            {
                "heapSort(A):",
                "  buildMaxHeap(A)",
                "  for i from N-1 downto 1:",
                "    swap(A[0], A[i])",
                "    heapify(A, 0, i)",
                "heapify(A, i, heapSize):",
                "  largest = i",
                "  left = 2*i+1, right = 2*i+2",
                "  if left < heapSize and A[left] > A[largest]:",
                "    largest = left",
                "  if right < heapSize and A[right] > A[largest]:",
                "    largest = right",
                "  if largest != i:",
                "    swap(A[i], A[largest])",
                "    heapify(A, largest, heapSize)"
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
        List<int> sortedIndices = new();

        CaptureState(arr, 0, "Xây dựng Max-Heap ban đầu từ mảng.");

        for (int i = n / 2 - 1; i >= 0; i--)
        {
            cancellationToken.ThrowIfCancellationRequested();
            Heapify(arr, n, i, sortedIndices, cancellationToken);
        }

        CaptureState(
            arr, 1,
            $"Max-Heap hoàn thành! Root = {arr[0]}.",
            sorted: new List<int>(sortedIndices));

        for (int i = n - 1; i > 0; i--)
        {
            cancellationToken.ThrowIfCancellationRequested();

            (arr[0], arr[i]) = (arr[i], arr[0]);
            sortedIndices.Add(i);

            CaptureState(
                arr, 3,
                $"Đưa phần tử lớn nhất {arr[i]} về vị trí [{i}].",
                swaps: new List<int> { 0, i },
                sorted: new List<int>(sortedIndices));

            Heapify(arr, i, 0, sortedIndices, cancellationToken);
        }

        sortedIndices.Add(0);
        CaptureState(
            arr, 0,
            "Mảng đã được sắp xếp tăng dần hoàn chỉnh!",
            sorted: new List<int>(sortedIndices));

        return _frames;
    }

    private void Heapify(int[] arr, int heapSize, int i, List<int> sortedIndices, CancellationToken ct)
    {
        int largest = i;
        int left = 2 * i + 1;
        int right = 2 * i + 2;

        if (left < heapSize)
        {
            ct.ThrowIfCancellationRequested();

            CaptureState(
                arr, 8,
                $"So sánh node[{largest}] = {arr[largest]} với left[{left}] = {arr[left]}.",
                compares: new List<int> { largest, left },
                sorted: new List<int>(sortedIndices));

            if (arr[left] > arr[largest])
                largest = left;
        }

        if (right < heapSize)
        {
            ct.ThrowIfCancellationRequested();

            CaptureState(
                arr, 10,
                $"So sánh node[{largest}] = {arr[largest]} với right[{right}] = {arr[right]}.",
                compares: new List<int> { largest, right },
                sorted: new List<int>(sortedIndices));

            if (arr[right] > arr[largest])
                largest = right;
        }

        if (largest != i)
        {
            (arr[i], arr[largest]) = (arr[largest], arr[i]);

            CaptureState(
                arr, 13,
                $"Hoán vị node[{i}] ↔ node[{largest}] để duy trì tính chất Max-Heap.",
                swaps: new List<int> { i, largest },
                sorted: new List<int>(sortedIndices));

            Heapify(arr, heapSize, largest, sortedIndices, ct);
        }
    }
}
