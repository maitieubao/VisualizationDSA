---
title: Sắp xếp Nhanh (Quick Sort)
description: Khám phá nguyên lý Chia để trị (Divide and Conquer) và sức mạnh đệ quy đằng sau một trong những thuật toán sắp xếp nhanh nhất thế giới.
---

# Sắp xếp Nhanh (Quick Sort) {#quick-sort}

Nếu Bubble Sort là một bài tập làm quen, thì **Quick Sort** lại là một vũ khí hạng nặng. Đây là một trong những thuật toán sắp xếp phổ biến và hiệu quả nhất trong khoa học máy tính, được sử dụng làm thuật toán mặc định trong rất nhiều ngôn ngữ lập trình (bao gồm cả hàm `Array.Sort()` của C# trong nhiều trường hợp).

Quick Sort hoạt động dựa trên chiến lược **Chia để trị (Divide and Conquer)**:
1. **Chọn một phần tử làm "Chốt" (Pivot).**
2. **Phân vùng (Partition):** Đưa tất cả các phần tử nhỏ hơn Chốt về bên trái, và các phần tử lớn hơn Chốt về bên phải.
3. Lúc này, Chốt đã nằm ở đúng vị trí cuối cùng của nó.
4. **Đệ quy (Recursion):** Lặp lại quá trình trên cho hai mảng con ở bên trái và bên phải Chốt.

## Nguyên lý Phân vùng (Partition) {#partitioning}

Trái tim của Quick Sort chính là bước Phân vùng. Có nhiều cách chọn Chốt (phần tử đầu, phần tử cuối, phần tử ngẫu nhiên, hoặc phần tử trung vị). Trong ví dụ này, chúng ta sẽ chọn **phần tử cuối cùng làm Chốt (Lomuto partition scheme)**.

Giả sử mảng: `[3, 8, 2, 5, 1, 4]` (Chốt là `4`).
Chúng ta sẽ dùng một con trỏ `i` để đánh dấu ranh giới của các phần tử nhỏ hơn `4`.

1. Duyệt `3`: Nhỏ hơn `4` -> Giữ ở bên trái.
2. Duyệt `8`: Lớn hơn `4` -> Bỏ qua.
3. Duyệt `2`: Nhỏ hơn `4` -> Đổi chỗ với `8` -> `[3, 2, 8, 5, 1, 4]`
4. Duyệt `5`: Lớn hơn `4` -> Bỏ qua.
5. Duyệt `1`: Nhỏ hơn `4` -> Đổi chỗ với `8` -> `[3, 2, 1, 5, 8, 4]`
6. Kết thúc duyệt, đổi chỗ Chốt `4` với phần tử lớn hơn đầu tiên (`5`) -> `[3, 2, 1, 4, 8, 5]`

Lúc này, `4` đã nằm chính giữa. Bên trái toàn số nhỏ hơn (`3, 2, 1`), bên phải toàn số lớn hơn (`8, 5`). Thuật toán tiếp tục đệ quy cho hai nửa này.

## Độ phức tạp Thuật toán (Complexity) {#complexity}

| Đặc tính | Phân tích Big O |
| :--- | :--- |
| **Thời gian (Tốt nhất & Trung bình)** | **O(N log N)** - Nhờ việc chia đôi mảng liên tục (log N cấp độ), mỗi cấp độ duyệt N phần tử. |
| **Thời gian (Xấu nhất)** | **O(N²)** - Xảy ra khi mảng ĐÃ sắp xếp sẵn nhưng lại chọn phần tử cuối làm chốt (mảng không bị chia đôi mà bị chia thành kích thước N-1 và 0). |
| **Không gian bộ nhớ** | **O(log N)** - Nhờ Stack đệ quy (Recursive Call Stack). |
| **Tính ổn định (Stable)** | **Không** - Phép đổi chỗ nhảy cóc có thể làm đảo lộn thứ tự các phần tử bằng nhau ban đầu. |

## Cài đặt bằng C# (Code Example) {#code-example}

```csharp
public void QuickSort(int[] array, int low, int high)
{
    if (low < high)
    {
        // Phân vùng mảng, nhận lại chỉ số của Chốt đã nằm đúng vị trí
        int pivotIndex = Partition(array, low, high);

        // Đệ quy sắp xếp nửa bên trái
        QuickSort(array, low, pivotIndex - 1);
        
        // Đệ quy sắp xếp nửa bên phải
        QuickSort(array, pivotIndex + 1, high);
    }
}

private int Partition(int[] array, int low, int high)
{
    int pivot = array[high]; // Chọn phần tử cuối làm Chốt
    int i = (low - 1); // Con trỏ ranh giới cho các phần tử nhỏ hơn chốt

    for (int j = low; j < high; j++)
    {
        if (array[j] <= pivot)
        {
            i++;
            // Hoán vị array[i] và array[j]
            Swap(ref array[i], ref array[j]);
        }
    }

    // Đưa Chốt vào đúng vị trí ranh giới
    Swap(ref array[i + 1], ref array[high]);
    
    return i + 1; // Trả về vị trí của Chốt
}

private void Swap(ref int a, ref int b)
{
    int temp = a;
    a = b;
    b = temp;
}
```

:::tip Cách tránh trường hợp O(N²)
Trong môi trường thực tế, để tránh rơi vào trường hợp xấu nhất $O(N^2)$, các Kỹ sư thường chọn Chốt một cách ngẫu nhiên (Randomized Quick Sort), hoặc sử dụng kỹ thuật "Median-of-three" (lấy phần tử trung vị của Đầu, Giữa, Cuối làm Chốt).
:::

## Next Steps {#next-steps}

Để cảm nhận rõ sức mạnh "chia để trị", hãy bấm Play ở Sandbox bên cạnh. Bạn sẽ thấy Quick Sort chạy đa luồng ảo diệu như thế nào khi nó liên tục xẻ nhỏ mảng ra và giải quyết từng phần độc lập.

Tiếp theo, chúng ta sẽ tìm hiểu một thuật toán sắp xếp cũng dùng chiến lược "Chia để trị" tương tự với O(N log N), nhưng đảm bảo hiệu suất cực kỳ ổn định mà không bị sụt giảm trong trường hợp xấu nhất: **Sắp xếp Trộn (Merge Sort)**.

<div class="vt-box-container next-steps">
  <a class="vt-box" href="/docs/sorting/merge-sort">
    <p class="next-steps-link">Sắp xếp Trộn (Merge Sort)</p>
    <p class="next-steps-caption">Kỹ thuật liên tục chia đôi mảng và trộn lại một cách hoàn hảo.</p>
  </a>
</div>
