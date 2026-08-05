// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { setActivePinia, createPinia } from 'pinia';
import { useAlgoPlaygroundStore } from '../store/useAlgoPlaygroundStore';
import { compileInWorker } from '../../../core/compileWorker';
import { AlgoInputParser } from '../engine/AlgoInputParser';
import { translateCompileError } from '../engine/compileErrorTranslator';
import type { PlaybackFrame } from '../../../core/CompilerStepExecutor';

// Mock Web Worker: chạy compile đồng bộ trong test thay vì worker thật
vi.mock('../../../core/compileWorker', async () => {
  const { CompilerStepExecutor } = await import('../../../core/CompilerStepExecutor');
  return {
    compileInWorker: vi.fn(async (
      sourceCode: string,
      initialArray: number[],
      options?: { array?: number[]; fallbackToRegex?: boolean },
    ) => {
      return CompilerStepExecutor.compileAlgorithm(sourceCode, initialArray, {
        ...options,
        fallbackToRegex: false,
      });
    }),
  };
});

describe('playgroundP0Tests — US-AP-006 (P0): Bấm Chạy sinh frame', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('US-AP-006: run() đặt isCompiling=true rồi false, sinh frames thành công', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();

    // Sau khi compile xong: isCompiling phải trở về false
    expect(store.isCompiling).toBe(false);
    // Frames được sinh
    expect(store.totalFrames).toBeGreaterThan(0);
    // Reset về bước đầu tiên
    expect(store.currentIndex).toBe(0);
    // Không có lỗi compile
    expect(store.compileError).toBeNull();
    // Render mode phải là array cho bubble-sort
    expect(store.renderMode).toBe('array');
  });

  it('US-AP-006: isCompiling=true trong khi worker đang biên dịch', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');

    let resolvePromise!: (frames: PlaybackFrame[]) => void;
    vi.mocked(compileInWorker).mockImplementationOnce(
      () => new Promise<PlaybackFrame[]>((res) => { resolvePromise = res; }),
    );

    store.run();
    await nextTick();
    // Đang biên dịch: isCompiling = true
    expect(store.isCompiling).toBe(true);

    resolvePromise([]);
    await nextTick();
    // Hoàn tất: isCompiling = false
    expect(store.isCompiling).toBe(false);
    expect(store.totalFrames).toBe(0);
  });

  it('US-AP-006: run() trên graph demo → renderMode=graph', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('dijkstra');
    await store.run();

    expect(store.renderMode).toBe('graph');
    expect(store.isCompiling).toBe(false);
    expect(store.totalFrames).toBeGreaterThan(0);
  });

  it('US-AP-006: run() lỗi biên dịch → compileError != null, frames bị xóa', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    store.setCode('this is not valid js (');
    await store.run();

    expect(store.compileError).not.toBeNull();
    expect(store.totalFrames).toBe(0);
    expect(store.isCompiling).toBe(false);
  });
});

describe('playgroundP0Tests — US-AP-015 (P0): VCR Step Forward/Backward', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('US-AP-015: stepNext tăng currentIndex', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();

    expect(store.currentIndex).toBe(0);
    store.stepNext();
    expect(store.currentIndex).toBe(1);
  });

  it('US-AP-015: stepPrev giảm currentIndex (clamp ≥ 0)', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();

    store.stepNext();
    store.stepNext();
    expect(store.currentIndex).toBe(2);

    store.stepPrev();
    expect(store.currentIndex).toBe(1);

    // Step về 0 rừ thử step nữa → vẫn 0
    store.stepPrev();
    store.stepPrev();
    store.stepPrev();
    expect(store.currentIndex).toBe(0);
  });

  it('US-AP-015: stepNext ở cuối timeline → isPlaying = false', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();

    const lastIdx = store.totalFrames - 1;
    store.jumpToFrame(lastIdx);
    store.isPlaying = true;
    store.stepNext();
    expect(store.isPlaying).toBe(false);
  });

  it('US-AP-015: jumpToFrame clamp đúng giới hạn', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();

    const total = store.totalFrames;

    store.jumpToFrame(total - 1);
    expect(store.currentIndex).toBe(total - 1);

    store.jumpToFrame(9999);
    expect(store.currentIndex).toBe(total - 1);

    store.jumpToFrame(-5);
    expect(store.currentIndex).toBe(total - 1);
  });

  it('US-AP-015: reset() về bước 0 và dừng playback', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();

    store.jumpToFrame(5);
    store.isPlaying = true;
    store.reset();

    expect(store.currentIndex).toBe(0);
    expect(store.isPlaying).toBe(false);
  });
});

describe('playgroundP0Tests — US-AP-003 (P0): Nhập dữ liệu hợp lệ', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('US-AP-003: inputRaw "5,3,8,4,2" → inputValidation.valid = true', () => {
    const store = useAlgoPlaygroundStore();
    store.setInput('5,3,8,4,2');

    expect(store.inputValidation.valid).toBe(true);
    expect(store.inputValidation.message).toBe('5 phần tử');
  });

  it('US-AP-003: inputRaw với khoảng trắng thừa vẫn parse đúng', () => {
    const store = useAlgoPlaygroundStore();
    store.setInput('  5 , 3 , 8 , 4 , 2  ');

    expect(store.inputValidation.valid).toBe(true);
    expect(store.inputValidation.message).toBe('5 phần tử');
  });

  it('US-AP-003: inputRaw rỗng → valid=true với message "Input trống"', () => {
    const store = useAlgoPlaygroundStore();
    store.setInput('');

    expect(store.inputValidation.valid).toBe(true);
    expect(store.inputValidation.message).toBe('Input trống');
  });
});

describe('playgroundP0Tests — US-AP-004 (P0): Validation input lỗi', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('US-AP-004: inputRaw "abc" → valid = false', () => {
    const store = useAlgoPlaygroundStore();
    store.setInput('abc');

    expect(store.inputValidation.valid).toBe(false);
    expect(store.inputValidation.message).toContain('không phải là số hợp lệ');
  });

  it('US-AP-004: inputRaw "5, abc, 3" → valid = false', () => {
    const store = useAlgoPlaygroundStore();
    store.setInput('5, abc, 3');

    expect(store.inputValidation.valid).toBe(false);
    expect(store.inputValidation.message).toContain('không phải là số hợp lệ');
  });

  it('US-AP-004: inputRaw "1,2,xyz" → valid = false', () => {
    const store = useAlgoPlaygroundStore();
    store.setInput('1,2,xyz');

    expect(store.inputValidation.valid).toBe(false);
  });
});

describe('playgroundP0Tests — US-AP-034 (P1): Validate max 100 phần tử', () => {
  it('US-AP-034: từ chối mảng > 100 phần tử', () => {
    const input = Array.from({ length: 101 }, (_, i) => i).join(', ');
    expect(() => AlgoInputParser.parseNumberArray(input)).toThrow(/tối đa 100 phần tử/);
  });

  it('US-AP-034: chấp nhận mảng đúng 100 phần tử', () => {
    const input = Array.from({ length: 100 }, (_, i) => i).join(', ');
    const result = AlgoInputParser.parseNumberArray(input);
    expect(result).toHaveLength(100);
  });

  it('US-AP-034: store inputValidation.tự động reject > 100', () => {
    setActivePinia(createPinia());
    localStorage.clear();
    const store = useAlgoPlaygroundStore();
    const input = Array.from({ length: 101 }, (_, i) => i).join(', ');
    store.setInput(input);

    expect(store.inputValidation.valid).toBe(false);
    expect(store.inputValidation.message).toContain('tối đa 100');
  });
});

describe('playgroundP0Tests — US-AP-035 (P1): Parse cây BST', () => {
  it('US-AP-035: parse mảng → tree nodes đúng cấu trúc BST', () => {
    const nodes = AlgoInputParser.buildTreeFromArray([8, 3, 10, 1, 6]);

    expect(nodes).toHaveLength(5);
    const root = nodes[0];
    expect(root.value).toBe(8);
    expect(root.leftId).toBe('3');
    expect(root.rightId).toBe('10');

    const left = nodes.find(n => n.id === '3');
    expect(left?.leftId).toBe('1');
    expect(left?.rightId).toBe('6');
  });

  it('US-AP-035: tree input qua store parse được', () => {
    setActivePinia(createPinia());
    localStorage.clear();
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bst-traversal');
    store.setInput('5,3,8,4,2');

    expect(store.inputValidation.valid).toBe(true);
    expect(store.inputValidation.message).toBe('5 phần tử');
  });

  it('US-AP-035: node trùng giátrị được đánh số thứ tự', () => {
    const nodes = AlgoInputParser.buildTreeFromArray([5, 5, 3]);
    const root = nodes[0];
    expect(root.value).toBe(5);
    expect(root.rightId).toBe('5_2');
    expect(root.leftId).toBe('3');
  });
});

describe('playgroundP0Tests — US-AP-036 (P1): Parse đồ thị', () => {
  it('US-AP-036: parse "A-B:10" → graph với 2 node, 1 edge', () => {
    const { graphNodes, graphEdges } = AlgoInputParser.buildGraphFromText('A-B:10');

    expect(graphNodes).toHaveLength(2);
    expect(graphEdges).toHaveLength(1);
    expect(graphEdges[0]).toEqual({ from: 'A', to: 'B', weight: 10, directed: false });
    expect(graphNodes.map(n => n.id)).toEqual(['A', 'B']);
  });

  it('US-AP-036: parse đồ thị nhiều cạnh', () => {
    const { graphNodes, graphEdges } = AlgoInputParser.buildGraphFromText('A-B:4, A-C:2, B-C:1');

    expect(graphEdges).toEqual([
      { from: 'A', to: 'B', weight: 4, directed: false },
      { from: 'A', to: 'C', weight: 2, directed: false },
      { from: 'B', to: 'C', weight: 1, directed: false },
    ]);
    expect(graphNodes.map(n => n.id)).toEqual(['A', 'B', 'C']);
  });

  it('US-AP-036: graph input qua store parse được', () => {
    setActivePinia(createPinia());
    localStorage.clear();
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bfs');
    store.setInput('A-B:10');

    expect(store.inputValidation.valid).toBe(true);
    expect(store.inputValidation.message).toBe('2 phần tử');
  });

  it('US-AP-036: parse cạnh có hướng A>B', () => {
    const { graphEdges } = AlgoInputParser.buildGraphFromText('A>B');
    expect(graphEdges[0].directed).toBe(true);
    expect(graphEdges[0].from).toBe('A');
    expect(graphEdges[0].to).toBe('B');
  });
});

describe('playgroundP0Tests — US-AP-011 (P1): Xác nhận compile error translator', () => {
  it('US-AP-011: SyntaxError → message TV với gợi ý', () => {
    const out = translateCompileError('Unexpected token \'else\'');
    expect(out).toContain('Lỗi cú pháp JavaScript');
    expect(out).toContain('Unexpected token');
  });

  it('US-AP-011: Vượt quá giới hạn thực thi → message TV', () => {
    const out = translateCompileError('Vượt quá giới hạn thực thi (tối đa 10000 bước).');
    expect(out).toContain('10.000 bước');
  });

  it('US-AP-011: Cannot read undefined → message TV', () => {
    const out = translateCompileError("TypeError: Cannot read properties of undefined (reading 'push')");
    expect(out).toContain('undefined');
    expect(out).toContain('chỉ số mảng');
  });

  it('US-AP-011: is not a function → message TV', () => {
    const out = translateCompileError('foo is not a function');
    expect(out).toContain('Gọi hàm không tồn tại');
  });

  it('US-AP-011: has already been declared → message TV', () => {
    const out = translateCompileError("Identifier 'x' has already been declared");
    expect(out).toContain('Khai báo biến trùng tên');
  });

  it('US-AP-011: validation message TV giữ nguyên', () => {
    const msg = "Giá trị 'abc' không phải là số hợp lệ!";
    expect(translateCompileError(msg)).toBe(msg);
  });
});
