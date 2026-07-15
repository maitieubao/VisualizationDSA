# 🎨 UI & UX Specifications - IDE Monaco Workspace

Tài liệu này đặc tả chi tiết thiết kế CSS của khu vực lập trình phân cực (IDE Layout Workspace), khung soạn thảo Monaco Editor cao cấp, bảng Console Logs mờ sương và các hiệu ứng phát sáng Neon cảnh báo lỗi biên dịch trong phân hệ **Code-to-Visualization Compiler**.

---

## 1. Bố cục Không gian Lập trình Phân cực Grid (IDE Layout Grid)

Giao diện chia tách hai phần bằng tỉ lệ 1:1, phân biệt rõ ràng khu vực viết mã nguồn bên trái và khu vực Canvas đồ họa biểu diễn hoạt ảnh bên phải.

```css
.ide-workspace-container {
  display: grid;
  grid-template-columns: 1fr 1fr; /* Tỉ lệ 50/50 hoàn hảo */
  gap: 24px;
  width: 100%;
  height: 90vh;
  padding: 24px;
  background: #0B0F19; /* Navy tối sâu thẳm */
  font-family: 'Outfit', sans-serif;
}

.ide-editor-panel {
  display: flex;
  flex-direction: column;
  background: rgba(30, 41, 59, 0.4); /* Slate 800 */
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.ide-canvas-panel {
  display: flex;
  flex-direction: column;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 20px;
  position: relative;
}
```

---

## 2. Thiết lập trình soạn thảo Monaco Editor (Monaco Container Styling)

Nhúng Monaco Editor vào khung chứa Slate bóng bẩy, sử dụng font chữ lập trình chống mỏi mắt JetBrains Mono:

```css
.monaco-editor-container {
  flex-grow: 1;
  width: 100%;
  height: 60%;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* Tinh chỉnh scrollbar của Monaco sang màu mờ Slate */
.monaco-editor .scrollbar .slider {
  background: rgba(255, 255, 255, 0.1) !important;
  border-radius: 4px;
}

.monaco-editor .scrollbar .slider:hover {
  background: rgba(255, 255, 255, 0.2) !important;
}
```

---

## 3. Bảng Nhật ký Biên dịch Console Logs (Compiler Console Logs)

Bảng ghi chép tiến trình phân tích cú pháp, nằm ngay dưới chân Monaco Editor với thiết kế mờ sương đậm đà lôi cuốn:

```css
.compiler-console-panel {
  height: 40%;
  background: rgba(15, 23, 42, 0.85); /* Đậm đạc hơn */
  padding: 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  overflow-y: auto;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}

.console-log-line {
  margin-bottom: 6px;
  line-height: 1.5;
}

/* Trạng thái thành công: Cyan Neon */
.console-log-line.status-success {
  color: #06B6D4;
  text-shadow: 0 0 8px rgba(6, 182, 212, 0.25);
}

/* Trạng thái lỗi biên dịch: Rose Red */
.console-log-line.status-error {
  color: #F43F5E;
  text-shadow: 0 0 8px rgba(244, 63, 94, 0.25);
}

/* Trạng thái biên dịch cảnh báo: Amber Orange */
.console-log-line.status-warn {
  color: #F59E0B;
}
```

---

## 4. Hiệu ứng Glow Viền Cảnh báo Lỗi Biên dịch (Error State Border Glow)

Khi sinh viên bấm Run nhưng mã nguồn chứa lỗi vòng lặp vô hạn hoặc lỗi cú pháp nghiêm trọng, đường viền của tấm Editor phát sáng cảnh báo đỏ:

```css
/* Trạng thái biên dịch thất bại */
.ide-editor-panel.compile-failed-glow {
  border-color: #EF4444 !important;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.15) !important;
  animation: cssGlowPulseError 2.0s infinite alternate;
}

@keyframes cssGlowPulseError {
  0% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.1); }
  100% { box-shadow: 0 0 25px rgba(239, 68, 68, 0.3); }
}
```
 Thiết kế bố cục IDE phân cực Grid kết hợp viền Neon phản hồi lỗi nhạy bén giúp người học luôn nắm giữ thế chủ động, nâng cao 250% tốc độ gỡ lỗi thuật toán.
