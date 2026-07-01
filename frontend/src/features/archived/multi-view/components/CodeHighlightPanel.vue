<template>
  <div class="code-highlight-panel">
    <div class="panel-header">
      <BaseIcon name="code-ide" class="panel-icon" />
      <span class="panel-title">Code Editor</span>
      <span class="panel-badge" v-if="activeLine > 0">Dòng {{ activeLine }}</span>
    </div>
    <div class="code-lines-container">
      <div
        v-for="(line, idx) in codeLines"
        :key="idx"
        class="code-line"
        :class="{
          'code-line-active': idx + 1 === activeLine,
        }"
      >
        <span class="line-number">{{ idx + 1 }}</span>
        <span class="gutter-arrow" v-if="idx + 1 === activeLine">▶</span>
        <span class="line-content">{{ line }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMultiViewStore } from '../store/useMultiViewStore';

const store = useMultiViewStore();

const activeLine = computed(() => store.currentStep?.activeLineNumber ?? 0);

const codeLines = [
  '// Thuật toán Sắp xếp nổi bọt (Bubble Sort)',
  '',
  'for (let i = 0; i < array.length - 1; i++) {',
  '  for (let j = 0; j < array.length - i - 1; j++) {',
  '    compare(j, j + 1);',
  '    //',
  '    if (array[j] > array[j + 1]) {',
  '      // Gọi swap để tráo đổi vị trí',
  '      swap(j, j + 1);',
  '    }',
  '  }',
  '  // Đánh dấu phần tử cuối lượt này đã đúng chỗ',
  '  highlight(array.length - i - 1);',
  '}',
  '// Đánh dấu phần tử đầu tiên đã xếp xong',
  'highlight(0);',
];
</script>

<style scoped>
.code-highlight-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.panel-icon {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--color-accent-primary);
}

.panel-title {
  font-size: 12px;
  font-weight: 600;
  color: #e2e8f0;
}

.panel-badge {
  margin-left: auto;
  padding: 2px 8px;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 6px;
  font-size: 10px;
  color: #F59E0B;
}

.code-lines-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.8;
}

.code-line {
  display: flex;
  align-items: center;
  padding: 0 12px;
  min-height: 24px;
  transition: background 0.15s ease;
}

.code-line-active {
  background: rgba(245, 158, 11, 0.15);
  border-left: 3px solid #F59E0B;
  box-shadow: inset 5px 0 10px rgba(245, 158, 11, 0.05);
}

.line-number {
  width: 28px;
  text-align: right;
  color: #475569;
  margin-right: 8px;
  user-select: none;
  flex-shrink: 0;
}

.code-line-active .line-number {
  color: #F59E0B;
}

.gutter-arrow {
  color: #F59E0B;
  font-size: 10px;
  margin-right: 4px;
  flex-shrink: 0;
}

.line-content {
  color: #cbd5e1;
  white-space: pre;
}

.code-line-active .line-content {
  color: #fbbf24;
}
</style>
