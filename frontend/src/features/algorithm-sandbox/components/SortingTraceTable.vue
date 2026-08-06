<template>
  <div class="sorting-trace-table flex flex-col min-h-0 w-full" data-tour-id="trace-table">
    <!-- Table -->
    <div class="flex-1 min-h-0 overflow-auto relative">
      <table class="w-full h-full border-collapse text-[11px] font-mono leading-tight">
        <thead class="sticky top-0 z-10">
          <tr class="text-left" style="background: var(--color-bg-secondary); border-bottom: 1px solid var(--vis-panel-border)">
            <th class="px-2 py-1 text-text-muted font-bold whitespace-nowrap w-8">#</th>
            <th
              v-for="col in columns"
              :key="col.key"
              class="px-1.5 py-1 text-text-muted font-bold whitespace-nowrap"
              :title="col.label"
            >{{ col.label }}</th>
            <th class="px-1.5 py-1 text-text-muted font-bold whitespace-nowrap">Mô tả</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(frame, idx) in frames"
            :key="frame.stepIndex"
            :ref="(el) => { if (idx === currentIndex) activeRowRef = el as HTMLElement | null; }"
            class="cursor-pointer border-b transition-colors"
            :class="[
              idx === currentIndex
                ? 'bg-accent/15 text-text-primary font-bold'
                : 'text-text-secondary hover:bg-bg-hover',
            ]"
            style="border-color: var(--vis-panel-border)"
            @click="$emit('jump', idx)"
          >
            <td class="px-2 py-[3px] whitespace-nowrap text-text-muted">{{ idx + 1 }}</td>
            <td
              v-for="col in columns"
              :key="col.key"
              class="px-1.5 py-[3px] whitespace-nowrap"
              :class="{
                'text-accent': isHighlightedCell(frame, col),
                'opacity-35': !isHighlightedCell(frame, col) && cellValue(frame, col) === '-',
              }"
            ><span v-html="parseEmojiToSvg(escapeHtmlText(String(cellValue(frame, col))))"></span></td>
            <td class="px-1.5 py-[3px] max-w-[200px]">
              <span class="block truncate" :title="frame.description" v-html="parseEmojiToSvg(escapeHtmlText(frame.description))"></span>
            </td>
          </tr>
          <tr v-if="frames.length > 0" class="pointer-events-none" style="height: 100%">
            <td :colspan="totalCols" style="height: 100%; border-bottom: none; background: transparent"></td>
          </tr>
        </tbody>
      </table>

      <div v-if="frames.length === 0" class="absolute inset-0 flex items-center justify-center text-xs text-text-muted">
        Chưa có dữ liệu — chạy thuật toán để xem bảng mô phỏng
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref, nextTick } from 'vue';
import { parseEmojiToSvg, escapeHtmlText } from '../../../utils/emojiParser';
import type { SortFrame, SortAlgorithm } from '../types/sorting.types';const props = defineProps<{
  frames: SortFrame[];
  currentIndex: number;
}>();

defineEmits<{ jump: [index: number] }>();

interface TraceColumn {
  key: string;
  label: string;
  fromVar?: string;
  kind?: 'compare' | 'swap' | 'pivot' | 'sorted' | 'phase' | 'value';
}

const VAR_COLUMNS: Record<SortAlgorithm, TraceColumn[]> = {
  bubble: [
    { key: 'i', label: 'i', fromVar: 'i' },
    { key: 'j', label: 'j', fromVar: 'j' },
    { key: 'comparisons', label: 'So sánh', fromVar: 'comparisons', kind: 'value' },
    { key: 'swaps', label: 'Hoán vị', fromVar: 'swaps', kind: 'value' },
  ],
  quick: [
    { key: 'low', label: 'low', fromVar: 'low' },
    { key: 'high', label: 'high', fromVar: 'high' },
    { key: 'i', label: 'i', fromVar: 'i' },
    { key: 'j', label: 'j', fromVar: 'j' },
    { key: 'pivot', label: 'Pivot', fromVar: 'pivot' },
    { key: 'swaps', label: 'Hoán vị', fromVar: 'swaps', kind: 'value' },
  ],
  merge: [
    { key: 'left', label: 'L', fromVar: 'left' },
    { key: 'mid', label: 'M', fromVar: 'mid' },
    { key: 'right', label: 'R', fromVar: 'right' },
    { key: 'i', label: 'i', fromVar: 'i' },
    { key: 'j', label: 'j', fromVar: 'j' },
    { key: 'k', label: 'k', fromVar: 'k' },
  ],
  heap: [
    { key: 'heapSize', label: 'Heap', fromVar: 'heapSize' },
    { key: 'i', label: 'i', fromVar: 'i' },
    { key: 'largest', label: 'largest', fromVar: 'largest' },
    { key: 'swaps', label: 'Hoán vị', fromVar: 'swaps', kind: 'value' },
  ],
  radix: [
    { key: 'exp', label: 'exp', fromVar: 'exp' },
    { key: 'i', label: 'i', fromVar: 'i' },
    { key: 'digit', label: 'digit', fromVar: 'digit' },
    { key: 'd', label: 'Hộp', fromVar: 'd' },
  ],
  counting: [
    { key: 'phase', label: 'Pha', fromVar: 'phase', kind: 'phase' },
    { key: 'i', label: 'i', fromVar: 'i' },
    { key: 'digit', label: 'digit', fromVar: 'digit' },
    { key: 'countVal', label: 'Count[d]', fromVar: 'countVal', kind: 'value' },
    { key: 'outputIdx', label: 'Output', fromVar: 'outputIdx' },
  ],
  bucket: [
    { key: 'i', label: 'i', fromVar: 'i' },
    { key: 'bucketIdx', label: 'Bucket', fromVar: 'bucketIdx' },
    { key: 'b', label: 'b', fromVar: 'b' },
    { key: 'j', label: 'j', fromVar: 'j' },
    { key: 'outputCount', label: 'Out', fromVar: 'outputCount' },
  ],
};

const columns = computed<TraceColumn[]>(() => {
  const algo = props.frames[0]?.algorithm ?? 'bubble';
  const base = VAR_COLUMNS[algo] ?? [];
  if (props.frames.length === 0) return base;
  return base.filter((col) => props.frames.some((f) => cellValue(f, col) !== '-'));
});

const totalCols = computed(() => 2 + columns.value.length);

function cellValue(frame: SortFrame, col: TraceColumn): string | number {
  if (col.kind === 'compare') {
    const ci = frame.comparingIndices;
    if (!ci) return '-';
    // counting/radix: comparingIndices không phải cặp bar-bar mà là [barIdx, ô Count]/[barIdx, barIdx]
    if (frame.algorithm === 'counting') return `A[${ci[0]}]→Count[${ci[1]}]`;
    if (frame.algorithm === 'radix') {
      return frame.radixStep === 'distribute'
        ? `A[${ci[0]}]→Hộp[${frame.variables?.digit ?? ci[1]}]`
        : `Hộp→A[${ci[0]}]`;
    }
    return `${ci[0]}↔${ci[1]}`;
  }
  if (col.kind === 'swap') {
    return frame.swappedIndices ? `${frame.swappedIndices[0]}↔${frame.swappedIndices[1]}` : '-';
  }
  if (col.kind === 'pivot') {
    return frame.pivotIndex !== null ? `${frame.pivotIndex}` : '-';
  }
  if (col.kind === 'sorted') {
    return String(frame.sortedIndices.length);
  }
  if (col.fromVar) {
    return frame.variables?.[col.fromVar] ?? '-';
  }
  return '-';
}

function isHighlightedCell(frame: SortFrame, col: TraceColumn): boolean {
  if (col.kind === 'compare') return frame.comparingIndices !== null;
  if (col.kind === 'swap') return frame.swappedIndices !== null;
  if (col.kind === 'pivot') return frame.pivotIndex !== null;
  return false;
}

const activeRowRef = ref<HTMLElement | null>(null);

watch(
  () => props.currentIndex,
  async () => {
    await nextTick();
    activeRowRef.value?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  },
);
</script>
