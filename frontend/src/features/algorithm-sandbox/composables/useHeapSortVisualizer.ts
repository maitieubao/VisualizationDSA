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
    const total = frame()!.arrayState.length;
    const heapSize = frame()!.heapSize ?? total;
    return heapSize < total ? 'SORT' : 'BUILD';
  });

  const currentStepDescription = computed(() => {
    if (!frame()) return 'Khởi tạo Heap Sort';
    return frame()!.description;
  });

  const miniStepDescription = computed(() => {
    if (!frame()) return 'Chuẩn bị dữ liệu mảng ban đầu.';
    const desc = frame()!.description.toLowerCase();

    if (desc.includes('khởi tạo')) {
      return 'Khởi động giải thuật Heap Sort. Cây nhị phân hoàn chỉnh được xây dựng trực tiếp từ các chỉ số mảng vật lý: parent = i, left = 2i + 1, right = 2i + 2.';
    }
    if (desc.includes('vun đống ban đầu') || desc.includes('xây dựng max-heap')) {
      return 'Giai đoạn Build Heap: Duyệt từ node không phải lá cuối cùng (index = floor(n/2)-1) ngược lên root để biến mảng lộn xộn thành cấu trúc Max-Heap.';
    }
    if (desc.includes('vun đống lại') || desc.includes('sift down')) {
      return 'Đang vun đống (Sift Down / Heapify): So sánh node cha (vàng) với các con, phát hiện vi phạm thuộc tính (đỏ) và hoán đổi để đưa giá trị lớn lên.';
    }
    if (desc.includes('đưa phần tử lớn nhất') || desc.includes('trích xuất')) {
      return 'Giai đoạn Sort: Rút phần tử lớn nhất ở root (index 0) đưa về cuối mảng để chốt vị trí đã sắp xếp (emerald), giảm kích thước Heap và vun đống lại.';
    }
    if (desc.includes('heap sort hoàn thành')) {
      return 'Thuật toán hoàn tất! Toàn bộ mảng đã được vun đống và sắp xếp tăng dần thành công.';
    }
    if (desc.includes('max-heap hoàn thành')) {
      return 'Giai đoạn Build Heap hoàn tất: root chứa giá trị lớn nhất toàn mảng, sẵn sàng bước vào giai đoạn trích xuất.';
    }
    return frame()!.description;
  });

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
    return Math.floor((idx - 1) / 2);
  }

  function isNodeInHeap(idx: number): boolean {
    return idx < currentHeapSize.value;
  }

  function getNodeClass(idx: number): string {
    if (!frame()) return '';
    const ci = frame()!.comparingIndices;
    const si = frame()!.swappedIndices;

    if (idx > 0) {
      const pIdx = getParentIndex(idx);
      const val = frame()!.arrayState[idx];
      const pVal = frame()!.arrayState[pIdx];

      if (idx < currentHeapSize.value && pVal < val && currentPhase.value === 'BUILD') {
        return 'node-violation animate-pulse';
      }
    }

    if (ci?.includes(idx)) {
      return 'node-comparing scale-105 z-20';
    }

    if (si?.includes(idx)) {
      return 'node-swapped scale-105 z-20';
    }

    if (idx >= currentHeapSize.value) {
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

    if (idx >= currentHeapSize.value) {
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
    if (idx >= currentHeapSize.value) {
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
    miniStepDescription,
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