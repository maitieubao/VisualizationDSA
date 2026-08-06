<template>
  <div class="r-array-wrap">
    <transition-group
      name="sort-list"
      tag="div"
      class="r-array"
      :style="{ gridTemplateColumns: `repeat(${n},1fr)`, gap: arrGap }"
    >
      <div
        v-for="(item, idx) in displayItems"
        :key="item.id"
        class="r-cell"
        :class="[cellClass(idx), item.isPlaceholder ? 'r-cell--placeholder' : '']"
        :style="{ height: cellH, fontSize: cellFs }"
      >
        <template v-if="!item.isPlaceholder">
          <span class="r-cell-val">
            <span class="r-dim">{{ prefixDigits(item.value) }}</span>
            <span class="r-hot" :class="comparingIndices?.includes(idx) ? 'r-hot--on' : ''">
              {{ activeDigit(item.value) }}
            </span>
            <span class="r-dim">{{ suffixDigits(item.value) }}</span>
          </span>
          <span v-if="n <= 12" class="r-idx">[{{ idx }}]</span>
        </template>
        <template v-else>
          <span class="r-cell-placeholder-dash"></span>
          <span v-if="n <= 12" class="r-idx">[{{ idx }}]</span>
        </template>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useRadixSortVisualizer } from '../../composables/useRadixSortVisualizer';
import type { SortFrame } from '../../types/sorting.types';

const props = defineProps<{ frame: SortFrame | null }>();
const {
  displayItems,
  n,
  cellH,
  arrGap,
  cellFs,
  comparingIndices,
  cellClass,
  activeDigit,
  prefixDigits,
  suffixDigits
} = useRadixSortVisualizer(() => props.frame);
</script>

<style scoped>
.r-array-wrap {
  flex-shrink: 0;
  width: 100%;
  margin-bottom: 0;
}
.r-array {
  display: grid;
  width: 100%;
  align-items: center;
}
.r-cell {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  border-radius: var(--radius-lg); border: 1px solid; font-weight: 700;
  transition: all .35s cubic-bezier(.25,.8,.25,1);
  box-shadow: var(--shadow-sm);
  width: 100%;
  position: relative; user-select: none;
}
.r-cell--idle {
  border-color: color-mix(in srgb, var(--color-accent-green) 40%, transparent);
  background: var(--color-accent-cyan-dim);
  color: var(--color-accent-cyan);
}
.r-cell--dist {
  border-color: var(--color-accent-yellow);
  background: var(--color-accent-yellow-dim);
  color: var(--color-accent-yellow);
  box-shadow: 0 0 18px var(--color-accent-yellow-glow);
  transform: scale(1.04) translateY(-2px);
  z-index: 2;
}
.r-cell--coll {
  border-color: var(--color-accent-green);
  background: var(--color-accent-green-dim);
  color: var(--color-accent-green);
  box-shadow: 0 0 18px var(--color-accent-green-glow);
  transform: scale(1.04) translateY(-2px);
  z-index: 2;
}
.r-cell--placeholder {
  border-style: dashed !important;
  border-color: var(--color-border-subtle) !important;
  background: color-mix(in srgb, var(--color-bg-surface) 10%, transparent) !important;
  color: var(--color-text-muted) !important;
  box-shadow: none !important;
  transform: none !important;
  opacity: 0.3;
}

.r-cell-placeholder-dash {
  width: 12px;
  height: 2px;
  background: var(--color-border-subtle);
  border-radius: 1px;
}

.r-cell-val { display: inline-flex; align-items: baseline; }
.r-dim      { opacity: .2; }
.r-hot      { font-weight: 900; color: var(--color-accent-cyan); transition: all .3s; display: inline-block; }
.r-hot--on  { color: var(--color-accent-yellow); transform: scale(1.2); filter: drop-shadow(0 0 8px var(--color-accent-yellow-glow)); text-decoration: underline 2px; }
.r-idx      { font-family: var(--font-mono); opacity: .35; font-size: 9.5px; margin-top: 2px; color: var(--color-text-muted); }

.sort-list-move         { transition: transform .4s cubic-bezier(.25,.8,.25,1); }
.sort-list-enter-from   { opacity: 0; transform: translateY(-8px) scale(.92); }
.sort-list-leave-to     { opacity: 0; transform: translateY(8px) scale(.92); }
.sort-list-enter-active,
.sort-list-leave-active { transition: all .3s ease; }
.sort-list-leave-active { position: absolute; }
</style>