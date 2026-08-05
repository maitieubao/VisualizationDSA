import { describe, it, expect } from 'vitest';
import {
  playgroundAlgoDemos,
  getAlgoDemo,
  algoDemoIds,
  generateDemoInput,
  HOOKS_HINT,
  type AlgoDemoCategory,
} from '../engine/playgroundAlgoDemos';
import { AlgoInputParser } from '../engine/AlgoInputParser';
import { CompilerStepExecutor } from '../../../core/CompilerStepExecutor';

const EXPECTED_CATEGORIES: readonly AlgoDemoCategory[] = ['sorting', 'searching', 'stack-queue', 'tree-graph'];

describe('playgroundAlgoDemos', () => {
  it('registers 21 unique demos', () => {
    expect(algoDemoIds).toHaveLength(21);
    expect(new Set(algoDemoIds).size).toBe(21);
  });

  it('has at least one demo per category', () => {
    for (const category of EXPECTED_CATEGORIES) {
      const count = Object.values(playgroundAlgoDemos).filter(d => d.category === category).length;
      expect(count, `category ${category}`).toBeGreaterThan(0);
    }
  });

  it('every demo carries hooks hint + valid metadata', () => {
    const hookCall = /\b(?:compare|swap|highlight|visit|active|enqueue|dequeue|push|pop|setDist|markEdge|log|searchTarget|searchRange|pointer|found|pruneNode|setCallStack|setBuckets|setCounts)\s*\(/;
    for (const demo of Object.values(playgroundAlgoDemos)) {
      expect(demo.id, demo.title).toBeTruthy();
      expect(demo.title).toBeTruthy();
      expect(demo.defaultInput.length).toBeGreaterThan(0);
      expect(demo.code).toMatch(hookCall);
      // HOOKS_HINT tách khỏi code editor (hiển thị qua panel "Hooks")
      expect(demo.code).not.toContain('// Hooks');
      expect(demo.code.length).toBeGreaterThan(100);
    }
    expect(HOOKS_HINT).toContain('compare(i, j)');
    expect(HOOKS_HINT).toContain('setBuckets');
  });

  it('getAlgoDemo returns undefined for unknown ids', () => {
    expect(getAlgoDemo('not-a-real-demo')).toBeUndefined();
  });

  it('every demo compiles strictly through the JS sandbox (no regex fallback)', () => {
    for (const demo of Object.values(playgroundAlgoDemos)) {
      const options = AlgoInputParser.parse(demo.defaultInput, demo.inputKind);
      const frames = CompilerStepExecutor.compileAlgorithm(demo.code, [], {
        ...options,
        fallbackToRegex: false,
      });
      expect(frames.length, demo.id).toBeGreaterThan(0);
      expect(frames[0].description.length).toBeGreaterThan(0);
    }
  });

  it('sorting demos finish with a fully sorted final array', () => {
    const sortingIds = Object.values(playgroundAlgoDemos)
      .filter(d => d.category === 'sorting')
      .map(d => d.id);

    for (const id of sortingIds) {
      const demo = getAlgoDemo(id)!;
      const options = AlgoInputParser.parse(demo.defaultInput, demo.inputKind);
      const frames = CompilerStepExecutor.compileAlgorithm(demo.code, [], options);
      const finalArray = frames[frames.length - 1].canvasStateSnapshot.array;
      const sorted = [...finalArray].sort((a, b) => a - b);
      expect(finalArray, id).toEqual(sorted);
    }
  });

  it('graph demos expose graph snapshot on first frame', () => {
    for (const id of ['bfs', 'dfs', 'dijkstra']) {
      const demo = getAlgoDemo(id)!;
      const options = AlgoInputParser.parse(demo.defaultInput, demo.inputKind);
      const frames = CompilerStepExecutor.compileAlgorithm(demo.code, [], options);
      expect(frames[0].canvasStateSnapshot.graphNodes?.length, id).toBeGreaterThan(0);
      expect(frames[0].canvasStateSnapshot.graphEdges?.length, id).toBeGreaterThan(0);
    }
  });

  it('tree demos expose a tree snapshot on first frame', () => {
    for (const id of ['bst', 'tree-traversal']) {
      const demo = getAlgoDemo(id)!;
      const options = AlgoInputParser.parse(demo.defaultInput, demo.inputKind);
      const frames = CompilerStepExecutor.compileAlgorithm(demo.code, [], options);
      expect(frames[0].canvasStateSnapshot.treeNodes?.length, id).toBeGreaterThan(0);
    }
  });

  it('dijkstra eventually reaches all graph nodes', () => {
    const demo = getAlgoDemo('dijkstra')!;
    const options = AlgoInputParser.parse(demo.defaultInput, demo.inputKind);
    const frames = CompilerStepExecutor.compileAlgorithm(demo.code, [], options);
    const finalSnapshot = frames[frames.length - 1].canvasStateSnapshot;
    expect(Object.keys(finalSnapshot.distances ?? {})).toEqual(
      (finalSnapshot.graphNodes ?? []).map(n => n.id),
    );
  });

  it('tree-traversal visits every node in correct in-order sequence', () => {
    const demo = getAlgoDemo('tree-traversal')!;
    const options = AlgoInputParser.parse(demo.defaultInput, demo.inputKind);
    const frames = CompilerStepExecutor.compileAlgorithm(demo.code, [], { ...options, fallbackToRegex: false });
    const finalSnapshot = frames[frames.length - 1].canvasStateSnapshot;
    const visitedValues = (finalSnapshot.visitedIds ?? []).map(id => {
      const node = (finalSnapshot.treeNodes ?? []).find(n => n.id === id);
      return node?.value;
    });
    expect(visitedValues).toEqual([1, 3, 4, 6, 7, 8, 10, 13, 14]);
  });

  it('quick-sort frames expose low/high/p for the partition overlay', () => {
    const demo = getAlgoDemo('quick-sort')!;
    const options = AlgoInputParser.parse(demo.defaultInput, demo.inputKind);
    const frames = CompilerStepExecutor.compileAlgorithm(demo.code, [], { ...options, fallbackToRegex: false });
    const allVarNames = new Set<string>();
    for (const f of frames) {
      for (const k of Object.keys(f.canvasStateSnapshot.loopVariables ?? {})) allVarNames.add(k);
    }
    expect(allVarNames.has('low')).toBe(true);
    expect(allVarNames.has('high')).toBe(true);
    expect(allVarNames.has('p')).toBe(true);
  });

  it('heap-sort frames expose heap size n for the heap tree overlay', () => {
    const demo = getAlgoDemo('heap-sort')!;
    const options = AlgoInputParser.parse(demo.defaultInput, demo.inputKind);
    const frames = CompilerStepExecutor.compileAlgorithm(demo.code, [], { ...options, fallbackToRegex: false });
    const allVarNames = new Set<string>();
    for (const f of frames) {
      for (const k of Object.keys(f.canvasStateSnapshot.loopVariables ?? {})) allVarNames.add(k);
    }
    expect(allVarNames.has('n')).toBe(true);
  });

  it('counting-sort feeds real data to the tier-3 layout', () => {
    const demo = getAlgoDemo('counting-sort')!;
    const options = AlgoInputParser.parse(demo.defaultInput, demo.inputKind);
    const frames = CompilerStepExecutor.compileAlgorithm(demo.code, [], { ...options, fallbackToRegex: false });
    const snapshots = frames.map(f => f.canvasStateSnapshot);
    const hasCounts = snapshots.some(s => (s.countArray?.length ?? 0) > 0);
    const hasOutputs = snapshots.some(s => (s.outputArray ?? []).some(v => v !== null));
    const hasPhase = snapshots.some(s => s.countingStep !== undefined);
    expect(hasCounts).toBe(true);
    expect(hasOutputs).toBe(true);
    expect(hasPhase).toBe(true);
  });

  it('radix-sort feeds real bucket data to the tier-3 layout', () => {
    const demo = getAlgoDemo('radix-sort')!;
    const options = AlgoInputParser.parse(demo.defaultInput, demo.inputKind);
    const frames = CompilerStepExecutor.compileAlgorithm(demo.code, [], { ...options, fallbackToRegex: false });
    const snapshots = frames.map(f => f.canvasStateSnapshot);
    const hasBuckets = snapshots.some(s => (s.radixBuckets?.flat().length ?? 0) > 0);
    expect(hasBuckets).toBe(true);
  });

  it('bucket-sort feeds real bucket data and rejects out-of-range input', () => {
    const demo = getAlgoDemo('bucket-sort')!;
    const goodOptions = AlgoInputParser.parse(demo.defaultInput, demo.inputKind);
    const frames = CompilerStepExecutor.compileAlgorithm(demo.code, [], { ...goodOptions, fallbackToRegex: false });
    const snapshots = frames.map(f => f.canvasStateSnapshot);
    expect(snapshots.some(s => (s.bucketSortBuckets?.flat().length ?? 0) > 0)).toBe(true);

    const badOptions = AlgoInputParser.parse('5, 3, 8, 1', demo.inputKind);
    expect(() =>
      CompilerStepExecutor.compileAlgorithm(demo.code, [], { ...badOptions, fallbackToRegex: false })
    ).toThrow(/\[0, 1\)/);
  });

  it('binary-search rejects unsorted input with a clear error', () => {
    const demo = getAlgoDemo('binary-search')!;
    const options = AlgoInputParser.parse('50, 10, 90, 30, 70', demo.inputKind);
    expect(() =>
      CompilerStepExecutor.compileAlgorithm(demo.code, [], { ...options, fallbackToRegex: false })
    ).toThrow(/mảng đã sắp xếp/);
  });

  it('undirected graph demos traverse edges in both directions', () => {
    const demo = getAlgoDemo('bfs')!;
    const options = AlgoInputParser.parse('B-A:4', demo.inputKind);
    const frames = CompilerStepExecutor.compileAlgorithm(demo.code, [], { ...options, fallbackToRegex: false });
    const finalSnapshot = frames[frames.length - 1].canvasStateSnapshot;
    expect(finalSnapshot.visitedIds).toContain('A');
    expect(finalSnapshot.visitedIds).toContain('B');
  });

  it('merge-sort feeds divide/merge state for the dedicated merge engine', () => {
    const demo = getAlgoDemo('merge-sort')!;
    const options = AlgoInputParser.parse(demo.defaultInput, demo.inputKind);
    const frames = CompilerStepExecutor.compileAlgorithm(demo.code, [], { ...options, fallbackToRegex: false });

    const mergeFrames = frames.filter(f => f.canvasStateSnapshot.mergeState !== undefined);
    expect(mergeFrames.length).toBeGreaterThan(0);

    // Pha divide: left+right = toàn bộ segment, output rỗng
    const divideFrames = mergeFrames.filter(f => f.canvasStateSnapshot.mergeState?.phase === 'divide');
    expect(divideFrames.length).toBeGreaterThan(0);
    for (const f of divideFrames) {
      const st = f.canvasStateSnapshot.mergeState!;
      expect(st.left.length + st.right.length).toBe(st.high - st.low + 1);
      expect(st.output.length).toBe(0);
      expect(st.leftIdx).toBe(0);
      expect(st.rightIdx).toBe(0);
    }

    // Pha merge: output điền dần trong từng segment, con trỏ trong phạm vi hợp lệ
    const mergeF = mergeFrames.filter(f => f.canvasStateSnapshot.mergeState?.phase === 'merge');
    expect(mergeF.length).toBeGreaterThan(0);
    const lastOutBySegment = new Map<string, number>();
    for (const f of mergeF) {
      const st = f.canvasStateSnapshot.mergeState!;
      const segKey = `${st.low}-${st.high}-${st.width}`;
      const lastOut = lastOutBySegment.get(segKey) ?? 0;
      expect(st.output.length).toBeGreaterThanOrEqual(lastOut);
      lastOutBySegment.set(segKey, st.output.length);
      expect(st.leftIdx).toBeGreaterThanOrEqual(0);
      expect(st.leftIdx).toBeLessThanOrEqual(st.left.length);
      expect(st.rightIdx).toBeGreaterThanOrEqual(0);
      expect(st.rightIdx).toBeLessThanOrEqual(st.right.length);
      for (const v of st.output) {
        expect(v).not.toBeNull();
      }
    }

    // Frame cuối: toàn bộ segment đã điền vào output
    const finalMerge = mergeF[mergeF.length - 1].canvasStateSnapshot.mergeState!;
    expect(finalMerge.output.length).toBe(finalMerge.high - finalMerge.low + 1);
  });

  it('heap-sort feeds build/extract state for the dedicated heap engine', () => {
    const demo = getAlgoDemo('heap-sort')!;
    const options = AlgoInputParser.parse(demo.defaultInput, demo.inputKind);
    const frames = CompilerStepExecutor.compileAlgorithm(demo.code, [], { ...options, fallbackToRegex: false });

    const heapFrames = frames.filter(f => f.canvasStateSnapshot.heapState !== undefined);
    expect(heapFrames.length).toBeGreaterThan(0);

    const states = heapFrames.map(f => f.canvasStateSnapshot.heapState!);
    const first = states[0];
    expect(first.phase).toBe('build');
    expect(first.heapSize).toBe(6); // toàn bộ mảng khi xây đống

    // Có cả pha extract và heapSize giảm dần về 1
    const extractStates = states.filter(s => s.phase === 'extract');
    expect(extractStates.length).toBeGreaterThan(0);
    const sizes = extractStates.map(s => s.heapSize);
    for (let i = 1; i < sizes.length; i++) {
      expect(sizes[i]).toBeLessThanOrEqual(sizes[i - 1]);
    }
    expect(sizes[sizes.length - 1]).toBe(1);

    // activeIdx luôn trong heap; siftPath kết thúc tại activeIdx và nằm trong heap
    for (const s of states) {
      expect(s.activeIdx).toBeGreaterThanOrEqual(0);
      expect(s.activeIdx).toBeLessThan(s.heapSize);
      if (s.siftPath && s.siftPath.length > 0) {
        expect(s.siftPath[s.siftPath.length - 1]).toBe(s.activeIdx);
        for (const idx of s.siftPath) {
          expect(idx).toBeLessThan(s.heapSize);
        }
      }
    }
    // Sift path được đánh dấu trong pha build
    expect(states.some(s => (s.siftPath?.length ?? 0) > 1)).toBe(true);

    // Frame cuối: mảng đã sort đầy đủ
    const finalArray = frames[frames.length - 1].canvasStateSnapshot.array;
    const sorted = [...finalArray].sort((a, b) => a - b);
    expect(finalArray).toEqual(sorted);
  });

  it('generateDemoInput produces valid input per demo kind', () => {
    // bucket-sort: giá trị trong [0, 1)
    const bucket = generateDemoInput('bucket-sort');
    for (const v of AlgoInputParser.parse(bucket, 'array').array ?? []) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
    // binary-search: mảng đã sắp xếp
    const bsValues = AlgoInputParser.parse(generateDemoInput('binary-search'), 'array').array ?? [];
    const sorted = [...bsValues].sort((a, b) => a - b);
    expect(bsValues).toEqual(sorted);
    // graph: parse hợp lệ, có node
    const graph = AlgoInputParser.parse(generateDemoInput('bfs'), 'graph');
    expect(graph.graphNodes?.length).toBeGreaterThanOrEqual(4);
    // tree: parse thành BST
    const tree = AlgoInputParser.parse(generateDemoInput('bst'), 'tree');
    expect(tree.treeNodes?.length).toBeGreaterThanOrEqual(6);
  });
});
