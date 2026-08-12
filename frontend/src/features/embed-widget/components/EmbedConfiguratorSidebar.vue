<template>
  <div class="embed-configurator-sidebar">
    
    <div class="embed-settings-group">
      
      <fieldset class="theme-fieldset" role="radiogroup" aria-label="Theme hiển thị">
        <legend class="embed-settings-label">Theme hiển thị</legend>
        <div class="theme-buttons">
          <button
            v-for="theme in themeOptions"
            :key="theme.id"
            type="button"
            role="radio"
            class="theme-btn"
            :class="{ active: store.selectedTheme === theme.id }"
            :aria-checked="store.selectedTheme === theme.id"
            :aria-label="'Theme ' + theme.label"
            @click="store.setTheme(theme.id)"
          >
            {{ theme.label }}
          </button>
        </div>
      </fieldset>
    </div>

    
    <div class="embed-settings-group">
      <label class="embed-settings-label" for="embed-algo-select">Giải thuật nhúng</label>
      <select
        id="embed-algo-select"
        class="embed-select"
        :value="store.selectedAlgorithm"
        @change="onAlgorithmChange"
      >
        <option
          v-for="algo in algorithmOptions"
          :key="algo.id"
          :value="algo.id"
          :disabled="algo.isPremium && !isPremiumUser"
        >
          {{ algo.label }}{{ algo.isPremium ? ' 🔒' : '' }}
        </option>
      </select>
      
      <p v-if="!isPremiumUser" class="embed-premium-hint">
        <BaseIcon name="lock" class="w-3 h-3 inline mr-1 align-middle" />
        Dijkstra yêu cầu tài khoản Premium để nhúng.
      </p>
    </div>

    
    <div class="embed-settings-group">
      <label class="embed-settings-label" for="embed-width-range">Chiều rộng ({{ store.widgetWidth }}px)</label>
      <input
        id="embed-width-range"
        type="range"
        class="embed-custom-range-slider"
        min="300"
        max="1400"
        step="10"
        :value="store.widgetWidth"
        :aria-valuetext="store.widgetWidth + 'px'"
        @input="onWidthChange"
      />
    </div>

    <div class="embed-settings-group">
      <label class="embed-settings-label" for="embed-height-range">Chiều cao ({{ store.widgetHeight }}px)</label>
      <input
        id="embed-height-range"
        type="range"
        class="embed-custom-range-slider"
        min="200"
        max="900"
        step="10"
        :value="store.widgetHeight"
        :aria-valuetext="store.widgetHeight + 'px'"
        @input="onHeightChange"
      />
    </div>

    
    <div class="embed-settings-group">
      <label class="embed-settings-label">Tùy chỉnh hiển thị</label>

      <div class="toggle-row">
        <span class="toggle-label">VCR Controls</span>
        <button
          type="button"
          class="toggle-switch"
          :class="{ on: store.showVcrControls }"
          role="switch"
          :aria-checked="store.showVcrControls"
          aria-label="Bật/tắt VCR Controls"
          @click="store.toggleVcrControls()"
        >
          <span class="toggle-knob" />
        </button>
      </div>

      <div class="toggle-row">
        <span class="toggle-label">Watch Variables</span>
        <button
          type="button"
          class="toggle-switch"
          :class="{ on: store.showWatchVariables }"
          role="switch"
          :aria-checked="store.showWatchVariables"
          aria-label="Bật/tắt Watch Variables"
          @click="store.toggleWatchVariables()"
        >
          <span class="toggle-knob" />
        </button>
      </div>

      <div class="toggle-row">
        <span class="toggle-label">Interactive Mode</span>
        <button
          type="button"
          class="toggle-switch"
          :class="{ on: store.isInteractive }"
          role="switch"
          :aria-checked="store.isInteractive"
          aria-label="Bật/tắt Interactive Mode"
          @click="store.toggleInteractive()"
        >
          <span class="toggle-knob" />
        </button>
      </div>
    </div>

    
    <button type="button" class="reset-btn" @click="store.resetConfigurator()">
      <BaseIcon name="refresh-ccw" class="w-3.5 h-3.5 inline mr-1 align-middle" />
      Đặt lại Mặc định
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEmbedConfiguratorStore } from '../store/useEmbedConfiguratorStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { EMBED_ALGORITHM_OPTIONS } from '../types/embed-widget.types';
import type { EmbedTheme } from '../types/embed-widget.types';

const store = useEmbedConfiguratorStore();
const authStore = useAuthStore();

const isPremiumUser = computed(() => authStore.isAuthenticated && authStore.isPremium);

// ─── EW-016: đánh dấu thuật toán premium (dijkstra) — disable cho user thường ───
const PREMIUM_ALGO_IDS = new Set(['dijkstra']);

// ─── EW-030: đồng bộ danh sách với VISUALIZER_MAP của EmbedWidgetView —
// thêm quick-sort (đã có trong map nhưng thiếu trong options) ───
const algorithmOptions = computed(() => {
  const options = EMBED_ALGORITHM_OPTIONS.map((algo) => ({
    ...algo,
    isPremium: PREMIUM_ALGO_IDS.has(algo.id),
  }));
  const hasQuickSort = options.some((algo) => algo.id === 'quick-sort');
  if (!hasQuickSort) {
    const quickIndex = options.findIndex((algo) => algo.id === 'quicksort-recursion');
    const quickSort = { id: 'quick-sort', label: 'Quick Sort', isPremium: false };
    if (quickIndex >= 0) options.splice(quickIndex + 1, 0, quickSort);
    else options.push(quickSort);
  }
  return options;
});

const themeOptions: { id: EmbedTheme; label: string }[] = [
  { id: 'dark', label: 'Dark' },
  { id: 'light', label: 'Light' },
  { id: 'glass', label: 'Glass' },
];

function onAlgorithmChange(event: Event): void {
  const target = event.target as HTMLSelectElement;
  const algo = algorithmOptions.value.find((a) => a.id === target.value);
  if (algo?.isPremium && !isPremiumUser.value) return;
  store.setAlgorithm(target.value);
}

function onWidthChange(event: Event): void {
  const target = event.target as HTMLInputElement;
  store.setDimensions(Number(target.value), store.widgetHeight);
}

function onHeightChange(event: Event): void {
  const target = event.target as HTMLInputElement;
  store.setDimensions(store.widgetWidth, Number(target.value));
}
</script>

<style scoped>
@import "./EmbedConfiguratorSidebar.css";
</style>
