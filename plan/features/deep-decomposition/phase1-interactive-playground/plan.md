# 📅 Implementation Plan - Interactive Playground (Phase 1)

Kế hoạch triển khai xây dựng phân hệ Sân chơi vẽ đồ thị tương tác (Interactive Playground) được phân chia làm 2 Sprint chính, đảm bảo hoàn thành từ nền tảng tương tác hình học đến đồng bộ lực vật lý và bộ biên dịch dữ liệu gửi API.

---

## 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN

```
+-------------------------------------------------------------+
| Sprint A: Nền tảng Tương tác Va chạm & UI Toolbar (Ngày 1-3)|
| - Dựng thẻ Canvas, cấu hình Single Event Listener.          |
| - Viết thuật toán khoảng cách Euclide kiểm tra va chạm node. |
| - Xây dựng component thanh công cụ dọc Floating Toolbar.    |
| - Hoàn thành chức năng SELECT di chuyển đỉnh và ADD_NODE.   |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Sprint B: Vẽ Liên Kết Lượng Giác & Mô Phỏng Vật Lý (Ngày 4-6)|
| - Viết logic kéo tạo cạnh ADD_EDGE có mũi tên lượng giác.   |
| - Cài đặt vòng lặp tính toán lực đẩy-kéo cân bằng đồ thị.    |
| - Thiết lập hộp thoại gán trọng số WEIGHT.                  |
| - Viết bộ Parser chuyển đồ thị sang Adjacency List JSON.   |
+-------------------------------------------------------------+
```

---

## 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN

### Sprint A: Nền tảng Tương tác Va chạm & UI Toolbar (Ngày 1-3)
*   **Mục tiêu:** Định hình giao diện thanh công cụ vẽ, dựng Canvas trống và hoàn tất thuật toán nhận diện click trúng node bằng toán học.
*   **Danh sách công việc:**
    1.  [ ] Thiết lập thẻ `<canvas>` trong component Vue 3 và đăng ký các sự kiện tương tác chuột điểm đơn (`mousedown`, `mousemove`, `mouseup`).
    2.  [ ] Xây dựng mô hình toán học khoảng cách Euclide để phân tích tọa độ chuột click có trúng node tròn hay không.
    3.  [ ] Viết mã nguồn thanh công cụ dọc trôi nổi `FloatingToolbar.vue` với thiết kế kính mờ sang trọng, các biểu tượng SELECT, ADD_NODE, ADD_EDGE, WEIGHT, DELETE.
    4.  [ ] Hoàn thành logic chế độ **SELECT**: Cho phép nhấp chọn đỉnh, kéo chuột tịnh tiến đỉnh mượt mà trên Canvas.
    5.  [ ] Hoàn thành logic chế độ **ADD_NODE**: Click chuột vào vị trí bất kỳ sinh đỉnh mới có nhãn chữ tăng dần.

### Sprint B: Vẽ Liên Kết Lượng Giác & Mô Phỏng Vật Lý (Ngày 4-6)
*   **Mục tiêu:** Đồng bộ hóa vẽ các đường nối có mũi tên tiếp xúc viền, lập trình vòng lặp lực đẩy vật lý và xuất dữ liệu kề JSON.
*   **Danh sách công việc:**
    1.  [ ] Viết thuật toán lượng giác `Math.atan2` tính toán chính xác điểm tiếp xúc viền ngoài của node để vẽ đầu mũi tên sắc sảo.
    2.  [ ] Hoàn thành logic chế độ **ADD_EDGE**: Nhấn giữ kéo dây chun đứt nét từ đỉnh nguồn, tự động hút (snap) và đổi màu phát sáng viền (Glow highlight) khi rê gần đỉnh đích.
    3.  [ ] Cài đặt vòng lặp lực vật lý tự cân bằng đồ thị: Lực đẩy tĩnh điện Coulomb đẩy các node xa nhau và lực kéo đàn hồi lò xo Hooke kéo các cạnh nối kề lại gần.
    4.  [ ] Thiết lập hộp thoại nhập số nhỏ khi click vào cạnh trong chế độ **WEIGHT** để gán nhãn trọng số trực quan.
    5.  [ ] Viết hàm Graph Parser chuyển đổi trạng thái node/edge trong Pinia Store thành Adjacency List JSON tương thích API Backend.

---

## 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)
1.  Đồ thị vẽ hoàn toàn trên Canvas duy trì hiệu năng 60 FPS ổn định, không giật lag khi kéo thả node di động.
2.  Đầu mũi tên của các cạnh liên kết chỉ hướng dừng chính xác sát mép ngoài hình tròn node, tuyệt đối không đâm xiên qua tâm hay đè lên chữ nhãn.
3.  Vòng lặp lực đẩy vật lý tự động dừng rung lắc (Stabilize/Cool down) sau khi đồ thị đã đạt trạng thái phân bổ khoảng cách tối ưu để tránh tiêu tốn CPU liên tục.
4.  Bấm nút chạy giải thuật xuất ra đúng Payload JSON danh sách kề chuẩn gửi POST API.
