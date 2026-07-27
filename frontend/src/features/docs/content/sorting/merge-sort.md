---
title: Sắp xếp Trộn (Merge Sort)
description: Khám phá cách thuật toán Merge Sort chia nhỏ mảng liên tục cho đến khi chỉ còn một phần tử, sau đó khéo léo gộp chúng lại với nhau theo đúng thứ tự.
---

# Sắp xếp Trộn (Merge Sort) {#merge-sort}

Nếu bạn yêu thích chiến lược "Chia để trị" (Divide and Conquer) ở Quick Sort nhưng ghét việc nó thỉnh thoảng bị chậm đi vào những ngày đẹp trời (rơi vào trường hợp xấu nhất O(N²)), thì **Merge Sort** chính là chân ái dành cho bạn.

Thuật toán này **đảm bảo** tốc độ thực thi luôn luôn là **O(N log N)** trong mọi tình huống, bất chấp mảng ban đầu có lộn xộn ra sao. Tuy nhiên, nó có một điểm yếu nhỏ: cần phải vay mượn thêm một chút bộ nhớ ngoài (O(N)).

## Nguyên lý hoạt động {#how-it-works}

Merge Sort hoạt động qua hai giai đoạn chính: **Chia (Divide)** và **Trộn (Merge)**.

**1. Giai đoạn Chia:**
Chẻ đôi mảng liên tục thành hai nửa bằng nhau, cho đến khi mỗi nửa chỉ còn duy nhất một phần tử. (Một mảng có 1 phần tử thì luôn luôn được coi là đã sắp xếp).

Ví dụ với mảng `[38, 27, 43, 3, 9, 82, 10]`:
- Chia lần 1: `[38, 27, 43, 3]` và `[9, 82, 10]`
- Chia lần 2: `[38, 27]`, `[43, 3]`, `[9, 82]`, `[10]`
- Chia lần 3: `[38]`, `[27]`, `[43]`, `[3]`, `[9]`, `[82]`, `[10]`

**2. Giai đoạn Trộn:**
Bắt đầu gộp dần các mảng nhỏ lại với nhau. Vì mỗi mảng nhỏ đều đã được sắp xếp, ta chỉ cần dùng hai con trỏ trỏ vào đầu 2 mảng nhỏ, so sánh ai nhỏ hơn thì bốc vào mảng lớn.

- Trộn 1: `[27, 38]`, `[3, 43]`, `[9, 82]`, `[10]`
- Trộn 2: `[3, 27, 38, 43]`, `[9, 10, 82]`
- Trộn 3 (Cuối): `[3, 9, 10, 27, 38, 43, 82]`

## Độ phức tạp Thuật toán {#complexity}

| Đặc tính | Phân tích Big O |
| :--- | :--- |
| **Thời gian (Tốt/Xấu/Trung bình)** | **O(N log N)** - Quá trình chia đôi mất log N bước. Mỗi bước phải trộn N phần tử. Ổn định tuyệt đối. |
| **Không gian bộ nhớ** | **O(N)** - Cần một mảng phụ để lưu trữ dữ liệu trong quá trình trộn. |
| **Tính ổn định (Stable)** | **Có** - Cực kỳ quan trọng! Nếu bạn sắp xếp danh sách nhân viên theo "Tuổi", những người bằng tuổi sẽ giữ nguyên thứ tự ban đầu của họ. |

## Cài đặt bằng C# (Code Example) {#code-example}

```csharp
public void MergeSort(int[] array, int left, int right)
{
    if (left < right)
    {
        // Tìm điểm chính giữa
        int mid = left + (right - left) / 2;

        // Đệ quy chia nửa trái
        MergeSort(array, left, mid);
        
        // Đệ quy chia nửa phải
        MergeSort(array, mid + 1, right);

        // Trộn hai nửa đã sắp xếp lại
        Merge(array, left, mid, right);
    }
}

private void Merge(int[] array, int left, int mid, int right)
{
    int n1 = mid - left + 1;
    int n2 = right - mid;

    // Tạo mảng tạm
    int[] leftArray = new int[n1];
    int[] rightArray = new int[n2];

    // Copy dữ liệu sang mảng tạm
    Array.Copy(array, left, leftArray, 0, n1);
    Array.Copy(array, mid + 1, rightArray, 0, n2);

    int i = 0, j = 0;
    int k = left; // Vị trí bắt đầu ghi đè vào mảng gốc

    // Trộn 2 mảng lại theo thứ tự tăng dần
    while (i < n1 && j < n2)
    {
        if (leftArray[i] <= rightArray[j])
        {
            array[k] = leftArray[i];
            i++;
        }
        else
        {
            array[k] = rightArray[j];
            j++;
        }
        k++;
    }

    // Nếu nửa trái còn dư, copy nốt vào
    while (i < n1) { array[k++] = leftArray[i++]; }
    
    // Nếu nửa phải còn dư, copy nốt vào
    while (j < n2) { array[k++] = rightArray[j++]; }
}
```

:::info Quick Sort vs Merge Sort
Mặc dù đều có độ phức tạp O(N log N), Quick Sort thường chạy nhanh hơn Merge Sort trên các mảng tĩnh (Array) do cách quản lý bộ nhớ đệm (Cache) của CPU tốt hơn. Ngược lại, Merge Sort được ưu tiên sử dụng nhiều hơn trên các **Danh sách liên kết (Linked List)** vì đặc thù không cần truy xuất mảng ngẫu nhiên.
:::

## Next Steps {#next-steps}

Đừng quên bấm Play trên Sandbox bên cạnh! Xem các mảng bị bẻ đôi và gộp lại liên tục sẽ giúp bạn hiểu sâu sắc về cách thức hoạt động của Đệ quy (Recursion) - kỹ năng tối thượng của lập trình viên.

Sau khi tận hưởng Merge Sort, hãy cùng chuyển sang thuật toán tận dụng một Cấu trúc dữ liệu hình cây vô cùng độc đáo để sắp xếp dữ liệu tại chỗ: **Sắp xếp Đống (Heap Sort)**.

<div class="vt-box-container next-steps">
  <a class="vt-box" href="/docs/sorting/heap-sort">
    <p class="next-steps-link">Sắp xếp Đống (Heap Sort)</p>
    <p class="next-steps-caption">Kỹ thuật "nhổ cây" mảng tuyến tính.</p>
  </a>
</div>
