using System;
using System.Collections.Generic;
using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

public class SlidingWindowStrategy : AlgorithmStrategyBase
{
    public override string AlgorithmId => "sliding-window";
    public override string Name => "Sliding Window (Cửa sổ trượt)";
    public override string Category => "Searching";

    public override AlgorithmMetadata GetMetadata()
    {
        return new AlgorithmMetadata
        {
            TimeComplexity = "O(N)",
            SpaceComplexity = "O(1)",
            Description = "Cửa sổ trượt (Sliding Window) duy trì một phạm vi phần tử liên tiếp (cửa sổ) và di chuyển nó dọc theo mảng để tính toán hiệu quả các bài toán mảng con. Ví dụ này tìm tổng lớn nhất của cửa sổ kích thước K = 3.",
            PseudoCode = new List<string>
            {
                "slidingWindow(A, K):",
                "  left = 0, currentSum = 0, maxSum = 0",
                "  for right from 0 to N-1:",
                "    currentSum += A[right]",
                "    if right - left + 1 > K:",
                "      currentSum -= A[left]",
                "      left++",
                "    maxSum = max(maxSum, currentSum)",
                "  return maxSum"
            }
        };
    }

    public override List<FrameDTO> Execute(int[] inputData, CancellationToken cancellationToken = default)
    {
        InitializeRecorder();

        if (inputData == null || inputData.Length == 0)
        {
            CaptureWindowFrame(Array.Empty<int>(), 0, "Mảng rỗng, không thể chạy cửa sổ trượt.", 0, 0, 0, 0);
            return _frames;
        }

        int[] arr = (int[])inputData.Clone();
        int n = arr.Length;
        int k = Math.Min(3, n);

        CaptureWindowFrame(arr, 0, $"Bắt đầu chạy cửa sổ trượt với kích thước cửa sổ K = {k}.", 0, 0, 0, 0);

        int left = 0;
        int currentSum = 0;
        int maxSum = 0;

        for (int right = 0; right < n; right++)
        {
            cancellationToken.ThrowIfCancellationRequested();
            currentSum += arr[right];

            CaptureWindowFrame(arr, 4, $"Dịch chuyển biên phải sang index {right} (A[{right}] = {arr[right]}). Tổng hiện tại = {currentSum}.", left, right, currentSum, maxSum);

            if (right - left + 1 > k)
            {
                cancellationToken.ThrowIfCancellationRequested();
                int oldVal = arr[left];
                currentSum -= oldVal;
                left++;

                CaptureWindowFrame(arr, 6, $"Cửa sổ vượt quá kích thước K = {k}. Loại bỏ biên trái A[{left - 1}] = {oldVal} (index {left - 1}) và dịch chuyển biên trái sang index {left}. Tổng hiện tại = {currentSum}.", left, right, currentSum, maxSum);
            }

            if (right - left + 1 == k)
            {
                cancellationToken.ThrowIfCancellationRequested();
                int prevMax = maxSum;
                maxSum = Math.Max(maxSum, currentSum);

                string expl = $"Cửa sổ đạt kích thước {k}. So sánh tổng hiện tại ({currentSum}) và maxSum trước đó ({prevMax}).";
                if (currentSum > prevMax)
                {
                    expl += $" Cập nhật maxSum mới = {currentSum}!";
                }
                else
                {
                    expl += $" maxSum không đổi = {maxSum}.";
                }

                CaptureWindowFrame(arr, 8, expl, left, right, currentSum, maxSum);
            }
        }

        CaptureWindowFrame(arr, 0, $"Thuật toán cửa sổ trượt hoàn tất! Tổng mảng con lớn nhất kích thước K = {k} là: {maxSum}.", 0, n - 1, 0, maxSum, finished: true);

        return _frames;
    }

    private void CaptureWindowFrame(
        int[] arr,
        int activeLine,
        string explanation,
        int left,
        int right,
        int currentSum,
        int maxSum,
        bool finished = false)
    {
        var active = new List<int>();
        var dimmed = new List<int>();

        if (!finished)
        {
            for (int i = 0; i < arr.Length; i++)
            {
                if (i >= left && i <= right)
                    active.Add(i);
                else
                    dimmed.Add(i);
            }
        }

        var highlights = new HighlightIndices
        {
            Compare = new List<int>(),
            Swap = new List<int>(),
            Sorted = new List<int>(),
            Low = finished ? null : left,
            High = finished ? null : right,
            Dimmed = dimmed,
            Active = active
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
