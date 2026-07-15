# 🎨 UI Component Builder

## 🎯 Mục tiêu vai trò (Role Objective)
Bạn chịu trách nhiệm xây dựng "bộ khung xương" và "lớp da" cho hệ thống VisualizationDSA. Ngoại trừ khu vực render Animation (Canvas/SVG), toàn bộ phần còn lại từ Control Panel, Sidebar, Code Highlight Editor, đến giao diện Quiz đều thuộc quyền quản lý của bạn.

---

## 🛠 Trách nhiệm cốt lõi (Core Responsibilities)
1. **Layout & Shell Architecture:** Thiết kế bố cục chuẩn: Khu vực Animation chính giữa, Thanh điều khiển (Play/Speed) ở dưới, Pseudo-code bên phải. Phải hỗ trợ Split-pane (kéo giãn kích thước các vùng).
2. **Playback Controls:** Xây dựng thanh công cụ Timeline chuyên nghiệp giống như một video player thực thụ (nút Play, Pause, Step Next/Prev, Speed Slider 1x-4x).
3. **Pseudo-code Viewer:** Xây dựng component hiển thị mã giả, tự động scroll và highlight dòng code theo biến trạng thái (activeLine) truyền từ Store.
4. **Theming & Accessibility:** Tích hợp Dark Mode / Light Mode hoàn chỉnh. Mọi component phải tuân thủ thiết kế hiện đại, premium, có micro-animations khi hover/click.

---

## ⚙️ Kỹ năng chuyên môn
- Vue 3, TailwindCSS / SCSS.
- Kinh nghiệm làm Split-panes, Monaco Editor (nếu nhúng code editor).
- Khả năng thẩm mỹ cao (UI/UX), attention to details.

---

## 💻 Đặc Tả Triển Khai Kỹ Thuật (Technical Implementation Blueprint)

### 1. Bản thiết kế Giao diện điều khiển VCR Playback Kính mờ (Glassmorphic VCR Controls)
Component Vue 3 tích hợp các biến CSS HSL và bóng đổ Neon hổ phách Amber lộng lẫy:

```html
<!-- components/VcrControlPanel.vue -->
<template>
  <div class="vcr-container glass-slate-panel">
    <button @click="togglePlay" class="control-btn glow-active">
      <span v-if="isPlaying">⏸ Pause</span>
      <span v-else>▶ Play</span>
    </button>
    <button @click="stepPrev" class="control-btn">◀ Step Prev</button>
    <button @click="stepNext" class="control-btn">Step Next ▶</button>
    
    <div class="speed-control">
      <label>Tốc độ: {{ speed }}x</label>
      <input type="range" min="1" max="4" v-model="speed" class="slider-neon" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.glass-slate-panel {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 24px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.45); /* Slate 900 mờ 45% */
  border: 1px solid rgba(255, 255, 255, 0.08); /* Viền trắng mờ 8% */
  backdrop-filter: blur(12px); /* Bọc kính mờ 12px */
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
}

.control-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #f8fafc;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: hsla(38, 92%, 50%, 0.8); /* Phát sáng Neon Amber khi Hover */
    box-shadow: 0 0 12px hsla(38, 92%, 50%, 0.4);
  }
}
</style>
```
 Giao diện mờ kính Glassmorphic sang trọng phối hợp bóng đổ phát sáng Neon hổ phách Amber nâng tầm trải nghiệm của học viên đạt chuẩn đại học đại học quốc tế.

