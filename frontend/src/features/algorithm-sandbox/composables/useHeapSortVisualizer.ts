import { computed, ref } from 'vue';
import type { SortFrame } from '../types/sorting.types';

export function useHeapSortVisualizer(frame: () => SortFrame | null) {
  const hoveredNodeIdx = ref<number | null>(null);

  const n = computed(() => frame()?.arrayStateWithIds?.length ?? frame()?.arrayState.length ?? 0);

  const currentHeapSize = computed(() => {
    if (!frame()) return n.value;
    return frame()!.heapSize ?? frame()!.arrayState.length;
  });

  const currentPhase = computed(() => {
    if (!frame()) return 'BUILD';
    const f = frame()!;
    const total = f.arrayState.length;
    const heapSize = f.heapSize ?? total;
    // SV-019: frame hoàn thành phải hiển thị phase rõ ràng (DONE) — không bị
    // xét nhầm thành 'SORT' dù heapSize không còn nhỏ hơn tổng số phần tử
    if (/hoàn thành|hoàn tất/i.test(f.description)) return 'DONE';
    return heapSize < total ? 'SORT' : 'BUILD';
  });

  const currentStepDescription = computed(() => {
    if (!frame()) return 'Khởi tạo Heap Sort';
    return frame()!.description;
  });

  // Phần tử đã "yên vị": nằm ngoài heap (heapSize) HOẶC đã được đánh dấu sorted
  // (frame hoàn thành heapSize = n nhưng sortedIndices đầy đủ — SV-019)
  function isSortedNode(idx: number): boolean {
    if (idx >= currentHeapSize.value) return true;
    return (frame()?.sortedIndices?.includes(idx) ?? false);
  }

  const maxDepth = computed(() => Math.ceil(Math.log2((n.value || 1) + 1)));

  const placeholderIndices = computed(() => {
    const fullTreeSize = Math.pow(2, maxDepth.value) - 1;
    const list: number[] = [];
    for (let i = n.value; i < fullTreeSize; i++) {
      list.push(i);
    }
    return list;
  });

  function getXPct(idx: number): number {
    const depth = Math.floor(Math.log2(idx + 1));
    const rowLen = Math.pow(2, depth);
    const posInRow = idx - (rowLen - 1);
    return ((posInRow + 0.5) / rowLen) * 100;
  }

  function getYPct(idx: number): number {
    const depth = Math.floor(Math.log2(idx + 1));
    const totalD = maxDepth.value;
    if (totalD <= 1) return 50;
    return 12 + (depth / (totalD - 1)) * 76;
  }

  function getParentIndex(idx: number): number {
    // Root (idx 0) không có cha — clamp về 0 để luôn trả chỉ số hợp lệ [0, n-1]
    return Math.max(0, Math.floor((idx - 1) / 2));
  }

  function isNodeInHeap(idx: number): boolean {
    return idx < currentHeapSize.value;
  }

  function getNodeClass(idx: number): string {
    if (!frame()) return '';
    const ci = frame()!.comparingIndices;
    const si = frame()!.swappedIndices;

    // SV-020: ưu tiên ci/si TRƯỚC node-violation — nếu không node đang so sánh
    // (ci/si khác null) bị lớp violation đè màu, che mất highlight node-comparing
    if (ci?.includes(idx)) {
      return 'node-comparing scale-105 z-20';
    }

    if (si?.includes(idx)) {
      return 'node-swapped scale-105 z-20';
    }

    if (idx > 0) {
      const pIdx = getParentIndex(idx);
      const val = frame()!.arrayState[idx];
      const pVal = frame()!.arrayState[pIdx];

      if (idx < currentHeapSize.value && pVal < val && currentPhase.value === 'BUILD') {
        return 'node-violation animate-pulse';
      }
    }

    if (isSortedNode(idx)) {
      return 'node-sorted opacity-60';
    }

    return 'node-active';
  }

  function getLineStroke(idx: number): string {
    if (!frame()) return 'rgba(61, 153, 112, 0.2)';
    const ci = frame()!.comparingIndices;
    const pIdx = getParentIndex(idx);

    if (ci?.includes(idx) && ci?.includes(pIdx)) {
      return 'var(--color-accent-yellow)';
    }

    if (idx < currentHeapSize.value) {
      const val = frame()!.arrayState[idx];
      const pVal = frame()!.arrayState[pIdx];
      if (pVal < val && currentPhase.value === 'BUILD') {
        return 'var(--color-accent-red)';
      }
    }

    if (isSortedNode(idx)) {
      return 'rgba(16, 185, 129, 0.08)';
    }

    return 'rgba(61, 153, 112, 0.35)';
  }

  function getLineWidth(idx: number): number {
    if (!frame()) return 1.5;
    const ci = frame()!.comparingIndices;
    const pIdx = getParentIndex(idx);
    if (ci?.includes(idx) && ci?.includes(pIdx)) return 3;
    return 2;
  }

  function getArrayItemClass(idx: number): string {
    if (!frame()) return '';
    const ci = frame()!.comparingIndices;
    const si = frame()!.swappedIndices;

    if (ci?.includes(idx)) {
      return 'item-comparing scale-102 z-10';
    }
    if (si?.includes(idx)) {
      return 'item-swapped scale-102 z-10';
    }
    if (isSortedNode(idx)) {
      return 'item-sorted opacity-60';
    }
    return 'item-active';
  }

  function getLeftChildLabel(idx: number): string {
    const left = idx * 2 + 1;
    if (left >= currentHeapSize.value) return 'Không có';
    return `Index ${left} (Value: ${frame()?.arrayState[left] ?? '—'})`;
  }

  function getRightChildLabel(idx: number): string {
    const right = idx * 2 + 2;
    if (right >= currentHeapSize.value) return 'Không có';
    return `Index ${right} (Value: ${frame()?.arrayState[right] ?? '—'})`;
  }

  const nodeSize = computed(() => {
    if (n.value <= 8) return '52px';
    if (n.value <= 11) return '44px';
    return '38px';
  });

  const nodeFontSize = computed(() => {
    if (n.value <= 8) return '13px';
    if (n.value <= 11) return '11.5px';
    return '10.5px';
  });

  const itemSize = computed(() => {
    if (n.value <= 6) return '88px';
    if (n.value <= 10) return '72px';
    return '56px';
  });

  const itemHeight = computed(() => {
    if (n.value <= 6) return '54px';
    if (n.value <= 10) return '48px';
    return '40px';
  });

  const itemGap = computed(() => {
    if (n.value <= 6) return '18px';
    if (n.value <= 10) return '12px';
    return '6px';
  });

  const fontSize = computed(() => {
    if (n.value <= 6) return '14px';
    if (n.value <= 10) return '12px';
    return '10.5px';
  });

  const childIndices = computed(() => {
    const list: number[] = [];
    for (let i = 1; i < n.value; i++) {
      list.push(i);
    }
    return list;
  });

  return {
    hoveredNodeIdx,
    n,
    currentHeapSize,
    currentPhase,
    currentStepDescription,
    maxDepth,
    placeholderIndices,
    childIndices,
    getXPct,
    getYPct,
    getParentIndex,
    isNodeInHeap,
    getNodeClass,
    getLineStroke,
    getLineWidth,
    getArrayItemClass,
    getLeftChildLabel,
    getRightChildLabel,
    nodeSize,
    nodeFontSize,
    itemSize,
    itemHeight,
    itemGap,
    fontSize,
  };
}