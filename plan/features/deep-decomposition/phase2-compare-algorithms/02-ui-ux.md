# 🎨 UI & UX Specifications - Split Screen & Stats Dashboard

Tài liệu này đặc tả chi tiết thiết kế CSS của bố cục chia tách màn hình song song (Dual Split Grid Layout), thanh điều khiển Range Slider trung tâm bóng bẩy và các thẻ thống kê so sánh hiệu năng trực trực quan phát sáng Neon trong phân hệ **Side-by-Side Algorithm Comparator**.

---

## 1. Bố cục Chia tách Màn hình Song song Grid (Dual Split Layout Grid)

Hai Canvas vẽ hoạt ảnh được căn chỉnh cân đối tuyệt đối bằng CSS Grid, bao bọc bởi một lớp viền phát sáng mỏng Slate sang trọng biểu thị cấu trúc bài giảng:

```css
.compare-workspace-container {
  display: grid;
  grid-template-rows: auto 1fr auto; /* Đỉnh: Chọn thuật toán; Giữa: Hai Canvas; Dưới: Điều khiển chung */
  height: 95vh;
  gap: 20px;
  padding: 24px;
  background: #090D16; /* Navy tối đen thẳm */
  font-family: 'Outfit', sans-serif;
}

.compare-canvases-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; /* Tỉ lệ 50/50 cân đối tuyệt đối */
  gap: 24px;
  height: 100%;
}

.compare-canvas-card {
  background: rgba(30, 41, 59, 0.35); /* Slate 800 với opacity */
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 20px;
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

/* Thẻ thuật toán hoàn thành trước phát sáng dịu màu Emerald xanh */
.compare-canvas-card.status-finished {
  border-color: rgba(16, 185, 129, 0.25);
  box-shadow: 0 0 25px rgba(16, 185, 129, 0.08);
}
```

---

## 2. Thẻ so sánh Hiệu năng Trực quan (Comparative Stats Cards)

Các chỉ số Big-O động cập nhật liên tục (phép so sánh, hoán vị) được biểu diễn trực quan dưới dạng các thẻ đo lường lôi cuốn:

```css
.compare-stats-dashboard {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 4 cột chỉ số song song */
  gap: 16px;
  margin-top: 16px;
}

.compare-stat-item-card {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 16px;
  text-align: center;
}

/* Hiển thị số đo lớn bên trái và bên phải để học sinh so đối */
.compare-dual-metrics {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-top: 8px;
}

.metric-left-val {
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 800;
  color: #06B6D4; /* Cyan cho bên trái */
  text-shadow: 0 0 8px rgba(6, 182, 212, 0.2);
}

.metric-divider {
  color: #475569; /* Slate 600 */
  font-size: 14px;
  font-weight: 600;
}

.metric-right-val {
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 800;
  color: #10B981; /* Emerald cho bên phải */
  text-shadow: 0 0 8px rgba(16, 185, 129, 0.2);
}
```

---

## 3. Cụm thanh Range Slider Điều khiển Đồng bộ (Unified Timeline Slider)

Thanh Slider dòng thời gian chung có màu gradient lộng lẫy và huy hiệu di chuyển bám sát nút kéo:

```css
.unified-slider-wrapper {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  padding: 16px 28px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.unified-range-input {
  flex-grow: 1;
  -webkit-appearance: none;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(to right, #06B6D4, #10B981); /* Gradient Cyan sang Emerald */
  outline: none;
  cursor: pointer;
}

.unified-range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #FFFFFF;
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
  transition: transform 0.15s ease;
}

.unified-range-input::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}
```
 Bố cục chia tách cân đối Split Screen Grid kết hợp các thanh đo sắc nét Neon Cyan và Emerald mang lại một thực nghiệm học thuật đối so sánh tiệm cận Big-O vô cùng lôi cuốn và trực quan hóa chiều sâu tối đa.
