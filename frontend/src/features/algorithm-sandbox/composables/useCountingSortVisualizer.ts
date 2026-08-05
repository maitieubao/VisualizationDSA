import { computed } from 'vue';
import type { SortFrame } from '../types/sorting.types';

export interface CountingItem {
  id: number;
  value: number;
}

export interface StableColor {
  border: string;
  background: string;
  text: string;
  glow: string;
}

const stableColors: StableColor[] = [
  {
    border: 'var(--color-accent-primary)',
    background: 'var(--color-accent-primary-dim)',
    text: 'var(--color-accent-primary-light)',
    glow: 'var(--color-accent-primary-glow)',
  },
  {
    border: 'var(--color-accent-yellow)',
    background: 'var(--color-accent-yellow-dim)',
    text: 'var(--color-accent-yellow-light)',
    glow: 'var(--color-accent-yellow-glow)',
  },
  {
    border: 'var(--color-accent-red)',
    background: 'var(--color-accent-red-dim)',
    text: 'var(--color-accent-red-light)',
    glow: 'var(--color-accent-red-glow)',
  },
  {
    border: 'var(--color-accent-green)',
    background: 'var(--color-accent-green-dim)',
    text: 'var(--color-accent-green-light)',
    glow: 'var(--color-accent-green-glow)',
  },
];

export function useCountingSortVisualizer(frame: () => SortFrame | null) {
  const currentFrame = computed(() => frame());
  const phase = computed(() => currentFrame.value?.countingStep ?? 'count');
  const activePlace = computed(() => currentFrame.value?.activeDigitPlace ?? 1);
  const inputValues = computed(() => currentFrame.value?.inputArray ?? currentFrame.value?.arrayState ?? []);
  const inputItems = computed<CountingItem[]>(() => {
    const ids = currentFrame.value?.inputArrayWithIds;
    if (ids && ids.length === inputValues.value.length) return ids;
    return inputValues.value.map((value, id) => ({ id, value }));
  });
  const countValues = computed(() => {
    const values = currentFrame.value?.countArray ?? [];
    return Array.from({ length: 10 }, (_, index) => values[index] ?? 0);
  });
  const outputItems = computed(() => {
    const output = currentFrame.value?.outputArrayWithIds ?? [];
    return Array.from({ length: inputValues.value.length }, (_, index) => output[index] ?? null);
  });
  const activePair = computed(() => currentFrame.value?.comparingIndices ?? null);
  const activeInputIndex = computed(() => activePair.value?.[0] ?? -1);
  const activeSecondaryIndex = computed(() => activePair.value?.[1] ?? -1);
  const countOffset = computed(() => {
    const values = inputValues.value;
    if (values.length === 0) return 0;
    const min = Math.min(...values);
    return min < 0 ? -min : 0;
  });
  const maxMagnitude = computed(() => {
    const values = inputValues.value;
    return Math.max(1, ...values.map(value => Math.abs(value)));
  });
  const placeLabel = computed(() => {
    if (activePlace.value === 1) return 'đơn vị';
    if (activePlace.value === 10) return 'chục';
    if (activePlace.value === 100) return 'trăm';
    return `10^${Math.round(Math.log10(activePlace.value))}`;
  });
  const explanation = computed(() => currentFrame.value?.description ?? 'Chọn dữ liệu và bắt đầu phát hoạt ảnh.');
  const isComplete = computed(() => currentFrame.value?.sortedIndices?.length === inputValues.value.length && inputValues.value.length > 0);

  function digitOf(value: number): number {
    return Math.floor((value + countOffset.value) / activePlace.value) % 10;
  }

  function digitParts(value: number): { prefix: string; digit: string; suffix: string } {
    const shifted = value + countOffset.value;
    const place = activePlace.value;
    const prefix = Math.floor(shifted / (place * 10));
    const suffix = shifted % place;
    const suffixLength = Math.max(0, String(place).length - 1);
    return {
      prefix: `${value < 0 ? '-' : ''}${prefix > 0 ? prefix : ''}`,
      digit: String(digitOf(value)),
      suffix: suffixLength > 0 ? String(suffix).padStart(suffixLength, '0') : '',
    };
  }

  function barHeightPct(value: number): number {
    return 24 + (Math.abs(value) / maxMagnitude.value) * 64;
  }

  function stableColor(id: number): StableColor {
    return stableColors[Math.abs(id) % stableColors.length];
  }

  function isInputActive(index: number): boolean {
    return (phase.value === 'count' || phase.value === 'output') && activeInputIndex.value === index;
  }

  function isCountHighlighted(index: number): boolean {
    if (!activePair.value) return false;
    if (phase.value === 'count') return activeSecondaryIndex.value === index;
    if (phase.value === 'output') return digitOf(inputValues.value[activeInputIndex.value] ?? 0) === index;
    return phase.value === 'accumulate' && (index === activePair.value[0] || index === activePair.value[1]);
  }

  function isOutputActive(index: number): boolean {
    return phase.value === 'output' && activeSecondaryIndex.value === index;
  }

  function phaseClass(name: 'count' | 'accumulate' | 'output'): string {
    if (phase.value === name) return `count-phase--${name}`;
    if ((name === 'count' && ['accumulate', 'output'].includes(phase.value)) || (name === 'accumulate' && phase.value === 'output')) return 'count-phase--complete';
    return 'count-phase--idle';
  }

  return {
    currentFrame,
    phase,
    activePlace,
    inputValues,
    inputItems,
    countValues,
    outputItems,
    activePair,
    activeInputIndex,
    activeSecondaryIndex,
    placeLabel,
    explanation,
    isComplete,
    digitOf,
    digitParts,
    barHeightPct,
    stableColor,
    isInputActive,
    isCountHighlighted,
    isOutputActive,
    phaseClass,
  };
}
