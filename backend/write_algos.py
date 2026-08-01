import os

base_dir = r"c:\Users\Lenovo\Desktop\DATN\VisualizationDSA\backend\src\Domain\Strategies"

selection_sort = '''using System;
using System.Collections.Generic;
using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

public class SelectionSortStrategy : AlgorithmStrategyBase
{
    public override string AlgorithmId => "selection-sort";
    public override string Name => "Selection Sort (Sắp xếp Chọn)";
    public override string Category => "Sorting";
    private const int MaxInputSize = 50;

    public override AlgorithmMetadata GetMetadata() => new()
    {
        TimeComplexity = "O(n²)",
        SpaceComplexity = "O(1)",
        Description = "Chọn phần tử nhỏ nhất trong vùng chưa sắp xếp, hoán đổi lên đầu. Ưu điểm: ít hoán đổi nhất trong các thuật toán O(n²).",
        PseudoCode = new List<string>
        {
            "for i from 0 to N-2",
            "  minIdx = i",
            "  for j from i+1 to N-1",
            "    if A[j] < A[minIdx] → minIdx = j",
            "  if minIdx != i → swap(A[i], A[minIdx])"
        }
    };

    public override List<FrameDTO> Execute(int[] inputData, CancellationToken ct = default)
    {
        if (inputData.Length > MaxInputSize)
            throw new ArgumentException($"Tối đa {MaxInputSize} phần tử.");
        
        InitializeRecorder();
        int[] arr = (int[])inputData.Clone();
        int n = arr.Length;
        List<int> sorted = new();

        CaptureState(arr, 0, $"Bắt đầu Selection Sort: mảng {n} phần tử.", sorted: sorted);

        for (int i = 0; i < n - 1; i++)
        {
            ct.ThrowIfCancellationRequested();
            int minIdx = i;
            CaptureState(arr, 1, $"Bước {i+1}: giả định min = A[{i}] = {arr[i]}.", 
                compares: new List<int>{i}, sorted: sorted);

            for (int j = i + 1; j < n; j++)
            {
                CaptureState(arr, 2, $"So sánh A[{j}] = {arr[j]} vs min A[{minIdx}] = {arr[minIdx]}.",
                    compares: new List<int>{j, minIdx}, sorted: sorted);
                
                if (arr[j] < arr[minIdx])
                {
                    minIdx = j;
                    CaptureState(arr, 2, $"→ CẬP NHẬT: min mới = A[{j}] = {arr[j]}.",
                        compares: new List<int>{j}, sorted: sorted);
                }
            }

            if (minIdx != i)
            {
                (arr[i], arr[minIdx]) = (arr[minIdx], arr[i]);
                CaptureState(arr, 4, $"HOÁN ĐỔI: A[{i}] ↔ A[{minIdx}] → {arr[i]} về đúng vị trí.",
                    swaps: new List<int>{i, minIdx}, sorted: sorted);
            }
            sorted.Add(i);
            CaptureState(arr, 0, $"✅ A[{i}] = {arr[i]} đã cố định. Đã sắp xếp {sorted.Count}/{n}.",
                sorted: new List<int>(sorted));
        }
        sorted.Add(n-1);
        CaptureState(arr, 0, "🎉 MẢNG ĐÃ SẮP XẾP HOÀN TOÀN!", sorted: sorted);
        return _frames;
    }
}
'''

insertion_sort = '''using System;
using System.Collections.Generic;
using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

public class InsertionSortStrategy : AlgorithmStrategyBase
{
    public override string AlgorithmId => "insertion-sort";
    public override string Name => "Insertion Sort (Sắp xếp Chèn)";
    public override string Category => "Sorting";
    private const int MaxInputSize = 50;

    public override AlgorithmMetadata GetMetadata() => new()
    {
        TimeComplexity = "O(n²) | Best O(n)",
        SpaceComplexity = "O(1)",
        Description = "Xây dựng mảng đã sắp xếp từng phần tử bằng cách chèn vào đúng vị trí. Rất nhanh với mảng gần đúng hoặc nhỏ (<15 phần tử).",
        PseudoCode = new List<string>
        {
            "for i from 1 to N-1",
            "  key = A[i], j = i - 1",
            "  while j >= 0 AND A[j] > key",
            "    A[j+1] = A[j], j = j - 1",
            "  A[j+1] = key"
        }
    };

    public override List<FrameDTO> Execute(int[] inputData, CancellationToken ct = default)
    {
        if (inputData.Length > MaxInputSize)
            throw new ArgumentException($"Tối đa {MaxInputSize} phần tử.");
        
        InitializeRecorder();
        int[] arr = (int[])inputData.Clone();
        int n = arr.Length;
        List<int> sorted = new(){0};

        CaptureState(arr, 0, $"Bắt đầu Insertion Sort. A[0] = {arr[0]} coi như đã sắp xếp.", sorted: sorted);

        for (int i = 1; i < n; i++)
        {
            ct.ThrowIfCancellationRequested();
            int key = arr[i];
            int j = i - 1;
            CaptureState(arr, 1, $"Lấy key = A[{i}] = {key}. Tìm vị trí chèn trong [0..{i-1}].",
                compares: new List<int>{i}, sorted: sorted);

            while (j >= 0 && arr[j] > key)
            {
                arr[j + 1] = arr[j];
                CaptureState(arr, 3, $"Dịch phải A[{j}] = {arr[j]} → vị trí {j+1}.",
                    swaps: new List<int>{j, j+1}, sorted: sorted);
                j--;
            }
            arr[j + 1] = key;
            sorted.Add(i);
            CaptureState(arr, 4, $"✅ CHÈN key={key} vào index {j+1}. Vùng đã sắp xếp: {sorted.Count}/{n}.",
                sorted: new List<int>(sorted));
        }
        CaptureState(arr, 0, "🎉 MẢNG ĐÃ SẮP XẾP HOÀN TOÀN!", sorted: sorted);
        return _frames;
    }
}
'''

quick_sort = '''using System;
using System.Collections.Generic;
using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

public class QuickSortStrategy : AlgorithmStrategyBase
{
    public override string AlgorithmId => "quick-sort";
    public override string Name => "Quick Sort (Sắp xếp Nhanh - Lomuto)";
    public override string Category => "Sorting";
    private const int MaxInputSize = 150;

    public override AlgorithmMetadata GetMetadata() => new()
    {
        TimeComplexity = "O(n log n) | Worst O(n²)",
        SpaceComplexity = "O(log n)",
        Description = "Chia để trị: chọn pivot, phân hoạch mảng thành 2 vùng (< pivot và > pivot), đệ quy sắp xếp từng vùng. Thuật toán nhanh nhất thực tế.",
        PseudoCode = new List<string>
        {
            "quickSort(A, low, high):",
            "  if low < high:",
            "    p = partition(A, low, high)",
            "    quickSort(A, low, p-1)",
            "    quickSort(A, p+1, high)",
            "partition(A, low, high):",
            "  pivot = A[high], i = low - 1",
            "  for j = low → high-1:",
            "    if A[j] <= pivot → i++, swap(A[i], A[j])",
            "  swap(A[i+1], A[high]) → return i+1"
        }
    };

    public override List<FrameDTO> Execute(int[] inputData, CancellationToken ct = default)
    {
        if (inputData.Length > MaxInputSize)
            throw new ArgumentException($"Tối đa {MaxInputSize} phần tử.");
        
        InitializeRecorder();
        int[] arr = (int[])inputData.Clone();
        List<int> sorted = new();
        
        CaptureState(arr, 0, $"🚀 Bắt đầu Quick Sort (Lomuto) trên mảng {arr.Length} phần tử.");
        QuickSortRecursive(arr, 0, arr.Length - 1, sorted, ct);
        
        for (int k = 0; k < arr.Length; k++) sorted.Add(k);
        CaptureState(arr, 0, "🎉 QUICK SORT HOÀN TẤT! Mảng tăng dần hoàn chỉnh.", sorted: sorted);
        return _frames;
    }

    private void QuickSortRecursive(int[] arr, int low, int high, List<int> sorted, CancellationToken ct)
    {
        if (low >= high)
        {
            if (low == high && !sorted.Contains(low)) sorted.Add(low);
            return;
        }
        ct.ThrowIfCancellationRequested();
        
        CaptureState(arr, 1, $"🔀 Đệ quy: sắp xếp vùng [{low}..{high}].", sorted: sorted);
        int p = Partition(arr, low, high, sorted, ct);
        
        QuickSortRecursive(arr, low, p - 1, sorted, ct);
        QuickSortRecursive(arr, p + 1, high, sorted, ct);
    }

    private int Partition(int[] arr, int low, int high, List<int> sorted, CancellationToken ct)
    {
        int pivot = arr[high];
        int i = low - 1;
        CaptureState(arr, 6, $"🎯 Pivot = A[{high}] = {pivot}. Phân hoạch [{low}..{high-1}].",
            highlights: new HighlightIndices{ Pivot = high, Sorted = new(sorted) });

        for (int j = low; j < high; j++)
        {
            ct.ThrowIfCancellationRequested();
            CaptureState(arr, 7, $"So sánh A[{j}] = {arr[j]} vs pivot {pivot}.",
                compares: new List<int>{j, high}, sorted: sorted);
            
            if (arr[j] <= pivot)
            {
                i++;
                if (i != j)
                {
                    (arr[i], arr[j]) = (arr[j], arr[i]);
                    CaptureState(arr, 7, $"✅ {arr[j]} ≤ pivot → hoán đổi A[{i}] ↔ A[{j}].",
                        swaps: new List<int>{i, j}, 
                        highlights: new HighlightIndices{ Pivot = high, Sorted = new(sorted) });
                }
            }
        }
        (arr[i + 1], arr[high]) = (arr[high], arr[i + 1]);
        if (!sorted.Contains(i+1)) sorted.Add(i+1);
        
        CaptureState(arr, 8, $"📍 Pivot {pivot} về đúng vị trí [{i+1}] (vĩnh viễn).",
            swaps: new List<int>{i+1, high}, sorted: new(sorted));
        return i + 1;
    }
}
'''

merge_sort = '''using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

public class MergeSortStrategy : AlgorithmStrategyBase
{
    public override string AlgorithmId => "merge-sort";
    public override string Name => "Merge Sort (Sắp xếp Trộn)";
    public override string Category => "Sorting";
    private const int MaxInputSize = 150;

    public override AlgorithmMetadata GetMetadata() => new()
    {
        TimeComplexity = "O(n log n) · ổn định",
        SpaceComplexity = "O(n)",
        Description = "Chia để trị: chia mảng thành 2 nửa, đệ quy sắp xếp, trộn lại thành mảng hoàn chỉnh. Thời gian ổn định, dễ song song hóa.",
        PseudoCode = new List<string>
        {
            "mergeSort(A, l, r):",
            "  if l < r:",
            "    m = (l + r) / 2",
            "    mergeSort(A, l, m)",
            "    mergeSort(A, m+1, r)",
            "    merge(A, l, m, r)",
            "merge(A, l, m, r):",
            "  L = A[l..m], R = A[m+1..r]",
            "  i=j=0, k=l",
            "  while i<|L| AND j<|R|: A[k++] = min(L[i], R[j])",
            "  copy remaining elements"
        }
    };

    public override List<FrameDTO> Execute(int[] inputData, CancellationToken ct = default)
    {
        if (inputData.Length > MaxInputSize)
            throw new ArgumentException($"Tối đa {MaxInputSize} phần tử.");
        
        InitializeRecorder();
        int[] arr = (int[])inputData.Clone();
        
        CaptureState(arr, 0, $"🚀 Bắt đầu Merge Sort: chia mảng {arr.Length} phần tử.");
        MergeSortRecursive(arr, 0, arr.Length - 1, ct);
        
        List<int> sorted = Enumerable.Range(0, arr.Length).ToList();
        CaptureState(arr, 0, "🎉 MERGE SORT HOÀN TẤT! Mảng tăng dần ổn định.", sorted: sorted);
        return _frames;
    }

    private void MergeSortRecursive(int[] arr, int l, int r, CancellationToken ct)
    {
        if (l >= r) return;
        ct.ThrowIfCancellationRequested();
        
        int m = (l + r) / 2;
        CaptureState(arr, 2, $"✂️ CHIA: [{l}..{r}] → trái [{l}..{m}] + phải [{m+1}..{r}].",
            compares: new List<int>{l, m, r});
        
        MergeSortRecursive(arr, l, m, ct);
        MergeSortRecursive(arr, m + 1, r, ct);
        Merge(arr, l, m, r, ct);
    }

    private void Merge(int[] arr, int l, int m, int r, CancellationToken ct)
    {
        int[] L = arr[l..(m+1)], R = arr[(m+1)..(r+1)];
        int i = 0, j = 0, k = l;
        
        CaptureState(arr, 5, $"🔀 TRỘN: L=[{string.Join(",",L)}] + R=[{string.Join(",",R)}] → [{l}..{r}].",
            compares: Enumerable.Range(l, r-l+1).ToList());

        while (i < L.Length && j < R.Length)
        {
            ct.ThrowIfCancellationRequested();
            if (L[i] <= R[j])
            {
                arr[k] = L[i++];
                CaptureState(arr, 7, $"L[{i-1}]={arr[k]} ≤ R[{j}]={R[j]} → ghi A[{k}].",
                    swaps: new List<int>{k});
            }
            else
            {
                arr[k] = R[j++];
                CaptureState(arr, 7, $"R[{j-1}]={arr[k]} < L[{i}]={L[i]} → ghi A[{k}].",
                    swaps: new List<int>{k});
            }
            k++;
        }
        while (i < L.Length) { arr[k] = L[i++]; CaptureState(arr,8, $"Copy L còn lại → A[{k-1}]={arr[k-1]}.", swaps: new List<int>{k-1}); k++; }
        while (j < R.Length) { arr[k] = R[j++]; CaptureState(arr,8, $"Copy R còn lại → A[{k-1}]={arr[k-1]}.", swaps: new List<int>{k-1}); k++; }
        
        CaptureState(arr, 0, $"✅ Vùng [{l}..{r}] đã trộn xong: [{string.Join(",", arr[l..(r+1)])}].",
            sorted: Enumerable.Range(l, r-l+1).ToList());
    }
}
'''

counting_sort = '''using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

public class CountingSortStrategy : AlgorithmStrategyBase
{
    public override string AlgorithmId => "counting-sort";
    public override string Name => "Counting Sort (Sắp xếp Đếm Phân Phối)";
    public override string Category => "Sorting";
    private const int MaxInputSize = 150;
    private const int MaxValue = 10000;

    public override AlgorithmMetadata GetMetadata() => new()
    {
        TimeComplexity = "O(n + k) · tuyến tính",
        SpaceComplexity = "O(k)",
        Description = "Không so sánh: đếm tần suất mỗi giá trị, tính prefix sum, ghi ngược ra mảng kết quả. Chạy cực nhanh với số nguyên nhỏ không âm.",
        PseudoCode = new List<string>
        {
            "min = A.min(), max = A.max()",
            "k = max - min + 1 → count[0..k-1] = 0",
            "for x in A → count[x - min]++",
            "for i=1→k-1 → count[i] += count[i-1] (prefix)",
            "for x in reversed(A): output[--count[x-min]] = x"
        }
    };

    public override List<FrameDTO> Execute(int[] inputData, CancellationToken ct = default)
    {
        if (inputData.Length > MaxInputSize)
            throw new ArgumentException($"Tối đa {MaxInputSize} phần tử.");
        if (inputData.Any(x => x < 0 || x > MaxValue))
            throw new ArgumentException("Counting Sort chỉ hỗ trợ số nguyên 0 → 10000.");
        
        InitializeRecorder();
        int[] arr = (int[])inputData.Clone();
        int n = arr.Length;
        if (n == 0) return _frames;

        int min = arr.Min(), max = arr.Max();
        int k = max - min + 1;
        CaptureState(arr, 0, $"🚀 Counting Sort: min={min}, max={max}, k={k} bins.");

        int[] count = new int[k];
        for (int i = 0; i < n; i++)
        {
            ct.ThrowIfCancellationRequested();
            count[arr[i] - min]++;
            CaptureState(arr, 2, $"🔢 Đếm: A[{i}]={arr[i]} → count[{arr[i]-min}] = {count[arr[i]-min]}.",
                compares: new List<int>{i});
        }
        CaptureState(arr, 2, $"✅ Đếm xong. Count array = [{string.Join(",", count)}].");

        for (int i = 1; i < k; i++)
        {
            count[i] += count[i - 1];
            CaptureState(arr, 3, $"📊 Prefix sum: count[{i}] = {count[i]} (vị trí cuối của {min+i}).");
        }

        int[] output = new int[n];
        for (int i = n - 1; i >= 0; i--)
        {
            ct.ThrowIfCancellationRequested();
            int val = arr[i];
            int pos = --count[val - min];
            output[pos] = val;
            CaptureState(output, 4, $"📍 Ghi ngược: A[{i}]={val} → output[{pos}].",
                swaps: new List<int>{pos});
        }
        Array.Copy(output, arr, n);
        
        List<int> sorted = Enumerable.Range(0, n).ToList();
        CaptureState(arr, 0, "🎉 COUNTING SORT HOÀN TẤT! O(n+k) tuyến tính.", sorted: sorted);
        return _frames;
    }
}
'''

radix_sort = '''using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

public class RadixSortStrategy : AlgorithmStrategyBase
{
    public override string AlgorithmId => "radix-sort";
    public override string Name => "Radix Sort (Sắp xếp Cơ Số - LSD)";
    public override string Category => "Sorting";
    private const int MaxInputSize = 150;

    public override AlgorithmMetadata GetMetadata() => new()
    {
        TimeComplexity = "O(d·(n + 10))",
        SpaceComplexity = "O(n + 10)",
        Description = "Sắp xếp theo từng chữ số từ thấp đến cao (LSD), mỗi bước dùng Counting Sort ổn định. Xử lý số nguyên lớn hiệu quả.",
        PseudoCode = new List<string>
        {
            "max = A.max()",
            "for exp = 1; max/exp > 0; exp *= 10:",
            "  countingSortByDigit(A, exp)"
        }
    };

    public override List<FrameDTO> Execute(int[] inputData, CancellationToken ct = default)
    {
        if (inputData.Length > MaxInputSize)
            throw new ArgumentException($"Tối đa {MaxInputSize} phần tử.");
        if (inputData.Any(x => x < 0))
            throw new ArgumentException("Radix Sort chỉ hỗ trợ số nguyên không âm.");
        
        InitializeRecorder();
        int[] arr = (int[])inputData.Clone();
        if (arr.Length == 0) return _frames;

        int max = arr.Max();
        CaptureState(arr, 0, $"🚀 Radix Sort (LSD): max={max}, sắp xếp theo từng chữ số.");

        for (int exp = 1; max / exp > 0; exp *= 10)
        {
            ct.ThrowIfCancellationRequested();
            CaptureState(arr, 1, $"⚡ CHỤC SỐ {exp}: sắp xếp theo chữ số (x/{exp})%10.");
            CountingSortByDigit(arr, exp, ct);
            CaptureState(arr, 1, $"✅ Sau chữ số {exp}: [{string.Join(",", arr)}].");
        }
        
        List<int> sorted = Enumerable.Range(0, arr.Length).ToList();
        CaptureState(arr, 0, "🎉 RADIX SORT HOÀN TẤT! Tất cả các chữ số đã ổn định.", sorted: sorted);
        return _frames;
    }

    private void CountingSortByDigit(int[] arr, int exp, CancellationToken ct)
    {
        int n = arr.Length;
        int[] output = new int[n];
        int[] count = new int[10];

        for (int i = 0; i < n; i++)
            count[(arr[i] / exp) % 10]++;
        
        CaptureState(arr, 2, $"Count theo chữ số: [{string.Join(",", count)}].");

        for (int i = 1; i < 10; i++) count[i] += count[i - 1];

        for (int i = n - 1; i >= 0; i--)
        {
            ct.ThrowIfCancellationRequested();
            int d = (arr[i] / exp) % 10;
            output[--count[d]] = arr[i];
        }
        Array.Copy(output, arr, n);
    }
}
'''

heap_sort = '''using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies;

public class HeapSortStrategy : AlgorithmStrategyBase
{
    public override string AlgorithmId => "heap-sort";
    public override string Name => "Heap Sort (Sắp xếp Đống)";
    public override string Category => "Sorting";
    private const int MaxInputSize = 150;

    public override AlgorithmMetadata GetMetadata() => new()
    {
        TimeComplexity = "O(n log n) · mọi trường hợp",
        SpaceComplexity = "O(1) · tại chỗ",
        Description = "Xây dựng Max-Heap (đống cực đại), liên tục lấy gốc (max) về cuối mảng, vun lại đống. Thời gian O(n log n) đảm bảo, không dùng đệ quy.",
        PseudoCode = new List<string>
        {
            "buildMaxHeap(A):",
            "  for i = N/2 - 1 → 0: heapify(A, N, i)",
            "heapSort(A):",
            "  buildMaxHeap(A)",
            "  for i = N-1 → 1:",
            "    swap(A[0], A[i])",
            "    heapify(A, i, 0)",
            "heapify(A, n, i):",
            "  largest = i, l=2i+1, r=2i+2",
            "  if l<n AND A[l]>A[largest] → largest=l",
            "  if r<n AND A[r]>A[largest] → largest=r",
            "  if largest≠i → swap, heapify(A,n,largest)"
        }
    };

    public override List<FrameDTO> Execute(int[] inputData, CancellationToken ct = default)
    {
        if (inputData.Length > MaxInputSize)
            throw new ArgumentException($"Tối đa {MaxInputSize} phần tử.");
        
        InitializeRecorder();
        int[] arr = (int[])inputData.Clone();
        int n = arr.Length;
        List<int> sorted = new();

        CaptureState(arr, 0, $"🚀 Heap Sort: xây Max-Heap từ mảng {n} phần tử.");

        // Bước 1: Build Max-Heap O(n)
        for (int i = n / 2 - 1; i >= 0; i--)
        {
            ct.ThrowIfCancellationRequested();
            Heapify(arr, n, i, sorted, ct);
        }
        CaptureState(arr, 1, $"✅ Đã xây dựng MAX-HEAP. Gốc A[0] = {arr[0]} là lớn nhất.");

        // Bước 2: Trích xuất max lần lượt O(n log n)
        for (int i = n - 1; i > 0; i--)
        {
            ct.ThrowIfCancellationRequested();
            (arr[0], arr[i]) = (arr[i], arr[0]);
            sorted.Insert(0, i);
            CaptureState(arr, 3, $"⬆️ TRÍCH MAX: swap root↔A[{i}] → {arr[i]} về cuối. Sorted: {sorted.Count}/{n}.",
                swaps: new List<int>{0, i}, sorted: new(sorted));
            
            Heapify(arr, i, 0, sorted, ct);
        }
        sorted.Insert(0, 0);
        CaptureState(arr, 0, "🎉 HEAP SORT HOÀN TẤT! O(n log n) đảm bảo, không đệ quy.", sorted: sorted);
        return _frames;
    }

    private void Heapify(int[] arr, int n, int i, List<int> sorted, CancellationToken ct)
    {
        while (true)
        {
            ct.ThrowIfCancellationRequested();
            int largest = i;
            int l = 2 * i + 1, r = 2 * i + 2;

            if (l < n && arr[l] > arr[largest]) largest = l;
            if (r < n && arr[r] > arr[largest]) largest = r;

            if (largest == i) return; // đã thỏa tính chất đống

            (arr[i], arr[largest]) = (arr[largest], arr[i]);
            CaptureState(arr, 8, $"🔧 VUN ĐỐNG: A[{i}]={arr[largest]} ↔ A[{largest}]={arr[i]}.",
                swaps: new List<int>{i, largest}, compares: new List<int>{i,l,r}, sorted: sorted);
            i = largest; // lặp vun xuống dưới (iterative → không tràn stack)
        }
    }
}
'''

def write_file(filename, content):
    with open(os.path.join(base_dir, filename), 'w', encoding='utf-8') as f:
        f.write(content)

write_file('SelectionSortStrategy.cs', selection_sort)
write_file('InsertionSortStrategy.cs', insertion_sort)
write_file('QuickSortStrategy.cs', quick_sort)
write_file('MergeSortStrategy.cs', merge_sort)
write_file('CountingSortStrategy.cs', counting_sort)
write_file('RadixSortStrategy.cs', radix_sort)
write_file('HeapSortStrategy.cs', heap_sort)

print('All files successfully updated.')
