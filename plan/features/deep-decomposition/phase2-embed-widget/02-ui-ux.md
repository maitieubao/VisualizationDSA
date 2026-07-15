# 🎨 UI & UX Specifications - Embed Configurator & Live Preview

Tài liệu này đặc tả chi tiết thiết kế CSS của bảng điều khiển mờ ảo Glassmorphism (Configurator Sidebar), khung hiển thị trực tiếp sơ đồ nhúng (Live Preview Canvas) và hộp code snippet viền Neon lộng lẫy trong phân hệ **Interactive Embed Widget**.

---

## 1. Bảng cấu hình mờ ảo Kính Glassmorphism (Settings Sidebar CSS)

Sidebar điều khiển cung cấp các nút gạt, thanh trượt kích thước bo góc tròn mượt mà:

```css
.embed-configurator-sidebar {
  width: 320px;
  background: rgba(15, 23, 42, 0.55); /* Slate 900 kính mờ */
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.embed-settings-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.embed-settings-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #94A3B8; /* Slate 400 */
  text-transform: uppercase;
}

.embed-custom-range-slider {
  width: 100%;
  accent-color: #06B6D4; /* Xanh Cyan nổi bật */
  background: rgba(255, 255, 255, 0.1);
  height: 6px;
  border-radius: 3px;
}
```

---

## 2. Hộp Xem thử Trực tiếp & Code Snippet Viền Neon (Live Preview & Snippet)

*   **Khung hiển thị Live Preview Canvas:** Nổi bật ở trung tâm với viền mạ vàng mờ ảo sành điệu, giả lập khung Iframe nhúng:

```css
.embed-live-preview-canvas {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle, rgba(16, 24, 48, 1) 0%, rgba(8, 12, 24, 1) 100%);
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.8);
}

/* Hộp sao chép Snippet code viền Neon */
.embed-code-snippet-box {
  background: rgba(10, 15, 26, 0.8);
  border: 1px solid #06B6D4; /* Viền Cyan phát sáng */
  border-radius: 12px;
  padding: 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #E2E8F0;
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.15);
  position: relative;
  overflow: hidden;
}

/* Hoạt ảnh bắn tia sáng mờ khi hover */
.embed-code-snippet-box::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(6, 182, 212, 0.05), transparent);
  transform: rotate(45deg);
  transition: transform 0.5s ease;
}

.embed-code-snippet-box:hover::after {
  transform: translate(50%, 50%) rotate(45deg);
}
```
 Giao diện mờ Glassmorphism kết hợp hộp code viền Neon Cyan phát sáng lộng lẫy mang lại cho học viên và đối tác EdTech cảm xúc thiết kế cao cấp vô song, thôi thúc giáo viên nhúng sơ đồ bài giảng ngay tức thì.
