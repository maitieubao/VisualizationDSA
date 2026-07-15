# 🚀 Product Requirements Document (PRD) - side-by-side Algorithm Comparator (Phase 2)

## 1. Tổng quan Nghiệp vụ (Overview)
Phân hệ **Side-by-Side Algorithm Comparator** (So sánh Đối chiếu Giải thuật) của **VisualizationDSA** mang lại một trải nghiệm thực nghiệm khoa học độc đáo cho người học, cho phép đặt hai giải thuật chạy song song trên cùng một tập dữ liệu đầu vào để trực tiếp đối chiếu hiệu năng, số bước tính toán và hành vi động của chúng, qua đó thấu hiểu sâu sắc khái niệm độ phức tạp thời gian Big-O.

---

## 2. Mục tiêu Nghiệp vụ (Goals)
*   **Xóa bỏ lý thuyết sáo rỗng:** Học viên không chỉ học thuộc lòng công thức Big-O mà trực tiếp nhìn thấy Quick Sort chạy xong trong nháy mắt trong khi Bubble Sort vẫn đang chật vật so sánh hoán vị.
*   **Đảm bảo tính công bằng của thực nghiệm (Fair comparison):** Tự động đồng bộ và tiêm cùng một cấu trúc dữ liệu đầu vào (cùng một mảng số ngẫu nhiên hoặc cùng một đồ thị) cho cả hai thuật toán đối sánh.
*   **Hệ thống điều khiển nhất quán (Unified Control Panel):** Trải nghiệm kéo tua, phát, tạm dừng, thay đổi tốc độ đồng bộ cho cả hai phân hệ hoạt ảnh thông qua một cụm nút duy nhất.
*   **Bảng phân tích trực quan sinh động (Comparative Stats Board):** Bảng hiển thị các cột đo động cập nhật thời gian thực về số lần so sánh, phép toán hoán đổi và tốc độ thời gian thực thi của từng thuật toán.

---

## 3. Các Tính năng trong Phạm vi MVP (Phase 2 MVP Scope)

### 3.1. Giao diện chia đôi Split Canvas Layout
*   Hỗ trợ hiển thị hai màn hình Canvas song song cân đối tuyệt đối trên giao diện bài học.
*   Hỗ trợ nạp độc lập hai thuật toán khác nhau cho hai bên (ví dụ: Left: Selection Sort; Right: Insertion Sort).

### 3.2. Cụm điều khiển đồng bộ Unified VCR Controls
*   Một cụm phím điều khiển Play/Pause/Speed điều tiết đồng bộ tiến trình chạy của cả hai Canvas con.
*   Thanh tua Slider đồng bộ kéo dòng thời gian của cả hai thuật toán về cùng một tỷ lệ tiến trình phần trăm tương ứng.

### 3.3. Bảng đo lường hiệu năng thời gian thực (Comparative Dashboard)
*   Các thanh tiến trình biểu diễn màu sắc Cyan và Emerald nhấp nháy phát sáng nhẹ để hiển thị các chỉ số hiệu năng động.
*   Bảng tổng kết so sánh chỉ số chi tiết sau khi cả hai thuật toán chạy hoàn tất tiến trình.

---

## 4. Trải nghiệm người dùng (User Stories)
*   Là một học viên, tôi muốn chạy song song Bubble Sort và Merge Sort trên cùng một mảng số đảo ngược để tự mắt chứng kiến số phép so sánh của Merge Sort ít hơn vượt trội như thế nào.
*   Là một sinh viên đang phân tích giải thuật tìm đường ngắn nhất, tôi muốn so sánh Dijkstra và A* để xem A* duyệt ít đỉnh hơn Dijkstra nhờ có thêm hàm heuristic định hướng.
*   Là một người dùng, tôi muốn chỉ cần kéo thanh tua Slider một lần mà cả hai Canvas cùng tua đồng bộ về đúng tiến trình tương ứng của chúng để tôi dễ dàng phân tích đối sánh cấu trúc tại mốc 50%.
