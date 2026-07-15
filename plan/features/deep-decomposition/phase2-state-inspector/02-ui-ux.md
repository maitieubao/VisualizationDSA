# 🎨 UI & UX Specifications - 3D Stack Frames & Neon Pointer Arrows

Tài liệu này đặc tả chi tiết thiết kế CSS của ngăn xếp xếp chồng 3D (Call Stack Panel), mũi tên Neon uốn lượn chỉ Heap (Pointer Neon Arrows) và hiệu ứng xung nhịp chớp tắt (Amber Hover Pulse).

---

## 1. Ngăn xếp Call Stack 3D Kính mờ (Stack Overlays UI)

Thiết kế Call Stack xếp chồng 3D Glassmorphism tạo cảm giác chiều sâu vật lý chân thực:

```css
.call-stack-container {
  display: flex;
  flex-direction: column-reverse; /* Xếp chồng ngược từ dưới lên trên */
  gap: 8px;
  padding: 16px;
  background: rgba(10, 15, 30, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  backdrop-filter: blur(12px);
  width: 280px;
}

/* Tầng Stack Frame lơ lửng */
.stack-frame-card {
  background: rgba(30, 41, 59, 0.5); /* Slate 800 kính mờ */
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px;
  transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  position: relative;
}

/* Frame trên cùng đang hoạt động (Top active frame) */
.stack-frame-card.is-active {
  border-color: #06B6D4; /* Xanh Cyan rực rỡ */
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.4);
  transform: translateY(-2px) scale(1.02);
}

/* Các tầng cũ phía dưới xếp chồng nhỏ dần (3D depth simulation) */
.stack-frame-card:not(.is-active) {
  opacity: 0.65;
  transform: scale(0.96);
}
```

---

## 2. Mũi tên Neon Chỉ Heap & Xung Nhịp Chớp Tắt (Pointer & Pulse UI)

```css
/* Đường nối con trỏ chỉ sang Heap (Pointer Neon Arrows) */
.pointer-neon-arrow {
  fill: none;
  stroke: #06B6D4; /* Cyan phát sáng con trỏ */
  stroke-width: 2.5;
  stroke-dasharray: 8, 12;
  filter: drop-shadow(0 0 6px rgba(6, 182, 212, 0.7));
  animation: pointer-flow-dash 1.2s infinite linear;
}

@keyframes pointer-flow-dash {
  to {
    stroke-dashoffset: -20;
  }
}

/* Xung nhịp chớp tắt màu Amber khi hover biến con trỏ (Amber hover pulse) */
.heap-object-node.is-hover-pulsed {
  animation: amber-glow-pulse 0.8s infinite alternate ease-in-out;
  border-color: #F59E0B !important; /* Vàng hổ phách */
}

@keyframes amber-glow-pulse {
  0% {
    box-shadow: 0 0 8px rgba(245, 158, 11, 0.4), inset 0 0 5px rgba(245, 158, 11, 0.1);
  }
  100% {
    box-shadow: 0 0 25px rgba(245, 158, 11, 0.9), inset 0 0 12px rgba(245, 158, 11, 0.4);
  }
}
```
 Thiết kế chồng xếp 3D Call Stack kính mờ Cyan kết hợp đường cong Cubic Bezier nét đứt chạy luồng sáng trôi trượt Neon và hiệu ứng chớp tắt Amber Pulse mang lại cho học viên cảm xúc sành điệu như đang làm chủ một cỗ máy thời gian bộ nhớ máy tính siêu thực.
