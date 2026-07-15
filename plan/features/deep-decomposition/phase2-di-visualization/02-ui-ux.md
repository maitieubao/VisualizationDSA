# 🎨 UI & UX Specifications - IoC Vault & Laser Injection

Tài liệu này đặc tả chi tiết thiết kế CSS của tủ kính mô phỏng 3D Glassmorphic IoC Container, style Neon của thẻ dịch vụ Singleton mạ vàng/Transient mạ bạc và hoạt ảnh bắn tia laser tiêm phụ thuộc sinh động trong phân hệ **IoC Container Dependency Visualizer**.

---

## 1. Tủ kính mô phỏng IoC Cabinet & Ngăn Chứa (Chamber Layout Grid)

Bộ tủ chứa IoC được dựng dạng khối 3D kính mờ nổi bật chính giữa màn hình workspace:

```css
.ioc-cabinet-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  padding: 32px;
  background: rgba(11, 15, 25, 0.65); /* Tông Navy vũ trụ tối thẳm */
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px);
}

.ioc-chamber-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.03);
}

/* Kho lưu trữ Singleton mạ vàng hoàng kim */
.ioc-chamber-section.singleton-vault-chamber {
  background: radial-gradient(circle at top left, rgba(245, 158, 11, 0.04), transparent);
  border-color: rgba(245, 158, 11, 0.15);
  box-shadow: inset 0 0 30px rgba(245, 158, 11, 0.03);
}

/* Phòng nghiên cứu Transient mạ bạc ánh kim */
.ioc-chamber-section.transient-lab-chamber {
  background: radial-gradient(circle at top left, rgba(148, 163, 184, 0.04), transparent);
  border-color: rgba(148, 163, 184, 0.15);
  box-shadow: inset 0 0 30px rgba(148, 163, 184, 0.03);
}
```

---

## 2. Thẻ Lớp Vòng đời Dịch vụ (Singleton Gold / Transient Silver Nodes)

```css
.ioc-instance-node-card {
  padding: 16px 20px;
  border-radius: 12px;
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(8px);
  font-family: 'JetBrains Mono', monospace;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Node Singleton - Mạ vàng hoàng kim rực rỡ */
.ioc-instance-node-card.lifecycle-singleton {
  border: 2px solid #F59E0B; /* Vàng Amber */
  box-shadow: 0 0 15px rgba(245, 158, 11, 0.25);
}

/* Node Transient - Mạ bạc ánh kim Slate 400 */
.ioc-instance-node-card.lifecycle-transient {
  border: 2px solid #94A3B8; /* Slate Bạc */
  box-shadow: 0 0 15px rgba(148, 163, 184, 0.2);
}
```

---

## 3. Hoạt ảnh Tia Laser Neon bơm Phụ thuộc (Laser Injection Path FX)

Khi một Repository được phân giải và tiêm vào Constructor của Service, tia laser Neon Amber/Cyan bắn dọc đường dẫn SVG:

```css
@keyframes laser-shoot-flow {
  0% {
    stroke-dashoffset: 80;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

.laser-injection-active-path {
  stroke: #F59E0B; /* Vàng hổ phách lộng lẫy */
  stroke-width: 4;
  stroke-dasharray: 40, 20;
  animation: laser-shoot-flow 0.8s infinite linear;
  filter: drop-shadow(0 0 8px #F59E0B);
}
```
 Cấu trúc tủ kính mô phỏng 3D Glassmorphic IoC Cabinet kết hợp các thẻ Singleton vàng óng/Transient bạc sáng và hoạt ảnh tia laser bắn Neon tiêm đối tượng mang lại cho học viên nhãn quan thực nghiệm tuyệt mỹ, dễ dàng thấu suốt cơ chế DI cốt lõi.
