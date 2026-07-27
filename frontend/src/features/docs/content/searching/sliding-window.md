---
title: Kỹ thuật Cửa sổ trượt (Sliding Window)
description: Khám phá bí quyết giải quyết các bài toán mảng con liên tiếp (sub-arrays) trong thời gian O(N) thông qua việc tái sử dụng kết quả thay vì tính toán lại từ đầu.
---

# Kỹ thuật Cửa sổ trượt (Sliding Window) {#sliding-window}

Khi đối mặt với các bài toán yêu cầu tìm "Tổng lớn nhất của $K$ phần tử liên tiếp", "Chuỗi con dài nhất không chứa ký tự lặp", hay "Dãy số liên tục có tổng bằng $S$" trên một mảng/chuỗi, tư duy ngây ngô nhất là dùng hai vòng lặp lồng nhau $O(N^2)$. 

Tuy nhiên, với **Kỹ thuật Cửa sổ trượt (Sliding Window)**, bạn có thể giải quyết các bài toán này chỉ với một lần lướt qua mảng, đưa độ phức tạp về mức **O(N)**. 

Bí mật của Cửa sổ trượt là **tái sử dụng kết quả của tính toán trước đó**.

## Nguyên lý hoạt động {#how-it-works}

Hãy tưởng tượng bạn có một khung cửa sổ bằng bìa các-tông bị khoét một lỗ vừa vặn để nhìn thấy $K$ phần tử cạnh nhau. Bạn đặt cửa sổ đó ở đầu mảng, tính toán, sau đó trượt nó sang phải 1 bước.

**Bài toán:** Tìm tổng lớn nhất của 3 phần tử liên tiếp trong mảng `[2, 1, 5, 1, 3, 2]`. ($K = 3$).

**Cách ngây ngô (Brute Force):**
- Tính `2 + 1 + 5 = 8`
- Tính `1 + 5 + 1 = 7` (Để ý bạn lại phải cộng số `1` và `5` một lần nữa)
- Tính `5 + 1 + 3 = 9` (Lại tính lại số `5` và `1`)
- Lãng phí phép tính!

**Cách dùng Cửa sổ trượt:**
1. Tính tổng cửa sổ đầu tiên (vị trí 0, 1, 2): `sum = 2 + 1 + 5 = 8`.
2. Trượt cửa sổ sang phải 1 bước (Bỏ số `2`, nạp số `1` mới ở vị trí 3):
   `sum_mới = sum_cũ - 2 + 1 = 8 - 2 + 1 = 7`.
3. Trượt tiếp (Bỏ số `1` đầu tiên, nạp số `3`):
   `sum_mới = 7 - 1 + 3 = 9`.

Thay vì cộng lại từ đầu, ta chỉ cần **cộng thêm phần tử mới vừa lọt vào cửa sổ, và trừ đi phần tử cũ vừa bị rơi ra khỏi cửa sổ**.

## Các loại Cửa sổ trượt {#types}

Có hai dạng Sliding Window chính:
1. **Cửa sổ kích thước cố định (Fixed Window):** Kích thước của sổ luôn là $K$ (như ví dụ tính tổng 3 phần tử ở trên).
2. **Cửa sổ co giãn (Dynamic Window):** Cửa sổ có thể phình to hoặc thu nhỏ tùy theo điều kiện bài toán (ví dụ: Tìm mảng con NGẮN NHẤT có tổng >= $S$). Khi chưa đủ tổng, mở rộng cửa sổ bên phải. Khi đã đủ tổng, từ từ co cửa sổ bên trái lại để tìm đoạn ngắn nhất.

## Độ phức tạp Thuật toán {#complexity}

| Đặc tính | Phân tích Big O |
| :--- | :--- |
| **Thời gian (Mọi trường hợp)** | **O(N)** - Dù là cửa sổ tĩnh hay động, mỗi phần tử trong mảng chỉ lọt vào cửa sổ 1 lần và rơi ra ngoài 1 lần. Thuật toán chỉ thực hiện tối đa 2N thao tác. |
| **Không gian bộ nhớ** | **O(1)** - Chỉ tốn vài biến đếm vòng lặp và biến lưu tổng, không cần cấp phát mảng phụ. |

## Cài đặt bằng C# (Code Example) {#code-example}

Dưới đây là cài đặt C# cho dạng **Cửa sổ cố định (Fixed Window)**.

```csharp
public int MaxSumSubarrayOfSizeK(int[] array, int k)
{
    if (array.Length < k) return 0; // Mảng bé hơn cửa sổ

    int maxSum = 0;
    int windowSum = 0;

    // Bước 1: Tính tổng cho cửa sổ đầu tiên
    for (int i = 0; i < k; i++)
    {
        windowSum += array[i];
    }
    maxSum = windowSum;

    // Bước 2: Trượt cửa sổ từ đầu đến cuối mảng
    for (int i = k; i < array.Length; i++)
    {
        // Cộng thêm phần tử mới bên phải, trừ đi phần tử cũ bên trái
        windowSum = windowSum + array[i] - array[i - k];
        
        // Cập nhật lại kỷ lục (max) nếu tổng mới lớn hơn
        maxSum = Math.Max(maxSum, windowSum);
    }

    return maxSum;
}
```

:::info "Tuyệt chiêu" Phỏng vấn Thuật toán
Cửa sổ trượt là một trong những pattern (mẫu) thường xuyên xuất hiện nhất trong các cuộc phỏng vấn LeetCode của các tập đoàn công nghệ lớn (FAANG). Nếu bài toán có nhắc đến các từ khóa như: *"Mảng con liền kề" (Contiguous subarray)*, *"Chuỗi con" (Substring)*, *"Liên tiếp" (Consecutive)* đi kèm với yêu cầu *"Tối đa/Tối thiểu/Dài nhất/Ngắn nhất"*, hãy tự động bật radar và nghĩ ngay đến Sliding Window!
:::

## Next Steps {#next-steps}

Từ Linear Search nguyên thủy duyệt từng phần tử một, đến Binary Search chặt nửa mảng, và cuối cùng là Sliding Window để vét cạn chuỗi con trong thời gian tuyến tính. Các công cụ tìm kiếm đã nằm trong tay bạn.

Tiếp theo, chúng ta sẽ xem xét cách phối hợp và chọn lựa thuật toán trong bài **Tổng hợp: Ứng dụng các thuật toán tìm kiếm**.

<div class="vt-box-container next-steps">
  <a class="vt-box" href="/docs/searching/summary">
    <p class="next-steps-link">Tổng hợp Ứng dụng Tìm kiếm</p>
    <p class="next-steps-caption">Phân tích ưu nhược điểm và nhận diện các dạng bài tập Tìm kiếm.</p>
  </a>
</div>
