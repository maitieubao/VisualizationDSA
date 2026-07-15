<template>
  <div class="watch-config-container">
    <!-- Header with filter toggle -->
    <div class="flex items-center gap-2 px-4 py-2 border-b"
      style="border-color: rgba(255, 255, 255, 0.05); background: rgba(30, 41, 59, 0.6);"
    >
      <div class="w-2 h-2 rounded-full bg-accent"></div>
      <span class="text-xs font-medium text-text-secondary uppercase tracking-wider">
        Watch Panel
      </span>
      <span class="ml-auto text-[10px] text-text-muted font-mono">
        {{ displayedCount }} / {{ totalCount }} vars
      </span>

      <!-- Toggle filter UI -->
      <button
        @click="showConfig = !showConfig"
        class="watch-config-toggle"
        :class="{ active: showConfig }"
        title="Cấu hình biến theo dõi"
      >
        <span>⚙</span>
      </button>
    </div>

    <!-- Filter Config Panel (collapsible) -->
    <Transition name="config-slide">
      <div v-if="showConfig" class="watch-config-panel">
        <!-- Active filters -->
        <div class="flex flex-wrap gap-1.5 mb-2">
          <span
            v-for="name in activeFilters"
            :key="name"
            class="watch-filter-tag active"
            @click="toggleFilter(name)"
          >
            {{ name }}
            <span class="tag-remove">×</span>
          </span>
          <span
            v-if="activeFilters.length === 0"
            class="text-[10px] text-text-muted"
          >
            Đang hiển thị tất cả biến
          </span>
        </div>

        <!-- Available vars to add -->
        <div class="flex flex-wrap gap-1.5 mb-2">
          <span
            v-for="name in availableToAdd"
            :key="name"
            class="watch-filter-tag available"
            @click="toggleFilter(name)"
            :title="`Nhấn để chỉ theo dõi ${name}`"
          >
            + {{ name }}
          </span>
        </div>

        <!-- Custom var input -->
        <div class="flex gap-2">
          <input
            v-model="customVarInput"
            @keydown.enter="addCustomVar"
            class="watch-custom-input"
            placeholder="Thêm tên biến..."
          />
          <button @click="addCustomVar" class="watch-add-btn">+</button>
        </div>

        <!-- Reset -->
        <button
          v-if="activeFilters.length > 0"
          @click="clearFilters"
          class="watch-reset-btn mt-2"
        >
          Hiện tất cả biến
        </button>
      </div>
    </Transition>

    <!-- Variables List -->
    <div class="watch-variables-list">
      <template v-if="filteredEntries.length === 0">
        <div class="text-center text-text-muted text-xs py-6">
          {{ totalCount === 0 ? 'Chưa có biến nào được capture' : 'Không có biến nào khớp bộ lọc' }}
        </div>
      </template>

      <TransitionGroup name="var-item" tag="div" class="flex flex-col gap-1.5">
        <div
          v-for="entry in filteredEntries"
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
            <!-- Previous value (chỉ hiển khi có delta thực sự) -->
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
import { ref, computed } from 'vue';

const props = defineProps<{
  variables: Record<string, string | number | undefined>;
  mutatedKeys: string[];
  previousVariables?: Record<string, string | number | undefined>;
}>();

interface VariableEntry {
  name: string;
  value: string | number | undefined;
}

const showConfig = ref(false);
const activeFilters = ref<string[]>([]); // rỗng = hiện tất cả
const customVarInput = ref('');

const allEntries = computed<VariableEntry[]>(() =>
  Object.entries(props.variables).map(([name, value]) => ({ name, value }))
);

const totalCount = computed(() => allEntries.value.length);
const displayedCount = computed(() => filteredEntries.value.length);

/** Danh sách biến chưa có trong activeFilters (gợi ý thêm) */
const availableToAdd = computed(() =>
  allEntries.value
    .map(e => e.name)
    .filter(name => !activeFilters.value.includes(name))
);

/** Nếu activeFilters rỗng → hiện tất cả, ngược lại filter theo danh sách */
const filteredEntries = computed<VariableEntry[]>(() => {
  if (activeFilters.value.length === 0) return allEntries.value;
  return allEntries.value.filter(e => activeFilters.value.includes(e.name));
});

function toggleFilter(name: string): void {
  const idx = activeFilters.value.indexOf(name);
  if (idx > -1) {
    activeFilters.value.splice(idx, 1);
  } else {
    activeFilters.value.push(name);
  }
}

function addCustomVar(): void {
  const name = customVarInput.value.trim();
  if (name && !activeFilters.value.includes(name)) {
    activeFilters.value.push(name);
  }
  customVarInput.value = '';
}

function clearFilters(): void {
  activeFilters.value = [];
}

function formatValue(value: string | number | undefined): string {
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `"${value}"`;
  return String(value);
}

function getPreviousValue(name: string): string | number | undefined {
  return props.previousVariables?.[name];
}

function hasDelta(name: string): boolean {
  if (!props.mutatedKeys.includes(name)) return false;
  const prev = props.previousVariables?.[name];
  const curr = props.variables[name];
  return prev !== undefined && prev !== curr;
}
</script>

<style scoped>
.watch-config-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(15, 23, 42, 0.4);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  overflow: hidden;
}

.watch-config-toggle {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  background: rgba(100, 116, 139, 0.1);
  color: #64748B;
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
}

.watch-config-toggle:hover,
.watch-config-toggle.active {
  background: rgba(6, 182, 212, 0.15);
  color: #06B6D4;
  border-color: rgba(6, 182, 212, 0.2);
}

/* Config panel */
.watch-config-panel {
  padding: 10px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  background: rgba(15, 23, 42, 0.6);
}

.watch-filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.watch-filter-tag.active {
  background: rgba(6, 182, 212, 0.15);
  color: #06B6D4;
  border: 1px solid rgba(6, 182, 212, 0.25);
}

.watch-filter-tag.active:hover {
  background: rgba(244, 63, 94, 0.1);
  color: #F43F5E;
  border-color: rgba(244, 63, 94, 0.2);
}

.watch-filter-tag.available {
  background: rgba(100, 116, 139, 0.08);
  color: #64748B;
  border: 1px solid rgba(100, 116, 139, 0.12);
}

.watch-filter-tag.available:hover {
  background: rgba(6, 182, 212, 0.08);
  color: #38BDF8;
  border-color: rgba(6, 182, 212, 0.15);
}

.tag-remove {
  font-size: 11px;
  margin-left: 2px;
}

.watch-custom-input {
  flex: 1;
  padding: 3px 8px;
  border-radius: 5px;
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  color: #E2E8F0;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.06);
  outline: none;
  transition: border-color 0.2s ease;
}

.watch-custom-input:focus {
  border-color: rgba(6, 182, 212, 0.4);
}

.watch-add-btn {
  padding: 3px 10px;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  background: rgba(6, 182, 212, 0.1);
  color: #06B6D4;
  border: 1px solid rgba(6, 182, 212, 0.2);
  transition: all 0.15s ease;
}

.watch-add-btn:hover {
  background: rgba(6, 182, 212, 0.2);
}

.watch-reset-btn {
  width: 100%;
  padding: 4px;
  border-radius: 5px;
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  cursor: pointer;
  background: rgba(100, 116, 139, 0.06);
  color: #64748B;
  border: 1px solid rgba(100, 116, 139, 0.1);
  transition: all 0.15s ease;
}

.watch-reset-btn:hover {
  color: #94A3B8;
  background: rgba(100, 116, 139, 0.1);
}

/* Variables list */
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

/* Previous value */
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

/* Flash animation */
.watch-var-value.value-changed {
  color: var(--color-accent, #06B6D4);
  animation: value-flash 0.5s ease-out;
}

@keyframes value-flash {
  0%   { color: #F59E0B; }
  40%  { color: #06B6D4; }
  100% { color: var(--color-accent, #06B6D4); }
}

/* Config slide transition */
.config-slide-enter-active,
.config-slide-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.config-slide-enter-from,
.config-slide-leave-to {
  opacity: 0;
  max-height: 0;
}

.config-slide-enter-to,
.config-slide-leave-from {
  opacity: 1;
  max-height: 200px;
}

/* TransitionGroup */
.var-item-enter-active { transition: all 0.25s ease; }
.var-item-leave-active  { transition: all 0.2s ease; }
.var-item-enter-from    { opacity: 0; transform: translateX(-10px); }
.var-item-leave-to      { opacity: 0; transform: translateX(10px); }
</style>
