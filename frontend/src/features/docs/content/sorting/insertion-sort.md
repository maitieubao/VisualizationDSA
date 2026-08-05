---
title: Sắp xếp Chèn (Insertion Sort)
description: Tìm hiểu Insertion Sort - thuật toán sắp xếp siêu hiệu quả với các mảng kích thước nhỏ hoặc đã được sắp xếp gần xong.
---

# Sắp xếp Chèn (Insertion Sort) {#insertion-sort}

:::info Mục tiêu bài học
- Nắm được ý tưởng rút từng phần tử và "chèn" nó vào vị trí thích hợp ở phần mảng đã được sắp xếp phía trước.
- Hiểu tại sao Insertion Sort lại cực kỳ nhanh ở trường hợp mảng gần như đã sắp xếp (Best Case O(N)).
- Biết được cách các thư viện chuẩn (như C#, Java) kết hợp thuật toán này với Quick Sort.
:::

Sắp xếp Chèn (Insertion Sort) hoạt động chính xác theo cách một người chơi bài tổ chức bộ bài trên tay mình. Ban đầu bạn cầm lá bài đầu tiên. Khi bốc thêm lá thứ hai, bạn so sánh nó với lá đầu tiên và nhét nó vào trước hoặc sau. Khi bốc lá thứ ba, bạn duyệt lại các lá đang cầm từ phải sang trái để tìm đúng khe hở và nhét lá mới vào.

## Nguyên lý hoạt động {#how-it-works}

1. Giả định phần tử đầu tiên (index 0) đã được sắp xếp.
2. Bắt đầu từ phần tử thứ 2 (index 1), gọi nó là `key`.
3. So sánh `key` với các phần tử đứng trước nó.
4. Đẩy lần lượt các phần tử lớn hơn `key` sang phải 1 bước để tạo khoảng trống.
5. Chèn `key` vào khoảng trống vừa tạo ra.
6. Lặp lại cho đến hết mảng.

**Ví dụ:** Sắp xếp mảng `[12, 11, 13, 5, 6]`

```mermaid
flowchart TD
    subgraph B1 ["Bước 1: Key = 11"]
        direction LR
        0_1[12] --- 1_1[11] --- 2_1[13] --- 3_1[5] --- 4_1[6]
        style 1_1 fill:#f59e0b,color:#fff
    end
    
    subgraph B2 ["Bước 2: Dịch 12 sang phải, chèn 11"]
        direction LR
        0_2[11] --- 1_2[12] --- 2_2[13] --- 3_2[5] --- 4_2[6]
        style 0_2 fill:#10b981,color:#fff
        style 1_2 fill:#10b981,color:#fff
    end
    
    subgraph B3 ["Bước 3: Key = 13 (Đã đúng vị trí)"]
        direction LR
        0_3[11] --- 1_3[12] --- 2_3[13] --- 3_3[5] --- 4_3[6]
        style 2_3 fill:#10b981,color:#fff
    end
    
    B1 --> B2 --> B3
```

## Cài đặt (Code Example) {#code-example}

```playground:insertion-sort
```

```dual:insertion-sort
public void InsertionSort(int[] arr)
{
    int n = arr.Length;
    
    for (int i = 1; i < n; i++)
    {
        int key = arr[i];
        int j = i - 1;

        // Di chuyển các phần tử của mảng đã sắp xếp (từ 0 đến i-1)
        // mà lớn hơn key sang vị trí phía sau 1 nấc
        while (j >= 0 && arr[j] > key)
        {
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        
        // Chèn key vào vị trí trống
        arr[j + 1] = key;
    }
}
```

## Phân tích Thuật toán {#complexity}

| Đặc tính | Phân tích Big O |
| :--- | :--- |
| **Thời gian (Tệ nhất / Trung bình)** | **O(N²)** - Xảy ra khi mảng bị sắp xếp ngược hoàn toàn (Từ lớn đến bé). Bạn phải đẩy toàn bộ các số trước nó sang phải. |
| **Thời gian (Tốt nhất)** | **O(N)** - Đây là **"siêu năng lực"** của thuật toán này. Nếu mảng đã được sắp xếp sẵn (hoặc gần xong), vòng lặp `while` bên trong sẽ lập tức dừng lại ngay ở lần kiểm tra đầu tiên. |
| **Không gian bộ nhớ** | **O(1)** - Sắp xếp tại chỗ (In-place). |
| **Tính ổn định (Stable)** | **Có** - Các phần tử có giá trị bằng nhau sẽ giữ nguyên thứ tự ban đầu. |

:::tip Vua của các mảng nhỏ (Small Arrays)
Mặc dù lý thuyết nói rằng **Quick Sort** hay **Merge Sort** (O(N log N)) nhanh hơn **Insertion Sort** (O(N²)). Nhưng thực tế trên máy tính, với mảng có kích thước rất nhỏ (thường là dưới 16 - 32 phần tử), Insertion Sort lại là kẻ chiến thắng do nó không tốn chi phí gọi đệ quy (overhead) và cực kỳ thân thiện với bộ nhớ cache CPU!

Trong C# (.NET) hay Java, phương thức `Array.Sort()` bên dưới vỏ bọc thực chất là lai tạp (Hybrid Sort). Nó sẽ chạy Quick Sort chia mảng ra, nhưng khi chia đến các mảng con có kích thước < 16, nó sẽ ngưng Quick Sort và đổi sang gọi **Insertion Sort** để tối ưu hóa triệt để tốc độ.
:::

:::tip Tóm tắt nhanh (Key Takeaways)
- Tư duy hệt như cách xếp bài trên tay: rút lá mới, dồn các lá cũ tạo khe hở, và nhét lá mới vào.
- Nếu mảng đã sắp xếp gần xong, thuật toán này chạy cực kỳ nhanh (O(N)).
- Thường được các ngôn ngữ lập trình dùng để kết liễu các mảng con nhỏ trong thuật toán lai (TimSort, IntroSort).
:::

## Next Steps {#next-steps}

Đừng chỉ đọc lý thuyết! Hãy truy cập bảng điều khiển tương tác (Sandbox) bên phải màn hình. Bấm nút Play và quan sát từng lượt rút lá bài, dồn các phần tử sang phải rồi chèn `key` vào đúng vị trí để thực sự củng cố kiến thức này.

Sau khi đã nắm vững Insertion Sort, chúng ta sẽ so sánh nó với một thuật toán cùng nhóm sắp xếp so sánh cơ bản: **Sắp xếp Nổi bọt (Bubble Sort)**.

<div class="vt-box-container next-steps">
  <a class="vt-box" href="/docs/sorting/bubble-sort">
    <p class="next-steps-link">Sắp xếp Nổi bọt (Bubble Sort)</p>
    <p class="next-steps-caption">So sánh từng cặp liền kề và liên tục đẩy phần tử lớn nhất về cuối mảng.</p>
  </a>
</div>

## 📚 Tham khảo lý thuyết

Các nguồn lý thuyết uy tín dưới đây được sử dụng để biên soạn bài viết, gắn với từng khái niệm chính:

- **CLRS — Introduction to Algorithms (Cormen, Leiserson, Rivest, Stein), Chương 2:** Nguồn kinh điển cho toàn bộ ý tưởng Insertion Sort, chứng minh tính đúng đắn bằng bất biến vòng lặp (loop invariant), cùng phân tích độ phức tạp thời gian tốt nhất O(N) và trung bình / xấu nhất O(N²).
- **Dasgupta, Papadimitriou, Vazirani — Algorithms, Mục 2.1:** Trình bày trực quan về Insertion Sort và giải thích vì sao thuật toán sắp xếp tại chỗ (in-place) chỉ tốn O(1) bộ nhớ phụ.
- **Wikipedia — Insertion sort:** Tổng hợp các đặc tính của thuật toán như tính ổn định (stable), khả năng thích nghi tốt với dữ liệu gần như đã sắp xếp, và sự so sánh với Quick Sort / Merge Sort trên các mảng kích thước nhỏ.
- **Microsoft Learn — Array.Sort Method (.NET):** Tài liệu chính thức của .NET giải thích phương thức `Array.Sort()` sử dụng thuật toán lai Introsort, kết hợp Quick Sort với Insertion Sort cho các mảng con nhỏ.
- **GeeksforGeeks — Insertion Sort:** Tài liệu tham khảo bổ sung về cài đặt chuẩn (dịch các phần tử lớn hơn `key` bằng vòng lặp `while`) và bảng tổng hợp độ phức tạp của thuật toán.
