# 🎨 UI & UX Specifications - Class Nodes & UML Connections

Tài liệu này đặc tả chi tiết thiết kế CSS của thẻ hộp lớp Glassmorphism (UML Node Card), các đường cong SVG liên kết phát sáng Neon linh hoạt, hoạt ảnh Observer gửi tín hiệu và Sandbox DIP biến chuyển coupling thô cứng sang loosely coupled xanh biếc.

---

## 1. Hộp Lớp Class Node Glassmorphism (UML Node Cards Styling)

Các hộp lớp UML được dựng bằng HTML kết hợp với CSS mờ ảo kính bo góc sang trọng, hiển thị cấu trúc phân vùng rõ rệt:

```css
.uml-class-node-card {
  position: absolute;
  background: rgba(15, 23, 42, 0.45); /* Slate 900 mờ */
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  backdrop-filter: blur(12px);
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
  cursor: grab;
  user-select: none;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.uml-class-node-card:active {
  cursor: grabbing;
  border-color: rgba(6, 182, 212, 0.3); /* Sáng Cyan nhẹ khi nhấp giữ kéo thả */
  box-shadow: 0 15px 40px -8px rgba(0, 0, 0, 0.6);
}

.uml-node-header {
  padding: 10px 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.uml-node-header.type-interface {
  color: #06B6D4; /* Cyan cho Interface */
}

.uml-node-header.type-abstract {
  color: #A78BFA; /* Purple cho Abstract Class */
}
```

---

## 2. Đường cong Liên kết Neon SVG (UML Relationship Neon Paths)

Các liên kết uốn lượn được tô vẽ rực rỡ mang bản sắc EdTech đặc thù:

```css
/* Đường cong uốn lượn kết nối */
.uml-bezier-connector-path {
  fill: none;
  stroke: rgba(255, 255, 255, 0.15);
  stroke-width: 2;
  transition: stroke 0.3s ease, stroke-width 0.3s ease;
}

/* Kế thừa (Inheritance) - Emerald lá cây */
.uml-bezier-connector-path.relation-inheritance {
  stroke: #10B981;
  filter: drop-shadow(0 0 4px rgba(16, 185, 129, 0.4));
}

/* Hiện thực Interface (Realization) - Cyan nét đứt */
.uml-bezier-connector-path.relation-realization {
  stroke: #06B6D4;
  stroke-dasharray: 6, 4;
  filter: drop-shadow(0 0 4px rgba(6, 182, 212, 0.4));
}

/* Phụ thuộc (Dependency) - Amber vàng hổ phách */
.uml-bezier-connector-path.relation-dependency {
  stroke: #F59E0B;
  stroke-dasharray: 4, 4;
  filter: drop-shadow(0 0 4px rgba(245, 158, 11, 0.4));
}
```

---

## 3. Hoạt ảnh Observer gửi tín hiệu & DIP Coupling Sandbox

*   **Tia lửa Observer:** Khi Subject Notify, một hạt sáng tròn trượt nhanh dọc theo đường dẫn SVG bám đuổi tọa độ:

```css
@keyframes stroke-pulse-flow {
  to {
    stroke-dashoffset: -30;
  }
}

.observer-notify-active-pulse {
  stroke: #06B6D4;
  stroke-dasharray: 8, 4;
  stroke-width: 3;
  animation: stroke-pulse-flow 1.2s infinite linear;
  filter: drop-shadow(0 0 6px #06B6D4);
}

/* Sandbox SOLID DIP: Khớp nối cứng (Highly Coupled Mode) */
.dip-coupling-box.highly-coupled {
  border: 2px solid #F43F5E; /* Đỏ Rose cảnh báo thô cứng */
  background: rgba(244, 63, 94, 0.03);
  box-shadow: 0 0 25px rgba(244, 63, 94, 0.15);
}

.dip-coupling-box.loosely-coupled {
  border: 2px solid #06B6D4; /* Cyan xanh biếc linh hoạt decoupled */
  background: rgba(6, 182, 212, 0.03);
  box-shadow: 0 0 25px rgba(6, 182, 212, 0.15);
}
```
 Bố cục thẻ mờ Glassmorphism kết hợp sợi chỉ Bezier phát sáng Neon rực rỡ giúp sinh viên học kiến trúc phần mềm vô cùng lôi cuốn, khắc sâu tư duy SOLID chuyên nghiệp.
