# 🎨 UI & UX Specifications - Share Modal & Emerald Progress Bar

Tài liệu này đặc tả chi tiết thiết kế CSS của hộp thoại chia sẻ mờ ảo Glassmorphism (Share & Export Modal), các phím định dạng Neon, thanh tiến trình xuất ảnh Emerald lộng lẫy và khung phát sáng vàng ấm áp bao quanh QR Code.

---

## 1. Hộp thoại Chia sẻ Kính Mờ Glassmorphism (Share Dialog Panel)

Hộp thoại xuất hiện mượt mà chính giữa màn hình với hiệu ứng làm mờ hậu cảnh sâu sắc:

```css
.share-export-dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(8, 12, 24, 0.75); /* Navy vũ trụ sẫm tối */
  backdrop-filter: blur(12px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.share-export-dialog-card {
  width: 460px;
  background: rgba(15, 23, 42, 0.6); /* Slate 900 kính mờ */
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.share-dialog-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
  font-weight: 700;
  color: #06B6D4; /* Cyan xanh biếc phát sáng */
  text-shadow: 0 0 10px rgba(6, 182, 212, 0.2);
  text-align: center;
}
```

---

## 2. Mã QR Phát sáng Vàng Hoàng Kim & Tiến trình Emerald (QR & Progress)

```css
/* Khung chứa QR Code phát sáng ấm áp */
.share-qr-code-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid #F59E0B; /* Vàng hổ phách */
  border-radius: 16px;
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.15);
  margin: 0 auto;
  transition: transform 0.3s ease;
}

.share-qr-code-wrapper:hover {
  transform: scale(1.05); /* Phóng nhẹ lôi cuốn */
}

/* Thanh tiến trình xuất ảnh Emerald lộng lẫy */
.export-progress-bar-container {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  overflow: hidden;
}

.export-progress-bar-fill {
  height: 100%;
  background: #10B981; /* Emerald xanh lá ngọt ngào */
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
  transition: width 0.3s ease-out;
}
```
 Giao diện Share Modal kính mờ Glassmorphism kết hợp thanh tiến trình Emerald lộng lẫy và khung QR phát sáng vàng ấm áp tạo nên nhãn quan thực nghiệm tuyệt mỹ, giúp quá trình xuất bản sơ đồ thuật toán của học sinh trở nên vô cùng sang trọng và đầy cảm xúc.
