# 🎨 UI & UX Specifications - Interactive Quiz Overlay

Tài liệu này đặc tả chi tiết thiết kế CSS của hộp thoại trắc nghiệm nổi kính mờ Glassmorphism, hiệu ứng Neon Glow phản hồi Đúng/Sai, hiệu ứng rung lắc (CSS Shake) cảnh báo sai lầm nhận thức, và thẻ tổng kết điểm số cao cấp.

---

## 1. Lớp phủ Trắc nghiệm Kính mờ (Glassmorphic Quiz Overlay Container)

Hộp thoại trắc nghiệm nổi lơ lửng chính giữa màn hình Canvas, làm tối nhẹ hậu cảnh bằng bộ lọc mờ sương để tập trung toàn bộ nhãn quan học viên vào thử thách lý thuyết.

```css
.quiz-overlay-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  
  /* Hậu cảnh kính mờ sương tối nhẹ */
  background: rgba(15, 23, 42, 0.65); 
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000; /* Đè lên toàn bộ lớp vẽ Canvas và VCR control */
  opacity: 0;
  animation: fadeInOverlay 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.quiz-dialog-card {
  width: 90%;
  max-width: 520px;
  background: rgba(30, 41, 59, 0.85); /* Slate 800 với opacity */
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 28px;
  padding: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  transform: scale(0.92);
  animation: scaleUpCard 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; /* Tạo nảy nhẹ Springy scale */
}

@keyframes fadeInOverlay {
  to { opacity: 1; }
}

@keyframes scaleUpCard {
  to { transform: scale(1); }
}
```

---

## 2. Các phương án lựa chọn & Hiệu ứng phát sáng Neon viền Đúng/Sai

```css
.quiz-option-btn {
  width: 100%;
  padding: 14px 20px;
  margin-top: 12px;
  text-align: left;
  font-family: 'Outfit', sans-serif;
  font-size: 14.5px;
  color: #E2E8F0; /* Slate 200 */
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.quiz-option-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

/* Nộp bài đúng: Viền Neon xanh Emerald */
.quiz-dialog-card.status-correct {
  border-color: #10B981;
  box-shadow: 0 0 25px rgba(16, 185, 129, 0.25);
}

/* Nộp bài sai: Rung lắc thẻ và viền đỏ Neon nhạt */
.quiz-dialog-card.status-incorrect {
  border-color: #EF4444; /* Rose Red */
  box-shadow: 0 0 25px rgba(239, 68, 68, 0.25);
  animation: cssShakeError 0.4s ease-in-out;
}

@keyframes cssShakeError {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
}
```

---

## 3. Lắng nghe Tương tác Canvas (CANVAS_TARGET Cursor Guide)

Khi thể loại câu hỏi nhấp Canvas được bật, con trỏ chuột khi rê trên thẻ Canvas đổi hình dạng để hướng dẫn học viên thực hiện thao tác tương tác:

```css
/* Khóa các nút vẽ của Toolbar */
.drawing-toolbar-overlay {
  pointer-events: none;
  opacity: 0.3;
  filter: grayscale(1);
}

/* Hướng dẫn trỏ chuột khi rê trên Canvas */
.canvas-interactive-target-mode {
  cursor: crosshair !important; /* Trỏ hình chữ thập ngắm bắn */
}

/* Canvas phát sáng Neon mỏng báo hiệu đang trong phiên hỏi đáp tương tác */
.canvas-element.waiting-quiz-input {
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.2) !important; /* Cyan Neon Glow */
  border-color: rgba(6, 182, 212, 0.3) !important;
}
```

---

## 4. Thẻ tổng kết điểm số cao cấp (Quiz Summary Card)

Bảng tổng kết xuất hiện khi hoàn thành toàn bộ tổ hợp câu hỏi trắc nghiệm của giải thuật:

```css
.summary-badges-container {
  display: flex;
  justify-content: space-around;
  margin: 24px 0;
}

.summary-badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  width: 100px;
}

.badge-value {
  font-size: 24px;
  font-weight: 800;
  color: #10B981; /* Emerald */
  text-shadow: 0 0 8px rgba(16, 185, 129, 0.3);
}

.badge-label {
  font-size: 11px;
  color: #64748B; /* Slate 500 */
  margin-top: 4px;
  text-transform: uppercase;
  font-weight: 600;
}
```
 Phản hồi hình học cao cấp và màu sắc Neon sành điệu giúp nâng tầm phân hệ học trắc nghiệm lên tầm cao mới của nghệ thuật thiết kế giao diện giáo dục.
