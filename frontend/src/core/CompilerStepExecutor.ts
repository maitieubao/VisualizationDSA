import { parse } from '@babel/parser';
import type { Node as BabelNode } from '@babel/types';

export interface GraphSnapshotNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface GraphSnapshotEdge {
  from: string;
  to: string;
  weight?: number;
  directed?: boolean;
}

export interface TreeSnapshotNode {
  id: string;
  value: number;
  leftId: string | null;
  rightId: string | null;
}

export interface CanvasStateSnapshot {
  array: number[];
  comparingIndices?: [number, number];
  swappingIndices?: [number, number];
  loopVariables?: Record<string, number>;
  /**
   * B2: snapshot biến PRIMITIVE (number/string/boolean) của mọi scope visible tại frame này —
   * nguồn dữ liệu cho Watch Panel. Không chứa object/array (tránh snapshot khổng lồ).
   */
  variables?: Record<string, number | string | boolean>;
  highlightedIndices?: number[];
  graphNodes?: GraphSnapshotNode[];
  graphEdges?: GraphSnapshotEdge[];
  treeNodes?: TreeSnapshotNode[];
  activeIds?: string[];
  visitedIds?: string[];
  queueIds?: string[];
  stackIds?: string[];
  distances?: Record<string, number>;
  highlightedEdges?: [string, string][];
  labels?: Record<string, string>;
  /** Search range [low..high] for binary/linear search */
  searchRange?: { low: number; high: number };
  /** Target value being searched */
  searchTarget?: number;
  /** Whether the target has been found */
  searchFound?: boolean;
  /** Index where the target was found (-1 if not found yet) */
  foundIndex?: number;
  /** Number of comparisons made so far */
  comparisonCount?: number;
  /** Pointers to display above bars (L, R, M, H, etc.) */
  pointers?: Array<{ index: number; label: string; color: string }>;
  /** Search regions to highlight/dim (for binary search pruning visualization) */
  searchRegions?: Array<{ start: number; end: number; state: 'active' | 'pruned' }>;
  /** Call stack frames for recursive algorithms */
  callStack?: Array<{ functionName: string; depth: number }>;
  /** Current recursion depth */
  recursionDepth?: number;
  /** Pruned/unused tree node IDs (for BST branch pruning visualization) */
  prunedNodeIds?: string[];
  /** Counting Sort: frequency table per value (offset by min value) */
  countArray?: number[];
  /** Counting Sort: current phase label */
  countingStep?: 'count' | 'accumulate' | 'output';
  /** Counting Sort: partially filled output slot (null = empty) */
  outputArray?: Array<number | null>;
  /** Radix Sort: digit place currently being processed (1, 10, 100...) */
  activeDigitPlace?: number;
  /** Radix Sort: 10 digit buckets */
  radixBuckets?: number[][];
  /** Radix Sort: distribute vs collect phase */
  radixStep?: 'distribute' | 'collect';
  /** Bucket Sort: n value buckets */
  bucketSortBuckets?: number[][];
  /** Bucket Sort: current phase label */
  bucketStep?: 'distribute' | 'sort' | 'collect';
  /** Bucket Sort: bucket index currently being processed */
  bucketSortActiveIdx?: number;
  /** Bucket Sort: range labels of each bucket */
  bucketRangeLabels?: string[];
  /** Bucket Sort: item indices inside the active bucket being compared */
  bucketSortComparingBucketIndices?: [number, number] | null;
  /** Merge Sort: trạng thái chia/trộn hiện tại (điều khiển layout riêng của merge engine) */
  mergeState?: MergeSortState;
  /** Heap Sort: trạng thái đống hiện tại (điều khiển layout riêng của heap engine) */
  heapState?: HeapSortState;
}

/** Trạng thái vun đống của Heap Sort (data-driven cho HeapSortAnimationEngine). */
export interface HeapSortState {
  /** 'build' — đang xây đống; 'extract' — đang trích xuất phần tử lớn nhất */
  phase: 'build' | 'extract';
  /** Kích thước heap hiện tại (các chỉ số >= heapSize đã nằm ngoài đống) */
  heapSize: number;
  /** Node đang được sift-down (i trong heapify) */
  activeIdx: number;
  /** Đường đi sift-down từ activeIdx xuống vị trí lắng (các index đã so sánh/di chuyển) */
  siftPath?: number[];
}

/** Trạng thái chia/trộn của Merge Sort (data-driven cho MergeSortAnimationEngine). */
export interface MergeSortState {
  /** 'divide' — đang chia đoạn; 'merge' — đang trộn 2 nửa */
  phase: 'divide' | 'merge';
  /** Nửa trái (đã sắp xếp trong lần trộn này) */
  left: number[];
  /** Nửa phải (đã sắp xếp trong lần trộn này) */
  right: number[];
  /** Con trỏ đang duyệt trong left */
  leftIdx: number;
  /** Con trỏ đang duyệt trong right */
  rightIdx: number;
  /** Output đang điền dần (null = chưa điền) */
  output: Array<number | null>;
  /** Đoạn [low..high] trong mảng gốc đang xử lý */
  low: number;
  mid: number;
  high: number;
  /** Độ rộng segment hiện tại (bottom-up) */
  width: number;
  /** Số lần chia đôi đã qua (pass 0-based) */
  pass: number;
}

export interface PlaybackFrame {
  stepIndex: number;
  canvasStateSnapshot: CanvasStateSnapshot;
  lineNumber: number;
  description: string;
}

export interface StepToLineMapping {
  stepIndex: number;
  lineNumber: number;
  codeSnippet: string;
}

export interface CompileOptions {
  array?: number[];
  graphNodes?: GraphSnapshotNode[];
  graphEdges?: GraphSnapshotEdge[];
  treeNodes?: TreeSnapshotNode[];
  /**
   * Bật chế độ nghiêm ngặt: nếu JS sandbox lỗi cú pháp/execution thì NÉM lỗi
   * thay vì rơi về bộ biên dịch Regex tĩnh. Dùng cho Playground cho phép người
   * dùng sửa code. Mặc định true (giữ hành vi cũ cho vcr-player).
   */
  fallbackToRegex?: boolean;
}


export function isPlaybackFrame(frame: unknown): frame is PlaybackFrame {
  return typeof frame === 'object' && frame !== null && 'canvasStateSnapshot' in frame;
}

/** Việt hóa lỗi kỹ thuật phổ biến (đệ quy tràn stack) trước khi hiển thị cho sinh viên. */
export function toFriendlyCompileError(message: string): string {
  if (/call stack|stack size/i.test(message)) {
    return 'Đệ quy quá sâu — kiểm tra điều kiện dừng (base case) của hàm đệ quy.';
  }
  return message;
}

export class CompilerStepExecutor {





  public static compileAlgorithm(
    sourceCode: string,
    initialArray: number[] = [45, 12, 85, 32, 9, 60],
    options?: CompileOptions,
  ): PlaybackFrame[] {
    try {
      return CompilerStepExecutor.compileJavaScript(sourceCode, initialArray, options);
    } catch (err: unknown) {
      const message = toFriendlyCompileError(err instanceof Error ? err.message : String(err));
      if (message.includes("Vượt quá giới hạn thực thi")) {
        throw new Error(message);
      }
      if (options?.fallbackToRegex === false) {
        throw new Error(message);
      }
      console.warn("Chuyển sang cơ chế biên dịch Regex tĩnh:", message);
      return CompilerStepExecutor.compilePseudocodeRegex(sourceCode, initialArray);
    }
  }





  private static compileJavaScript(sourceCode: string, initialArray: number[], options?: CompileOptions): PlaybackFrame[] {
    const frames: PlaybackFrame[] = [];
    let currentLine = 0;
    let stepCount = 0;
    let inSwap = false;
    const highlighted: number[] = [];

    
    const graphNodes = options?.graphNodes ?? [];
    const graphEdges = options?.graphEdges ?? [];
    const treeNodes = options?.treeNodes ?? [];

    
    const mockArray = [...(options?.array ?? initialArray)];

    
    const state = {
      array: mockArray,
      vars: {} as Record<string, number>,
      // B2: snapshot biến primitive đầy đủ (number/string/boolean) cho Watch Panel.
      allVars: {} as Record<string, number | string | boolean>,
      visited: [] as string[],
      active: [] as string[],
      queue: [] as string[],
      stack: [] as string[],
      distances: {} as Record<string, number>,
      highlightedEdges: [] as [string, string][],
      labels: {} as Record<string, string>,
      searchRange: undefined as { low: number; high: number } | undefined,
      searchTarget: undefined as number | undefined,
      searchFound: false,
      foundIndex: -1,
      comparisonCount: 0,
      pointers: undefined as Array<{ index: number; label: string; color: string }> | undefined,
      searchRegions: undefined as Array<{ start: number; end: number; state: 'active' | 'pruned' }> | undefined,
      callStack: undefined as Array<{ functionName: string; depth: number }> | undefined,
      recursionDepth: 0,
      prunedNodeIds: undefined as string[] | undefined,
      countArray: undefined as number[] | undefined,
      countingStep: undefined as 'count' | 'accumulate' | 'output' | undefined,
      outputArray: undefined as Array<number | null> | undefined,
      activeDigitPlace: undefined as number | undefined,
      buckets: [] as number[][],
      bucketStep: undefined as 'distribute' | 'collect' | 'sort' | undefined,
      bucketSortActiveIdx: undefined as number | undefined,
      bucketRangeLabels: undefined as string[] | undefined,
      bucketSortComparingBucketIndices: undefined as [number, number] | null | undefined,
      mergeState: undefined as MergeSortState | undefined,
      heapState: undefined as HeapSortState | undefined,
    };

    
    const buildBaseSnapshot = (): CanvasStateSnapshot => ({
      array: [...state.array],
      graphNodes,
      graphEdges,
      treeNodes,
      loopVariables: { ...state.vars },
      // B2: toàn bộ biến primitive visible (đã lọc number/string/boolean) cho Watch Panel.
      variables: { ...state.allVars },
      highlightedIndices: [...highlighted],
      visitedIds: [...state.visited],
      activeIds: [...state.active],
      queueIds: [...state.queue],
      stackIds: [...state.stack],
      distances: { ...state.distances },
      highlightedEdges: state.highlightedEdges.map(e => [...e] as [string, string]),
      labels: { ...state.labels },
      searchRange: state.searchRange,
      searchTarget: state.searchTarget,
      searchFound: state.searchFound,
      foundIndex: state.foundIndex,
      comparisonCount: state.comparisonCount,
      pointers: state.pointers ? state.pointers.map(p => ({ ...p })) : undefined,
      searchRegions: state.searchRegions ? state.searchRegions.map(r => ({ ...r })) : undefined,
      callStack: state.callStack ? state.callStack.map(f => ({ ...f })) : undefined,
      recursionDepth: state.recursionDepth,
      prunedNodeIds: state.prunedNodeIds ? [...state.prunedNodeIds] : undefined,
      countArray: state.countArray ? [...state.countArray] : undefined,
      countingStep: state.countingStep,
      outputArray: state.outputArray ? [...state.outputArray] : undefined,
      activeDigitPlace: state.activeDigitPlace,
      radixBuckets: state.buckets.map(b => [...b]),
      radixStep: state.bucketStep === 'sort' ? 'distribute' : state.bucketStep,
      bucketSortBuckets: state.buckets.map(b => [...b]),
      bucketStep: state.bucketStep,
      bucketSortActiveIdx: state.bucketSortActiveIdx,
      bucketRangeLabels: state.bucketRangeLabels ? [...state.bucketRangeLabels] : undefined,
      bucketSortComparingBucketIndices: state.bucketSortComparingBucketIndices
        ? [...state.bucketSortComparingBucketIndices] as [number, number]
        : undefined,
      mergeState: state.mergeState
        ? {
          ...state.mergeState,
          left: [...state.mergeState.left],
          right: [...state.mergeState.right],
          output: [...state.mergeState.output],
        }
        : undefined,
      heapState: state.heapState
        ? {
          ...state.heapState,
          siftPath: state.heapState.siftPath ? [...state.heapState.siftPath] : undefined,
        }
        : undefined,
    });

    
    const commit = (partial: Partial<CanvasStateSnapshot>, description: string): void => {
      frames.push({
        stepIndex: frames.length,
        lineNumber: currentLine,
        description,
        canvasStateSnapshot: {
          ...buildBaseSnapshot(),
          ...partial,
          loopVariables: { ...state.vars },
          variables: { ...state.allVars },
        },
      });
    };

    
    const trackLine = (lineNum: number, variables: Record<string, unknown>) => {
      stepCount++;
      if (stepCount > CompilerStepExecutor.MAX_STEPS) {
        throw new Error("Vượt quá giới hạn thực thi (tối đa 10000 bước). Có thể có vòng lặp vô hạn!");
      }
      currentLine = lineNum;

      const loopVars: Record<string, number> = {};
      const allVars: Record<string, number | string | boolean> = {};
      for (const [name, val] of Object.entries(variables)) {
        if (typeof val === 'number') {
          loopVars[name] = val;
          allVars[name] = val;
        } else if (typeof val === 'string' || typeof val === 'boolean') {
          allVars[name] = val;
        }
      }
      state.vars = loopVars;
      state.allVars = allVars;
    };

    let loopIterations = 0;
    const loopTick = () => {
      loopIterations++;
      if (loopIterations > CompilerStepExecutor.MAX_LOOP_ITERATIONS) {
        throw new Error(`Vượt quá giới hạn lặp (tối đa ${CompilerStepExecutor.MAX_LOOP_ITERATIONS} vòng). Có thể có vòng lặp vô hạn!`);
      }
    };

    const safeVars = (fn: () => Record<string, unknown>): Record<string, unknown> => {
      try {
        return fn();
      } catch {
        return {};
      }
    };

    
    const compare = (a: number, b: number) => {
      if (typeof a !== 'number' || typeof b !== 'number') return;
      
      const desc = `So sánh phần tử tại vị trí ${a} (${state.array[a]}) và ${b} (${state.array[b]})`;
      commit({ comparingIndices: [a, b] }, desc);
    };

    
    const swap = (a: number, b: number) => {
      if (typeof a !== 'number' || typeof b !== 'number') return;
      if (a < 0 || a >= state.array.length || b < 0 || b >= state.array.length) return;

      inSwap = true;
      const temp = state.array[a];
      state.array[a] = state.array[b];
      state.array[b] = temp;
      inSwap = false;

      const desc = `Tráo đổi phần tử tại vị trí ${a} (${state.array[b]}) và ${b} (${state.array[a]})`;
      commit({ swappingIndices: [a, b], array: [...state.array] }, desc);
    };

    
    const highlight = (a: number) => {
      if (typeof a !== 'number') return;
      if (a < 0 || a >= state.array.length) return;

      if (!highlighted.includes(a)) {
        highlighted.push(a);
      }

      const desc = `Đánh dấu phần tử tại vị trí ${a} (${state.array[a]}) đã hoàn thành`;
      commit({ highlightedIndices: [...highlighted] }, desc);
    };

    const toKey = (id: string | number): string => String(id);

    const visit = (id: string | number) => {
      const key = toKey(id);
      if (!state.visited.includes(key)) {
        state.visited.push(key);
      }
      commit({ visitedIds: [...state.visited] }, `Đánh dấu đã thăm ${key}`);
    };

    const unvisit = (id: string | number) => {
      const key = toKey(id);
      state.visited = state.visited.filter(v => v !== key);
      commit({ visitedIds: [...state.visited] }, `Hủy đánh dấu đã thăm ${key}`);
    };

    const active = (id: string | number) => {
      state.active = [toKey(id)];
      commit({ activeIds: [...state.active] }, `Đang xử lý đỉnh ${state.active[0]}`);
    };

    const enqueue = (id: string | number) => {
      const key = toKey(id);
      if (!state.queue.includes(key)) {
        state.queue.push(key);
      }
      commit({ queueIds: [...state.queue] }, `Đưa ${key} vào hàng đợi`);
    };

    const dequeue = (id: string | number) => {
      const key = toKey(id);
      state.queue = state.queue.filter(v => v !== key);
      commit({ queueIds: [...state.queue] }, `Lấy ${key} ra khỏi hàng đợi`);
    };

    const push = (id: string | number) => {
      const key = toKey(id);
      if (!state.stack.includes(key)) {
        state.stack.push(key);
      }
      commit({ stackIds: [...state.stack] }, `Đẩy ${key} vào ngăn xếp`);
    };

    const pop = (id: string | number) => {
      const key = toKey(id);
      state.stack = state.stack.filter(v => v !== key);
      commit({ stackIds: [...state.stack] }, `Lấy ${key} ra khỏi ngăn xếp`);
    };

    const setDist = (id: string | number, value: number) => {
      const key = toKey(id);
      state.distances[key] = value;
      commit({ distances: { ...state.distances } }, `Cập nhật khoảng cách tới ${key} = ${value}`);
    };

    const markEdge = (u: string | number, v: string | number) => {
      const a = toKey(u);
      const b = toKey(v);
      if (!state.highlightedEdges.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) {
        state.highlightedEdges.push([a, b]);
      }
      commit({ highlightedEdges: state.highlightedEdges.map(e => [...e] as [string, string]) }, `Đánh dấu cạnh ${a} - ${b}`);
    };

    const clearEdges = () => {
      state.highlightedEdges = [];
      commit({ highlightedEdges: [] }, 'Xóa toàn bộ cạnh được đánh dấu');
    };

    const label = (id: string | number, text: string) => {
      state.labels[toKey(id)] = text;
      commit({ labels: { ...state.labels } }, `Gán nhãn ${id} = ${text}`);
    };

    const log = (msg: string) => {
      commit({}, msg);
    };

    const searchRange = (low: number, high: number) => {
      state.searchRange = { low, high };
      state.searchRegions = [{ start: 0, end: low - 1, state: 'pruned' }, { start: low, end: high, state: 'active' }, { start: high + 1, end: state.array.length - 1, state: 'pruned' }];
      commit({ searchRange: { low, high }, searchRegions: state.searchRegions }, `Tìm kiếm trong khoảng [${low}..${high}]`);
    };

    const searchTarget = (target: number) => {
      state.searchTarget = target;
      commit({ searchTarget: target }, `Tìm kiếm giá trị ${target}`);
    };

    const found = (index: number) => {
      state.searchFound = true;
      state.foundIndex = index;
      commit({ searchFound: true, foundIndex: index }, `Tìm thấy tại vị trí ${index}`);
    };

    const comparisonCount = (count: number) => {
      state.comparisonCount = count;
      commit({ comparisonCount: count }, `Số phép so sánh: ${count}`);
    };

    const pointer = (index: number, label: string, color: string) => {
      if (!state.pointers) state.pointers = [];
      const existing = state.pointers.findIndex(p => p.label === label);
      if (existing >= 0) state.pointers[existing] = { index, label, color };
      else state.pointers.push({ index, label, color });
      commit({ pointers: state.pointers.map(p => ({ ...p })) }, `Con trỏ ${label} = ${index}`);
    };

    const pruneNode = (id: string | number) => {
      const key = toKey(id);
      if (!state.prunedNodeIds) state.prunedNodeIds = [];
      if (!state.prunedNodeIds.includes(key)) state.prunedNodeIds.push(key);
      commit({ prunedNodeIds: [...state.prunedNodeIds] }, `Loại bỏ nhánh ${key}`);
    };

    const MAX_RECURSION_DEPTH = 100;
    const setCallStack = (frames: Array<{ functionName: string; depth: number }>) => {
      state.callStack = frames;
      state.recursionDepth = frames.length;
      if (frames.length > MAX_RECURSION_DEPTH) {
        throw new Error(`Vượt quá giới hạn đệ quy (tối đa ${MAX_RECURSION_DEPTH} cấp).`);
      }
      commit({ callStack: frames.map(f => ({ ...f })), recursionDepth: frames.length }, `Call stack depth: ${frames.length}`);
    };

    const setSearchRegion = (start: number, end: number, regionState: 'active' | 'pruned') => {
      if (!state.searchRegions) state.searchRegions = [];
      const existing = state.searchRegions.findIndex(r => r.start === start && r.end === end);
      if (existing >= 0) state.searchRegions[existing] = { start, end, state: regionState };
      else state.searchRegions.push({ start, end, state: regionState });
      commit({ searchRegions: state.searchRegions.map(r => ({ ...r })) }, `Vùng [${start}..${end}] → ${regionState}`);
    };

    const setCounts = (counts: number[]) => {
      state.countArray = [...counts];
      commit({ countArray: [...counts] }, `Cập nhật mảng đếm (${counts.length} ô)`);
    };

    const setCountingPhase = (phase: 'count' | 'accumulate' | 'output') => {
      state.countingStep = phase;
      commit({ countingStep: phase }, `Giai đoạn Counting Sort: ${phase}`);
    };

    const setOutputs = (outputs: Array<number | null>) => {
      state.outputArray = [...outputs];
      commit({ outputArray: [...outputs] }, `Cập nhật mảng kết quả`);
    };

    const setDigitPlace = (place: number) => {
      state.activeDigitPlace = place;
      commit({ activeDigitPlace: place }, `Sắp xếp theo hàng chữ số ${place}`);
    };

    const setArrayElement = (idx: number, val: number) => {
      if (typeof idx !== 'number' || typeof val !== 'number') return;
      if (idx < 0 || idx >= state.array.length) return;
      inSwap = true;
      state.array[idx] = val;
      inSwap = false;
    };

    const setBuckets = (buckets: number[][], silent = false) => {
      state.buckets = buckets.map(b => [...b]);
      if (!silent) {
        commit({ radixBuckets: state.buckets.map(b => [...b]), bucketSortBuckets: state.buckets.map(b => [...b]) }, `Cập nhật ${buckets.length} xô`);
      }
    };

    const setBucketPhase = (phase: 'distribute' | 'collect' | 'sort') => {
      state.bucketStep = phase;
      commit({ bucketStep: phase, radixStep: phase === 'sort' ? 'distribute' : phase }, `Giai đoạn phân xô: ${phase}`);
    };

    const setActiveBucket = (idx: number) => {
      state.bucketSortActiveIdx = idx;
      commit({ bucketSortActiveIdx: idx }, `Đang xử lý xô ${idx}`);
    };

    const setRangeLabels = (labels: string[]) => {
      state.bucketRangeLabels = [...labels];
      commit({ bucketRangeLabels: [...labels] }, `Cập nhật nhãn dải giá trị`);
    };

    const setBucketComparing = (a: number, b: number) => {
      state.bucketSortComparingBucketIndices = [a, b];
      commit({ bucketSortComparingBucketIndices: [a, b] }, `So sánh cặp (${a}, ${b}) trong xô`);
    };

    const setMergeState = (st: MergeSortState) => {
      state.mergeState = {
        ...st,
        left: [...st.left],
        right: [...st.right],
        output: [...st.output],
      };
      const phaseLabel = st.phase === 'divide' ? 'Chia đoạn' : 'Trộn';
      commit({ mergeState: state.mergeState }, `${phaseLabel} [${st.low}..${st.high}] (width=${st.width})`);
    };

    const setHeapState = (st: HeapSortState) => {
      state.heapState = {
        ...st,
        siftPath: st.siftPath ? [...st.siftPath] : undefined,
      };
      const phaseLabel = st.phase === 'build' ? 'Xây đống' : 'Trích xuất';
      commit({ heapState: state.heapState }, `${phaseLabel} · heapSize=${st.heapSize} · active=${st.activeIdx}`);
    };

    
    let processedCode = sourceCode
      .replace(/compare\s*\(\s*(?:arr|array)\[([^\]]+)\]\s*,\s*(?:arr|array)\[([^\]]+)\]\s*\)/gi, 'compare($1, $2)')
      .replace(/swap\s*\(\s*(?:arr|array)\[([^\]]+)\]\s*,\s*(?:arr|array)\[([^\]]+)\]\s*\)/gi, 'swap($1, $2)')
      .replace(/highlight\s*\(\s*(?:arr|array)\[([^\]]+)\]\s*\)/gi, 'highlight($1)');

    let ast: unknown;
    try {
      ast = parse(processedCode, { sourceType: 'script', allowReturnOutsideFunction: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Lỗi cú pháp JavaScript: ${message}`);
    }

    const instrumentedCode = CompilerStepExecutor.instrumentAst(ast as BabelNode, processedCode);

    const arrayProxy = new Proxy(state.array, {
      get(target, prop) {
        if (prop === 'length') return target.length;
        if (typeof prop === 'symbol') {
          return (target as unknown as Record<symbol, unknown>)[prop];
        }
        const idx = Number(prop);
        if (!isNaN(idx)) {
          return target[idx];
        }
        return (target as unknown as Record<string, unknown>)[prop];
      },
      set(target, prop, value) {
        if (typeof prop === 'symbol') {
          (target as unknown as Record<symbol, unknown>)[prop] = value;
          return true;
        }
        const idx = Number(prop);
        if (!isNaN(idx)) {
          target[idx] = value;

          if (!inSwap) {
            const desc = `Gán array[${idx}] = ${value}`;
            commit({ array: [...target] }, desc);
          }
          return true;
        }
        (target as unknown as Record<string, unknown>)[prop] = value;
        return true;
      }
    });

    const sandbox = new Function(
      'array',
      'arr',
      'compare',
      'swap',
      'highlight',
      'visit',
      'unvisit',
      'active',
      'enqueue',
      'dequeue',
      'push',
      'pop',
      'setDist',
      'markEdge',
      'clearEdges',
      'label',
      'log',
      'graphNodes',
      'graphEdges',
      'treeNodes',
      '__trackLine',
      'safeVars',
      '__loopTick',
      'searchRange',
      'searchTarget',
      'found',
      'comparisonCount',
      'pointer',
      'pruneNode',
      'setCallStack',
      'setSearchRegion',
      'setCounts',
      'setCountingPhase',
      'setOutputs',
      'setDigitPlace',
      'setArrayElement',
      'setBuckets',
      'setBucketPhase',
      'setActiveBucket',
      'setRangeLabels',
      'setBucketComparing',
      'setMergeState',
      'setHeapState',
      instrumentedCode
    );

    sandbox(
      arrayProxy,
      arrayProxy,
      compare,
      swap,
      highlight,
      visit,
      unvisit,
      active,
      enqueue,
      dequeue,
      push,
      pop,
      setDist,
      markEdge,
      clearEdges,
      label,
      log,
      graphNodes,
      graphEdges,
      treeNodes,
      trackLine,
      safeVars,
      loopTick,
      searchRange,
      searchTarget,
      found,
      comparisonCount,
      pointer,
      pruneNode,
      setCallStack,
      setSearchRegion,
      setCounts,
      setCountingPhase,
      setOutputs,
      setDigitPlace,
      setArrayElement,
      setBuckets,
      setBucketPhase,
      setActiveBucket,
      setRangeLabels,
      setBucketComparing,
      setMergeState,
      setHeapState,
    );

    return frames;
  }

  private static readonly MAX_STEPS = 10000;
  private static readonly MAX_LOOP_ITERATIONS = 1000000;

  /**
   * Chèn __trackLine vào trước mỗi statement và __loopTick vào đầu mỗi vòng lặp.
   * Không hoist biến: giữ nguyên block scope/closure để đệ quy hoạt động đúng.
   */
  private static instrumentAst(ast: BabelNode, source: string): string {
    interface Scope { names: Set<string>; }
    interface Chunk { text: string; priority: 'open' | 'track' | 'close'; }

    const scopes: Scope[] = [{ names: new Set() }];
    const inserts = new Map<number, Chunk[]>();

    const addInsert = (pos: number | null | undefined, text: string, priority: 'open' | 'track' | 'close'): void => {
      const at = pos ?? 0;
      const list = inserts.get(at) ?? [];
      list.push({ text, priority });
      inserts.set(at, list);
    };

    const visibleNames = (): string[] => {
      const all = new Set<string>();
      for (const scope of scopes) {
        for (const name of scope.names) all.add(name);
      }
      return [...all];
    };

    const lineOf = (node: BabelNode): number => node.loc?.start.line ?? 0;

    const processExpr = (node: BabelNode | null | undefined): void => {
      if (!node || typeof node.type !== 'string') return;
      switch (node.type) {
        case 'FunctionExpression':
        case 'ArrowFunctionExpression':
          processFunction(node);
          break;
        case 'ClassMethod':
        case 'ClassPrivateMethod':
          processFunction(node);
          break;
        default: {
          for (const key of Object.keys(node)) {
            const value = (node as unknown as Record<string, unknown>)[key];
            if (Array.isArray(value)) {
              for (const item of value) {
                if (item && typeof item === 'object' && typeof (item as BabelNode).type === 'string') {
                  processExpr(item as BabelNode);
                }
              }
            } else if (value && typeof value === 'object' && typeof (value as BabelNode).type === 'string') {
              processExpr(value as BabelNode);
            }
          }
        }
      }
    };

    const processFunction = (node: BabelNode): void => {
      const fn = node as unknown as {
        params?: Array<{
          type?: string;
          name?: string;
          left?: { type?: string; name?: string };
          argument?: { type?: string; name?: string };
        }>;
        body?: BabelNode;
      };
      const scope: Scope = { names: new Set() };
      for (const p of fn.params ?? []) {
        if (p?.type === 'Identifier' && p.name) scope.names.add(p.name);
        else if (p?.type === 'AssignmentPattern' && p.left?.type === 'Identifier' && p.left.name) scope.names.add(p.left.name);
        else if (p?.type === 'RestElement' && p.argument?.type === 'Identifier' && p.argument.name) scope.names.add(p.argument.name);
      }
      scopes.push(scope);
      for (const p of fn.params ?? []) processExpr(p as unknown as BabelNode);
      const body = fn.body;
      if (body && body.type === 'BlockStatement') {
        scopes.push({ names: new Set() });
        for (const st of (body as unknown as { body: BabelNode[] }).body) processStatement(st);
        scopes.pop();
      }
      scopes.pop();
    };

    const processLoopBody = (body: BabelNode): void => {
      if (body.type === 'BlockStatement') {
        addInsert((body.start ?? 0) + 1, `__loopTick();`, 'open');
        scopes.push({ names: new Set() });
        for (const st of (body as unknown as { body: BabelNode[] }).body) processStatement(st);
        scopes.pop();
      } else {
        addInsert(body.start, `{ __loopTick(); `, 'open');
        processStatement(body);
        addInsert(body.end, `}`, 'close');
      }
    };

    const processBranch = (stmt: BabelNode): void => {
      if (stmt.type === 'BlockStatement') {
        scopes.push({ names: new Set() });
        for (const st of (stmt as unknown as { body: BabelNode[] }).body) processStatement(st, true);
        scopes.pop();
      } else {
        addInsert(stmt.start, `{ `, 'open');
        processStatement(stmt, true);
        addInsert(stmt.end, `}`, 'close');
      }
    };

    const processStatement = (stmt: BabelNode, allowInsert = true): void => {
      const line = lineOf(stmt);
      if (line > 0 && allowInsert && stmt.type !== 'BlockStatement') {
        const names = visibleNames();
        const varsText = names.length > 0 ? `{ ${names.join(', ')} }` : '{}';
        addInsert(stmt.start, `__trackLine(${line}, safeVars(function(){ return ${varsText}; }));`, 'track');
      }

      const s = stmt as unknown as Record<string, unknown>;
      switch (stmt.type) {
        case 'VariableDeclaration': {
          const scope = scopes[scopes.length - 1];
          for (const d of (s.declarations as Array<{ id?: BabelNode; init?: BabelNode }>) ?? []) {
            if (d.id?.type === 'Identifier') scope.names.add((d.id as unknown as { name: string }).name);
            processExpr(d.init);
          }
          break;
        }
        case 'FunctionDeclaration': {
          scopes[scopes.length - 1].names.add((s.id as unknown as { name: string }).name);
          processFunction(stmt);
          break;
        }
        case 'BlockStatement': {
          scopes.push({ names: new Set() });
          for (const st of (s.body as BabelNode[]) ?? []) processStatement(st);
          scopes.pop();
          break;
        }
        case 'ForStatement': {
          const init = s.init as BabelNode | null;
          const loopScope: Scope = { names: new Set() };
          if (init?.type === 'VariableDeclaration') {
            const kind = (init as unknown as { kind: string }).kind;
            if (kind === 'let' || kind === 'const' || kind === 'var') {
              for (const d of (init as unknown as { declarations: Array<{ id?: BabelNode }> }).declarations) {
                if (d.id?.type === 'Identifier') loopScope.names.add((d.id as unknown as { name: string }).name);
              }
            }
          }
          scopes.push(loopScope);
          processExpr(init);
          processExpr(s.test as BabelNode | null);
          processExpr(s.update as BabelNode | null);
          processLoopBody(s.body as BabelNode);
          scopes.pop();
          break;
        }
        case 'WhileStatement': {
          processExpr(s.test as BabelNode | null);
          processLoopBody(s.body as BabelNode);
          break;
        }
        case 'DoWhileStatement': {
          processLoopBody(s.body as BabelNode);
          processExpr(s.test as BabelNode | null);
          break;
        }
        case 'ForInStatement':
        case 'ForOfStatement': {
          const left = s.left as BabelNode | null;
          const loopScope: Scope = { names: new Set() };
          if (left?.type === 'VariableDeclaration') {
            const kind = (left as unknown as { kind: string }).kind;
            if (kind === 'let' || kind === 'const' || kind === 'var') {
              for (const d of (left as unknown as { declarations: Array<{ id?: BabelNode }> }).declarations) {
                if (d.id?.type === 'Identifier') loopScope.names.add((d.id as unknown as { name: string }).name);
              }
            }
          }
          scopes.push(loopScope);
          processExpr(left);
          processExpr(s.right as BabelNode | null);
          processLoopBody(s.body as BabelNode);
          scopes.pop();
          break;
        }
        case 'IfStatement': {
          processExpr(s.test as BabelNode | null);
          if (s.consequent) processBranch(s.consequent as BabelNode);
          if (s.alternate) processBranch(s.alternate as BabelNode);
          break;
        }
        case 'TryStatement': {
          if (s.block) processBranch(s.block as BabelNode);
          if (s.handler) {
            const handler = s.handler as unknown as { param?: BabelNode; body?: BabelNode };
            scopes.push({ names: new Set() });
            if (handler.param?.type === 'Identifier') {
              scopes[scopes.length - 1].names.add((handler.param as unknown as { name: string }).name);
            }
            if (handler.body) processBranch(handler.body);
            scopes.pop();
          }
          if (s.finalizer) processBranch(s.finalizer as BabelNode);
          break;
        }
        case 'SwitchStatement': {
          processExpr(s.discriminant as BabelNode | null);
          for (const c of (s.cases as Array<{ test?: BabelNode; consequent?: BabelNode[] }>) ?? []) {
            processExpr(c.test);
            for (const cs of c.consequent ?? []) processStatement(cs);
          }
          break;
        }
        case 'LabeledStatement': {
          processBranch(s.body as BabelNode);
          break;
        }
        case 'ClassDeclaration': {
          const id = s.id as unknown as { name?: string } | null;
          if (id?.name) scopes[scopes.length - 1].names.add(id.name);
          for (const m of (s.body as unknown as { body: BabelNode[] }).body ?? []) {
            if (m.type === 'ClassMethod' || m.type === 'ClassPrivateMethod') processFunction(m);
          }
          break;
        }
        default: {
          processExpr(stmt);
          break;
        }
      }
    };

    for (const st of (ast as unknown as { program: { body: BabelNode[] } }).program.body) {
      processStatement(st);
    }

    const groups = [...inserts.entries()].sort((a, b) => b[0] - a[0]);
    const priorityOrder: Record<'open' | 'track' | 'close', number> = { open: 0, track: 1, close: 2 };
    let code = source;
    for (const [pos, chunks] of groups) {
      chunks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
      const text = chunks.map(c => c.text).join('');
      code = code.slice(0, pos) + text + code.slice(pos);
    }
    return code;
  }





  private static compilePseudocodeRegex(sourceCode: string, initialArray: number[]): PlaybackFrame[] {
    const lines = sourceCode.split('\n');
    const frames: PlaybackFrame[] = [];
    let currentStep = 0;
    let mockArray = [...initialArray];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      const lineNum = index + 1;

      if (!trimmed || trimmed.startsWith('//')) {
        return; 
      }

      const swapRegex = /swap\s*\(?\s*arr\[(\d+)\]\s*,\s*arr\[(\d+)\]\s*\)?/i;
      const compareRegex = /compare\s*\(?\s*arr\[(\d+)\]\s*,\s*arr\[(\d+)\]\s*\)?/i;

      const swapMatch = trimmed.match(swapRegex);
      const compareMatch = trimmed.match(compareRegex);

      if (swapMatch) {
        const idx1 = parseInt(swapMatch[1], 10);
        const idx2 = parseInt(swapMatch[2], 10);

        if (idx1 < mockArray.length && idx2 < mockArray.length) {
          const temp = mockArray[idx1];
          mockArray[idx1] = mockArray[idx2];
          mockArray[idx2] = temp;

          frames.push({
            stepIndex: currentStep++,
            lineNumber: lineNum,
            description: `Tráo đổi phần tử tại vị trí ${idx1} (${mockArray[idx2]}) và ${idx2} (${mockArray[idx1]})`,
            canvasStateSnapshot: {
              array: [...mockArray],
              swappingIndices: [idx1, idx2]
            }
          });
        } else {
          // Swap ngoài biên mảng: bỏ qua (trước đây reverse() tùy tiện làm hỏng dữ liệu giả lập).
        }
      } else if (compareMatch) {
        const idx1 = parseInt(compareMatch[1], 10);
        const idx2 = parseInt(compareMatch[2], 10);

        frames.push({
          stepIndex: currentStep++,
          lineNumber: lineNum,
          description: `So sánh phần tử tại vị trí ${idx1} (${mockArray[idx1]}) và ${idx2} (${mockArray[idx2]})`,
          canvasStateSnapshot: {
            array: [...mockArray],
            comparingIndices: [idx1, idx2]
          }
        });
      } else if (trimmed.startsWith('swap') || trimmed.includes('temp =')) {
        mockArray = [...mockArray].reverse();
        frames.push({
          stepIndex: currentStep++,
          lineNumber: lineNum,
          description: `Thực thi hoán vị mảng: [${mockArray.join(', ')}]`,
          canvasStateSnapshot: {
            array: [...mockArray]
          }
        });
      } else if (trimmed.startsWith('if') || trimmed.startsWith('compare') || trimmed.includes('compare')) {
        frames.push({
          stepIndex: currentStep++,
          lineNumber: lineNum,
          description: `So sánh các phần tử`,
          canvasStateSnapshot: {
            array: [...mockArray],
            comparingIndices: [0, 1]
          }
        });
      } else if (trimmed.startsWith('loop') || trimmed.startsWith('for') || trimmed.startsWith('while')) {
        const loopRegex = /(?:loop|for|while)\s+(\w+)(?:\s+from\s+(\d+|[a-zA-Z_]+))?/i;
        const loopMatch = trimmed.match(loopRegex);
        const loopVars: Record<string, number> = {};
        const highlighted: number[] = [];
        let desc = `Bắt đầu vòng lặp: ${trimmed}`;
        
        if (loopMatch) {
          const varName = loopMatch[1];
          const valStr = loopMatch[2];
          let val = 0;
          if (valStr) {
            val = isNaN(Number(valStr)) ? 0 : parseInt(valStr, 10);
          }
          loopVars[varName] = val;
          desc = `Bắt đầu vòng lặp điều kiện với biến '${varName}' khởi chạy tại ${valStr || 0}`;
          if (val >= 0 && val < mockArray.length) {
            highlighted.push(val);
          }
        }

        frames.push({
          stepIndex: currentStep++,
          lineNumber: lineNum,
          description: desc,
          canvasStateSnapshot: {
            array: [...mockArray],
            loopVariables: loopVars,
            highlightedIndices: highlighted
          }
        });
      }
    });

    return frames;
  }





  public static generateStepToLineMapping(sourceCode: string, frames: PlaybackFrame[]): StepToLineMapping[] {
    const lines = sourceCode.split('\n');
    return frames.map(frame => {
      const lineIdx = frame.lineNumber - 1;
      const snippet = (lineIdx >= 0 && lineIdx < lines.length) ? lines[lineIdx].trim() : '';
      return {
        stepIndex: frame.stepIndex,
        lineNumber: frame.lineNumber,
        codeSnippet: snippet
      };
    });
  }
}
