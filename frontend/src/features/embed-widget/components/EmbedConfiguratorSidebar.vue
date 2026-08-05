<template>
  <div class="embed-configurator-sidebar">
    
    <div class="embed-settings-group">
      <label class="embed-settings-label">Theme hiển thị</label>
      <div class="theme-buttons">
        <button
          v-for="theme in themeOptions"
          :key="theme.id"
          type="button"
          class="theme-btn"
          :class="{ active: store.selectedTheme === theme.id }"
          :aria-pressed="store.selectedTheme === theme.id"
          :aria-label="'Theme ' + theme.label"
          @click="store.setTheme(theme.id)"
        >
          {{ theme.label }}
        </button>
      </div>
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
        >
          {{ algo.label }}
        </option>
      </select>
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
import { useEmbedConfiguratorStore } from '../store/useEmbedConfiguratorStore';
import { EMBED_ALGORITHM_OPTIONS } from '../types/embed-widget.types';
import type { EmbedTheme } from '../types/embed-widget.types';

const store = useEmbedConfiguratorStore();
const algorithmOptions = EMBED_ALGORITHM_OPTIONS;

const themeOptions: { id: EmbedTheme; label: string }[] = [
  { id: 'dark', label: 'Dark' },
  { id: 'light', label: 'Light' },
  { id: 'glass', label: 'Glass' },
];

function onAlgorithmChange(event: Event): void {
  const target = event.target as HTMLSelectElement;
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
