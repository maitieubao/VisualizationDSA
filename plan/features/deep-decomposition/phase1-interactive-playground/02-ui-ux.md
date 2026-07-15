# 🎨 UI & UX Specifications - Drawing Toolbars & Feedback

Tài liệu này đặc tả chi tiết giao diện cấu trúc CSS thanh công cụ nổi Glassmorphism và các quy tắc phản hồi thị giác (Visual Feedback) trong tiến trình tương tác vẽ đồ thị của người dùng.

---

## 1. Thiết kế Thanh công cụ nổi dọc (Floating Glassmorphic Toolbar)

Thanh công cụ được thiết kế nổi lơ lửng bên mép trái của vùng Canvas, bo cạnh mềm mại và ứng dụng kính mờ cao cấp để tránh che lấp tầm nhìn.

### CSS Stylesheet:
```css
.playground-floating-toolbar {
  position: absolute;
  top: 50%;
  left: 20px;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 12px;
  
  /* Thiết kế kính mờ cao cấp */
  background: rgba(30, 41, 59, 0.65); /* Slate 800 với opacity */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  
  z-index: 1001;
}

/* Nút bấm hành động chuyển trạng thái */
.toolbar-tool-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: none;
  background: transparent;
  color: #94A3B8; /* Slate 400 */
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.toolbar-tool-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #F8FAFC; /* Slate 50 */
}

/* Trạng thái công cụ đang chọn chuyển sáng xanh Neon phát sáng */
.toolbar-tool-btn.active-tool {
  background: #10B981; /* Emerald Neon */
  color: #FFFFFF;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
}
```

---

## 2. Phản hồi Thị giác khi đang Kéo vẽ Cạnh (Edge Drawing Feedback)

*   **Vẽ tạm dây chun đứt nét (Dashed Rubber-band Line):** Khi người học ở chế độ **ADD_EDGE**, nhấp chuột giữ đỉnh nguồn A và kéo trỏ chuột ra ngoài khoảng trống. Canvas sẽ liên tục vẽ một đường đứt nét tạm thời (`ctx.setLineDash([6, 4])`) nối từ tâm đỉnh A bám theo vị trí tọa độ thực tế của con trỏ chuột.
*   **Nhận diện Snapping Hút dính:** Khi trỏ chuột kéo rê lại gần (cách viền đỉnh đích B một khoảng cách $\le 40\text{px}$):
    *   Đầu đường đứt nét tự động **hút dính (snap)** bám sát vào viền ngoài của đỉnh B.
    *   Hệ thống kích hoạt hiệu ứng **viền phát sáng (Glow Highlight)** màu xanh Neon xung quanh đỉnh B để báo hiệu người dùng có thể nhả chuột để tạo kết nối.
    *   Khi nhả chuột trái, đường liên kết chính thức được đăng ký vào Store và dây đứt nét biến mất mượt mà.

---

## 3. Hộp thoại Nhập trọng số Cạnh (Weight Input Box UX)

Khi click chọn cạnh trong chế độ **WEIGHT**:
*   Một ô nhập liệu Input nổi siêu nhỏ (Popover) xuất hiện ngay tại **trung điểm tọa độ** của cạnh vừa chọn:
    $$\text{midpoint}(X, Y) = \left( \frac{x_1 + x_2}{2}, \frac{y_1 + y_2}{2} \right)$$
*   **Hành vi:**
    1.  Hộp thoại tự động lấy tiêu điểm (Auto Focus) và bôi đen số cũ để người học sửa nhanh.
    2.  Nhấn `Enter` hoặc click ra ngoài (Blur) sẽ lưu ngay trọng số mới và cập nhật hiển thị nhãn số trên Canvas.
    3.  Ngăn chặn tuyệt đối việc nhập ký tự chữ hoặc số âm để bảo toàn ngữ cảnh sư phạm của thuật toán đồ thị.
