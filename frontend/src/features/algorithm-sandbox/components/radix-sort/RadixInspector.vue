<template>
  <div class="r-inspector">
    <div class="r-inspector-grid">
      <div class="r-stat">
        <span class="r-stat-lbl">Hàng</span>
        <span class="r-stat-val">{{ digitPlaceLabel }}</span>
      </div>
      <div class="r-stat">
        <span class="r-stat-lbl">Bước</span>
        <span class="r-stat-val">{{ isDistributePhase ? 'Phân Phối' : 'Thu Hoạch' }}</span>
      </div>
      <div class="r-stat">
        <span class="r-stat-lbl">Phần tử</span>
        <span class="r-stat-val">{{ activeElementIdx >= 0 ? '#' + activeElementIdx : '—' }}</span>
      </div>
      <div class="r-stat">
        <span class="r-stat-lbl">Hộp</span>
        <span class="r-stat-val" :style="{ color: activeBucketIdx >= 0 ? bucketColor : 'var(--color-text-muted)' }">
          {{ activeBucketIdx >= 0 ? '[' + activeBucketIdx + ']' : '—' }}
        </span>
      </div>
      <div class="r-stat">
        <span class="r-stat-lbl">Phần tử</span>
        <span class="r-stat-val">{{ frame?.arrayState.length ?? 0 }}</span>
      </div>
      <div class="r-stat">
        <span class="r-stat-lbl">Độ phức tạp</span>
        <span class="r-stat-val r-stat-val--mono">O(n·k)</span>
      </div>
    </div>

    <div class="r-inspector-explain">
      <div class="r-inspector-explain-title"><BaseIcon name="book-open" class="r-explain-ic" /> Giải thích</div>
      <div class="r-inspector-explain-body" v-html="parseEmojiToSvg(currentStepDescription)"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRadixSortVisualizer } from '../../composables/useRadixSortVisualizer';
import { parseEmojiToSvg } from '../../../../utils/emojiParser';
import type { SortFrame } from '../../types/sorting.types';

const props = defineProps<{ frame: SortFrame | null }>();
const {
  digitPlaceLabel,
  isDistributePhase,
  activeElementIdx,
  activeBucketIdx,
  currentStepDescription
} = useRadixSortVisualizer(() => props.frame);

const bucketColor = computed(() => {
  const b = activeBucketIdx.value;
  const colors = ['#eab308','#f97316','#ef4444','#ec4899','#a855f7','#8b5cf6','#6366f1','#3b82f6','#06b6d4','#10b981'];
  return colors[b] || 'var(--color-accent-cyan)';
});
</script>

<style scoped>
.r-inspector {
  flex-shrink: 0;
  margin-top: 10px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  padding: 10px 13px;
}
.r-inspector-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 6px;
}
.r-stat {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.r-stat-lbl {
  font-size: 10px;
  font-family: var(--font-mono);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--color-text-secondary);
}
.r-stat-val {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary);
}
.r-stat-val--mono {
  font-family: var(--font-mono);
  color: var(--color-accent-cyan);
}

.r-inspector-explain {
  margin-top: 8px;
  padding-top: 7px;
  border-top: 1px solid var(--color-border-subtle);
}
.r-inspector-explain-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-secondary);
  margin-bottom: 3px;
}
.r-explain-ic {
  width: 12px;
  height: 12px;
  vertical-align: -1.5px;
  margin-right: 3px;
}
.r-inspector-explain-body {
  font-size: 12px;
  color: var(--color-text-primary);
  line-height: 1.5;
  opacity: .9;
}
</style>