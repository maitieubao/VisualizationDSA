using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

public class InsertionSortStrategy : AlgorithmStrategyBase
{
    public override string AlgorithmId => "insertion-sort";
    public override string Name => "Insertion Sort (Sắp xếp chèn)";
    public override string Category => "Sorting";

    public override AlgorithmMetadata GetMetadata() => new()
    {
        TimeComplexity = "O(N²) worst | O(N) best", SpaceComplexity = "O(1)",
        Description = "Xét từ trái→phải, mỗi phần tử được CHÈN vào đúng vị trí trong đoạn đã sắp xếp bên trái. Rất nhanh với mảng gần đúng.",
        PseudoCode = new List<string> { "for i=1..N-1:", "  key = A[i]; j = i-1", "  while j>=0 && A[j]>key: A[j+1]=A[j]; j--", "  A[j+1]=key" }
    };

    public override List<FrameDTO> Execute(int[] input, CancellationToken ct = default)
    {
        InitializeRecorder();
        var a = (int[])input.Clone();
        var sorted = new List<int> { 0 }; 
        CaptureState(a, 0, $"🚀 Bắt đầu Insertion Sort", sorted: new List<int>(sorted));

        for (int i = 1; i < a.Length; i++)
        {
            ct.ThrowIfCancellationRequested();
            int key = a[i];
            int j = i - 1;
            
            CaptureState(a, 1, $"Chọn A[{i}] = {key} làm key để chèn",
                         compares: new List<int> { i }, sorted: new List<int>(sorted));

            while (j >= 0 && a[j] > key)
            {
                CaptureState(a, 2, $"So sánh A[{j}]={a[j]} > key={key} → Dịch {a[j]} sang phải",
                             compares: new List<int> { j, j + 1 }, sorted: new List<int>(sorted));
                a[j + 1] = a[j];
                j--;
                CaptureState(a, 2, $"Dịch chuyển hoàn tất. A[{j + 2}] = {a[j + 2]}",
                             swaps: new List<int> { j + 1, j + 2 }, sorted: new List<int>(sorted));
            }
            a[j + 1] = key;
            sorted.Add(i);
            CaptureState(a, 3, $"Chèn key={key} vào vị trí A[{j + 1}]",
                         swaps: new List<int> { j + 1 }, sorted: new List<int>(sorted));
        }
        
        CaptureState(a, 0, "✅ Insertion Sort hoàn tất!", sorted: sorted);
        return _frames;
    }
}
