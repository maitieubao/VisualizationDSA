using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

public class MonotonicStackStrategy : AlgorithmStrategyBase
{
    public override string AlgorithmId => "monotonic-stack";
    public override string Name => "Monotonic Stack (Ngăn xếp đơn điệu)";
    public override string Category => "Stack-Queue";

    public override AlgorithmMetadata GetMetadata()
    {
        return new AlgorithmMetadata
        {
            TimeComplexity = "O(N)",
            SpaceComplexity = "O(N)",
            Description = "Ngăn xếp đơn điệu (Monotonic Stack) duy trì các phần tử tăng dần hoặc giảm dần để giải quyết hiệu quả các bài toán như 'Tìm phần tử lớn hơn tiếp theo' (Next Greater Element) trong thời gian tuyến tính O(N).",
            PseudoCode = new List<string>
            {
                "nextGreaterElement(A):",
                "  stack = []",
                "  res = [-1 for _ in A]",
                "  for i from 0 to N-1:",
                "    while stack is not empty and A[stack.top()] < A[i]:",
                "      idx = stack.pop()",
                "      res[idx] = A[i]",
                "    stack.push(i)",
                "  return res"
            }
        };
    }

    public override List<FrameDTO> Execute(int[] inputData, CancellationToken cancellationToken = default)
    {
        InitializeRecorder();

        if (inputData == null || inputData.Length == 0)
        {
            CaptureStackFrame(new List<int>(), 0, "Mảng rỗng, không có phần tử nào cần xử lý.");
            return _frames;
        }

        int[] arr = (int[])inputData.Clone();
        int n = arr.Length;
        int[] res = Enumerable.Repeat(-1, n).ToArray();

        Stack<int> stack = new(); // Stores indices of array

        CaptureStackFrame(new List<int>(), 0, "Khởi tạo ngăn xếp đơn điệu rỗng.");

        for (int i = 0; i < n; i++)
        {
            cancellationToken.ThrowIfCancellationRequested();

            string stepExpl = $"Duyệt đến phần tử A[{i}] = {arr[i]}.";
            CaptureStackFrame(GetStackValues(stack, arr), 3, stepExpl, compareIdx: i);

            while (stack.Count > 0 && arr[stack.Peek()] < arr[i])
            {
                cancellationToken.ThrowIfCancellationRequested();
                int poppedIdx = stack.Pop();
                res[poppedIdx] = arr[i];

                string popExpl = $"Vì A[stack.top()] (A[{poppedIdx}] = {arr[poppedIdx]}) < A[{i}] ({arr[i]}), " +
                                  $"lấy index {poppedIdx} ra khỏi ngăn xếp. " +
                                  $"Tìm thấy phần tử lớn hơn tiếp theo của {arr[poppedIdx]} là {arr[i]}.";

                CaptureStackFrame(GetStackValues(stack, arr), 5, popExpl, compareIdx: poppedIdx);
            }

            stack.Push(i);
            string pushExpl = $"Đẩy index {i} (giá trị {arr[i]}) vào ngăn xếp.";
            CaptureStackFrame(GetStackValues(stack, arr), 7, pushExpl, activeIdx: i);
        }

        CaptureStackFrame(GetStackValues(stack, arr), 0, $"Thuật toán hoàn tất! Kết quả Next Greater Element: [{string.Join(", ", res)}]", finished: true);

        return _frames;
    }

    private List<int> GetStackValues(Stack<int> stack, int[] arr)
    {
        // Return values of elements in stack from bottom to top for visual display in TubeRenderer
        var list = stack.Select(idx => arr[idx]).ToList();
        list.Reverse();
        return list;
    }

    private void CaptureStackFrame(
        List<int> stackValues,
        int activeLine,
        string explanation,
        int compareIdx = -1,
        int activeIdx = -1,
        bool finished = false)
    {
        var highlights = new HighlightIndices
        {
            Compare = compareIdx >= 0 ? new List<int> { compareIdx } : new List<int>(),
            Swap = new List<int>(),
            Sorted = new List<int>(),
            Active = activeIdx >= 0 ? new List<int> { activeIdx } : new List<int>()
        };

        _frames.Add(new FrameDTO
        {
            StepId = _frames.Count + 1,
            ActiveLine = activeLine,
            Explanation = explanation,
            DataState = stackValues.ToArray(), // Current elements shown in the tube stack!
            Highlights = highlights
        });
    }
}
