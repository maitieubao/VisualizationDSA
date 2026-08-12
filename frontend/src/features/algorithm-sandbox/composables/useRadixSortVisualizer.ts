import { computed } from 'vue';
import type { SortFrame } from '../types/sorting.types';

export function useRadixSortVisualizer(frame: () => SortFrame | null) {
  const displayItems = computed(() => {
    const ids = frame()?.arrayStateWithIds;
    if (!ids || ids.length === 0) {
      return (frame()?.arrayState ?? []).map((value, id) => ({ id, value, isPlaceholder: false }));
    }

    if (frame()?.radixStep === 'collect' && !(frame()?.description ?? '').includes('hoàn thành')) {
      const activeIdx = activeElementIdx.value;
      return ids.map((item, idx) => {
        if (idx <= activeIdx) {
          return { ...item, isPlaceholder: false };
        } else {
          return { ...item, isPlaceholder: true };
        }
      });
    }

    if (frame()?.radixStep === 'distribute') {
      const activeIdx = activeElementIdx.value;
      if (activeIdx >= 0) {
        return ids.map((item, idx) => ({
          ...item,
          isPlaceholder: idx < activeIdx,
        }));
      }
    }

    return ids.map(item => ({ ...item, isPlaceholder: false }));
  });

  const n = computed(() => Math.max(displayItems.value.length, 1));

  const cellH = computed(() => n.value <= 8 ? '72px' : n.value <= 12 ? '60px' : '50px');
  const arrGap = computed(() => n.value <= 8 ? '8px' : '5px');
  const cellFs = computed(() => n.value <= 8 ? '14px' : '12px');

  // SV-008 (EC-022): min 1 pass thay Math.min(...values) — mảng lớn không RangeError
  const countOffset = computed(() => {
    const values = frame()?.arrayState;
    if (!values || values.length === 0) return 0;
    let min = values[0];
    for (let i = 1; i < values.length; i++) {
      if (values[i] < min) min = values[i];
    }
    return min < 0 ? -min : 0;
  });

  const isDistributePhase = computed(() => frame()?.radixStep !== 'collect');
  const activeDigitPlace = computed(() => frame()?.activeDigitPlace ?? 1);

  const digitPlaceLabel = computed(() => {
    const e = activeDigitPlace.value;
    return e === 1 ? 'Hàng đơn vị (1s)' : e === 10 ? 'Hàng chục (10s)' : e === 100 ? 'Hàng trăm (100s)' : `×${e}`;
  });

  const currentStepDescription = computed(() => frame()?.description ?? 'Khởi tạo Radix Sort');

  const miniStepExplanation = computed(() => {
    if (!frame()) return 'Chuẩn bị dữ liệu mảng ban đầu.';
    const f = frame()!;
    const { activeDigitPlace: exp, radixStep, comparingIndices, arrayState } = f;
    const place = exp ?? 1;
    if (comparingIndices && comparingIndices.length > 0) {
      const idx = comparingIndices[0];
      const val = arrayState[idx];
      const digit = Math.floor((val + countOffset.value) / place) % 10;
      const ps = place === 1 ? 'đơn vị' : place === 10 ? 'chục' : 'trăm';
      return radixStep === 'distribute'
        ? `[PHÂN PHỐI] Xét arr[${idx}] = ${val}. Chữ số hàng ${ps} = ${digit}. → Hộp [${digit}].`
        : `[THU THẬP] Rút ${val} từ đáy Hộp [${digit}] (FIFO) → arr[${idx}].`;
    }
    if (f.description.includes('✅')) return 'Hoán tất! Mảng đã sắp xếp theo tất cả hàng chữ số.';
    return f.description;
  });

  const comparingIndices = computed(() => frame()?.comparingIndices ?? null);

  const activeElementIdx = computed(() => {
    const ci = comparingIndices.value;
    return ci && ci.length > 0 ? ci[0] : -1;
  });

  const activeBucketIdx = computed(() => {
    if (!frame() || activeElementIdx.value === -1) return -1;
    const val = frame()!.arrayState[activeElementIdx.value];
    return Math.floor((val + countOffset.value) / activeDigitPlace.value) % 10;
  });

  const hasActiveConnection = computed(() =>
    activeElementIdx.value !== -1 && activeBucketIdx.value !== -1
  );

  const connStyle = computed(() => {
    if (!hasActiveConnection.value) return { display: 'none' };
    return {
      background: isDistributePhase.value ? 'var(--color-accent-yellow)' : 'var(--color-accent-green)',
      boxShadow: isDistributePhase.value ? '0 0 8px var(--color-accent-yellow-glow)' : '0 0 8px var(--color-accent-green-glow)',
    };
  });

  function bucketItems(d: number): Array<{ id: number; value: number }> {
    const wids = frame()?.radixBucketsWithIds?.[d];
    if (wids) return wids;
    return (frame()?.radixBuckets?.[d] ?? []).map((value, idx) => ({ id: idx * 100 + d, value }));
  }
  function isBucketActive(d: number) { return activeBucketIdx.value === d; }

  function cellClass(idx: number): string {
    if (!frame()) return 'r-cell--idle';
    const { comparingIndices: ci, radixStep } = frame()!;
    if (ci?.includes(idx)) return radixStep === 'distribute' ? 'r-cell--dist' : 'r-cell--coll';
    return 'r-cell--idle';
  }

  function bucketItemClass(d: number, item: { id: number; value: number }): string {
    if (!isDistributePhase.value && isBucketActive(d)) {
      const items = bucketItems(d);
      if (items.length > 0 && items[0].id === item.id) return 'r-bitem--coll';
    }
    if (isBucketActive(d)) return 'r-bitem--active';
    return 'r-bitem--idle';
  }

  function activeDigit(val: number): string {
    return String(Math.floor((val + countOffset.value) / activeDigitPlace.value) % 10);
  }
  function prefixDigits(val: number): string {
    const s = String(val + countOffset.value);
    const pos = s.length - Math.log10(activeDigitPlace.value) - 1;
    return pos > 0 ? s.substring(0, pos) : '';
  }
  function suffixDigits(val: number): string {
    const s = String(val + countOffset.value);
    const pos = s.length - Math.log10(activeDigitPlace.value) - 1;
    return pos + 1 < s.length ? s.substring(pos + 1) : '';
  }

  return {
    displayItems,
    n,
    cellH,
    arrGap,
    cellFs,
    isDistributePhase,
    activeDigitPlace,
    digitPlaceLabel,
    currentStepDescription,
    miniStepExplanation,
    comparingIndices,
    activeElementIdx,
    activeBucketIdx,
    hasActiveConnection,
    connStyle,
    bucketItems,
    isBucketActive,
    cellClass,
    bucketItemClass,
    activeDigit,
    prefixDigits,
    suffixDigits,
  };
}