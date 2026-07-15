# 🎭 Behavioral Specification & Validation Rules (Playground)

Tài liệu này đặc tả chi tiết các quy tắc phản hồi giao diện, kịch bản tương tác vẽ hình và các ràng buộc kiểm tra tính hợp lệ của đồ thị trên **Interactive Playground**.

---

## 1. Giới hạn Quy mô Đồ thị (Max Nodes Constraint)

*   **Ràng buộc:** Để bảo toàn tính thẩm mỹ của màn hình và tránh tình trạng lưới đồ thị quá chật chội làm người học hoa mắt, hệ thống áp dụng giới hạn quy mô bản vẽ.
*   **Hành vi xử lý:**
    *   Giới hạn tối đa **30 Đỉnh (Nodes)** trên một Canvas.
    *   Nếu người học cố gắng nhấn đúp chuột sinh thêm đỉnh thứ 31 trong chế độ `ADD_NODE`, hệ thống sẽ chặn hành vi, viền Canvas rung lắc nhẹ màu đỏ báo động, và bật một Toast cảnh báo: *"Số lượng đỉnh tối đa cho phép là 30 để đảm bảo màn hình hiển thị trực quan."*

---

## 2. Kiểm tra Luật Thù hình Thuật toán (Algorithm-Specific Rules)

Bảng vẽ tự động thay đổi hành vi kiểm thử (Validation) dựa trên giải thuật cấu trúc dữ liệu đang được lựa chọn ở trang hiện hành:

### 2.1. Chế độ Cây tìm kiếm nhị phân (Binary Search Tree - BST)
*   **Ràng buộc:** Một cây nhị phân chỉ cho phép tối đa 2 liên kết con (trái và phải) xuất phát từ mỗi node cha.
*   **Hành vi xử lý:** 
    *   Nếu ở chế độ BST, khi người học cố tình kéo dây chun kết nối cạnh thứ 3 từ một đỉnh cha đã có sẵn 2 con, hệ thống sẽ từ chối Snap, nhả chuột dây chun tự động co biến mất và cảnh báo: *"Một nút trong Cây nhị phân chỉ được cho phép có tối đa 2 con."*

### 2.2. Chế độ Đồ thị liên thông (Connected Graph Check)
*   **Ràng buộc:** Đối với các thuật toán tìm đường Dijkstra hoặc Prim, đồ thị bắt buộc phải liên thông (không được tồn tại đỉnh bị cô lập bơ vơ không có cạnh nối).
*   **Hành vi xử lý:**
    *   Khi người dùng nhấn nút chạy giải thuật, Parser sẽ duyệt BFS/DFS toàn bộ đồ thị vẽ ra.
    *   Nếu phát hiện đỉnh cô lập, hệ thống tạm dừng gửi API, đỉnh cô lập đó nhấp nháy đỏ trên Canvas và cảnh báo: *"Thuật toán Dijkstra yêu cầu đồ thị phải liên thông hoàn toàn. Hãy nối hoặc xóa đỉnh cô lập đang nhấp nháy."*

---

## 3. Khóa bảng tương tác khi thuật toán đang phát (Active Playback Lock)

*   **Ràng buộc:** Khi người dùng bắt đầu chạy giải thuật (đang xem hoạt ảnh bay, hoán vị trên Canvas hoặc đang mở bài giảng điện tử).
*   **Hành vi xử lý:**
    *   Toàn bộ thanh công cụ dọc Floating Toolbar bị ẩn hoặc làm mờ xám (`disabled`).
    *   Khóa tuyệt đối khả năng click chuột đẻ đỉnh hay kéo nối cạnh để tránh thay đổi cấu trúc đồ thị khi công cụ vẽ Canvas đang biểu diễn hoạt ảnh.
    *   Giao diện vẽ chỉ được khôi phục quyền tương tác sau khi hoạt ảnh kết thúc hoặc người dùng bấm nút Dừng giải thuật.
    ```css
    .canvas-drawing-layer.animation-active {
      pointer-events: none; /* Khóa click chuột tương tác */
    }
    ```
