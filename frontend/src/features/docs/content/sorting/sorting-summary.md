---
title: Tổng hợp Thuật toán Sắp xếp
description: Bảng so sánh toàn diện 7 thuật toán sắp xếp kinh điển và bí quyết lựa chọn thuật toán chuẩn kỹ sư phần mềm trong môi trường thực tế.
---

# Tổng hợp: Chọn Thuật toán Sắp xếp {#sorting-summary}

Chúng ta đã cùng nhau phân tích 7 thuật toán sắp xếp phổ biến nhất. Đứng trước một mảng dữ liệu lộn xộn, không có một thuật toán nào là "tuyệt đối tốt nhất" cho mọi trường hợp. Việc lựa chọn phụ thuộc vào **kích thước dữ liệu, bản chất dữ liệu, và giới hạn phần cứng**.

Dưới đây là bảng tổng hợp "kim chỉ nam" giúp bạn dễ dàng đưa ra quyết định.

## Bảng So sánh Tổng hợp Big O {#comparison-table}

| Thuật toán | Tốt nhất | Trung bình | Xấu nhất | Bộ nhớ (Space) | Ổn định (Stable) | Dựa trên So sánh? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Bubble Sort** | O(N) | O(N²) | O(N²) | O(1) | ✅ Có | ✅ Có |
| **Quick Sort** | O(N log N) | O(N log N) | O(N²) | O(log N) | ❌ Không | ✅ Có |
| **Merge Sort** | O(N log N) | O(N log N) | O(N log N) | O(N) | ✅ Có | ✅ Có |
| **Heap Sort** | O(N log N) | O(N log N) | O(N log N) | O(1) | ❌ Không | ✅ Có |
| **Counting Sort**| O(N + K) | O(N + K) | O(N + K) | O(N + K) | ✅ Có | ❌ Không |
| **Radix Sort** | O(d(N+K)) | O(d(N+K)) | O(d(N+K)) | O(N + K) | ✅ Có | ❌ Không |
| **Bucket Sort** | O(N + K) | O(N + K) | O(N²) | O(N + K) | ✅ Có (tùy thuộc) | ⚠️ Một phần |

> ⚠️ **Bucket Sort không thuần "non-comparison"** như Counting Sort/Radix Sort: chỉ bước chia xô (Scatter) là không dùng so sánh, nhưng bước sắp xếp nội bộ trong từng xô (thường là Insertion Sort) **dựa trên so sánh**. Tương tự, tính ổn định (stable) của nó tùy thuộc thuật toán sắp xếp dùng bên trong mỗi xô.

## Bí quyết Lựa chọn (Best Practices) {#how-to-choose}

### 1. Dữ liệu rất nhỏ ($N < 50$)
Đừng dùng thuật toán phức tạp. Cài đặt **Insertion Sort (Sắp xếp chèn)** hoặc dùng luôn **Bubble Sort**. Mã nguồn ngắn gọn, không tốn chi phí gọi đệ quy (overhead) sẽ giúp CPU xử lý nhanh hơn cả Quick Sort.

### 2. Dữ liệu cực lớn, bộ nhớ dư dả, cần Tính Ổn định (Stable)
**Merge Sort** là vua. Nó hoàn hảo khi bạn phải sắp xếp cơ sở dữ liệu lớn, đọc ghi từ ổ cứng ngoài (External Sorting), hoặc khi bạn thao tác với cấu trúc Danh sách liên kết (Linked List).

### 3. Cần tốc độ tối đa, không cần Tính Ổn định
Sử dụng **Quick Sort**. Đây là lý do tại sao nó là thuật toán mặc định trong hầu hết các ngôn ngữ lập trình. Mặc dù có O(N²) ở trường hợp xấu, nhưng nhờ khai thác cực tốt CPU Cache, nó chạy nhanh hơn Merge và Heap trên thực tế. C# giải quyết O(N²) của Quick Sort bằng cách kết hợp nó với Heap Sort!

### 4. Thiết bị nhúng, bộ nhớ cực kỳ eo hẹp (Memory constraint)
Sử dụng **Heap Sort**. Nó đảm bảo O(N log N) tuyệt đối mà không cần dùng đến 1 byte mảng phụ hay Stack đệ quy nào. Hoàn hảo cho các hệ thống phần cứng giới hạn.

### 5. Dữ liệu có khoảng giá trị nhỏ và hẹp (K nhỏ)
Sử dụng **Counting Sort**. Ví dụ: Sắp xếp học sinh toàn trường theo điểm thi (từ 0 đến 10), hoặc tuổi (từ 1 đến 100). Thuật toán O(N) này sẽ thổi bay Quick Sort.

### 6. Dữ liệu thập phân phân bố đồng đều
Sử dụng **Bucket Sort**. Các điểm số thập phân từ 0.0 đến 1.0 sẽ được phân vào các xô và sắp xếp nội bộ cực kỳ hiệu quả.

## Sự thật thú vị: C# sử dụng thuật toán nào? {#csharp-sort}

Bạn có biết hàm `Array.Sort()` hay `.OrderBy()` quen thuộc trong C# dùng thuật toán gì không?
Thực tế, Microsoft (và phần lớn ngôn ngữ khác như C++, Python) không dùng một thuật toán đơn lẻ. Họ dùng các **Thuật toán lai (Hybrid Algorithms)**!

Trong .NET (C#), thuật toán được sử dụng gọi là **Introsort (Introspective Sort)**. Nó hoạt động như sau:
1. Nó khởi đầu bằng **Quick Sort** để lấy tốc độ tối đa.
2. Nó liên tục theo dõi độ sâu của đệ quy (Recursion depth). Nếu nó thấy Quick Sort đang chạy quá sâu (nguy cơ rơi vào O(N²)), nó lập tức "quay xe" chuyển sang **Heap Sort** để đảm bảo thời gian O(N log N).
3. Nếu ở vòng lặp nào đó, mảng con bị chia nhỏ chỉ còn dưới 16 phần tử, nó chuyển sang **Insertion Sort** vì với mảng nhỏ, Insertion Sort vô đối về tốc độ!

:::tip Bài học rút ra
Kỹ sư phần mềm giỏi không phải là người tự tay viết lại thuật toán Quick Sort vào dự án công ty (hãy dùng hàm có sẵn của ngôn ngữ). Kỹ sư giỏi là người **hiểu rõ chi phí thời gian và bộ nhớ** của dữ liệu mình đang nắm giữ để gọi đúng hàm, chọn đúng cấu trúc dữ liệu!
:::

## Next Steps {#next-steps}

Chúc mừng bạn đã chinh phục thành công chương Nhóm Sắp xếp! Kiến thức này đã đủ để bạn vượt qua mọi câu hỏi phỏng vấn về độ phức tạp thời gian.

Bây giờ, chúng ta sẽ chuyển sang một nhóm thuật toán có tính ứng dụng cao hơn rất nhiều trong việc thao tác với Cơ sở dữ liệu: **Nhóm Tìm kiếm (Searching Algorithms)**. Bài đầu tiên: **Tìm kiếm Tuần tự (Linear Search)**.

<div class="vt-box-container next-steps">
  <a class="vt-box" href="/docs/searching/linear-search">
    <p class="next-steps-link">Tìm kiếm Tuần tự (Linear Search)</p>
    <p class="next-steps-caption">Cách đơn giản nhất để tìm kim trong đáy bể.</p>
  </a>
</div>

## 📚 Tham khảo lý thuyết {#references}

Dưới đây là các nguồn tài liệu kinh điển và chính thống được dùng để biên soạn bài viết này, giúp bạn tự nghiên cứu sâu hơn nếu muốn:

- **Bảng tổng hợp độ phức tạp, tính ổn định (stable) và tính in-place của từng thuật toán:** Cormen, Leiserson, Rivest & Stein, *Introduction to Algorithms* (CLRS), 3rd Edition (MIT Press) - Chương 6, 7, 8 về Heap Sort, Quick Sort và các thuật toán sắp xếp tuyến tính (Counting Sort, Radix Sort, Bucket Sort). Đây là nguồn gốc của toàn bộ các ký hiệu Big O trong bảng so sánh.
- **Độ phức tạp trường hợp tốt nhất O(N) của Bubble Sort nhờ cờ dừng sớm:** [Bubble sort - Wikipedia](https://en.wikipedia.org/wiki/Bubble_sort). Mô tả thuật toán cùng bảng độ phức tạp và tính ổn định.
- **Quick Sort O(N log N) trung bình, O(N²) trường hợp xấu và vai trò chọn pivot:** [Quicksort - Wikipedia](https://en.wikipedia.org/wiki/Quicksort).
- **Merge Sort, Heap Sort với độ phức tạp O(N log N) tuyệt đối, không gian phụ trợ và tính ổn định:** [Merge sort - Wikipedia](https://en.wikipedia.org/wiki/Merge_sort) và [Heapsort - Wikipedia](https://en.wikipedia.org/wiki/Heapsort).
- **Counting Sort, Radix Sort, Bucket Sort — họ sắp xếp không dựa trên so sánh, đạt O(N) khi giá trị có phạm vi nhỏ:** [Counting sort - Wikipedia](https://en.wikipedia.org/wiki/Counting_sort), [Radix sort - Wikipedia](https://en.wikipedia.org/wiki/Radix_sort) và [Bucket sort - Wikipedia](https://en.wikipedia.org/wiki/Bucket_sort).
- **C# dùng thuật toán lai IntroSort (Quick Sort + Heap Sort + Insertion Sort) cho `Array.Sort()`:** Microsoft Learn - [Array.Sort Method (.NET)](https://learn.microsoft.com/en-us/dotnet/api/system.array.sort). Tài liệu chính thức giải thích chiến lược lai giúp tránh trường hợp xấu O(N²).
- **Hành vi của `OrderBy()` trong LINQ và so sánh với `Array.Sort()`:** Microsoft Learn - [Enumerable.OrderBy Method (.NET)](https://learn.microsoft.com/en-us/dotnet/api/system.linq.enumerable.orderby).
