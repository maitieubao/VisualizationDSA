# 🧠 Core Logic & Algorithm Implementation Specification (C#)

Tài liệu này đặc tả chi tiết thuật toán sinh trạng thái hoạt họa cho các giải thuật đệ quy phức tạp và cấu trúc dữ liệu phân nhánh ở Backend sử dụng **C#**.

---

## 1. Cơ chế Chụp Trạng thái Đệ quy (Recursive State Capture)

Khác với các thuật toán vòng lặp phẳng thông thường, các thuật toán đệ quy (như Quick Sort, Merge Sort, duyệt Cây) có cấu trúc ngăn xếp cuộc gọi (Call Stack) lồng nhau. Để tái tạo chính xác trạng thái mảng và các con trỏ đồ họa tại mỗi bước đệ quy, chúng ta phải truyền mảng làm việc và bộ đếm bước dùng chung xuyên suốt các cấp đệ quy.

### 1.1. Hiện thực hóa thuật toán Quick Sort Đệ quy (C#)

Dưới đây là mã nguồn lõi hoàn chỉnh của thuật toán Quick Sort ghi nhận chi tiết trạng thái con trỏ chốt Pivot, con trỏ quét `j` và con trỏ hoán vị `i`:

```csharp
using System;
using System.Collections.Generic;
using VisualizationDSA.Core.DTOs;
using VisualizationDSA.Core.Strategies;

namespace VisualizationDSA.Core.Algorithms
{
    public class QuickSortStrategy : IAlgorithmStrategy
    {
        public string AlgorithmId => "quick-sort";
        public string Name => "Sắp xếp Nhanh (Quick Sort)";
        public string Category => "Sorting";

        private List<FrameDTO> _frames;
        private int _stepCounter;

        public AlgorithmMetadata GetMetadata()
        {
            return new AlgorithmMetadata
            {
                TimeComplexity = "O(N log N)",
                SpaceComplexity = "O(log N)",
                Description = "Giải thuật chia để trị chọn phần tử chốt (Pivot) và phân hoạch mảng."
            };
        }

        public List<FrameDTO> Execute(int[] inputData)
        {
            _frames = new List<FrameDTO>();
            _stepCounter = 1;

            int[] arr = (int[])inputData.Clone();

            // Chụp frame ban đầu
            Capture(arr, 0, "Khởi tạo mảng đầu vào và chuẩn bị sắp xếp nhanh.", -1, null, null);

            // Bắt đầu đệ quy
            ExecuteQuickSort(arr, 0, arr.Length - 1);

            // Chụp frame kết thúc hoàn thành
            var sortedIndices = new List<int>();
            for (int k = 0; k < arr.Length; k++) sortedIndices.Add(k);
            Capture(arr, 0, "Mảng đã được sắp xếp tăng dần hoàn chỉnh.", -1, null, null, sortedIndices);

            return _frames;
        }

        private void ExecuteQuickSort(int[] arr, int low, int high)
        {
            if (low < high)
            {
                int pivotIdx = Partition(arr, low, high);
                ExecuteQuickSort(arr, low, pivotIdx - 1);
                ExecuteQuickSort(arr, pivotIdx + 1, high);
            }
        }

        private int Partition(int[] arr, int low, int high)
        {
            int pivot = arr[high]; // Chọn phần tử cuối cùng làm chốt Pivot
            int i = (low - 1); // Con trỏ phân chia

            Capture(arr, 2, $"Chọn phần tử cuối cùng làm chốt Pivot: {pivot} (index {high})", high, null, null);

            for (int j = low; j < high; j++)
            {
                Capture(arr, 5, $"So sánh phần tử A[{j}] ({arr[j]}) với Pivot ({pivot})", high, new[] { j }, null);

                if (arr[j] < pivot)
                {
                    i++;
                    Capture(arr, 7, $"Phần tử A[{j}] ({arr[j]}) nhỏ hơn Pivot. Hoán vị A[{i}] ({arr[i]}) và A[{j}] ({arr[j]})", high, null, new[] { i, j });
                    
                    int temp = arr[i];
                    arr[i] = arr[j];
                    arr[j] = temp;
                }
            }

            Capture(arr, 11, $"Đưa Pivot về đúng vị trí sắp xếp. Hoán vị A[{i + 1}] ({arr[i + 1]}) và Pivot A[{high}] ({arr[high]})", high, null, new[] { i + 1, high });
            
            int temp2 = arr[i + 1];
            arr[i + 1] = arr[high];
            arr[high] = temp2;

            return i + 1;
        }

        private void Capture(
            int[] arr, 
            int activeLine, 
            string explanation, 
            int pivotIdx, 
            int[] compareIdxs, 
            int[] swapIdxs,
            List<int> sorted = null)
        {
            var highlights = new HighlightsDTO
            {
                Compare = compareIdxs != null ? new List<int>(compareIdxs) : new List<int>(),
                Swap = swapIdxs != null ? new List<int>(swapIdxs) : new List<int>(),
                Sorted = sorted != null ? sorted : new List<int>()
            };

            if (pivotIdx != -1)
            {
                // Pivot sẽ được thêm vào mảng so sánh để tô màu đặc biệt (ví dụ màu tím)
                highlights.Compare.Add(pivotIdx);
            }

            _frames.Add(new FrameDTO
            {
                StepId = _stepCounter++,
                ActiveLine = activeLine,
                Explanation = explanation,
                DataState = new List<int>(arr),
                Highlights = highlights
            });
        }
    }
}
```

---

## 2. Logic Sinh Trạng thái Cây tìm kiếm nhị phân (BST Node Insertion)

Đối với cấu trúc cây BST, trạng thái lưu trữ không phải là một mảng tĩnh mà là sự phân nhánh của các Node. Chúng ta biểu diễn đồ thị cây bằng cách chuyển đổi trạng thái Cây sang định dạng mảng phẳng chứa liên kết liên thông (hoặc cấu trúc serialized tree):

*   **Định nghĩa cấu trúc Node:** Mỗi node chứa `Id`, `Value`, `LeftNodeId`, `RightNodeId`, `CoordinateX`, `CoordinateY`.
*   **Capture trạng thái thêm node:** Khi thêm một node mới, ta duyệt từ root đi xuống đệ quy để so sánh tìm vị trí chèn. Mỗi phép so sánh tại một node cha sẽ sinh ra một frame hoạt họa làm nổi bật node cha đó (màu vàng), thuyết minh: *"So sánh giá trị chèn {val} với node {parent_val}, đi sang {left/right}"*.

---

## 3. Logic CTDL Tuyến tính Stack / Queue

Đối với Stack (Push/Pop) và Queue (Enqueue/Dequeue), dữ liệu trạng thái `dataState` biểu diễn mảng chứa các phần tử đang nằm trong ngăn xếp/hàng đợi.
*   **Stack:** Thao tác **Push** sẽ sinh frame hiển thị phần tử mới "bay" từ trên đỉnh rơi xuống đáy ống chứa. Thao tác **Pop** làm nổi bật phần tử đỉnh (màu đỏ) và đẩy phần tử ra khỏi ống chứa, giải phóng bộ nhớ.
*   **Queue:** Thao tác **Enqueue** chèn phần tử vào cuối hàng đợi (Rear). Thao tác **Dequeue** lấy phần tử ra từ đầu hàng đợi (Front), dịch chuyển tất cả phần tử còn lại lên phía trước 1 ô.
