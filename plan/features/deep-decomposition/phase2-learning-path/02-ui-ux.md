# 🎨 UI & UX Specifications - RPG Map Skill Tree & Neon Laser Bridges

Tài liệu này đặc tả chi tiết thiết kế CSS của lưới bản đồ phiêu lưu RPG Map, các node tròn ải giải thuật phát sáng tùy biến trạng thái và hoạt ảnh dòng điện Neon chảy cuồn cuộn trên cầu nối ánh sáng tiên quyết (Laser Flow Bridges).

---

## 1. Bản đồ Phiêu lưu Lưới mờ Glassmorphism (RPG Map Grid UI)

Không gian bản đồ được thiết kế mờ kính tối tân, giả lập một vũ trụ tri thức thuật toán:

```css
.learning-path-map-container {
  width: 100%;
  height: 600px;
  background: radial-gradient(circle, rgba(16, 24, 48, 1) 0%, rgba(8, 12, 24, 1) 100%);
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.9);
}

/* Các node tròn ải giải thuật phiêu lưu */
.path-node-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  cursor: pointer;
  position: absolute;
  z-index: 10;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.path-node-circle:hover {
  transform: scale(1.15); /* Phóng nhẹ quyến rũ */
}
```

---

## 2. Các Trạng thái Node Ải & Hoạt ảnh Cầu nối Laser SVG (Bridges & Nodes States)

```css
/* Trạng thái 1: Node COMPLETED - Đã học xong bừng sáng Emerald */
.node-state-completed {
  background: rgba(16, 185, 129, 0.15);
  border: 2px solid #10B981;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
  color: #10B981;
}

/* Trạng thái 2: Node UNLOCKED/ACTIVE - Đang học nhấp nháy Cyan mát mẻ */
.node-state-active {
  background: rgba(6, 182, 212, 0.2);
  border: 2px solid #06B6D4;
  box-shadow: 0 0 25px rgba(6, 182, 212, 0.6);
  color: #06B6D4;
  animation: node-active-breath 2s infinite ease-in-out;
}

@keyframes node-active-breath {
  0%, 100% { box-shadow: 0 0 15px rgba(6, 182, 212, 0.4); }
  50% { box-shadow: 0 0 30px rgba(6, 182, 212, 0.8); }
}

/* Trạng thái 3: Node LOCKED - Bị khóa Slate u tối */
.node-state-locked {
  background: rgba(30, 41, 59, 0.5);
  border: 2px dashed rgba(148, 163, 184, 0.2);
  color: #475569;
  cursor: not-allowed;
}

/* Cầu nối Laser SVG có hoạt ảnh nét đứt chạy năng lượng cuồn cuộn */
.laser-flow-bridge-path {
  fill: none;
  stroke: #06B6D4; /* Dòng điện Cyan */
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dasharray: 10, 15;
  animation: laser-flow-pulse 1.5s infinite linear;
}

@keyframes laser-flow-pulse {
  to {
    stroke-dashoffset: -40; /* Đẩy luồng sáng di chuyển liên tục */
  }
}
```
 Giao diện bản đồ phiêu lưu RPG Map kính mờ kết hợp các node ải phát sáng 3 màu sắc và cầu nối ánh sáng Laser SVG cuộn chảy năng lượng tạo nên trải nghiệm thực nghiệm tuyệt mỹ, giúp quá trình học DSA trở nên vô cùng sang trọng và tràn đầy niềm vui thăng tiến mỗi ngày.
