<template>
  <div class="flex-shrink-0 flex items-center gap-3 px-4 py-2 bg-bg-secondary/80 rounded-xl border border-border-subtle" data-tour-id="concurrency-toolbar">
    <!-- Scenario Dropdown -->
    <div class="flex items-center gap-2">
      <label class="text-[10px] text-text-secondary uppercase tracking-wider whitespace-nowrap">Kịch bản</label>
      <select
        :value="selectedScenarioId"
        @change="onScenarioChange"
        data-tour-id="concurrency-scenario-select"
        class="scenario-select bg-bg-surface border border-border-default text-text-primary text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent"
      >
        <option v-for="s in scenarioList" :key="s.id" :value="s.id" class="scenario-option">{{ s.title }}</option>
      </select>
    </div>

    <span class="text-[11px] text-text-secondary flex-1 truncate">{{ scenarioDescription }}</span>

    <!-- Mutex Toggle -->
    <div class="flex items-center gap-2 flex-shrink-0">
      <span class="text-[10px] text-text-secondary uppercase tracking-wider">Mutex</span>
      <button
        @click="$emit('toggle-mutex')"
        data-tour-id="concurrency-mutex-toggle"
        class="relative w-10 h-5 rounded-full transition-all duration-300 border cursor-pointer"
        :style="mutexEnabled 
          ? 'background: var(--color-accent-cyan, #06B6D4); border-color: var(--color-accent-cyan, #06B6D4); box-shadow: 0 0 8px rgba(6, 182, 212, 0.4);' 
          : 'background: rgba(255, 255, 255, 0.05); border-color: rgba(255, 255, 255, 0.1);'"
      >
        <span
          class="absolute top-[2px] left-[2px] w-3.5 h-3.5 rounded-full bg-white transition-transform duration-300 shadow-sm"
          :style="{ transform: mutexEnabled ? 'translateX(20px)' : 'translateX(0)' }"
        ></span>
      </button>
      <span class="text-[10px] font-bold" :class="mutexEnabled ? 'text-accent' : 'text-text-muted'">
        {{ mutexEnabled ? 'BẬT' : 'TẮT' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  selectedScenarioId: string;
  scenarioList: { id: string; title: string }[];
  scenarioDescription: string;
  mutexEnabled: boolean;
}>();

const emit = defineEmits<{ 'scenario-change': [id: string]; 'toggle-mutex': [] }>();

function onScenarioChange(e: Event): void {
  emit('scenario-change', (e.target as HTMLSelectElement).value);
}
</script>

<style scoped>
.scenario-select {
  cursor: pointer;
}
.scenario-option {
  background-color: #0f172a !important; /* Dark Slate background */
  color: #f8fafc !important; /* Slate 50 light color */
}
</style>
