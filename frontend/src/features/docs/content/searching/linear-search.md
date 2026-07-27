---
title: Tìm kiếm Tuần tự (Linear Search)
description: Khám phá phương pháp tìm kiếm cơ bản và tự nhiên nhất của con người - duyệt qua từng phần tử một cho đến khi tìm thấy kết quả.
---

# Tìm kiếm Tuần tự (Linear Search) {#linear-search}

Tìm kiếm Tuần tự (Linear Search) là thuật toán tìm kiếm cơ bản, trực quan và dễ hiểu nhất trong khoa học máy tính. Cách thức hoạt động của nó giống hệt như cách bạn tìm một cuốn sách cụ thể trên một kệ sách không được sắp xếp: Bạn nhìn vào cuốn đầu tiên, nếu không phải, bạn nhìn sang cuốn thứ hai, rồi cuốn thứ ba... cho đến khi tìm thấy, hoặc đi đến cuối kệ sách.

## Nguyên lý hoạt động {#how-it-works}

Cho một mảng có $N$ phần tử và một giá trị cần tìm (gọi là `target`).
1. Bắt đầu từ phần tử đầu tiên (vị trí `0`).
2. So sánh phần tử hiện tại với `target`.
3. Nếu khớp, trả về vị trí hiện tại (Tìm kiếm thành công).
4. Nếu không khớp, tiến sang phần tử tiếp theo.
5. Lặp lại bước 2. Nếu đã duyệt hết mảng mà vẫn không khớp, trả về `-1` (Tìm kiếm thất bại).

**Ví dụ:** Tìm `target = 8` trong mảng `[5, 2, 8, 4, 1]`.
- Vị trí 0 (Số `5`): Khác `8` ❌
- Vị trí 1 (Số `2`): Khác `8` ❌
- Vị trí 2 (Số `8`): Bằng `8` ✅. Trả về vị trí `2`.

## Độ phức tạp Thuật toán {#complexity}

| Đặc tính | Phân tích Big O |
| :--- | :--- |
| **Thời gian (Tốt nhất)** | **O(1)** - Phần tử cần tìm nằm ngay ở vị trí đầu tiên của mảng. |
| **Thời gian (Xấu nhất)** | **O(N)** - Phần tử cần tìm nằm ở cuối mảng, hoặc không tồn tại trong mảng. Bạn phải duyệt qua toàn bộ $N$ phần tử. |
| **Không gian bộ nhớ** | **O(1)** - Chỉ cần một biến đếm vòng lặp, không tiêu tốn thêm RAM. |

## Cài đặt bằng C# (Code Example) {#code-example}

Thuật toán này chỉ đơn giản là một vòng lặp `for`.

```csharp
public int LinearSearch(int[] array, int target)
{
    // Duyệt qua từng phần tử trong mảng
    for (int i = 0; i < array.Length; i++)
    {
        // Nếu tìm thấy, trả về ngay vị trí (index)
        if (array[i] == target)
        {
            return i;
        }
    }
    
    // Đã duyệt hết mảng mà không tìm thấy
    return -1;
}
```

:::tip Ứng dụng thực tế
Mặc dù bị chê là chậm (O(N)), Linear Search vẫn được sử dụng cực kỳ phổ biến trong lập trình thực tế (ví dụ hàm `.Contains()` hay `.FirstOrDefault()` của LINQ thường dùng thuật toán này). 
Lý do là vì: Nó **không yêu cầu dữ liệu phải được sắp xếp trước**. Khi bạn làm việc với một tập dữ liệu nhỏ (vài nghìn phần tử) hoặc dữ liệu ngẫu nhiên thường xuyên thay đổi, việc bỏ ra $O(N \log N)$ để sắp xếp mảng rồi tìm kiếm nhị phân sẽ tốn thời gian hơn rất nhiều so với việc chỉ việc chạy Linear Search $O(N)$.
:::

## Next Steps {#next-steps}

Mặc dù Linear Search tốt cho các mảng nhỏ và chưa được sắp xếp, nhưng hãy tưởng tượng bạn phải tìm một cái tên trong danh bạ điện thoại có 1 triệu số. Bạn không thể lật từng trang một từ đầu đến cuối được!

Đó là lúc chúng ta cần đến một thuật toán tìm kiếm "chia để trị", có khả năng loại bỏ một nửa số phần tử chỉ trong 1 lần thử nghiệm. Chào mừng bạn đến với **Tìm kiếm Nhị phân (Binary Search)**.

<div class="vt-box-container next-steps">
  <a class="vt-box" href="/docs/searching/binary-search">
    <p class="next-steps-link">Tìm kiếm Nhị phân (Binary Search)</p>
    <p class="next-steps-caption">Kỹ năng tìm kiếm xé dọc mảng dữ liệu với tốc độ O(log N).</p>
  </a>
</div>
