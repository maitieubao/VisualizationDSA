# 🎨 UI & UX Specifications - Thermal SRP Cards & Laser Fractures

Tài liệu này đặc tả chi tiết thiết kế CSS của thẻ lớp quá nhiệt bùng cháy (Thermal SRP Cards), luồng sáng phát quang Dependency Inversion (Neon Flowing Paths) và vết nứt laser Liskov Substitution (SVG Laser Fracture).

---

## 1. Thẻ Lớp Quá nhiệt Tỏa lửa & Rạn nứt Laser (Thermal SRP UI)

Giao diện thẻ Class vi phạm SRP nhiệt hóa và rạn nứt kính:

```css
.solid-class-card {
  width: 260px;
  background: rgba(15, 23, 42, 0.5); /* Slate 900 kính mờ */
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 20px;
  backdrop-filter: blur(16px);
  position: relative;
  transition: border-color 0.4s ease, box-shadow 0.4s ease;
}

/* Thẻ lớp SRP bị quá nhiệt (Overheated Class Card) */
.solid-class-card.is-overheated {
  border-color: #EF4444 !important; /* Đỏ rực Neon */
  box-shadow: 0 0 30px rgba(239, 68, 68, 0.6), inset 0 0 15px rgba(239, 68, 68, 0.2);
  animation: thermal-glow 1.5s infinite alternate ease-in-out;
}

@keyframes thermal-glow {
  0% { filter: drop-shadow(0 0 5px rgba(239, 68, 68, 0.4)); }
  100% { filter: drop-shadow(0 0 20px rgba(239, 68, 68, 0.8)); }
}

/* Canvas lồng phía sau thẻ lớp để vẽ hạt lửa bùng cháy */
.thermal-spark-canvas {
  position: absolute;
  top: -10px;
  left: -10px;
  width: calc(100% + 20px);
  height: calc(100% + 20px);
  pointer-events: none;
  z-index: 1;
}
```

---

## 2. Rạn nứt Laser LSP & Luồng sáng Neon DIP (Laser Fracture & Flowing Paths)

```css
/* Đường nứt nổ ziczac laser LSP (Glass crack ziczac overlay) */
.lsp-laser-fracture-line {
  fill: none;
  stroke: #EF4444; /* Đỏ rực cảnh báo gãy nứt */
  stroke-width: 4;
  stroke-linecap: round;
  filter: drop-shadow(0 0 8px #EF4444);
  stroke-dasharray: 5, 5;
  animation: laser-break-flash 0.3s infinite alternate;
}

@keyframes laser-break-flash {
  0% { opacity: 0.3; }
  100% { opacity: 1; }
}

/* Luồng sáng phát quang chạy dọc Dependency Inversion (Neon Flowing path) */
.dip-flowing-path {
  fill: none;
  stroke: #10B981; /* Lục Emerald dịu mát mắt khi đúng DIP */
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dasharray: 10, 15;
  animation: dip-flow-run 1s infinite linear;
}

.dip-flowing-path.is-violating {
  stroke: #EF4444; /* Đỏ chói vi phạm thiết kế ngược */
}

@keyframes dip-flow-run {
  to {
    stroke-dashoffset: -25;
  }
}
```
 Giao diện Thermal SRP Cards bùng cháy hạt lửa Canvas 2D kết hợp rạn nứt ziczac laser LSP đỏ rực và luồng sáng DIP lục Emerald trôi trượt mượt mà mang lại cảm xúc vật lý sành điệu, biến các nguyên lý SOLID khô khan trở thành một phòng lab thí nghiệm trực quan cực đỉnh.
