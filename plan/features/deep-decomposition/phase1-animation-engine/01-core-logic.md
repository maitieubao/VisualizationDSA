# 🧠 Backend State Generator & Core Logic (C# .NET)

Tài liệu này đặc tả chi tiết cơ chế chạy giải thuật và ghi nhận chuỗi trạng thái hoạt họa dưới dạng mảng tĩnh ở phía máy chủ sử dụng **C# .NET Core**.

---

## 1. Cơ chế Capture State (State Recorder Pattern)

Để không phải viết lại logic hoạt ảnh phức tạp ở Frontend, Backend sử dụng mẫu thiết kế **State Recorder**. Mỗi bước thực thi nhỏ nhất của thuật toán (như so sánh hay hoán đổi phần tử) được coi là một "khung hình" (Frame). Khung hình này lưu lại toàn bộ ảnh chụp nhanh (snapshot) của mảng dữ liệu cùng với các siêu dữ liệu phụ trợ.

```csharp
namespace VisualizationDSA.Core.Engine
{
    /// <summary>
    /// Các con trỏ làm nổi bật hiển thị trên UI.
    /// </summary>
    public class HighlightIndices
    {
        public List<int> Compare { get; set; } = new();
        public List<int> Swap { get; set; } = new();
        public List<int> Sorted { get; set; } = new();
    }

    /// <summary>
    /// Lưu trữ snapshot của một bước trong giải thuật.
    /// </summary>
    public class FrameDTO
    {
        public int StepId { get; set; }
        public int ActiveLine { get; set; }
        public string Explanation { get; set; } = string.Empty;
        
        // Mảng dữ liệu tĩnh bắt buộc phải độc lập để tránh lỗi tham chiếu
        public int[] DataState { get; set; } = Array.Empty<int>();
        public HighlightIndices Highlights { get; set; } = new();
    }
}
```

### 1.1. Lớp Cơ sở AlgorithmBase điều phối bộ ghi nhận
Mỗi lớp giải thuật đều phải kế thừa từ `AlgorithmBase` để thừa hưởng hàm ghi nhận trạng thái tự động:

```csharp
using System;
using System.Collections.Generic;

namespace VisualizationDSA.Core.Engine
{
    public abstract class AlgorithmBase
    {
        protected List<FrameDTO> _frames = new();
        private int _stepCounter = 0;

        protected void InitializeRecorder()
        {
            _frames.Clear();
            _stepCounter = 0;
        }

        /// <summary>
        /// Chụp ảnh nhanh trạng thái mảng và lưu lại vào danh sách.
        /// </summary>
        protected void CaptureState(
            int[] currentData, 
            int activeLine, 
            string explanation, 
            List<int>? compares = null, 
            List<int>? swaps = null, 
            List<int>? sorted = null)
        {
            _frames.Add(new FrameDTO
            {
                StepId = ++_stepCounter,
                ActiveLine = activeLine,
                Explanation = explanation,
                
                // CRITICAL: Bắt buộc dùng .Clone() để tạo vùng nhớ mảng hoàn toàn mới.
                // Nếu không clone, tất cả các frame sẽ trỏ chung về cùng 1 mảng dữ liệu ban đầu 
                // và phản ánh sai lệch kết quả sau khi giải thuật kết thúc.
                DataState = (int[])currentData.Clone(), 
                
                Highlights = new HighlightIndices
                {
                    Compare = compares ?? new List<int>(),
                    Swap = swaps ?? new List<int>(),
                    Sorted = sorted ?? new List<int>()
                }
            });
        }
    }
}
```

---

## 2. Bài toán Tối ưu hóa Bộ nhớ (Memory Constraint & Analysis)

### 2.1. Phân tích Dung lượng Bộ nhớ (Memory Footprint)
Xét một giải thuật có độ phức tạp thời gian là $O(N^2)$ như Bubble Sort với mảng đầu vào có $N$ phần tử:
*   Số lần so sánh trung bình: $\frac{N(N-1)}{2}$ bước.
*   Số lần hoán vị trung bình: $\frac{N(N-1)}{4}$ bước.
*   Tổng số lượng Frame sinh ra khoảng: $S \approx \frac{3N^2}{4}$ bước.

Nếu $N = 10,000$ (kích thước mảng phổ biến trong các kiểm thử thông thường):
$$S \approx \frac{3 \times 10,000^2}{4} = 75,000,000 \text{ frames!}$$

Mỗi `FrameDTO` chứa một mảng bản sao $N$ số nguyên ($10,000 \times 4 \text{ bytes} \approx 40\text{KB}$) cộng với chuỗi giải thích (~100 bytes).
Tổng dung lượng bộ nhớ thô cần để xử lý giải thuật này ở Backend trước khi chuyển thành JSON:
$$\text{Memory} \approx 75,000,000 \times 40\text{KB} \approx 3,000,000,000\text{KB} \approx 3\text{TB RAM!}$$
Điều này sẽ dẫn đến lỗi cạn kiệt tài nguyên máy chủ (`OutOfMemoryException`) ngay lập tức.

### 2.2. Chiến lược Bảo vệ (Safety Input Guards)
Để đảm bảo an toàn tuyệt đối cho hệ thống hạ tầng máy chủ, chúng ta thiết lập quy định giới hạn đầu vào (Guard Limits) nghiêm ngặt dựa trên phân loại độ phức tạp giải thuật:

| Độ phức tạp giải thuật | Kích thước mảng tối đa ($N$) | Phản hồi khi vượt giới hạn |
|:---|:---|:---|
| Giải thuật $O(N^2)$ (Bubble Sort, Selection Sort,...) | **50 phần tử** | `HTTP 400 Bad Request` kèm thông điệp cảnh báo. |
| Giải thuật $O(N \log N)$ (Quick Sort, Merge Sort,...) | **150 phần tử** | `HTTP 400 Bad Request` kèm thông điệp cảnh báo. |
| Giải thuật tìm kiếm $O(N)$ (Linear, Binary Search,...) | **100 phần tử** | `HTTP 400 Bad Request` kèm thông điệp cảnh báo. |

---

## 3. Hiện thực hóa Thuật toán thực tế (Bubble Sort Executor)

Dưới đây là cài đặt hoàn chỉnh cho lớp thực thi Bubble Sort kế thừa lớp ghi nhận trạng thái:

```csharp
using System.Collections.Generic;

namespace VisualizationDSA.Core.Engine
{
    public class BubbleSortExecutor : AlgorithmBase
    {
        public AlgorithmResult Execute(int[] inputData)
        {
            // Kiểm tra bảo vệ bộ nhớ đầu vào (Memory Guard)
            if (inputData.Length > 50)
            {
                throw new ArgumentException("Kích thước mảng vượt quá giới hạn an toàn (tối đa 50 phần tử).");
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

            // Trạng thái mảng thô ban đầu
            CaptureState(arr, 0, "Bắt đầu khởi chạy giải thuật Bubble Sort.");

            for (int i = 0; i < n - 1; i++)
            {
                for (int j = 0; j < n - i - 1; j++)
                {
                    // Chụp ảnh bước so sánh (dòng 2 trong mã giả)
                    CaptureState(
                        arr, 
                        2, 
                        $"So sánh giá trị tại index {j} ({arr[j]}) và index {j+1} ({arr[j+1]})", 
                        compares: new List<int> { j, j + 1 },
                        sorted: new List<int>(sortedIndices)
                    );

                    if (arr[j] > arr[j + 1])
                    {
                        // Đổi chỗ hai phần tử
                        int temp = arr[j];
                        arr[j] = arr[j + 1];
                        arr[j + 1] = temp;

                        // Chụp ảnh bước hoán vị (dòng 3 trong mã giả)
                        CaptureState(
                            arr, 
                            3, 
                            $"Hoán đổi vị trí của {arr[j+1]} và {arr[j]} vì {arr[j+1]} < {arr[j]}", 
                            swaps: new List<int> { j, j + 1 },
                            sorted: new List<int>(sortedIndices)
                        );
                    }
                }
                
                // Cố định phần tử lớn nhất của lượt lặp hiện tại về cuối mảng
                sortedIndices.Add(n - i - 1);
                CaptureState(
                    arr, 
                    0, 
                    $"Phần tử {arr[n-i-1]} đã được cố định ở vị trí index {n-i-1} thành công.", 
                    sorted: new List<int>(sortedIndices)
                );
            }

            // Hoàn tất sắp xếp mảng
            sortedIndices.Add(0); // phần tử cuối cùng
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
}
```
