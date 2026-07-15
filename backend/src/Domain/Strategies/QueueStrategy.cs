using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

public class QueueStrategy : AlgorithmStrategyBase
{
    public override string AlgorithmId => "queue";
    public override string Name => "Queue (Hàng đợi - FIFO)";
    public override string Category => "Stack-Queue";

    public override AlgorithmMetadata GetMetadata()
    {
        return new AlgorithmMetadata
        {
            TimeComplexity = "O(1)",
            SpaceComplexity = "O(N)",
            Description = "Hàng đợi (Queue) hoạt động theo nguyên tắc FIFO — Vào trước ra trước. Enqueue thêm phần tử vào cuối, Dequeue lấy phần tử ở đầu ra.",
            PseudoCode = new List<string>
            {
                "queue = []",
                "enqueue(value):",
                "  queue.append(value)     // O(1)",
                "dequeue():",
                "  return queue.removeFirst() // O(1)",
                "front():",
                "  return queue[0]          // O(1)"
            }
        };
    }

    public override List<FrameDTO> Execute(int[] inputData, CancellationToken cancellationToken = default)
    {
        InitializeRecorder();
        var queue = new List<int>();

        CaptureQueueFrame(queue, 0, "Khởi tạo hàng đợi rỗng.");

        foreach (int val in inputData)
        {
            cancellationToken.ThrowIfCancellationRequested();
            queue.Add(val);
            CaptureQueueFrame(queue, 2,
                $"Enqueue({val}): Thêm phần tử {val} vào cuối hàng đợi (Rear).",
                activeIdx: queue.Count - 1);
        }

        CaptureQueueFrame(queue, 0,
            $"Hàng đợi hiện tại có {queue.Count} phần tử. Bắt đầu Dequeue lần lượt.");

        while (queue.Count > 0)
        {
            cancellationToken.ThrowIfCancellationRequested();
            int frontVal = queue[0];

            CaptureQueueFrame(queue, 4,
                $"Dequeue(): Lấy phần tử {frontVal} ra từ đầu hàng đợi (Front - FIFO).",
                activeIdx: 0,
                isRemoving: true);

            queue.RemoveAt(0);

            CaptureQueueFrame(queue, 4,
                $"Đã lấy {frontVal} ra. Các phần tử còn lại trượt sang trái. Còn {queue.Count} phần tử.");
        }

        CaptureQueueFrame(queue, 0, "Hàng đợi đã rỗng hoàn toàn!");

        return _frames;
    }

    private void CaptureQueueFrame(
        List<int> queue,
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
            DataState = queue.ToArray(),
            Highlights = highlights
        });
    }
}
