# 📅 Implementation Plan - Concurrency Visualizer (Phase 2)

Kế hoạch phát triển phân hệ Trực quan hóa Bất đồng bộ & Song song (Concurrency Visualizer) được phân bổ thành 2 Sprint để đảm bảo tính thẩm mỹ của Thread Rails và sự chính xác của thuật toán phát hiện Deadlock DFS đồ thị.

---

## 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN

```
+-------------------------------------------------------------+
| Sprint A: Thiết kế Thread Rails & Khóa Padlock (Ngày 1-3)    |
| - Dựng bố cục đường ray luồng nằm ngang Slate mờ.          |
| - Thiết kế cổng vùng găng Critical Section bo Glassmorphism |
| - Vẽ các ổ khóa Mutex Lock với hiệu ứng xoay đóng/mở.       |
| - Tích hợp Monaco Editor hiển thị mã giả đa luồng.          |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Sprint B: Động cơ Đa luồng & DFS Cycle Detector (Ngày 4-6)   |
| - Hiện thực hóa lớp TypeScript ConcurrencySimulationEngine. |
| - Viết giải thuật DFS phát hiện nghẽn vòng tròn Deadlock.   |
| - Đồng bộ hóa phím điều khiển tua Range Slider tiến trình.  |
| - Tiền tải kịch bản Producer-Consumer và Dining Philosophers|
+-------------------------------------------------------------+
```

---

## 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN

### Sprint A: Thiết kế Thread Rails & Khóa Padlock (Ngày 1-3)
*   **Mục tiêu:** Hoàn thiện giao diện đường ray luồng đa đạng, thiết lập cổng kiểm soát vùng găng Glassmorphism lộng lẫy và ổ khóa Mutex Lock chuyển động đóng mở sinh động.
*   **Danh sách công việc:**
    1.  [ ] Xây dựng khung chứa đường ray luồng CSS Flex song song, tự động co giãn thích ứng theo kích cỡ panel.
    2.  [ ] Thiết kế Component cổng vùng găng `CriticalSectionGate.vue` bo tròn sang trọng nổi bật chính giữa các đường ray.
    3.  [ ] Thiết kế các icon ổ khóa Mutex có hiệu ứng chuyển trạng thái Neon Cyan (khi mở) sang Amber Vàng hổ phách (khi đóng giữ khóa).
    4.  [ ] Thiết kế panel xem trước mã giả đa luồng bằng Monaco Editor font JetBrains Mono sắc nét.

### Sprint B: Động cơ Đa luồng & DFS Cycle Detector (Ngày 4-6)
*   **Mục tiêu:** Cài đặt bộ máy giả lập đa luồng bất đồng bộ dựa trên sự kiện, giải thuật DFS đồ thị phát hiện vòng lặp Deadlock và đồng bộ kéo Slider.
*   **Danh sách công việc:**
    1.  [ ] Hiện thực hóa lớp TypeScript hạt nhân `ConcurrencySimulationEngine` xử lý di chuyển luồng và xếp hàng đợi lấy khóa.
    2.  [ ] Cài đặt lớp kiểm tra chu trình đồ thị `DeadlockDetector` sử dụng giải thuật DFS tối ưu dưới 10ms.
    3.  [ ] Đồng bộ hóa cụm phím Play/Pause và Range Slider kéo tua dòng thời gian của toàn bộ các luồng ảo mượt mà.
    4.  [ ] Định dạng và tiền tải 2 tệp JSON kịch bản kinh điển: *Nhà sản xuất - Người tiêu dùng* và *Triết gia ăn tối*.

---

## 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)
1.  Đường ray luồng (Thread Rails Layout) hiển thị sắc nét cân đối trên cả Desktop và Tablet.
2.  Hiệu ứng Race Condition thể hiện chính xác giá trị sai lệch khi tắt Mutex Lock, và chạy mượt mà đúng đắn khi bật Mutex Lock.
3.  Giải thuật DFS tìm chu trình đồ thị WFG hoạt động chính xác 100%, phát cờ báo Deadlock và lóe đỏ Neon vòng tròn tắc nghẽn tức khắc.
4.  Thanh Range Slider chung cho phép kéo lướt tua nhanh đồng bộ toàn bộ tiến trình của các luồng ảo trơn tru.
5.  Kịch bản Triết gia ăn tối (Dining Philosophers) chạy hoàn hảo, hiển thị 5 triết gia ăn uống và tranh chấp đũa vô cùng trực quan.
