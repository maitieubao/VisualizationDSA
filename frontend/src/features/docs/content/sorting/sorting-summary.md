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
| **Bucket Sort** | O(N + K) | O(N + K) | O(N²) | O(N + K) | ✅ Có | ❌ Không |

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
