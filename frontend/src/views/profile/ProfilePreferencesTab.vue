<template>
  <section class="panel-section">
    <div class="panel-header">
      <h2 class="panel-title">Preferences</h2>
      <p class="panel-subtitle">Tùy chỉnh trải nghiệm xem giải thuật, tốc độ trình chiếu và hiệu ứng tương tác.</p>
    </div>

    <div class="pm-form">
      <div class="pm-setting-item">
        <div class="setting-info">
          <label class="setting-label">Tốc độ VCR mặc định</label>
          <p class="setting-desc">Tốc độ phát mặc định khi mở các trình xem hoạt ảnh DSA.</p>
        </div>
        <div class="setting-control">
          <div class="segmented-control">
            <button v-for="speed in [0.5, 1, 1.5, 2]" :key="speed" class="segment-btn" :class="{ 'segment-btn--active': preferences.defaultSpeed === speed }" @click="updateSpeedPref(speed)">
              {{ speed }}x
            </button>
          </div>
        </div>
      </div>

      <div class="pm-setting-item">
        <div class="setting-info">
          <label class="setting-label">Hiệu ứng pháo hoa Confetti</label>
          <p class="setting-desc">Hiển thị pháo hoa chúc mừng khi hoàn thành xuất sắc bài quiz.</p>
        </div>
        <div class="setting-control">
          <button class="toggle-switch" :class="{ 'toggle-switch--on': preferences.enableConfetti }" @click="toggleConfettiPref">
            <span class="toggle-thumb"></span>
          </button>
        </div>
      </div>

      <div class="pm-setting-item">
        <div class="setting-info">
          <label class="setting-label">Tự động phát bước tiếp theo</label>
          <p class="setting-desc">Tự động chuyển bước giải thuật trong chế độ E-Lecture khi kết thúc lời giải thích.</p>
        </div>
        <div class="setting-control">
          <button class="toggle-switch" :class="{ 'toggle-switch--on': preferences.autoPlay }" @click="toggleAutoPlayPref">
            <span class="toggle-thumb"></span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useToastStore } from '../../composables/useToast';

const toastStore = useToastStore();

const preferences = reactive({
  defaultSpeed: Number(localStorage.getItem('vdsa_pref_speed')) || 1,
  enableConfetti: localStorage.getItem('vdsa_pref_confetti') !== 'false',
  autoPlay: localStorage.getItem('vdsa_pref_autoplay') === 'true'
});

function updateSpeedPref(speed: number) {
  preferences.defaultSpeed = speed;
  localStorage.setItem('vdsa_pref_speed', String(speed));
  toastStore.success(`Đã đổi tốc độ mặc định sang ${speed}x`);
}

function toggleConfettiPref() {
  preferences.enableConfetti = !preferences.enableConfetti;
  localStorage.setItem('vdsa_pref_confetti', String(preferences.enableConfetti));
}

function toggleAutoPlayPref() {
  preferences.autoPlay = !preferences.autoPlay;
  localStorage.setItem('vdsa_pref_autoplay', String(preferences.autoPlay));
}
</script>
