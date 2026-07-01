<template>
  <div class="watch-panel-container">
    <!-- Header -->
    <div class="flex items-center gap-2 px-4 py-2 border-b"
      style="border-color: rgba(255, 255, 255, 0.05); background: rgba(30, 41, 59, 0.6);"
    >
      <div class="w-2 h-2 rounded-full bg-accent"></div>
      <span class="text-xs font-medium text-text-secondary uppercase tracking-wider">
        Watch Panel
      </span>
      <span class="ml-auto text-[10px] text-text-muted font-mono">
        {{ variableEntries.length }} var{{ variableEntries.length !== 1 ? 's' : '' }}
      </span>
    </div>

    <!-- Variables List -->
    <div class="watch-variables-list">
      <template v-if="variableEntries.length === 0">
        <div class="text-center text-text-muted text-xs py-6">
          Chua co bien nao dang theo doi
        </div>
      </template>

      <TransitionGroup name="var-item" tag="div" class="flex flex-col gap-1.5">
        <div
          v-for="entry in variableEntries"
          :key="entry.name"
          class="watch-variable-item-row"
          :class="{ 'value-mutated': mutatedKeys.includes(entry.name) }"
        >
          <!-- Variable name -->
          <span class="watch-var-name">{{ entry.name }}</span>

          <!-- Assignment arrow -->
          <span class="text-text-disabled text-xs mx-2">=</span>

          <!-- Variable value with delta -->
          <span class="watch-var-value-group">
            <!-- 🆕 Previous value (chỉ hiển khi có delta thực sự) -->
            <span
              v-if="hasDelta(entry.name)"
              class="watch-var-prev"
            >
              {{ formatValue(getPreviousValue(entry.name)) }}
              <span class="watch-delta-arrow">→</span>
            </span>

            <!-- Current value -->
            <span
              class="watch-var-value"
              :class="{ 'value-changed': mutatedKeys.includes(entry.name) }"
            >
              {{ formatValue(entry.value) }}
            </span>
          </span>

          <!-- Mutation indicator dot -->
          <div
            v-if="mutatedKeys.includes(entry.name)"
            class="w-1.5 h-1.5 rounded-full bg-accent-cyan ml-2 animate-pulse"
          ></div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  variables: Record<string, string | number | undefined>;
  mutatedKeys: string[];
  previousVariables?: Record<string, string | number | undefined>; // 🆕 delta display
}>();

interface VariableEntry {
  name: string;
  value: string | number | undefined;
}

const variableEntries = computed<VariableEntry[]>(() => {
  return Object.entries(props.variables).map(([name, value]) => ({
    name,
    value,
  }));
});

function formatValue(value: string | number | undefined): string {
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `"${value}"`;
  return String(value);
}

// 🆕 Lấy giá trị trước để hiển thị delta
function getPreviousValue(name: string): string | number | undefined {
  return props.previousVariables?.[name];
}

// 🆕 Kiểm tra có delta thực sự không (giá trị thực sự thay đổi)
function hasDelta(name: string): boolean {
  if (!props.mutatedKeys.includes(name)) return false;
  const prev = props.previousVariables?.[name];
  const curr = props.variables[name];
  return prev !== undefined && prev !== curr;
}
</script>

<style scoped>
.watch-panel-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(15, 23, 42, 0.4);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  overflow: hidden;
}

.watch-variables-list {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
}

.watch-variable-item-row {
  display: flex;
  align-items: center;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border-left: 2px solid transparent;
  transition: all 0.2s ease;
}

.watch-variable-item-row.value-mutated {
  border-left-color: #06B6D4;
  background: rgba(6, 182, 212, 0.04);
}

.watch-var-name {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #94A3B8;
  min-width: 40px;
}

.watch-var-value-group {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  overflow: hidden;
}

/* 🆕 Previous value (mờ, gạch ngang nhẹ) */
.watch-var-prev {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #64748B;
  display: flex;
  align-items: center;
  gap: 4px;
  text-decoration: line-through;
  text-decoration-color: rgba(100, 116, 139, 0.4);
}

.watch-delta-arrow {
  text-decoration: none;
  color: #475569;
  font-size: 10px;
}

.watch-var-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 700;
  color: #E2E8F0;
}

/* 🆕 Flash animation khi giá trị thay đổi */
.watch-var-value.value-changed {
  color: var(--color-accent, #06B6D4);
  animation: value-flash 0.5s ease-out;
}

@keyframes value-flash {
  0%   { color: #F59E0B; }
  40%  { color: #06B6D4; }
  100% { color: var(--color-accent, #06B6D4); }
}

/* TransitionGroup animations */
.var-item-enter-active {
  transition: all 0.25s ease;
}
.var-item-leave-active {
  transition: all 0.2s ease;
}
.var-item-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}
.var-item-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>
