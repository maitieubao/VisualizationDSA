<template>
  <div class="r-inspector">
    <div class="r-insp-header">
      <span>🔍 Giải thích bước hiện tại</span>
      <span class="r-insp-badge" :class="isDistributePhase ? 'r-ib--dist' : 'r-ib--coll'">
        {{ isDistributePhase ? 'DISTRIBUTE' : 'COLLECT' }}
      </span>
    </div>
    <div class="r-stats">
      <div class="r-stat">
        <span class="r-slbl">Hàng chữ số</span>
        <span class="r-sval r-sval--c">{{ digitPlaceLabel }}</span>
      </div>
      <div class="r-stat">
        <span class="r-slbl">Bước</span>
        <span class="r-sval r-sval--w">{{ frame?.stepIndex ?? 0 }}</span>
      </div>
      <div class="r-stat">
        <span class="r-slbl">Phần tử xét</span>
        <span class="r-sval r-sval--y">
          {{ comparingIndices?.length
            ? `arr[${comparingIndices[0]}] = ${frame?.arrayState[comparingIndices[0]] ?? '—'}`
            : '—' }}
        </span>
      </div>
      <div class="r-stat">
        <span class="r-slbl">Hộp đích</span>
        <span class="r-sval r-sval--g">{{ activeBucketIdx >= 0 ? `[${activeBucketIdx}]` : '—' }}</span>
      </div>
    </div>
    <div class="r-notes">
      <p><strong>Non-comparison:</strong> Sắp xếp theo vị trí chữ số, không so sánh cặp khóa.</p>
      <p><strong>FIFO Stability:</strong> Phần tử dưới đáy hộp được rút trước → tính ổn định.</p>
      <p><strong>Độ phức tạp:</strong> O(d·(n+k)), d = số chữ số, k = 10.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRadixSortVisualizer } from '@/features/core-learning/algorithm-sandbox/composables/useRadixSortVisualizer';
import type { SortFrame } from '@/features/core-learning/algorithm-sandbox/types/sorting.types';

const props = defineProps<{ frame: SortFrame | null }>();
const {
  isDistributePhase,
  digitPlaceLabel,
  comparingIndices,
  activeBucketIdx
} = useRadixSortVisualizer(() => props.frame);
</script>

<style scoped>
.r-inspector {
  flex: 1;
  min-height: 0;
  background: color-mix(in srgb, var(--color-bg-secondary) 65%, transparent);
  border: 1px solid var(--color-border-subtle);
  border-radius: 13px;
  padding: 9px 13px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  backdrop-filter: blur(6px);
  overflow: hidden;
}
.r-insp-header {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 13.5px; font-weight: 700; color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 6px;
  flex-shrink: 0;
}
.r-insp-badge {
  font-size: 10.5px; font-family: var(--font-mono); font-weight: 700;
  padding: 2px 7px; border-radius: 999px; border: 1px solid;
}
.r-ib--dist { background: var(--color-accent-yellow-dim); color: var(--color-accent-yellow); border-color: color-mix(in srgb, var(--color-accent-yellow) 30%, transparent); }
.r-ib--coll { background: var(--color-accent-green-dim);  color: var(--color-accent-green); border-color: color-mix(in srgb, var(--color-accent-green) 30%, transparent); }

.r-stats { display: flex; flex-wrap: wrap; gap: 6px; flex-shrink: 0; }
.r-stat  { display: flex; flex-direction: column; gap: 2px; background: color-mix(in srgb, var(--color-bg-primary) 20%, transparent); border: 1px solid var(--color-border-subtle); border-radius: 7px; padding: 7px 11px; min-width: 96px; }
.r-slbl  { font-size: 9.5px; font-family: var(--font-mono); color: var(--color-text-muted); text-transform: uppercase; letter-spacing: .07em; }
.r-sval  { font-size: 14.5px; font-weight: 700; font-family: var(--font-mono); }
.r-sval--c { color: var(--color-accent-cyan); }
.r-sval--w { color: var(--color-text-primary); }
.r-sval--y { color: var(--color-accent-yellow); }
.r-sval--g { color: var(--color-accent-green); }

.r-notes { display: flex; flex-direction: column; gap: 2px; border-top: 1px solid var(--color-border-subtle); padding-top: 6px; flex-shrink: 0; }
.r-notes p { font-size: 12px; color: var(--color-text-secondary); line-height: 1.5; margin: 0; }
.r-notes strong { color: var(--color-text-primary); }
</style>
