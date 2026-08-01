---
title: Sắp xếp theo Cơ số (Radix Sort)
description: Khám phá cách thuật toán Radix Sort phá vỡ giới hạn O(N log N) bằng cách phân nhóm các con số từ hàng đơn vị, chục đến trăm thay vì so sánh trực tiếp.
---

# Sắp xếp theo Cơ số (Radix Sort) {#radix-sort}

Khoa học máy tính đã chứng minh toán học rằng: **Mọi thuật toán sắp xếp dựa trên sự so sánh (Comparison-based sorting) như Quick, Merge, hay Heap Sort đều bị giới hạn ở tốc độ giới hạn (lower bound) là O(N log N).** Bạn không thể so sánh nhanh hơn được nữa.

Tuy nhiên, **Radix Sort** đã lách luật! Nó thuộc nhóm các thuật toán sắp xếp **KHÔNG so sánh (Non-comparison based)**. Thay vì đặt câu hỏi "A có lớn hơn B không?", Radix Sort ném các con số vào các "xô" (buckets) dựa trên từng chữ số (cơ số) của nó. Nhờ vậy, tốc độ của nó có thể vươn tới mức tiệm cận **O(N)**.

## Nguyên lý hoạt động {#how-it-works}

Ý tưởng của Radix Sort cực kỳ đơn giản: 
1. Quét qua tất cả các con số, chỉ nhìn vào chữ số ở **hàng đơn vị**. Xếp chúng vào 10 cái xô (từ xô số `0` đến xô số `9`). Xong, đổ các xô ra theo thứ tự.
2. Lặp lại bước 1, nhưng nhìn vào chữ số ở **hàng chục**.
3. Lặp lại bước 1, nhưng nhìn vào chữ số ở **hàng trăm**... Cứ thế cho đến khi duyệt hết chữ số lớn nhất.

**Ví dụ:** Sắp xếp mảng `[170, 45, 75, 90, 802, 24, 2, 66]`

**Vòng 1 (Hàng đơn vị):**
- Xô 0: `170, 90`
- Xô 2: `802, 2`
- Xô 4: `24`
- Xô 5: `45, 75`
- Xô 6: `66`
👉 Ghép lại: `[170, 90, 802, 2, 24, 45, 75, 66]`

**Vòng 2 (Hàng chục):** (Số nào thiếu hàng chục thì coi như là số 0)
- Xô 0: `802, 2` (Số 802 coi hàng chục là 0)
- Xô 2: `24`
- Xô 4: `45`
- Xô 6: `66`
- Xô 7: `170, 75`
- Xô 9: `90`
👉 Ghép lại: `[802, 2, 24, 45, 66, 170, 75, 90]`

**Vòng 3 (Hàng trăm):**
- Xô 0: `2, 24, 45, 66, 75, 90`
- Xô 1: `170`
- Xô 8: `802`
👉 Ghép lại cuối cùng: `[2, 24, 45, 66, 75, 90, 170, 802]`. Sắp xếp hoàn tất!

## Độ phức tạp Thuật toán {#complexity}

| Đặc tính | Phân tích Big O |
| :--- | :--- |
| **Thời gian (Mọi trường hợp)** | **O(d × (N + k))** - Trong đó `d` là số lượng chữ số của con số lớn nhất, `N` là số phần tử, `k` là hệ cơ số (với số thập phân thì `k = 10`). Nếu `d` nhỏ, tốc độ gần như là tuyến tính O(N). |
| **Không gian bộ nhớ** | **O(N + k)** - Cần bộ nhớ phụ cho các xô chứa và mảng đầu ra. Trả giá bằng dung lượng RAM để lấy tốc độ. |
| **Tính ổn định (Stable)** | **Bắt buộc Có** - Nếu xô ở vòng trước không giữ nguyên thứ tự tương đối, thuật toán sẽ sụp đổ. (Counting Sort thường được dùng làm thuật toán ném xô nội bộ vì nó Stable). |

## Cài đặt (Code Example) {#code-example}

Để cài đặt Radix Sort, chúng ta thường dùng **Counting Sort** làm thuật toán hỗ trợ để "chia xô" cho từng chữ số.

```playground:radix-sort
```

```dual:radix-sort
public void RadixSort(int[] array)
{
    int n = array.Length;
    if (n == 0) return;

    // Tìm số lớn nhất để biết số vòng lặp tối đa (d)
    int max = array.Max();

    // Duyệt qua từng chữ số: Hàng đơn vị (exp=1), Hàng chục (exp=10)...
    for (int exp = 1; max / exp > 0; exp *= 10)
    {
        CountingSortByDigit(array, n, exp);
    }
}

// Hàm chia xô dựa trên 1 chữ số cố định (exp)
private void CountingSortByDigit(int[] array, int n, int exp)
{
    int[] output = new int[n];
    int[] count = new int[10]; // 10 xô từ 0 đến 9

    // Khởi tạo mảng đếm
    for (int i = 0; i < 10; i++) count[i] = 0;

    // Đếm số lượng phần tử rơi vào từng xô
    for (int i = 0; i < n; i++)
    {
        int digit = (array[i] / exp) % 10;
        count[digit]++;
    }

    // Tính vị trí tích lũy (Prefix Sum) để xác định vị trí thực tế trong mảng output
    for (int i = 1; i < 10; i++)
    {
        count[i] += count[i - 1];
    }

    // Xây dựng mảng output. 
    // Duyệt ngược từ cuối mảng gốc để duy trì Tính Ổn định (Stability)!
    for (int i = n - 1; i >= 0; i--)
    {
        int digit = (array[i] / exp) % 10;
        output[count[digit] - 1] = array[i];
        count[digit]--;
    }

    // Copy lại vào mảng gốc
    for (int i = 0; i < n; i++)
    {
        array[i] = output[i];
    }
}
```

:::warning Tại sao không dùng Radix Sort cho mọi thứ?
Mặc dù nghe có vẻ nhanh thần tốc O(N), nhưng Radix Sort có nhược điểm lớn: Nó **chỉ chơi với các con số nguyên (Integer) hoặc chuỗi (String) cùng độ dài**. Bạn sẽ khóc ròng nếu cố dùng Radix Sort để sắp xếp một mảng các đối tượng `Student` phức tạp, hoặc sắp xếp số thập phân (Floating point). Đó là lý do Quick Sort vẫn là vua của tính linh hoạt.
:::

## Next Steps {#next-steps}

Thuật toán Radix Sort nhìn trên màn hình mô phỏng sẽ vô cùng thú vị. Các con số sẽ nhảy múa ra vào các xô với nhịp điệu cực kỳ đều đặn. Hãy bấm xem Sandbox nhé!

Sau khi chứng kiến cả 5 thuật toán vừa qua, ắt hẳn bạn đang bị rối não: *"Rốt cục thì dự án thực tế nên xài cái nào?"*. Đừng lo, bài học tiếp theo sẽ giải đáp hoàn toàn thắc mắc đó: **Bảng Tổng hợp & Chọn thuật toán sắp xếp phù hợp**.
