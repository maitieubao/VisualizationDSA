<template>
  <div class="embed-configurator-sidebar">
    <!-- Theme Selector -->
    <div class="embed-settings-group">
      <label class="embed-settings-label">Theme hiển thị</label>
      <div class="theme-buttons">
        <button
          v-for="theme in themeOptions"
          :key="theme.id"
          class="theme-btn"
          :class="{ active: store.selectedTheme === theme.id }"
          @click="store.setTheme(theme.id)"
        >
          {{ theme.label }}
        </button>
      </div>
    </div>

    <!-- Algorithm Selector -->
    <div class="embed-settings-group">
      <label class="embed-settings-label">Giải thuật nhúng</label>
      <select
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

    <!-- Dimensions -->
    <div class="embed-settings-group">
      <label class="embed-settings-label">Chiều rộng ({{ store.widgetWidth }}px)</label>
      <input
        type="range"
        class="embed-custom-range-slider"
        min="300"
        max="1400"
        step="10"
        :value="store.widgetWidth"
        @input="onWidthChange"
      />
    </div>

    <div class="embed-settings-group">
      <label class="embed-settings-label">Chiều cao ({{ store.widgetHeight }}px)</label>
      <input
        type="range"
        class="embed-custom-range-slider"
        min="200"
        max="900"
        step="10"
        :value="store.widgetHeight"
        @input="onHeightChange"
      />
    </div>

    <!-- Toggles -->
    <div class="embed-settings-group">
      <label class="embed-settings-label">Tùy chỉnh hiển thị</label>

      <div class="toggle-row">
        <span class="toggle-label">VCR Controls</span>
        <button
          class="toggle-switch"
          :class="{ on: store.showVcrControls }"
          @click="store.toggleVcrControls()"
        >
          <span class="toggle-knob" />
        </button>
      </div>

      <div class="toggle-row">
        <span class="toggle-label">Watch Variables</span>
        <button
          class="toggle-switch"
          :class="{ on: store.showWatchVariables }"
          @click="store.toggleWatchVariables()"
        >
          <span class="toggle-knob" />
        </button>
      </div>

      <div class="toggle-row">
        <span class="toggle-label">Interactive Mode</span>
        <button
          class="toggle-switch"
          :class="{ on: store.isInteractive }"
          @click="store.toggleInteractive()"
        >
          <span class="toggle-knob" />
        </button>
      </div>
    </div>

    <!-- Reset Button -->
    <button class="reset-btn" @click="store.resetConfigurator()">
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
