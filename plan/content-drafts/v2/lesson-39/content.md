# 🎯 Tổng ôn & chiến lược phỏng vấn

## 1. Động cơ học
Một buổi phỏng vấn thuật toán thường chỉ kéo dài 45 phút: vài phút phân tích đề, một giải pháp đúng và sạch, vài phút kiểm thử. Người được tuyển không phải người thuộc nhiều code nhất mà là người chọn đúng cấu trúc dữ liệu và thuật toán ngay từ phút đầu. Đó là kỹ năng rèn được bằng phương pháp — bài cuối này tổng hợp tư duy đó thành bản đồ quyết định.

## 2. Lý thuyết cốt lõi
- **Chọn cấu trúc theo thao tác ưu tiên:** tra cứu khóa nhanh → hash table; giữ thứ tự → mảng sắp xếp hoặc BST; min/max liên tục → heap; FIFO → queue; LIFO → stack; quan hệ cặp đôi → graph; tiền tố chung → trie.
- **Chọn thuật toán theo dấu hiệu đề:** mảng đã sắp xếp → binary search, two pointers; mọi nghiệm → backtracking; trạng thái lặp lại → quy hoạch động; đường đi ngắn nhất → BFS hoặc Dijkstra; phụ thuộc → topological sort; top K → heap kích thước K; liên thông → DFS hoặc Union-Find.
- Hai bảng ánh xạ giúp hình dung giải pháp trước khi viết code — thói quen quyết định kết quả phỏng vấn.

## 3. Quy trình giải bài (checklist)
1. Đọc đề, ghi rõ ràng buộc: kích thước đầu vào, kiểu dữ liệu, giới hạn thời gian — suy ra mức Big O cần đạt.
2. Nêu brute force trước rồi tối ưu; xác nhận cách hiểu đề với người phỏng vấn trước khi code.
3. Viết code biến tên rõ nghĩa, xử lý biên ngay: rỗng, một phần tử, toàn phần tử trùng.
4. Dry-run ví dụ nhỏ trên giấy, đối chiếu từng bước với đầu ra mong đợi.
5. Sau khi chạy đúng, kiểm tra edge case sót: tràn số, âm, null, chu trình, N cực lớn.

Edge case kinh điển: mảng rỗng và một phần tử; số âm khi đề chỉ nhắc số nguyên; tổng/tích tràn 32-bit; đồ thị có chu trình khi DFS; đầu vào đã sắp xếp hoặc ngược.

Lỗi thường gặp: off-by-one; đệ quy thiếu điều kiện dừng; BFS quên đánh dấu đã thăm gây lặp vô hạn; hai vòng lặp khi hash làm trong O(n); sửa đầu vào gốc của đề.

## 4. Độ phức tạp & so sánh — bảng tra nhanh
| Nhu cầu | Cấu trúc phù hợp | Tra cứu/lấy | Thêm |
| :--- | :--- | :--- | :--- |
| Tra theo khóa | Hash table | O(1) | O(1) |
| Giữ thứ tự | Mảng sort / BST | O(log n) | O(n) / O(log n) |
| Min/max liên tục | Heap | O(1) | O(log n) |
| Vào trước ra trước | Queue | O(1) | O(1) |
| Vào sau ra trước | Stack | O(1) | O(1) |
| Thành phần liên thông | Union-Find | gần O(1) | gần O(1) |

- Bảng này trả lời phần lớn câu hỏi 'nên dùng cấu trúc nào'; nắm nhịp O(1) - O(log n) - O(n) là nền tảng suy ra mọi cấu trúc khác.

## 5. Liên kết trực quan hóa
🖥️ **Mô phỏng tương tác:** bài học này chưa có demo trực quan chuyên biệt — hãy tự chạy code mẫu ở mục 3, rồi tiếp tục với phần Quiz.

## 6. Tổng kết
- Tra nhanh bằng hash, giữ thứ tự bằng sort/BST, min/max bằng heap, phụ thuộc bằng topo, liên thông bằng DFS/Union-Find.
- Viết brute force trước để hiểu đúng đề, tối ưu sau; luôn khai báo giả định và độ phức tạp.
- Kiểm thử biên là bắt buộc: rỗng, một phần tử, trùng, tràn, chu trình.
- Luyện theo pattern mỗi ngày một bài, ghi chép lỗi sai, tái giải bài cũ sau một đến hai tuần.
- Bẫy lớn nhất: chọn cấu trúc theo sở thích thay vì yêu cầu đề; ngừng suy nghĩ khi code chạy đúng một ví dụ.

## 📚 Tham khảo
- Coursera: Data Structures and Algorithms Specialization (UC San Diego)
- Udemy: JavaScript Algorithms and Data Structures Masterclass (Colt Steele)
- Sách: Introduction to Algorithms (CLRS) / Algorithms (Dasgupta et al.)
