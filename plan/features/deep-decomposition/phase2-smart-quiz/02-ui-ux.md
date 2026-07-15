# 🎨 UI & UX Specifications - Slide-in Glassmorphic Quiz & Node Highlights

Tài liệu này đặc tả chi tiết thiết kế CSS của thẻ trắc nghiệm trượt kính mờ sang trọng (Slide-in Glassmorphic Quiz Overlays), hiệu ứng phát sáng của các cột mảng khi di chuột qua và hoạt ảnh phản hồi kết quả Emerald/Crimson.

---

## 1. Thẻ Trắc nghiệm Slide-in Kính mờ trượt nhẹ (Quiz Overlays UI)

Giao diện trắc nghiệm lơ lửng trượt ra êm ái phong cách Glassmorphism:

```css
.smart-quiz-overlay-panel {
  position: absolute;
  top: 20px;
  right: -350px; /* Ban đầu ẩn ngoài biên */
  width: 320px;
  background: rgba(10, 15, 30, 0.65); /* Kính tối mờ ảo */
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 24px;
  backdrop-filter: blur(16px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  z-index: 100;
  transition: right 0.5s cubic-bezier(0.16, 1, 0.3, 1); /* Trượt trơn tru quý phái */
}

/* Kích hoạt trượt vào màn hình */
.smart-quiz-overlay-panel.is-active {
  right: 20px;
}

/* Hover phát sáng Array Bar SVG báo hiệu tương tác click được */
.svg-interactive-node {
  cursor: pointer;
  transition: filter 0.2s ease, stroke 0.2s ease;
}

.svg-interactive-node:hover {
  filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.8)); /* Bừng sáng Cyan */
  stroke: #06B6D4 !important;
}

/* Trạng thái được chọn (Selected Node Glow) */
.svg-interactive-node.is-selected {
  filter: drop-shadow(0 0 12px rgba(245, 158, 11, 0.9)); /* Cam hổ phách rực rỡ */
  stroke: #F59E0B !important;
}
```

---

## 2. Banner Phản hồi HSL Emerald & Crimson (HSL Feedback States)

```css
/* Đúng (Correct Banner - Emerald Neon Glow) */
.quiz-feedback-banner-correct {
  border: 1px solid rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.08);
  color: #34D399;
  filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.2));
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
}

/* Sai (Incorrect Banner - Crimson Shake) */
.quiz-feedback-banner-incorrect {
  border: 1px solid rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.08);
  color: #F87171;
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
  animation: quiz-shake 0.4s ease-in-out;
}

@keyframes quiz-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  75% { transform: translateX(6px); }
}

/* Monaco click line highlight */
.monaco-clickable-line-hover {
  background: rgba(6, 182, 212, 0.08) !important;
  cursor: pointer;
}

.monaco-clickable-line-selected {
  background: rgba(245, 158, 11, 0.15) !important;
  border-left: 3px solid #F59E0B !important;
}
```
 Giao diện trắc nghiệm Slide-in panel trượt êm ái kết hợp các mốc hover phát sáng mảng/cây sặc sỡ và banner phản hồi Emerald/Crimson bùng nổ Confetti mang lại sự hào hứng học tập tột cùng cho sinh viên.
