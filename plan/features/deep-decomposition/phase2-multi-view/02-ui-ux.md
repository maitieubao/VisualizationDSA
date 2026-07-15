# 🎨 UI & UX Specifications - Resizable Splitters & Monaco Line Highlights

Tài liệu này đặc tả chi tiết thiết kế CSS của khung chia đôi/chia ba màn hình tối tân (Resizable Splitters), hoạt ảnh tô sáng dòng code đang thực thi màu vàng hổ phách (Monaco Active Highlights) và thanh trượt tua thời gian VCR Scrubber.

---

## 1. Khung Chia màn hình Resizable Kính mờ (Split Panes UI)

Bố cục không gian làm việc chia ô đa giao diện phong cách Glassmorphism:

```css
.multiview-workspace-grid {
  display: flex;
  width: 100%;
  height: calc(100vh - 120px);
  background: #090D1A; /* Nền Slate cực tối */
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* Thanh phân chia resizable phân cực kéo thả */
.resizable-splitter-handle {
  width: 8px;
  height: 100%;
  background: rgba(255, 255, 255, 0.03);
  cursor: col-resize;
  position: relative;
  z-index: 20;
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

/* Di chuột bừng sáng Neon Cyan lộng lẫy */
.resizable-splitter-handle:hover,
.resizable-splitter-handle.is-dragging {
  background: #06B6D4;
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.8), 0 0 30px rgba(6, 182, 212, 0.4);
}
```

---

## 2. Monaco Code Highlights & Trục VCR Slider Neon

```css
/* Tô sáng dòng code Monaco đang chạy bằng màu vàng hổ phách Neon mờ */
.monaco-active-line-decoration {
  background: rgba(245, 158, 11, 0.15) !important;
  border-left: 3px solid #F59E0B !important;
  box-shadow: inset 5px 0 10px rgba(245, 158, 11, 0.05);
}

/* Mũi tên laser lề biên Monaco (gutter pointer) */
.monaco-active-gutter-decoration {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23F59E0B'%3E%3Cpath d='M8 5v14l11-7z'/%3E%3C/svg%3E") no-repeat center center;
  background-size: contain;
  margin-left: 2px;
}

/* Bộ trượt tua thời gian dùng chung VCR Scrubber */
.vcr-timeline-slider {
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  outline: none;
  position: relative;
}

/* Nút kéo tua Slider cam Neon rực rỡ */
.vcr-timeline-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #F97316; /* Cam Neon */
  box-shadow: 0 0 10px rgba(249, 115, 22, 0.8);
  cursor: grab;
  transition: transform 0.1s ease;
}

.vcr-timeline-slider::-webkit-slider-thumb:active {
  cursor: grabbing;
  transform: scale(1.25); /* Nở to phấn khích */
}
```
 Khung chia màn hình Resizable kính mờ bừng sáng Neon Cyan kết hợp Monaco active line highlight mạ vàng hổ phách và VCR Slider cam Neon mang lại cho học viên cảm giác đang gỡ lỗi trên một bo mạch lượng tử tối tân, cuốn hút rèn luyện say mê.
