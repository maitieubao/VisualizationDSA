import { ref, computed } from 'vue';
import type { SortFrame } from '../types/sorting.types';

export function useHeapSortVisualizer(frame: () => SortFrame | null) {
  const hoveredNodeIdx = ref<number | null>(null);

  const n = computed(() => frame()?.arrayStateWithIds?.length ?? 6);

  // Heap size bounds
  const currentHeapSize = computed(() => {
    if (!frame()) return n.value;
    return frame()!.heapSize ?? frame()!.arrayState.length;
  });

  // Phase determination: BUILD vs SORT
  const currentPhase = computed(() => {
    if (!frame()) return 'BUILD';
    const desc = frame()!.description.toLowerCase();
    if (desc.includes('đưa phần tử lớn nhất') || desc.includes('hoán đổi') || desc.includes('vun đống lại') || desc.includes('hoàn thành')) {
      return 'SORT';
    }
    return 'BUILD';
  });

  // Step descriptions
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
    if (desc.includes('hoàn thành')) {
      return 'Thuật toán hoàn tất! Toàn bộ mảng đã được vun đống và sắp xếp tăng dần thành công.';
    }
    return frame()!.description;
  });

  // ─── Tree geometry (percentage-based so it fits the box) ─────────────
  const maxDepth = computed(() => Math.ceil(Math.log2((n.value || 1) + 1)));

  // Placeholder indices to fill out the complete tree level
  const placeholderIndices = computed(() => {
    const fullTreeSize = Math.pow(2, maxDepth.value) - 1;
    const list: number[] = [];
    for (let i = n.value; i < fullTreeSize; i++) {
      list.push(i);
    }
    return list;
  });

  function getXPct(idx: number): number {
    const depth  = Math.floor(Math.log2(idx + 1));
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

  // Real node style class binding
  function getNodeClass(idx: number): string {
    if (!frame()) return '';
    const ci = frame()!.comparingIndices;
    const si = frame()!.swappedIndices;
    
    // 1. Violation check: parent < child while build/sift phase
    if (idx > 0) {
      const pIdx = getParentIndex(idx);
      const val  = frame()!.arrayState[idx];
      const pVal = frame()!.arrayState[pIdx];
      // Only highlight active heap elements violating max-heap
      if (idx < currentHeapSize.value && pVal < val && currentPhase.value === 'BUILD') {
        return 'node-violation animate-pulse';
      }
    }
    
    // 2. Active comparison highlight (amber/yellow)
    if (ci?.includes(idx)) {
      return 'node-comparing scale-105 z-20';
    }
    
    // 3. Swap transition highlight (rose/red)
    if (si?.includes(idx)) {
      return 'node-swapped scale-105 z-20';
    }
    
    // 4. Sorted area nodes (emerald green)
    if (idx >= currentHeapSize.value) {
      return 'node-sorted opacity-60';
    }
    
    // Default active heap nodes (cyan)
    return 'node-active';
  }
  // Edge line drawing attributes
  function getLineStroke(idx: number): string {
    if (!frame()) return 'color-mix(in srgb, var(--color-accent-cyan) 20%, transparent)';
    const ci = frame()!.comparingIndices;
    const pIdx = getParentIndex(idx);
    
    // 1. Active comparison line (yellow)
    if (ci?.includes(idx) && ci?.includes(pIdx)) {
      return 'var(--color-accent-yellow)';
    }
    
    // 2. Max-Heap violation line (rose)
    if (idx < currentHeapSize.value) {
      const val = frame()!.arrayState[idx];
      const pVal = frame()!.arrayState[pIdx];
      if (pVal < val && currentPhase.value === 'BUILD') {
        return 'var(--color-accent-red)';
      }
    }
    
    // 3. Sorted chốt chót line (dimmer)
    if (idx >= currentHeapSize.value) {
      return 'color-mix(in srgb, var(--color-accent-green) 8%, transparent)';
    }
    
    // 4. Default active heap line (cyan)
    return 'color-mix(in srgb, var(--color-accent-cyan) 35%, transparent)';
  }
  function getLineWidth(idx: number): number {
    if (!frame()) return 1.5;
    const ci = frame()!.comparingIndices;
    const pIdx = getParentIndex(idx);
    if (ci?.includes(idx) && ci?.includes(pIdx)) return 3;
    return 2;
  }
  // Array item class bindings
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
  // Debug label helpers for tooltip
  function getLeftChildLabel(idx: number): string {
    const left = idx * 2 + 1;
    if (left >= n.value) return 'Không có';
    return `Index ${left} (Value: ${frame()?.arrayState[left] ?? '—'})`;
  }

  function getRightChildLabel(idx: number): string {
    const right = idx * 2 + 2;
    if (right >= n.value) return 'Không có';
    return `Index ${right} (Value: ${frame()?.arrayState[right] ?? '—'})`;
  }

  // Responsive layout sizes
  const nodeSize     = computed(() => n.value <= 8 ? '52px' : n.value <= 11 ? '44px' : '38px');
  const nodeFontSize = computed(() => n.value <= 8 ? '13px' : n.value <= 11 ? '11.5px' : '10.5px');
  
  const itemSize     = computed(() => n.value <= 6 ? '88px' : n.value <= 10 ? '72px' : '56px');
  const itemHeight   = computed(() => n.value <= 6 ? '54px' : n.value <= 10 ? '48px' : '40px');
  const itemGap      = computed(() => n.value <= 6 ? '18px' : n.value <= 10 ? '12px' : '6px');
  const fontSize     = computed(() => n.value <= 6 ? '14px' : n.value <= 10 ? '12px' : '10.5px');

  const containerStyle = computed(() => ({
    minWidth: '580px',
  }));

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
    containerStyle
  };
}
