import { computed } from 'vue';
import type { SortFrame } from '../types/sorting.types';

export interface BucketItem {
  id: number;
  value: number;
}

const palette = [
  ['var(--color-accent-primary)', 'var(--color-accent-primary-dim)', 'var(--color-accent-primary-light)', 'var(--color-accent-primary-glow)'],
  ['var(--color-accent-yellow)', 'var(--color-accent-yellow-dim)', 'var(--color-accent-yellow-light)', 'var(--color-accent-yellow-glow)'],
  ['var(--color-accent-red)', 'var(--color-accent-red-dim)', 'var(--color-accent-red-light)', 'var(--color-accent-red-glow)'],
  ['var(--color-accent-green)', 'var(--color-accent-green-dim)', 'var(--color-accent-green-light)', 'var(--color-accent-green-glow)'],
] as const;

export function useBucketSortVisualizer(frame: () => SortFrame | null) {
  const currentFrame = computed(() => frame());
  const phase = computed(() => currentFrame.value?.bucketStep ?? 'distribute');
  const inputItems = computed<BucketItem[]>(() => {
    const source = currentFrame.value?.inputArrayWithIds ?? currentFrame.value?.arrayStateWithIds;
    return source ? source.map(item => ({ ...item })) : (currentFrame.value?.arrayState ?? []).map((value, id) => ({ id, value }));
  });
  const buckets = computed<BucketItem[][]>(() => {
    const source = currentFrame.value?.bucketSortBucketsWithIds;
    return Array.from({ length: 4 }, (_, index) => (source?.[index] ?? []).map(item => ({ ...item })));
  });
  const outputItems = computed<Array<BucketItem | null>>(() => {
    const source = currentFrame.value?.bucketSortOutputWithIds ?? [];
    return Array.from({ length: inputItems.value.length }, (_, index) => source[index] ? { ...source[index]! } : null);
  });
  const activeBucket = computed(() => currentFrame.value?.bucketSortActiveIdx ?? -1);
  const activePair = computed(() => currentFrame.value?.bucketSortComparingBucketIndices ?? null);
  const activeInputIndex = computed(() => currentFrame.value?.comparingIndices?.[0] ?? -1);
  const activeOutputIndex = computed(() => currentFrame.value?.comparingIndices?.[0] ?? -1);
  const rangeLabels = computed(() => currentFrame.value?.bucketRangeLabels ?? ['Bucket 0', 'Bucket 1', 'Bucket 2', 'Bucket 3']);
  // SV-008 (EC-022): max 1 pass thay Math.max(1, ...spread) — mảng lớn không RangeError
  const maxMagnitude = computed(() => {
    let max = 1;
    for (const item of inputItems.value) {
      const abs = Math.abs(item.value);
      if (abs > max) max = abs;
    }
    return max;
  });
  const explanation = computed(() => currentFrame.value?.description ?? 'Chọn dữ liệu và bắt đầu Bucket Sort.');
  const isComplete = computed(() => currentFrame.value?.sortedIndices.length === inputItems.value.length && inputItems.value.length > 0);

  function stableColor(id: number) {
    const colors = palette[Math.abs(id) % palette.length];
    return { border: colors[0], background: colors[1], text: colors[2], glow: colors[3] };
  }

  function barHeightPct(value: number): number {
    return 24 + (Math.abs(value) / maxMagnitude.value) * 64;
  }

  function phaseClass(name: 'distribute' | 'sort' | 'collect') {
    if (phase.value === name) return `bucket-phase--${name}`;
    const order = ['distribute', 'sort', 'collect'];
    return order.indexOf(name) < order.indexOf(phase.value) ? 'bucket-phase--complete' : 'bucket-phase--idle';
  }

  function isInputActive(index: number) {
    return phase.value === 'distribute' && activeInputIndex.value === index;
  }

  function isBucketActive(index: number) {
    return activeBucket.value === index;
  }

  function isBucketItemActive(bucketIndex: number, itemIndex: number) {
    return phase.value === 'sort' && activeBucket.value === bucketIndex && activePair.value?.includes(itemIndex) === true;
  }

  function isOutputActive(index: number) {
    return phase.value === 'collect' && activeOutputIndex.value === index;
  }

  function bucketStatus(index: number) {
    if (activeBucket.value === index) return phase.value === 'collect' ? 'LẤY' : phase.value === 'sort' ? 'SORT' : 'NHẬN';
    if (activeBucket.value >= 0 && index < activeBucket.value) return phase.value === 'collect' ? 'RỖNG' : 'XONG';
    return 'CHỜ';
  }

  return {
    currentFrame,
    phase,
    inputItems,
    buckets,
    outputItems,
    activeBucket,
    activePair,
    activeInputIndex,
    activeOutputIndex,
    rangeLabels,
    explanation,
    isComplete,
    stableColor,
    barHeightPct,
    phaseClass,
    isInputActive,
    isBucketActive,
    isBucketItemActive,
    isOutputActive,
    bucketStatus,
  };
}
