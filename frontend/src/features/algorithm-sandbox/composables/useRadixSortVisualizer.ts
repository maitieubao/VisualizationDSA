import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import type { SortFrame } from '../types/sorting.types';

export function useRadixSortVisualizer(frame: () => SortFrame | null) {
  const displayItems = computed(() => {
    const ids = frame()?.arrayStateWithIds;
    if (!ids || ids.length === 0) {
      return (frame()?.arrayState ?? []).map((value, id) => ({ id, value, isPlaceholder: false }));
    }
    
    if (frame()?.radixStep === 'collect' && !frame()?.description.includes('hoàn thành')) {
      const activeIdx = activeElementIdx.value;
      return ids.map((item, idx) => {
        if (idx <= activeIdx) {
          return { ...item, isPlaceholder: false };
        } else {
          return { ...item, isPlaceholder: true };
        }
      });
    }
    
    return ids.map(item => ({ ...item, isPlaceholder: false }));
  });

  const n = computed(() => Math.max(displayItems.value.length, 1));

  // ── Sizing (responsive) ───────────────────────────────────────────────────────
  const cellH  = computed(() => n.value <= 8 ? '72px' : n.value <= 12 ? '60px' : '50px');
  const arrGap = computed(() => n.value <= 8 ? '8px'  : '5px');
  const cellFs = computed(() => n.value <= 8 ? '14px' : '12px');

  // ── Phase ─────────────────────────────────────────────────────────────────────
  const isDistributePhase = computed(() => frame()?.radixStep !== 'collect');
  const activeDigitPlace  = computed(() => frame()?.activeDigitPlace ?? 1);

  const digitPlaceLabel = computed(() => {
    const e = activeDigitPlace.value;
    return e === 1 ? 'Hàng đơn vị (1s)' : e === 10 ? 'Hàng chục (10s)' : e === 100 ? 'Hàng trăm (100s)' : `×${e}`;
  });

  // ── Text ──────────────────────────────────────────────────────────────────────
  const currentStepDescription = computed(() => frame()?.description ?? 'Khởi tạo Radix Sort');

  const miniStepExplanation = computed(() => {
    if (!frame()) return 'Chuẩn bị dữ liệu mảng ban đầu.';
    const f = frame()!;
    const { activeDigitPlace: exp, radixStep, comparingIndices, arrayState } = f;
    const place = exp ?? 1;
    if (comparingIndices && comparingIndices.length > 0) {
      const idx   = comparingIndices[0];
      const val   = arrayState[idx];
      const digit = Math.floor(val / place) % 10;
      const ps    = place === 1 ? 'đơn vị' : place === 10 ? 'chục' : 'trăm';
      return radixStep === 'distribute'
        ? `[PHÂN PHỐI] Xét arr[${idx}] = ${val}. Chữ số hàng ${ps} = ${digit}. → Hộp [${digit}].`
        : `[THU THẬP] Rút ${val} từ đáy Hộp [${digit}] (FIFO) → arr[${idx}].`;
    }
    if (f.description.includes('✅')) return 'Hoàn tất! Mảng đã sắp xếp theo tất cả hàng chữ số.';
    return f.description;
  });

  // ── Active tracking ───────────────────────────────────────────────────────────
  const comparingIndices = computed(() => frame()?.comparingIndices ?? null);

  const activeElementIdx = computed(() => {
    const ci = comparingIndices.value;
    return ci && ci.length > 0 ? ci[0] : -1;
  });

  const activeBucketIdx = computed(() => {
    if (!frame() || activeElementIdx.value === -1) return -1;
    const val = frame()!.arrayState[activeElementIdx.value];
    return Math.floor(val / activeDigitPlace.value) % 10;
  });

  const hasActiveConnection = computed(() =>
    activeElementIdx.value !== -1 && activeBucketIdx.value !== -1
  );

  // ── SVG connector path ────────────────────────────────────────────────────────
  const connectionCoords = ref({ x1: 500, x2: 500 });

  const updateCoords = () => {
    if (!hasActiveConnection.value) return;
    nextTick(() => {
      const rootEl = document.querySelector('.radix-root');
      if (!rootEl) return;
      
      const activeCell = rootEl.querySelector('.r-cell--dist, .r-cell--coll');
      const activeBucket = rootEl.querySelector('.r-bucket--active');
      const connector = rootEl.querySelector('.r-connector');
      
      if (activeCell && activeBucket && connector) {
        const cellRect = activeCell.getBoundingClientRect();
        const bucketRect = activeBucket.getBoundingClientRect();
        const connRect = connector.getBoundingClientRect();
        
        const x1 = cellRect.left + cellRect.width / 2 - connRect.left;
        const x2 = bucketRect.left + bucketRect.width / 2 - connRect.left;
        const width = connRect.width || 1;
        
        connectionCoords.value = {
          x1: Math.max(0, Math.min(1000, (x1 / width) * 1000)),
          x2: Math.max(0, Math.min(1000, (x2 / width) * 1000))
        };
      }
    });
  };

  watch(
    () => [frame(), activeElementIdx.value, activeBucketIdx.value, isDistributePhase.value],
    () => {
      updateCoords();
    },
    { deep: true, immediate: true }
  );

  onMounted(() => {
    window.addEventListener('resize', updateCoords);
    setTimeout(updateCoords, 100);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateCoords);
  });

  const connPath = computed(() => {
    if (!hasActiveConnection.value) return '';
    const { x1, x2 } = connectionCoords.value;
    if (isDistributePhase.value) {
      return `M ${x1} 8 L ${x1} 22 C ${x1} 60, ${x2} 40, ${x2} 78 L ${x2} 92`;
    }
    return `M ${x2} 92 L ${x2} 78 C ${x2} 40, ${x1} 60, ${x1} 22 L ${x1} 8`;
  });

  // ── Bucket helpers ────────────────────────────────────────────────────────────
  function bucketItems(d: number): Array<{ id: number; value: number }> {
    const wids = frame()?.radixBucketsWithIds?.[d];
    if (wids) return wids;
    return (frame()?.radixBuckets?.[d] ?? []).map((value, idx) => ({ id: idx * 100 + d, value }));
  }
  function isBucketActive(d: number) { return activeBucketIdx.value === d; }

  // ── Class helpers ─────────────────────────────────────────────────────────────
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

  // ── Digit text helpers ────────────────────────────────────────────────────────
  function activeDigit(val: number): string {
    return String(Math.floor(val / activeDigitPlace.value) % 10);
  }
  function prefixDigits(val: number): string {
    const s = String(val);
    const pos = s.length - Math.log10(activeDigitPlace.value) - 1;
    return pos > 0 ? s.substring(0, pos) : '';
  }
  function suffixDigits(val: number): string {
    const s = String(val);
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
    connPath,
    bucketItems,
    isBucketActive,
    cellClass,
    bucketItemClass,
    activeDigit,
    prefixDigits,
    suffixDigits,
    updateCoords
  };
}
