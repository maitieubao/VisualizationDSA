---
title: Tìm kiếm Nhị phân (Binary Search)
description: Học cách chia đôi không gian tìm kiếm liên tục, một kỹ thuật quyền năng giúp bạn tìm thấy dữ liệu trong 1 tỷ bản ghi chỉ với 30 phép tính.
---

# Tìm kiếm Nhị phân (Binary Search) {#binary-search}

Bạn hãy thử tưởng tượng đang mở một cuốn từ điển dày cộp để tìm chữ "P". Chẳng ai lại lật từng trang từ đầu sách (Linear Search). Bản năng của chúng ta là mở toang ra giữa cuốn sách. Nếu trang đó đang ở chữ "M", ta biết chắc chữ "P" nằm ở nửa sau. Ta lờ đi toàn bộ nửa đầu và tiếp tục mở đôi nửa sau. 

Đó chính xác là cách **Tìm kiếm Nhị phân (Binary Search)** hoạt động. 

Điều kiện tiên quyết và bắt buộc của Binary Search là: **Dữ liệu đầu vào PHẢI ĐƯỢC SẮP XẾP từ trước!**

## Nguyên lý hoạt động {#how-it-works}

Giả sử ta cần tìm `target = 37` trong mảng đã sắp xếp: `[11, 23, 29, 37, 41, 58, 62, 70]`.

Ta dùng hai con trỏ `left` (bắt đầu ở 0) và `right` (bắt đầu ở cuối mảng).

**Lần 1:**
- `left` = 0, `right` = 7.
- Tính điểm giữa `mid` = (0 + 7) / 2 = 3. 
- Phần tử ở `mid` là `array[3] = 37`.
- So sánh `37` với `target` (37) -> Khớp hoàn toàn! 
Thuật toán trả về vị trí `3` chỉ sau đúng 1 bước!

**Ví dụ khác: Tìm `target = 62`**
- **Lần 1:** `mid` = 3 (Giá trị `37`). Vì `62 > 37`, ta biết `62` nằm ở nửa phải. Cập nhật `left = mid + 1 = 4`.
- **Lần 2:** `left` = 4, `right` = 7. `mid` = (4 + 7) / 2 = 5 (Giá trị `58`). Vì `62 > 58`, ta tiếp tục thu hẹp vào nửa phải. Cập nhật `left = mid + 1 = 6`.
- **Lần 3:** `left` = 6, `right` = 7. `mid` = (6 + 7) / 2 = 6 (Giá trị `62`). Khớp! Trả về vị trí `6`.

## Độ phức tạp Thuật toán {#complexity}

| Đặc tính | Phân tích Big O |
| :--- | :--- |
| **Thời gian (Tốt nhất)** | **O(1)** - Phần tử cần tìm nằm ngay đúng ở giữa mảng ở lần chia đầu tiên. |
| **Thời gian (Xấu nhất)** | **O(log N)** - Nhờ việc vứt bỏ một nửa số lượng phần tử mỗi lần so sánh, tốc độ là logarit. Nếu $N = 1.000.000$, bạn chỉ mất tối đa 20 phép thử! |
| **Không gian bộ nhớ** | **O(1)** - Nếu dùng vòng lặp (Iterative). Còn nếu dùng Đệ quy (Recursive) sẽ mất `O(log N)` bộ nhớ cho Call Stack. |

## Cài đặt bằng C# (Code Example) {#code-example}

Dưới đây là cách cài đặt bằng vòng lặp `while`, cách tiếp cận tiết kiệm RAM nhất.

```csharp
public int BinarySearch(int[] array, int target)
{
    int left = 0;
    int right = array.Length - 1;

    while (left <= right)
    {
        // Tránh lỗi tràn số (Integer Overflow) khi mảng quá lớn
        // Không dùng (left + right) / 2
        int mid = left + (right - left) / 2;

        // Nếu tìm thấy
        if (array[mid] == target)
        {
            return mid;
        }

        // Nếu target lớn hơn phần tử giữa, vứt bỏ nửa bên trái
        if (array[mid] < target)
        {
            left = mid + 1;
        }
        // Nếu target nhỏ hơn, vứt bỏ nửa bên phải
        else
        {
            right = mid - 1;
        }
    }

    // Không tìm thấy
    return -1;
}
```

:::warning Lỗi kinh điển của Lập trình viên
Bạn có để ý dòng code `int mid = left + (right - left) / 2;` không?
Tại sao không viết `int mid = (left + right) / 2;` cho gọn? 
Đó là bởi vì nếu mảng cực kỳ lớn (ví dụ kích thước gần 2 tỷ phần tử của Max Int), phép cộng `left + right` sẽ vượt quá giới hạn tối đa của biến số nguyên (`Integer Overflow`), dẫn đến kết quả ra số âm và làm sập ứng dụng! Cú pháp trên là một Best Practice khi viết Binary Search.
:::

## Next Steps {#next-steps}

Mặc dù có tốc độ khủng khiếp, Binary Search lại mắc phải điểm yếu là **"Dữ liệu phải được sắp xếp"**. Nếu cơ sở dữ liệu của bạn thêm/xóa/sửa liên tục, chi phí để sắp xếp lại dữ liệu trước khi tìm kiếm sẽ xóa sạch ưu thế của Binary Search.

Tiếp theo, chúng ta sẽ làm quen với một kỹ thuật tìm kiếm/duyệt mảng nâng cao, chuyên trị các bài toán tìm kiếm "chuỗi con" hoặc "mảng con thỏa mãn điều kiện" liên tục: **Kỹ thuật Cửa sổ trượt (Sliding Window)**.

<div class="vt-box-container next-steps">
  <a class="vt-box" href="/docs/searching/sliding-window">
    <p class="next-steps-link">Kỹ thuật Cửa sổ trượt (Sliding Window)</p>
    <p class="next-steps-caption">Kéo một khung cửa sổ linh hoạt để giải quyết bài toán mảng con trong O(N).</p>
  </a>
</div>
