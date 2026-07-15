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
.embed-configurator-sidebar {
  width: 320px;
  background: rgba(15, 23, 42, 0.55);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  flex-shrink: 0;
}

.embed-settings-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.embed-settings-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 700;
}

.theme-buttons {
  display: flex;
  gap: 6px;
}

.theme-btn {
  flex: 1;
  padding: 8px 10px;
  font-size: 11px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(15, 23, 42, 0.5);
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
}

.theme-btn:hover {
  border-color: rgba(6, 182, 212, 0.3);
  color: #06b6d4;
}

.theme-btn.active {
  background: rgba(6, 182, 212, 0.12);
  border-color: rgba(6, 182, 212, 0.4);
  color: #06b6d4;
  box-shadow: 0 0 12px rgba(6, 182, 212, 0.15);
}

.embed-select {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  background: rgba(7, 11, 19, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.embed-select:focus {
  border-color: rgba(6, 182, 212, 0.4);
}

.embed-custom-range-slider {
  width: 100%;
  accent-color: #06b6d4;
  height: 6px;
  border-radius: 3px;
  cursor: pointer;
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
}

.toggle-label {
  font-size: 12px;
  color: #cbd5e1;
  font-family: 'JetBrains Mono', monospace;
}

.toggle-switch {
  width: 40px;
  height: 22px;
  border-radius: 11px;
  border: none;
  padding: 2px;
  cursor: pointer;
  transition: background 0.25s ease;
  background: rgba(100, 116, 139, 0.4);
  position: relative;
}

.toggle-switch.on {
  background: rgba(6, 182, 212, 0.6);
}

.toggle-knob {
  display: block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #e2e8f0;
  transition: transform 0.25s ease;
  transform: translateX(0);
}

.toggle-switch.on .toggle-knob {
  transform: translateX(18px);
}

.reset-btn {
  width: 100%;
  padding: 10px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: 8px;
  border: 1px solid rgba(244, 63, 94, 0.25);
  background: rgba(244, 63, 94, 0.08);
  color: #f43f5e;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: auto;
}

.reset-btn:hover {
  background: rgba(244, 63, 94, 0.15);
  box-shadow: 0 0 12px rgba(244, 63, 94, 0.12);
}
</style>
