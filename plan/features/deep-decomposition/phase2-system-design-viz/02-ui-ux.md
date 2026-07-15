# 🎨 UI & UX Specifications - Glassmorphic Nodes & Neon Packets Flow

Tài liệu này đặc tả chi tiết thiết kế CSS của các thẻ Server mờ kính Glassmorphic, hoạt ảnh hạt Neon dữ liệu trôi nổi trên SVG Paths và hiệu ứng Canvas khói bốc nghi ngút khi sập nguồn (FAILED Node).

---

## 1. Thẻ Máy Chủ Kính Mờ Glassmorphism (Server Cards UI)

Thiết kế Node server lơ lửng tinh xảo, thể hiện trọn vẹn phong cách tương tác premium:

```css
.system-node-card {
  background: rgba(15, 23, 42, 0.6); /* Slate 900 kính mờ */
  border: 1.5px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 16px;
  backdrop-filter: blur(16px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s ease;
  position: absolute;
  cursor: grab;
  user-select: none;
}

.system-node-card:active {
  cursor: grabbing;
  transform: scale(1.04);
  border-color: #06B6D4; /* Cyan bừng sáng khi kéo thả */
}

/* Node Server bị FAILED (Sập nguồn đỏ lòm) */
.system-node-card.is-failed {
  border-color: #EF4444; /* Đỏ rực */
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.5), inset 0 0 10px rgba(239, 68, 68, 0.2);
  filter: grayscale(0.3) brightness(0.8);
}
```

---

## 2. Hạt Neon dữ liệu và Khói Bụi Sập Nguồn (Packets & Smoke Particles UI)

```css
/* Luồng hạt Neon SVG di chuyển dọc theo Paths */
.neon-data-packet-particle {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  position: absolute;
  pointer-events: none;
  transform: translate(-50%, -50%);
  filter: drop-shadow(0 0 8px var(--packet-neon-color));
}

/* Đăng ký biến màu Neon cho các loại luồng tin khác nhau */
.packet-http-request {
  --packet-neon-color: #10B981; /* Lục Emerald */
  background: #10B981;
}

.packet-db-write {
  --packet-neon-color: #FBBF24; /* Vàng rực */
  background: #FBBF24;
}

.packet-cache-hit {
  --packet-neon-color: #F59E0B; /* Cam hổ phách */
  background: #F59E0B;
}

/* Canvas bụi khói mờ ảo bốc cuồn cuộn phía dưới Server sập nguồn */
.failure-smoke-canvas {
  position: absolute;
  top: -10px;
  left: -10px;
  width: calc(100% + 20px);
  height: calc(100% + 20px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.85;
}
```
 Thiết kế thẻ Server kính mờ Slate 900 sang trọng kết hợp dòng hạt Neon trôi nổi rực rỡ và hệ Canvas khói xám bốc cuồn cuộn 60 FPS khi sập nguồn mang lại một thế giới kiến trúc phân tán sống động chưa từng có, khơi dậy đam mê công nghệ cao cấp của học viên.
