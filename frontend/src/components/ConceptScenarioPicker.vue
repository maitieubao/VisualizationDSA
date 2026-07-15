<template>
  <div class="scenario-picker">
    <span class="scenario-picker__label">{{ label }}</span>
    <div class="scenario-picker__grid">
      <button
        v-for="scenario in scenarios"
        :key="scenario.id"
        class="scenario-picker__btn"
        :disabled="loading"
        @click="$emit('select', scenario.id)"
      >
        {{ scenario.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface ScenarioOption {
  id: string;
  label: string;
}

withDefaults(defineProps<{
  scenarios: ScenarioOption[];
  label?: string;
  loading?: boolean;
}>(), {
  label: 'Backend Scenarios',
  loading: false,
});

defineEmits<{
  select: [id: string];
}>();
</script>

<style scoped>
.scenario-picker {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.scenario-picker__label {
  font-size: 11px;
  font-weight: 600;
  color: var(--vcr-accent);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.scenario-picker__grid {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.scenario-picker__btn {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--duration-normal) ease;
  border: 1px solid var(--picker-border);
  background: var(--picker-bg);
  color: var(--vcr-accent);
}
.scenario-picker__btn:hover:not(:disabled) {
  background: var(--picker-hover-bg);
  border-color: var(--glass-border-hover);
}
.scenario-picker__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
