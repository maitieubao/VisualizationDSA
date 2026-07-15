# 🚀 Product Requirements Document (PRD) - Interactive Playground (Phase 1)

## 1. Tổng quan Nghiệp vụ (Overview)
Phân hệ **Interactive Playground** (Sân chơi tương tác) chuyển đổi trải nghiệm nhập liệu dữ liệu thuật toán từ gõ chữ thô sơ sang hình thức vẽ trực quan hóa bằng chuột. Tính năng này tỏa sáng nhất khi người học nghiên cứu các cấu trúc mạng lưới phi tuyến tính như Đồ thị (Graphs) và Cây (Trees) nơi việc định nghĩa ma trận hay danh sách kề qua chữ là một rào cản nhận thức lớn.

---

## 2. Mục tiêu Nghiệm vụ (Goals)
*   **Vẽ đồ thị tương tác tự do:** Hỗ trợ click chuột để sinh đỉnh (Node), kéo thả chuột từ đỉnh A sang đỉnh B để thiết lập liên kết (Edge).
*   **Cơ chế đàn hồi tự nhiên (Elastic Movement):** Cho phép nắm kéo di chuyển vị trí các đỉnh tự do trên Canvas, các liên kết nối với đỉnh đó phải tự động co giãn như những sợi dây thun đàn hồi.
*   **Trọng số tương tác:** Cho phép gán giá trị trọng số dữ liệu (Weights) trực tiếp trên mỗi đường nối bằng cách click chọn cạnh.
*   **Không phụ thuộc cú pháp nhập liệu:** Loại bỏ hoàn toàn các lỗi gõ sai dấu phẩy, dấu ngoặc nhọn của học viên khi định nghĩa đồ thị.

---

## 3. Các Tính năng trong Phạm vi MVP (Phase 1 MVP Scope)

### 3.1. Các chế độ công cụ vẽ cốt lõi (Tool modes)
*   Chế độ **SELECT** (Nắm kéo di chuyển): Di chuyển tự do các node, Canvas vẽ lại thời gian thực.
*   Chế độ **ADD_NODE** (Thêm đỉnh): Click chuột vào vùng trống Canvas để tạo đỉnh mới gắn nhãn chữ tăng dần (A, B, C, D...).
*   Chế độ **ADD_EDGE** (Thêm cạnh): Nhấn giữ từ đỉnh nguồn, kéo một nét vẽ đứt nét, nhả chuột tại đỉnh đích để tạo cạnh nối.
*   Chế độ **WEIGHT** (Gán trọng số): Click vào cạnh để bật hộp thoại nhỏ cho phép nhập số dương gán cho cạnh.
*   Chế độ **DELETE** (Xóa): Click chọn đỉnh hoặc cạnh bất kỳ để xóa vĩnh viễn khỏi bản vẽ.

### 3.2. Hiển thị hình ảnh vectơ cao cấp
*   Vẽ các đỉnh hình tròn phẳng cao cấp, các cạnh nét vẽ rõ ràng.
*   Hỗ trợ vẽ mũi tên có hướng rõ nét dừng chính xác sát viền ngoài của hình tròn đích.

---

## 4. Trải nghiệm người dùng (User Stories)
*   Là một học viên lần đầu học thuật toán tìm đường đi ngắn nhất Dijkstra, tôi muốn tự tay nhấp chuột vẽ 5 thành phố (đỉnh) và kéo các con đường nối (cạnh) có độ dài tùy chọn để quan sát cách thuật toán lan tỏa tìm đường đi.
*   Là một giảng viên, tôi muốn vẽ nhanh một cấu trúc cây nhị phân cân bằng bằng cách click chuột đẻ nhánh để trình chiếu minh họa bài giảng trực tiếp cho cả giảng đường xem.
