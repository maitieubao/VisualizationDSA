using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

public class BinarySearchStrategy : AlgorithmStrategyBase
{
    public override string AlgorithmId => "binary-search";
    public override string Name => "Binary Search (Tìm kiếm nhị phân)";
    public override string Category => "Searching";

    public override AlgorithmMetadata GetMetadata()
    {
        return new AlgorithmMetadata
        {
            TimeComplexity = "O(log N)",
            SpaceComplexity = "O(1)",
            Description = "Binary Search chia đôi phạm vi tìm kiếm mỗi bước bằng cách so sánh giá trị giữa (mid) với target. Yêu cầu mảng đã sắp xếp tăng dần.",
            PseudoCode = new List<string>
            {
                "binarySearch(A, target)",
                "  low = 0, high = N-1",
                "  while low <= high",
                "    mid = (low + high) / 2",
                "    if A[mid] == target",
                "      return mid",
                "    else if A[mid] < target",
                "      low = mid + 1",
                "    else",
                "      high = mid - 1",
                "  return -1"
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

        for (int k = 0; k < searchArr.Length - 1; k++)
        {
            cancellationToken.ThrowIfCancellationRequested();
            if (searchArr[k] > searchArr[k + 1])
            {
                throw new ArgumentException(
                    "Thuật toán tìm kiếm nhị phân (Binary Search) chỉ chạy trên mảng đã sắp xếp tăng dần. Vui lòng sắp xếp mảng trước khi chạy.");
            }
        }

        CaptureBinaryFrame(searchArr, 0,
            $"Bắt đầu tìm kiếm nhị phân target = {target} trong mảng đã sắp xếp.",
            0, searchArr.Length - 1, -1);

        int low = 0;
        int high = searchArr.Length - 1;
        bool found = false;

        while (low <= high)
        {
            cancellationToken.ThrowIfCancellationRequested();
            int mid = (low + high) / 2;

            CaptureBinaryFrame(searchArr, 3,
                $"low = {low}, high = {high}, mid = {mid}. A[mid] = {searchArr[mid]}",
                low, high, mid);

            if (searchArr[mid] == target)
            {
                CaptureBinaryFrame(searchArr, 5,
                    $"Tìm thấy! A[{mid}] = {searchArr[mid]} = target ({target}).",
                    low, high, mid, foundIdx: mid);
                found = true;
                break;
            }
            else if (searchArr[mid] < target)
            {
                CaptureBinaryFrame(searchArr, 7,
                    $"A[{mid}] ({searchArr[mid]}) < target ({target}). Thu hẹp: low = {mid + 1}.",
                    low, high, mid);
                low = mid + 1;
            }
            else
            {
                CaptureBinaryFrame(searchArr, 9,
                    $"A[{mid}] ({searchArr[mid]}) > target ({target}). Thu hẹp: high = {mid - 1}.",
                    low, high, mid);
                high = mid - 1;
            }
        }

        if (!found)
        {
            CaptureBinaryFrame(searchArr, 10,
                $"Không tìm thấy giá trị {target} trong mảng.",
                low, high, -1);
        }

        return _frames;
    }

    private void CaptureBinaryFrame(
        int[] arr,
        int activeLine,
        string explanation,
        int low,
        int high,
        int mid,
        int foundIdx = -1)
    {
        var dimmed = new List<int>();
        for (int i = 0; i < arr.Length; i++)
        {
            if (i < low || i > high)
                dimmed.Add(i);
        }

        var highlights = new HighlightIndices
        {
            Compare = mid >= 0 ? new List<int> { mid } : new List<int>(),
            Swap = new List<int>(),
            Sorted = new List<int>(),
            Low = low >= 0 && low < arr.Length ? low : null,
            Mid = mid >= 0 && mid < arr.Length ? mid : null,
            High = high >= 0 && high < arr.Length ? high : null,
            Found = foundIdx >= 0 ? foundIdx : null,
            Dimmed = dimmed
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
