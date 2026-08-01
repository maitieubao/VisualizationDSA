---
title: Tổng hợp Cây & Đồ thị
description: Cẩm nang sinh tồn khi đối mặt với các bài toán Cây và Đồ thị, cung cấp bí quyết chọn lựa giữa BFS, DFS và nhận diện các pattern kinh điển.
---

# Tổng hợp: Ứng dụng Cây & Đồ thị {#tree-graph-summary}

Mảng (Array) hay Ngăn xếp (Stack) giống như con đường một chiều, bạn chỉ việc nhắm mắt đi thẳng. Nhưng Cây (Tree) và Đồ thị (Graph) lại giống như một mạng lưới giao thông chằng chịt các ngã rẽ. Đó là lý do tại sao các bài toán liên quan đến nhóm cấu trúc phi tuyến tính này luôn được xếp vào hàng khó nhất trong các buổi phỏng vấn thuật toán (Hard LeetCode).

Bài viết này sẽ đóng vai trò như một chiếc la bàn, giúp bạn "đọc vị" đề bài và chọn ngay vũ khí chính xác giữa BFS và DFS.

## Bảng so sánh BFS và DFS {#comparison-table}

| Tiêu chí | BFS (Duyệt chiều rộng) | DFS (Duyệt chiều sâu) |
| :--- | :--- | :--- |
| **Bản chất** | Tỏa ra mọi hướng cùng lúc (như vết dầu loang) | Đâm xuyên một mạch đến tận cùng (như đào giếng) |
| **Cấu trúc lõi**| Hàng đợi (Queue) | Ngăn xếp (Stack) hoặc Đệ quy (Recursion) |
| **Không gian bộ nhớ** | Tốn kém nếu Đồ thị rất "rộng" (nhiều hàng xóm ở mỗi tầng) | Tốn kém nếu Đồ thị rất "sâu" (đi được rất xa mới chạm đáy) |
| **Rủi ro sập hệ thống**| Hết bộ nhớ (Out of Memory) do Queue phình to | Tràn bộ nhớ (StackOverflow) nếu dùng Đệ quy cho đồ thị siêu sâu |
| **Ưu điểm độc tôn**| **Luôn tìm ra đường đi ngắn nhất** (với mảng 2D/đồ thị ko trọng số) | Code đệ quy cực kỳ ngắn gọn, dễ triển khai |

## Nhận diện "Mùi" bài toán (Pattern Matching) {#pattern-matching}

Chỉ cần nhìn thấy những từ khóa sau trong đề bài, bạn có thể đoán ngay đến 90% giải pháp!

### 1. Dấu hiệu Gọi tên BFS
- *"Tìm **đường đi ngắn nhất** (Shortest path)..."*
- *"Số bước **tối thiểu** (Minimum steps)..."*
- *"Thoát khỏi mê cung **nhanh nhất**..."*
- *"Khoảng cách gần nhất từ điểm A đến B..."*

👉 **Chiến lược:** BFS là lựa chọn DUY NHẤT cho các bài toán yêu cầu tìm "sự ngắn nhất" hoặc "số bước ít nhất" trên một đồ thị không có trọng số (ví dụ: mảng 2D chỉ có 0 và 1). Việc dùng DFS cho các bài này là cực kỳ ngớ ngẩn vì DFS có thể đi lòng vòng quanh thế giới rồi mới tới điểm B, trong khi điểm B nằm ngay cạnh điểm A!

### 2. Dấu hiệu Gọi tên DFS
- *"Liệt kê **tất cả** các con đường (Find all paths)..."*
- *"Liệu **có tồn tại** một đường đi từ A đến B không?"*
- *"Giải mê cung / Backtracking (Sudoku, 8 Hậu)..."*
- *"Tính **tổng** các nhánh trên cây..."*
- *"Bài toán đếm số Hòn đảo (Number of Islands) hoặc tìm Vùng Liên thông (Connected Components)"* (Bài này BFS làm cũng được, nhưng DFS viết đệ quy nhàn hơn nhiều).

👉 **Chiến lược:** DFS tỏa sáng khi bạn cần Vét cạn (Exhaustive search) tất cả các khả năng, hoặc khi bạn chỉ cần câu trả lời "CÓ hay KHÔNG" (đụng phải đích là ngưng luôn). Đệ quy của DFS giúp bạn bảo toàn trạng thái (backtrack) mỗi khi đi vào ngõ cụt.

### 3. Dấu hiệu Gọi tên Cây nhị phân tìm kiếm (BST)
- *"Thiết kế một hệ thống cho phép **Thêm (Insert), Xóa (Delete) và Tìm kiếm (Search)** liên tục, đều đặn"*
- *"Mỗi thao tác phải diễn ra trong khoảng $O(\log N)$"*
- *"Tìm số lớn thứ $K$ trong một mảng thay đổi liên tục"* (Gợi ý duyệt In-order)

👉 **Chiến lược:** BST sinh ra để thay thế mảng tĩnh khi dữ liệu biến động quá nhiều. Hãy nhớ rằng duyệt In-order trên BST sẽ cho ra một danh sách luôn Sắp xếp Tăng dần hoàn hảo.

## Lưu ý sống còn: "Visited" trong Đồ thị {#visited-set}

Lỗi ngớ ngẩn nhất nhưng lại làm rớt phỏng vấn nhiều nhất khi làm bài Đồ thị là quên **đánh dấu các đỉnh đã thăm (Visited)**. 

Khác với Cây là dòng thác chảy một chiều, Đồ thị chứa các chu trình (Cycles) — A nối B, B nối A. Nếu bạn không tạo một mảng `bool[] visited` hoặc `HashSet<int>` để đánh dấu, BFS/DFS của bạn sẽ chạy qua lại giữa A và B tạo thành vòng lặp vô hạn (Infinite Loop).
- Với BFS: Bỏ vào Queue $\rightarrow$ Ghi `Visited` ngay lập tức.
- Với DFS: Đẩy vào Stack $\rightarrow$ Ghi `Visited` ngay lập tức.

## Next Steps {#next-steps}

Chúc mừng bạn! Bạn đã hoàn thành 100% giáo trình thuật toán cấu trúc dữ liệu nền tảng (Sorting, Searching, Tuyến tính, và Cây đồ thị). Lượng kiến thức này đã biến bạn thành một chiến binh thực thụ, sẵn sàng bẻ khóa mọi cấu trúc code khó nhằn.

Và bây giờ, hãy tháo bỏ chiếc mũ "Thuật toán học", đội lên đầu chiếc nón "Kỹ sư kiến trúc phần mềm". Chúng ta sẽ bước vào thế giới trừu tượng nhất nhưng cũng thực dụng nhất: **Lập trình Hướng Đối Tượng (OOP)**.

<div class="vt-box-container next-steps">
  <a class="vt-box" href="/docs/oop/encapsulation">
    <p class="next-steps-link">Bắt đầu Chương OOP: Tính Đóng Gói (Encapsulation)</p>
    <p class="next-steps-caption">Xây tường bảo vệ dữ liệu và nghệ thuật giấu kín sự phức tạp.</p>
  </a>
</div>
