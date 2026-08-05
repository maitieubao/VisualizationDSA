<template>
  <div class="bucket-connector"><span></span><strong :class="`bucket-connector--${phase}`" v-html="parseEmojiToSvg(label)"></strong><span></span></div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBucketSortVisualizer } from '../../composables/useBucketSortVisualizer';
import { parseEmojiToSvg } from '../../../../utils/emojiParser';
import type { SortFrame } from '../../types/sorting.types';
const props = defineProps<{ frame: SortFrame | null }>();
const { phase, activeBucket, activeInputIndex, activeOutputIndex, activePair } = useBucketSortVisualizer(() => props.frame);
const label = computed(() => phase.value === 'distribute' ? `A[${activeInputIndex.value}] → Bucket ${activeBucket.value}` : phase.value === 'sort' ? `Bucket ${activeBucket.value}: compare [${activePair.value?.join(', ') ?? '–'}]` : `Bucket ${activeBucket.value} → Output[${activeOutputIndex.value}]`);
</script>

<style scoped>
.bucket-connector { display: flex; align-items: center; gap: 10px; min-height: 28px; }
.bucket-connector span { flex: 1; height: 1px; background: var(--color-border-subtle); }
.bucket-connector strong { max-width: 90%; overflow: hidden; padding: 4px 9px; border: 1px solid var(--color-border-subtle); border-radius: 999px; color: var(--color-text-secondary); background: var(--color-bg-primary); text-overflow: ellipsis; white-space: nowrap; font: 700 10px var(--font-mono); }
.bucket-connector--distribute { color: var(--color-accent-primary-light) !important; border-color: var(--color-accent-primary) !important; }
.bucket-connector--sort { color: var(--color-accent-yellow-light) !important; border-color: var(--color-accent-yellow) !important; }
.bucket-connector--collect { color: var(--color-accent-green-light) !important; border-color: var(--color-accent-green) !important; }
</style>
