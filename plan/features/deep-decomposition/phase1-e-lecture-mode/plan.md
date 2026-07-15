# 📅 Implementation Plan - E-Lecture Mode (Phase 1)

Lộ trình chi tiết xây dựng và triển khai phân hệ Bài giảng Điện tử (E-Lecture Mode) được chia làm 2 Sprint chính, hoàn thiện từ nền tảng dữ liệu đến trải nghiệm đồ họa tương tác đồng bộ.

---

## 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN

```
+-------------------------------------------------------------+
| Sprint A: Thiết lập Hợp đồng Dữ liệu & UI Overlay (Ngày 1-3)|
| - Định nghĩa JSON Schema kịch bản bài giảng.                 |
| - Viết kịch bản Mockup bài giảng mẫu Quick Sort.             |
| - Xây dựng Component LectureOverlay.vue hiệu ứng kính mờ.   |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Sprint B: Đồng Bộ Đồng Cơ & Đóng Gói Trực Quan (Ngày 4-6)   |
| - Hiện thực hóa Pinia Store useLectureStore TypeScript.    |
| - Tích hợp cơ chế khóa đồng bộ PLAY_UNTIL với Canvas.      |
| - Hiệu ứng tự động thu phóng, ẩn hiện thẻ khi Canvas chạy.   |
+-------------------------------------------------------------+
```

---

## 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN

### Sprint A: Thiết lập Hợp đồng Dữ liệu & UI Overlay (Ngày 1-3)
*   **Mục tiêu:** Định hình cấu trúc kịch bản và hoàn tất thiết kế giao diện thẻ bài giảng đẹp mắt nổi bật đè lên màn hình Canvas.
*   **Danh sách công việc:**
    1.  [ ] Định nghĩa bộ kiểu dữ liệu (Interfaces) TypeScript cho kịch bản Slide và lệnh điều khiển.
    2.  [ ] Tạo thư mục chứa và biên soạn tập tin kịch bản mẫu `quick-sort-pivot-101.json` mô phỏng 3 bước giới thiệu chốt Pivot.
    3.  [ ] Thiết kế và viết mã nguồn Component `LectureOverlay.vue` ứng dụng kính mờ (Glassmorphism CSS), nút Next/Back, và thanh phân trang chấm tròn.
    4.  [ ] Viết lớp phủ tối nền (Dimmed Backdrop Layer) che 40% độ sáng xung quanh Canvas khi mở bài học.
    5.  [ ] Thiết lập nút bấm đóng bài học `[ Exit E-Lecture ]` phục hồi trạng thái.

### Sprint B: Đồng Bộ Động Cơ & Đóng Gói Trực Quan (Ngày 4-6)
*   **Mục tiêu:** Kết nối đồng bộ logic chuyển Slide của bài học với quá trình phát lại hoạt họa của Canvas thông qua Pinia Store.
*   **Danh sách công việc:**
    1.  [ ] Hiện thực hóa Pinia Setup Store `useLectureStore` viết bằng TypeScript quản lý luồng chuyển Slide.
    2.  [ ] Tích hợp cơ chế khóa trạng thái `isWaitingForAnimation` để khóa nút bấm Next khi hoạt ảnh đang trượt tới điểm đích.
    3.  [ ] Cài đặt Callback Hook nhận tín hiệu dừng từ `useAnimationStore` sau khi hoàn thành lệnh chạy `PLAY_UNTIL`.
    4.  [ ] Hiện thực hóa hiệu ứng tự động thu nhỏ thẻ bài giảng về góc phải (hoặc chuyển Opacity về 0.2) khi Canvas bắt đầu chạy hoạt họa minh họa, phóng to trở lại ban đầu khi Canvas dừng hẳn.
    5.  [ ] Tích hợp phím tắt bàn phím (Phím mũi tên Trái/Phải để chuyển Slide, phím Esc để thoát bài học) cải thiện khả năng tiếp cận (Accessibility).

---

## 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)
1.  Kịch bản bài học đọc động từ JSON, chuyển slide mượt mà qua các hiệu ứng chuyển cảnh CSS mịn màng.
2.  Khi chạy lệnh hoạt ảnh `PLAY_UNTIL`, nút "Tiếp tục" bắt buộc phải bị khóa, đồng thời thẻ bài giảng phải tự động thu nhỏ hoặc mờ đi để người học không bị che khuất tầm mắt nhìn các cột Canvas chuyển động.
3.  Bấm nút thoát thoát chế độ bài học phải phục hồi 100% độ sáng màn hình và mở khóa hoàn toàn timeline tương tác tự do.
4.  Vượt qua kiểm thử đơn vị độc lập cho các trạng thái chuyển tiếp Slide trong Pinia Store.
