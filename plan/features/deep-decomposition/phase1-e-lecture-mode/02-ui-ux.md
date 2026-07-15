# 🎨 UI & UX Specification - Presentation Layer (Overlay)

Tài liệu này đặc tả thiết kế giao diện thẻ trình bày bài giảng điện tử (Lecture Panel Overlay), bộ lọc làm mờ nền (Backdrop Dimming) và cơ chế thu phóng tập trung động nhằm tối ưu hóa trải nghiệm học tập của học sinh.

---

## 1. Thiết kế Thẻ Kính mờ (Glassmorphism Modal)

Thẻ bài giảng được thiết kế nổi đè lên trên Canvas để tạo chiều sâu kiến trúc giao diện, đồng thời giữ tông màu trung tính sang trọng để tăng tính tập trung nhận thức.

### Các thuộc tính CSS Design Tokens lõi:
```css
.lecture-overlay-panel {
  position: absolute;
  top: 10%;
  left: 5%;
  width: 380px;
  min-height: 250px;
  padding: 24px;
  
  /* Thiết kế kính mờ cao cấp */
  background: rgba(30, 41, 59, 0.7); /* Slate 800 với opacity */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 
              0 10px 10px -5px rgba(0, 0, 0, 0.2);
              
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  z-index: 1000;
}
```

---

## 2. Các Trạng thái Giao diện & Hiệu ứng Chuyển cảnh

### 2.1. Lớp phủ tối nền (Dimmed Backdrop Layer)
Khi E-Lecture Mode được bật, một thẻ lớp phủ tối nền trong suốt xuất hiện đằng sau thẻ bài giảng nhưng nằm trước Canvas:
*   **Thuộc tính:** `background: rgba(15, 23, 42, 0.4)` (Slate 900 với opacity 40%).
*   **Mục đích:** Giảm thiểu độ tương phản thị giác của Canvas, kéo trọn vẹn tiêu điểm của mắt người học vào phần mô tả lý thuyết.

### 2.2. Cơ chế Thu nhỏ Mờ đục Tập trung Động (Dynamic Transparency Minimize)
*   **Thách thức UX:** Khi Canvas bắt đầu di chuyển hoạt ảnh (lệnh `PLAY_UNTIL`), nếu thẻ bài giảng vẫn đứng sừng sững che một phần ba màn hình Canvas sẽ khiến người học không thể nhìn trọn vẹn quá trình đổi chỗ hay so sánh cột.
*   **Giải pháp:** Ngay khi hệ thống bắt đầu chạy hoạt ảnh minh họa, thẻ bài giảng tự động thu nhỏ kích thước (hoặc chuyển dịch sang góc phải màn hình) và đổi Opacity về mức tối giản:
    ```css
    .lecture-overlay-panel.canvas-running {
      opacity: 0.2; /* Mờ đục để nhìn xuyên thấu Canvas phía sau */
      transform: scale(0.9) translate(-20px, 0);
      pointer-events: none; /* Tránh click nhầm khi đang phát hoạt ảnh */
    }
    ```
*   Khi hoạt ảnh dừng lại đúng mốc sư phạm, thẻ bài giảng tự động phóng to trở lại kích thước mặc định (`opacity: 1`, `transform: scale(1)`) và chuyển sang trạng thái sẵn sàng để sinh viên đọc đúc kết.

---

## 3. Các thành phần điều khiển nội dung

*   **Bộ chấm tròn phân trang (Pagination Dots):** Nằm dưới cùng của panel bài giảng. Mỗi slide biểu thị bằng một chấm tròn nhỏ. Chấm slide hiện tại chuyển sang màu xanh dương phát sáng, các chấm còn lại màu slate mờ. Người học có thể click trực tiếp vào chấm tròn để chuyển trang nhanh.
*   **Nút Đóng [ X ] (Close button):** Nằm ở góc trên bên phải thẻ bài học, cho phép tắt nhanh E-Lecture để phục hồi 100% độ tương tác tự do của Canvas.
