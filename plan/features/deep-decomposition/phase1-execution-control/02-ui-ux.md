# 🎨 UI & UX Specifications - Control Panel & Timeline (Vue 3)

Tài liệu này đặc tả chi tiết giao diện cấu trúc HTML/CSS của bảng điều khiển VCR và giải pháp hiển thị Tooltip thuyết minh động khi hover qua thanh tiến trình.

---

## 1. Thiết kế Giao diện Bảng điều khiển (VCR Control Panel)

Bảng điều khiển được thiết kế dạng dải Slate phẳng cao cấp bo góc mịn đè chân Canvas.

### 1.1. Cấu trúc Component HTML (`ControlPanel.vue`)
```html
<template>
  <div class="control-panel-container">
    <!-- 1. Vùng nút điều hướng VCR trái -->
    <div class="vcr-controls-left">
      <button @click="animStore.stepBackward" :disabled="isFirstFrame" class="vcr-action-btn" title="Lùi 1 bước (Arrow Left)">
        <span class="icon">|◀</span>
      </button>
      
      <button @click="togglePlay" class="vcr-play-btn" :title="isPlaying ? 'Tạm dừng (Space)' : 'Phát (Space)'">
        <span v-if="isPlaying" class="icon">⏸</span>
        <span v-else-if="isFinished" class="icon">↩</span>
        <span v-else class="icon">▶</span>
      </button>
      
      <button @click="animStore.stepForward" :disabled="isLastFrame" class="vcr-action-btn" title="Tiến 1 bước (Arrow Right)">
        <span class="icon">▶|</span>
      </button>
    </div>

    <!-- 2. Vùng thanh trượt tiến trình ở giữa -->
    <div class="timeline-slider-center" ref="sliderContainer" @mousemove="handleSliderHover" @mouseleave="hideTooltip">
      <input 
        type="range" 
        min="0" 
        :max="totalFrames - 1" 
        v-model.number="currentFrame"
        @mousedown="scrubEngine.startScrub"
        @input="onScrubInput"
        @mouseup="scrubEngine.endScrub"
        class="custom-timeline-slider"
      />
      
      <!-- Tooltip thuyết minh nổi động -->
      <div 
        v-if="tooltip.visible" 
        :style="{ left: tooltip.x + 'px' }" 
        class="slider-dynamic-tooltip"
      >
        <span class="tooltip-step-label">Bước {{ tooltip.step }}:</span>
        <p class="tooltip-explanation-text">{{ truncateText(tooltip.text, 55) }}</p>
      </div>
    </div>

    <!-- 3. Vùng tùy chọn tốc độ ở bên phải -->
    <div class="speed-controls-right">
      <select v-model="playbackSpeed" class="speed-select-dropdown">
        <option :value="0.25">0.25x</option>
        <option :value="0.5">0.5x</option>
        <option :value="1.0">1.0x (Mặc định)</option>
        <option :value="2.0">2.0x</option>
        <option :value="4.0">4.0x</option>
      </select>
    </div>
  </div>
</template>
```

---

## 2. Thiết kế CSS Custom Youtube-style Slider

Tùy biến thanh Range Input mặc định của trình duyệt để đạt phong cách Youtube sắc sảo:

```css
.custom-timeline-slider {
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
  transition: height 0.1s ease;
}

/* Tăng kích thước khi hover giống Youtube */
.custom-timeline-slider:hover {
  height: 8px;
}

/* Tùy biến nút kéo (Thumb) màu xanh Neon phát sáng */
.custom-timeline-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #10B981; /* Emerald Neon */
  box-shadow: 0 0 10px #10B981;
  transition: transform 0.1s ease;
}

.custom-timeline-slider::-webkit-slider-thumb:hover {
  transform: scale(1.3);
}
```

---

## 3. Logic Tính toán Tọa độ Tooltip Động khi Hover

Khi di chuột qua thanh trượt Slider, chúng ta ánh xạ vị trí chuột trục hoành `offsetX` sang tỷ lệ phần trăm của tổng khung hình để tìm ra Frame tương ứng và trích xuất câu thuyết minh:

```typescript
const sliderContainer = ref<HTMLDivElement | null>(null);
const tooltip = ref({ visible: false, x: 0, step: 0, text: '' });

function handleSliderHover(event: MouseEvent) {
  if (!sliderContainer.value || totalFrames.value <= 1) return;

  const rect = sliderContainer.value.getBoundingClientRect();
  const hoverX = event.clientX - rect.left; // Vị trí chuột so với container
  const ratio = Math.max(0, Math.min(1, hoverX / rect.width)); // Tỉ lệ phần trăm [0, 1]
  
  const targetFrameIdx = Math.round(ratio * (totalFrames.value - 1));
  const matchedFrame = animStore.frames[targetFrameIdx];

  if (matchedFrame) {
    tooltip.value = {
      visible: true,
      x: hoverX - 100, // Căn giữa tooltip rộng 200px
      step: targetFrameIdx + 1,
      text: matchedFrame.explanation
    };
  }
}

function hideTooltip() {
  tooltip.value.visible = false;
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
```
