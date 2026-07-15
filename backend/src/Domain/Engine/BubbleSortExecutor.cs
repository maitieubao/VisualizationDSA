namespace VisualizationDSA.Domain.Engine;

/// <summary>
/// Bộ thực thi Bubble Sort kế thừa AlgorithmBase.
/// Sinh chuỗi FrameDTO mô tả từng bước: compare → swap → sorted mark.
/// </summary>
public class BubbleSortExecutor : AlgorithmBase
{
    private const int MaxInputSize = 50;

    public AlgorithmResult Execute(int[] inputData)
    {
        if (inputData.Length > MaxInputSize)
        {
            throw new ArgumentException(
                $"Kích thước mảng vượt quá giới hạn an toàn (tối đa {MaxInputSize} phần tử).");
        }

        InitializeRecorder();

        var result = new AlgorithmResult
        {
            AlgorithmId = "bubble-sort",
            PseudoCode = new List<string>
            {
                "for i from 0 to N-1",
                "  for j from 0 to N-i-2",
                "    if A[j] > A[j+1]",
                "      swap(A[j], A[j+1])"
            }
        };

        int[] arr = (int[])inputData.Clone();
        int n = arr.Length;
        List<int> sortedIndices = new();

        CaptureState(arr, 0, "Bắt đầu khởi chạy giải thuật Bubble Sort.");

        for (int i = 0; i < n - 1; i++)
        {
            for (int j = 0; j < n - i - 1; j++)
            {
                CaptureState(
                    arr,
                    2,
                    $"So sánh giá trị tại index {j} ({arr[j]}) và index {j + 1} ({arr[j + 1]})",
                    compares: new List<int> { j, j + 1 },
                    sorted: new List<int>(sortedIndices)
                );

                if (arr[j] > arr[j + 1])
                {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;

                    CaptureState(
                        arr,
                        3,
                        $"Hoán đổi vị trí của {arr[j + 1]} và {arr[j]} vì {arr[j + 1]} > {arr[j]}",
                        swaps: new List<int> { j, j + 1 },
                        sorted: new List<int>(sortedIndices)
                    );
                }
            }

            sortedIndices.Add(n - i - 1);
            CaptureState(
                arr,
                0,
                $"Phần tử {arr[n - i - 1]} đã được cố định ở vị trí index {n - i - 1} thành công.",
                sorted: new List<int>(sortedIndices)
            );
        }

        sortedIndices.Add(0);
        CaptureState(
            arr,
            0,
            "Mảng đã được sắp xếp tăng dần hoàn chỉnh!",
            sorted: new List<int>(sortedIndices)
        );

        result.Frames = _frames;
        return result;
    }
}
