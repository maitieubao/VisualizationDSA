using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

public class LinearSearchStrategy : AlgorithmStrategyBase
{
    public override string AlgorithmId => "linear-search";
    public override string Name => "Linear Search (Tìm kiếm tuần tự)";
    public override string Category => "Searching";

    public override AlgorithmMetadata GetMetadata()
    {
        return new AlgorithmMetadata
        {
            TimeComplexity = "O(N)",
            SpaceComplexity = "O(1)",
            Description = "Linear Search duyệt tuần tự từng phần tử trong mảng từ đầu đến cuối để tìm giá trị mục tiêu.",
            PseudoCode = new List<string>
            {
                "linearSearch(A, target)",
                "  for i from 0 to N-1",
                "    if A[i] == target",
                "      return i   // Tìm thấy!",
                "  return -1      // Không tìm thấy"
            }
        };
    }

    public override List<FrameDTO> Execute(int[] inputData, CancellationToken cancellationToken = default)
    {
        InitializeRecorder();

        if (inputData.Length == 0)
        {
            CaptureState(Array.Empty<int>(), 0, "Mảng rỗng, không thể tìm kiếm.");
            return _frames;
        }

        int[] arr = (int[])inputData.Clone();
        int target = arr[^1];
        int[] searchArr = arr[..^1];

        CaptureSearchFrame(searchArr, 0,
            $"Bắt đầu tìm kiếm tuần tự giá trị target = {target} trong mảng.",
            target);

        bool found = false;
        for (int i = 0; i < searchArr.Length; i++)
        {
            cancellationToken.ThrowIfCancellationRequested();
            CaptureSearchFrame(searchArr, 2,
                $"Kiểm tra A[{i}] = {searchArr[i]} có bằng target ({target})?",
                target,
                compareIdx: i);

            if (searchArr[i] == target)
            {
                CaptureSearchFrame(searchArr, 3,
                    $"Tìm thấy! A[{i}] = {searchArr[i]} = target ({target}).",
                    target,
                    foundIdx: i);
                found = true;
                break;
            }
        }

        if (!found)
        {
            CaptureSearchFrame(searchArr, 4,
                $"Không tìm thấy giá trị {target} trong mảng.",
                target);
        }

        return _frames;
    }

    private void CaptureSearchFrame(
        int[] arr,
        int activeLine,
        string explanation,
        int target,
        int compareIdx = -1,
        int foundIdx = -1)
    {
        var highlights = new HighlightIndices
        {
            Compare = compareIdx >= 0 ? new List<int> { compareIdx } : new List<int>(),
            Swap = new List<int>(),
            Sorted = new List<int>(),
            Found = foundIdx >= 0 ? foundIdx : null,
            Dimmed = compareIdx > 0
                ? Enumerable.Range(0, compareIdx).ToList()
                : new List<int>()
        };

        _frames.Add(new FrameDTO
        {
            StepId = _frames.Count + 1,
            ActiveLine = activeLine,
            Explanation = explanation,
            DataState = (int[])arr.Clone(),
            Highlights = highlights
        });
    }
}
