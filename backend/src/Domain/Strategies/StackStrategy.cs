using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

public class StackStrategy : AlgorithmStrategyBase
{
    public override string AlgorithmId => "stack";
    public override string Name => "Stack (Ngăn xếp - LIFO)";
    public override string Category => "Stack-Queue";

    public override AlgorithmMetadata GetMetadata()
    {
        return new AlgorithmMetadata
        {
            TimeComplexity = "O(1)",
            SpaceComplexity = "O(N)",
            Description = "Ngăn xếp (Stack) hoạt động theo nguyên tắc LIFO — Vào sau ra trước. Push đẩy phần tử vào đỉnh, Pop lấy phần tử ở đỉnh ra.",
            PseudoCode = new List<string>
            {
                "stack = []",
                "push(value):",
                "  stack.append(value)   // O(1)",
                "pop():",
                "  return stack.removeLast() // O(1)",
                "peek():",
                "  return stack[top]      // O(1)"
            }
        };
    }

    public override List<FrameDTO> Execute(int[] inputData, CancellationToken cancellationToken = default)
    {
        InitializeRecorder();
        var stack = new List<int>();

        CaptureStackFrame(stack, 0, "Khởi tạo ngăn xếp rỗng.");

        foreach (int val in inputData)
        {
            cancellationToken.ThrowIfCancellationRequested();
            stack.Add(val);
            CaptureStackFrame(stack, 2,
                $"Push({val}): Đẩy phần tử {val} vào đỉnh ngăn xếp.",
                activeIdx: stack.Count - 1);
        }

        CaptureStackFrame(stack, 0,
            $"Ngăn xếp hiện tại có {stack.Count} phần tử. Bắt đầu Pop lần lượt.");

        while (stack.Count > 0)
        {
            cancellationToken.ThrowIfCancellationRequested();
            int topIdx = stack.Count - 1;
            int topVal = stack[topIdx];

            CaptureStackFrame(stack, 4,
                $"Pop(): Lấy phần tử {topVal} ra khỏi đỉnh ngăn xếp (LIFO).",
                activeIdx: topIdx,
                isRemoving: true);

            stack.RemoveAt(topIdx);

            CaptureStackFrame(stack, 4,
                $"Đã lấy {topVal} ra. Còn {stack.Count} phần tử.");
        }

        CaptureStackFrame(stack, 0, "Ngăn xếp đã rỗng hoàn toàn!");

        return _frames;
    }

    private void CaptureStackFrame(
        List<int> stack,
        int activeLine,
        string explanation,
        int activeIdx = -1,
        bool isRemoving = false)
    {
        var highlights = new HighlightIndices
        {
            Compare = new List<int>(),
            Swap = isRemoving && activeIdx >= 0 ? new List<int> { activeIdx } : new List<int>(),
            Sorted = new List<int>(),
            Active = activeIdx >= 0 && !isRemoving ? new List<int> { activeIdx } : new List<int>()
        };

        _frames.Add(new FrameDTO
        {
            StepId = _frames.Count + 1,
            ActiveLine = activeLine,
            Explanation = explanation,
            DataState = stack.ToArray(),
            Highlights = highlights
        });
    }
}
