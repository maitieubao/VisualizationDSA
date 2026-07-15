# 🚀 Product Requirements Document (PRD) - DSA Modules Library (Phase 1)

## 1. Tổng quan Dự án (Overview)
Phân hệ **DSA Modules Library** đóng vai trò là "Thư viện Nội dung Học tập" của ứng dụng **VisualizationDSA**. Phân hệ này chịu trách nhiệm cung cấp mã giải thuật thực thi chuẩn mực sư phạm và dữ liệu lý thuyết chi tiết để tích hợp trực tiếp vào **Animation Engine** nhằm mang lại trải nghiệm học trực quan tối đa.

---

## 2. Mục tiêu Sản phẩm (Goals)
*   **Xây dựng bộ giải thuật nền tảng chuẩn mực:** Triển khai các thuật toán và cấu trúc dữ liệu cơ bản, thông dụng nhất trong chương trình giảng dạy Khoa học Máy tính tại các trường đại học.
*   **Trình diễn trực quan hóa đa dạng:** Hỗ trợ biểu diễn trực quan nhiều dạng cấu trúc dữ liệu khác nhau từ mảng 1D, cây nhị phân, đến ngăn xếp/hàng đợi bằng hình ảnh đồ họa trực quan tự nhiên.
*   **Dễ dàng mở rộng:** Thiết kế hệ thống dạng cắm rút (plugin) giúp bổ sung giải thuật mới trong tương lai cực kỳ đơn giản và an toàn.

---

## 3. Phạm vi MVP (Phase 1 MVP Scope)

### 3.1. Danh sách giải thuật & CTDL trong phạm vi (In-Scope)
*   **Thuật toán Sắp xếp (Sorting):** Bubble Sort (Sắp xếp nổi bọt), Selection Sort (Chọn trực tiếp), Insertion Sort (Chèn trực tiếp), Merge Sort (Trộn), Quick Sort (Sắp xếp nhanh).
*   **Thuật toán Tìm kiếm (Searching):** Linear Search (Tìm kiếm tuần tự), Binary Search (Tìm kiếm nhị phân).
*   **Cấu trúc dữ liệu tuyến tính (Linear DS):** Ngăn xếp (Stack - thao tác Push/Pop), Hàng đợi (Queue - thao tác Enqueue/Dequeue).
*   **Cấu trúc dữ liệu phi tuyến (Non-Linear DS):** Cây tìm kiếm nhị phân (Binary Search Tree - BST các thao tác Thêm Node, Tìm kiếm, Duyệt cây LNR/NLR/LRN).

### 3.2. Ngoài phạm vi (Out-of-Scope - Sẽ phát triển ở các Phase sau)
*   Các thuật toán đồ thị phức tạp như Tìm đường đi ngắn nhất (Dijkstra, Bellman-Ford, A* Search).
*   Cây tự cân bằng nâng cao (AVL Tree, Red-Black Tree, B-Tree).
*   Thuật toán đối khớp chuỗi (KMP, Rabin-Karp).

---

## 4. Yêu cầu Trải nghiệm Người dùng (User Stories)
*   Là một học viên, tôi muốn so sánh trực quan cơ chế phân tách mảng đệ quy của Quick Sort so với sự dịch chuyển tuần tự của Bubble Sort để hiểu tại sao Quick Sort lại chạy nhanh hơn.
*   Là một giảng viên ôn thi, tôi muốn trình chiếu từng bước đẩy phần tử vào (Push) và lấy phần tử ra (Pop) ở cùng một đầu của Ngăn xếp Stack để học viên dễ hình dung cơ chế LIFO (Vào sau ra trước).
*   Là một lập trình viên mới gia nhập dự án, tôi muốn tự viết thêm thuật toán Heap Sort mới vào mã nguồn mà không lo sợ làm hỏng hay đụng độ code với các giải thuật Sort hiện có.
