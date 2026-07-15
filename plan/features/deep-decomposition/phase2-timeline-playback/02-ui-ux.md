# 🎨 UI & UX Specifications - VCR Panels & Neon Progress Tracks

Tài liệu này đặc tả chi tiết thiết kế CSS của cụm phím điều hướng VCR mờ kính Glassmorphic, thanh trượt Scrubber Neon Cyan phát sáng và hạt indicator bám chuột.

---

## 1. Cụm Phím Điều Hướng VCR Kính Mờ (VCR Panel UI)

Thiết kế thanh điều khiển VCR nằm ngang, tạo cảm giác sang trọng bóng bẩy và nhạy bén xúc giác:

```css
.vcr-controller-panel {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 24px;
  background: rgba(15, 23, 42, 0.45); /* Slate 900 kính mờ */
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 9999px; /* Bo tròn kén nhộng */
  backdrop-filter: blur(16px);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  width: fit-content;
  margin: 0 auto;
}

/* Các nút bấm xúc giác VCR */
.vcr-button {
  background: transparent;
  border: none;
  color: #94A3B8; /* Slate 400 */
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.vcr-button:hover {
  color: #06B6D4; /* Cyan rực rỡ */
  background: rgba(6, 182, 212, 0.1);
  transform: scale(1.12);
  box-shadow: 0 0 12px rgba(6, 182, 212, 0.2);
}

.vcr-button:active {
  transform: scale(0.92);
}
```

---

## 2. Thanh trượt Scrubber Neon và Indicator Quét (Scrubber UI)

```css
/* Đường chạy trượt mỏng của Scrubber */
.vcr-scrubber-track {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 3px;
  position: relative;
  cursor: pointer;
  transition: height 0.2s ease;
}

.vcr-scrubber-track:hover {
  height: 8px; /* Dày ra một chút khi hover để dễ thao tác */
}

/* Tiến trình đã phát qua (Neon Filled Progress) */
.vcr-scrubber-filled {
  height: 100%;
  background: linear-gradient(90deg, #0891B2, #06B6D4); /* Dải Cyan phát sáng */
  border-radius: 3px;
  position: absolute;
  top: 0;
  left: 0;
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.6);
}

/* Hạt indicator tròn lơ lửng bám quét ngón tay (Scrubber Indicator Knob) */
.vcr-scrubber-knob {
  width: 16px;
  height: 16px;
  background: #FFFFFF;
  border: 3px solid #06B6D4; /* Cyan */
  border-radius: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  cursor: grab;
  box-shadow: 0 0 12px rgba(6, 182, 212, 0.8);
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.vcr-scrubber-knob:active {
  cursor: grabbing;
  transform: translate(-50%, -50%) scale(1.3); /* Phồng to khi đang miết quét */
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.95);
}
```
 Thiết kế cụm phím kén nhộng VCR mờ kính tinh xảo kết hợp đường trượt Scrubber Neon Cyan và hạt indicator phồng to lơ lửng khi miết kéo mang lại cho người học cảm giác gỡ lỗi cực đỉnh, sành điệu như đang làm chủ cuốn phim điện ảnh giải thuật.
