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
          <div class="segmented-control" role="group" aria-label="Chọn tốc độ phát mặc định">
            <button
              v-for="speed in [0.5, 1, 1.5, 2]"
              :key="speed"
              class="segment-btn"
              :class="{ 'segment-btn--active': preferences.defaultSpeed === speed }"
              :aria-pressed="preferences.defaultSpeed === speed"
              @click="updateSpeedPref(speed)"
            >
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
          <button
            class="toggle-switch"
            :class="{ 'toggle-switch--on': preferences.enableConfetti }"
            role="switch"
            :aria-checked="preferences.enableConfetti"
            aria-label="Bật hoặc tắt hiệu ứng pháo hoa Confetti"
            @click="toggleConfettiPref"
          >
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
          <button
            class="toggle-switch"
            :class="{ 'toggle-switch--on': preferences.autoPlay }"
            role="switch"
            :aria-checked="preferences.autoPlay"
            aria-label="Bật hoặc tắt tự động phát bước tiếp theo"
            @click="toggleAutoPlayPref"
          >
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
import {
  useSpeedPreferences,
  DSA_PREFERENCES_KEY,
} from '../../features/animation-engine/composables/useSpeedPreferences';

const toastStore = useToastStore();
// PR-012: nối THẬT vào hệ thống dùng chung `dsa_preferences` (VCR thật đọc key này) —
// thay cho 3 key chết `vdsa_pref_*` không nơi nào đọc.
const { loadSpeed, saveSpeed, initSpeedFromStorage } = useSpeedPreferences();

// Đọc/boot JSON chung dsa_preferences — các khóa boolean (confetti/autoplay) lưu CÙNG
// object với defaultSpeed để nơi tiêu thụ (useGamificationStore/useConfetti) đọc được.
function readJsonPref(key: string, fallback: boolean): boolean {
  try {
    const raw = localStorage.getItem(DSA_PREFERENCES_KEY);
    if (!raw) return fallback;
    const parsed: Record<string, unknown> = JSON.parse(raw) as Record<string, unknown>;
    const value = parsed[key];
    return typeof value === 'boolean' ? value : fallback;
  } catch {
    return fallback;
  }
}

function writeJsonPref(key: string, value: boolean): void {
  try {
    let existing: Record<string, unknown> = {};
    const raw = localStorage.getItem(DSA_PREFERENCES_KEY);
    if (raw) {
      try { existing = JSON.parse(raw) as Record<string, unknown>; } catch { /* ghi đè object mới */ }
    }
    existing[key] = value;
    localStorage.setItem(DSA_PREFERENCES_KEY, JSON.stringify(existing));
  } catch {
    // Storage đầy/không khả dụng — bỏ qua, UI vẫn hoạt động trong phiên.
  }
}

const preferences = reactive({
  defaultSpeed: loadSpeed(),
  enableConfetti: readJsonPref('enableConfetti', true),
  autoPlay: readJsonPref('autoPlay', false)
});

function updateSpeedPref(speed: number): void {
  preferences.defaultSpeed = speed;
  saveSpeed(speed);
  // Đồng bộ ngay vào store VCR đang chạy — người dùng không phải tải lại trang.
  initSpeedFromStorage();
  toastStore.success(`Đã đổi tốc độ mặc định sang ${speed}x`);
}

function toggleConfettiPref(): void {
  preferences.enableConfetti = !preferences.enableConfetti;
  writeJsonPref('enableConfetti', preferences.enableConfetti);
}

function toggleAutoPlayPref(): void {
  preferences.autoPlay = !preferences.autoPlay;
  writeJsonPref('autoPlay', preferences.autoPlay);
}
</script>
