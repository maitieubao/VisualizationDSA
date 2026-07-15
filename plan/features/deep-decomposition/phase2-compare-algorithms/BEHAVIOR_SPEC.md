# 🎭 Behavioral Specification & Sync Policies (Algorithm Comparator)

Tài liệu này đặc tả chi tiết các chính sách căn chỉnh tốc độ khi một bên về đích trước, quy tắc đồng bộ dữ liệu ngẫu nhiên ban đầu và hành vi xử lý thay đổi kích thước màn hình kép trên **Side-by-Side Algorithm Comparator**.

---

## 1. Hành vi kết thúc Không đồng thời (Unequal Playback Completion Policy)

Vì các thuật toán có độ phức tạp Big-O khác nhau có tổng số bước khung hình chênh lệch rất lớn (Ví dụ: Quick Sort kết thúc ở Frame 15, Bubble Sort kéo dài tới Frame 80):
*   **Chế độ Phát thường (Standard Independent Speed):**
    *   Khi thuật toán nhanh hơn (Quick Sort) chạy hết tổng số frame của nó (Frame 15), Canvas bên phải tự động chuyển sang trạng thái dừng tĩnh (PAUSE) hiển thị thông báo huy hiệu *"HOÀN THÀNH"* màu Emerald lấp lánh kề bên.
    *   Canvas bên trái (Bubble Sort) vẫn tiếp tục phát hoạt ảnh chầm chậm cho tới khi hoàn tất Frame thứ 80. Bảng thống kê bên phải giữ nguyên trạng thái tĩnh hoàn thành để đối chiếu.
*   **Chế độ Phát tỷ lệ (Normalized Progress Sync):**
    *   Tốc độ phát của Quick Sort được nhân lên tương ứng. Cả hai Canvas con cùng chuyển động khớp từng nhịp % tiến trình và cùng chạm vạch đích $100\%$ đồng thời.

---

## 2. Quy tắc Đồng nhất Dữ liệu Đầu vào (Equalized Random Seed Policy)

Để đảm bảo tính khoa học công bằng tuyệt đối của các phép đối sánh trực quan:
*   **Hành vi tiêm dữ liệu:**
    *   Khi người dùng nhấn nút *"Tạo mảng ngẫu nhiên"* hoặc *"Tạo đồ thị mới"*, hệ thống chỉ sinh ra **một hạt giống dữ liệu duy nhất** (Single data seed object).
    *   Hạt giống dữ liệu này được nhân bản làm hai bản sao giống hệt nhau, đồng thời tiêm trực tiếp vào cả hai bộ máy tính toán hoạt ảnh Left và Right.
    *   Tuyệt đối không cho phép tạo mảng số ngẫu nhiên riêng rẽ cho từng bên, tránh việc so sánh khập khiễng do mảng này dễ sắp xếp hơn mảng kia.

---

## 3. Thích ứng co giãn Màn hình kép (Dual Canvas Resizing Adapters)

*   **Vấn đề:** Khi sinh viên co nhỏ trình duyệt hoặc quay ngang màn hình điện thoại di động làm thay đổi kích thước (width/height) của các khung chứa Canvas song song.
*   **Hành vi xử lý:**
    *   Hệ thống lắng nghe sự kiện `ResizeObserver` trên cả 2 panel.
    *   Khi có thay đổi kích thước, hệ thống tự động gọi hàm tính toán lại tỷ lệ điểm ảnh `devicePixelRatio` cho cả hai Canvas cùng lúc, bảo đảm hình vẽ cột số hoặc đỉnh đồ thị Dijkstra luôn sắc nét cân đối, tuyệt đối không bị méo mó hình học.
