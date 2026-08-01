using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

public class SelectionSortStrategy : AlgorithmStrategyBase
{
    public override string AlgorithmId => "selection-sort";
    public override string Name => "Selection Sort (Sắp xếp chọn)";
    public override string Category => "Sorting";

    public override AlgorithmMetadata GetMetadata() => new()
    {
        TimeComplexity = "O(N²)", SpaceComplexity = "O(1)",
        Description = "Mỗi lượt tìm phần tử NHỎ NHẤT trong đoạn chưa sắp xếp, swap về đầu.",
        PseudoCode = new List<string> { "for i=0..N-2:", "  minIdx = i", "  for j=i+1..N-1: if A[j]<A[minIdx] → minIdx=j", "  swap(A[i],A[minIdx])" }
    };

    public override List<FrameDTO> Execute(int[] input, CancellationToken ct = default)
    {
        InitializeRecorder();
        var a = (int[])input.Clone();
        var sorted = new List<int>();
        for (int i = 0; i < a.Length - 1; i++)
        {
            ct.ThrowIfCancellationRequested();
            int minIdx = i;
            CaptureState(a, 1, $"Lượt {i + 1}: giả định min = A[{i}] = {a[i]}",
                         compares: new List<int> { i }, sorted: new List<int>(sorted));
            for (int j = i + 1; j < a.Length; j++)
            {
                CaptureState(a, 2, $"So sánh A[{j}]={a[j]} vs min={a[minIdx]}",
                             compares: new List<int> { minIdx, j }, sorted: new List<int>(sorted));
                if (a[j] < a[minIdx]) { minIdx = j; CaptureState(a, 2, $"→ cập nhật min mới = A[{j}]={a[j]}", compares: new List<int> { j }, sorted: new List<int>(sorted)); }
            }
            if (minIdx != i)
            {
                (a[i], a[minIdx]) = (a[minIdx], a[i]);
                CaptureState(a, 3, $"Swap A[{i}] ↔ A[{minIdx}] → {a[i]} về đúng vị trí",
                             swaps: new List<int> { i, minIdx }, sorted: new List<int>(sorted));
            }
            sorted.Add(i);
        }
        sorted.Add(a.Length - 1);
        CaptureState(a, 0, "✅ Selection Sort xong!", sorted: sorted);
        return _frames;
    }
}
