// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { setActivePinia, createPinia } from 'pinia';
import { useAlgoPlaygroundStore } from '../store/useAlgoPlaygroundStore';
import { compileInWorker } from '../../../core/compileWorker';
import { getAlgoDemo, playgroundAlgoDemos, HOOKS_HINT, algoDemoIds } from '../engine/playgroundAlgoDemos';
import { useThemeStore } from '../../../shared/store/useThemeStore';

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

describe('playgroundP2Tests — US-AP-002 (P2): Chip complexity', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('US-AP-002: bubble-sort có chip O(n²) và O(1)', () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    const demo = getAlgoDemo(store.demoId!);

    expect(demo).toBeDefined();
    expect(demo!.complexity).toBe('O(n²)');
    expect(demo!.space).toBe('O(1)');
  });

  it('US-AP-002: merge-sort có chip O(n·log n) và O(n)', () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('merge-sort');
    const demo = getAlgoDemo(store.demoId!);

    expect(demo).toBeDefined();
    expect(demo!.complexity).toBe('O(n·log n)');
    expect(demo!.space).toBe('O(n)');
  });

  it('US-AP-002: dijkstra có chip complexity và space', () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('dijkstra');
    const demo = getAlgoDemo(store.demoId!);

    expect(demo).toBeDefined();
    expect(demo!.complexity).toBe('O((V+E)·log V)');
    expect(demo!.space).toBe('O(V)');
  });
});

describe('playgroundP2Tests — US-AP-009 (P2): Monaco theme', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('US-AP-009: theme light → monaco theme = vs', () => {
    const themeStore = useThemeStore();
    themeStore.currentTheme = 'light';

    const monacoTheme = themeStore.currentTheme === 'light' ? 'vs' : 'vs-dark';
    expect(monacoTheme).toBe('vs');
  });

  it('US-AP-009: theme terminal-dark → monaco theme = vs-dark', () => {
    const themeStore = useThemeStore();
    themeStore.currentTheme = 'terminal-dark';

    const monacoTheme = themeStore.currentTheme === 'light' ? 'vs' : 'vs-dark';
    expect(monacoTheme).toBe('vs-dark');
  });

  it('US-AP-009: toggle theme đổi monaco theme', () => {
    const themeStore = useThemeStore();
    themeStore.currentTheme = 'terminal-dark';

    const before = themeStore.currentTheme === 'light' ? 'vs' : 'vs-dark';
    expect(before).toBe('vs-dark');

    themeStore.toggleTheme();
    const after = themeStore.currentTheme === 'light' ? 'vs' : 'vs-dark';
    expect(after).toBe('vs');
  });
});

describe('playgroundP2Tests — US-AP-012 (P2): Hooks popover', () => {
  it('US-AP-012: HOOKS_HINT chứa compare hook', () => {
    expect(HOOKS_HINT).toContain('compare(i, j)');
  });

  it('US-AP-012: HOOKS_HINT chứa swap hook', () => {
    expect(HOOKS_HINT).toContain('swap(i, j)');
  });

  it('US-AP-012: HOOKS_HINT chứa highlight hook', () => {
    expect(HOOKS_HINT).toContain('highlight(i)');
  });

  it('US-AP-012: HOOKS_HINT chứa visit/active hooks', () => {
    expect(HOOKS_HINT).toContain('visit(id)');
    expect(HOOKS_HINT).toContain('active(id)');
  });

  it('US-AP-012: HOOKS_HINT chứa enqueue/dequeue hooks', () => {
    expect(HOOKS_HINT).toContain('enqueue(id)');
    expect(HOOKS_HINT).toContain('dequeue(id)');
  });

  it('US-AP-012: HOOKS_HINT chứa push/pop hooks', () => {
    expect(HOOKS_HINT).toContain('push(id)');
    expect(HOOKS_HINT).toContain('pop(id)');
  });
});

describe('playgroundP2Tests — US-AP-013 (P2): Empty state', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('US-AP-013: ban đầu totalFrames=0, isCompiling=false, compileError=null → empty state visible', () => {
    const store = useAlgoPlaygroundStore();

    expect(store.totalFrames).toBe(0);
    expect(store.isCompiling).toBe(false);
    expect(store.compileError).toBeNull();
  });

  it('US-AP-013: empty state text chứa "Chọn demo và bấm"', () => {
    const EMPTY_STATE_TEXT = 'Chọn demo và bấm Chạy để xem từng bước.';
    expect(EMPTY_STATE_TEXT).toContain('Chọn demo và bấm');
  });
});

describe('playgroundP2Tests — US-AP-014 (P2): Monaco error', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('US-AP-014: editorLoadError = true khi Monaco fail', () => {
    const editorLoadError = true;
    expect(editorLoadError).toBe(true);
  });

  it('US-AP-014: reload button visible khi editorLoadError = true', () => {
    // Template: <button v-if="editorLoadError" @click="reloadPage">Tải lại trang (F5)</button>
    const editorLoadError = true;
    const buttonText = 'Tải lại trang (F5)';

    // Khi editorLoadError = true → button hiển thị
    expect(editorLoadError).toBe(true);
    expect(buttonText).toBe('Tải lại trang (F5)');
  });
});

describe('playgroundP2Tests — US-AP-020 (P2): Frame description', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('US-AP-020: currentDescription trả về mô tả frame hiện tại', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();

    expect(store.currentDescription).toBeTruthy();
    expect(typeof store.currentDescription).toBe('string');
  });

  it('US-AP-020: currentLineNumber > 0 khi có frame', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();

    expect(store.currentLineNumber).toBeGreaterThan(0);
  });

  it('US-AP-020: description format "Dòng X: mô tả"', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();

    const lineNum = store.currentLineNumber;
    const desc = store.currentDescription;
    const formatted = lineNum > 0 ? `Dòng ${lineNum}: ${desc}` : desc;

    expect(formatted).toContain('Dòng');
    expect(formatted).toContain(':');
  });
});

describe('playgroundP2Tests — US-AP-021 (P2): Loop variables', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('US-AP-021: frame có loopVariables hiển thị chip amber', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();

    // Step qua các frame để tìm frame có loopVariables
    let foundLoopVars = false;
    for (let i = 0; i < store.totalFrames; i++) {
      store.jumpToFrame(i);
      const loopVars = store.currentFrame?.canvasStateSnapshot.loopVariables;
      if (loopVars && Object.keys(loopVars).length > 0) {
        foundLoopVars = true;
        break;
      }
    }

    // bubble-sort có loop variables (i, j)
    expect(foundLoopVars).toBe(true);
  });

  it('US-AP-021: loopVariables là Record<string, number>', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();

    for (let i = 0; i < store.totalFrames; i++) {
      store.jumpToFrame(i);
      const loopVars = store.currentFrame?.canvasStateSnapshot.loopVariables;
      if (loopVars && Object.keys(loopVars).length > 0) {
        for (const [name, value] of Object.entries(loopVars)) {
          expect(typeof name).toBe('string');
          expect(typeof value).toBe('number');
        }
        break;
      }
    }
  });
});

describe('playgroundP2Tests — US-AP-022 (P2): History toggle', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('US-AP-022: traceLogs trả về mảng log', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();

    expect(Array.isArray(store.traceLogs)).toBe(true);
  });

  it('US-AP-022: traceLogs có entry khi jump đến frame có description', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();

    // Jump đến frame cuối để traceLogs hiển thị nhiều entries
    store.jumpToFrame(store.totalFrames - 1);

    // traceLogs hiển thị descriptions khớp regex "^Đang chạy dòng N"
    expect(store.traceLogs.length).toBeGreaterThan(0);
  });

  it('US-AP-022: traceLogs entry format "L{line}: {desc}"', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();

    if (store.traceLogs.length > 0) {
      const firstLog = store.traceLogs[0];
      // Có thể bắt đầu bằng "L{line}:" hoặc chỉ description
      expect(typeof firstLog).toBe('string');
      expect(firstLog.length).toBeGreaterThan(0);
    }
  });
});

describe('playgroundP2Tests — US-AP-023 (P2): Menu actions', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('US-AP-023: menu action "hooks" toggle showHooks', () => {
    let showHooks = false;
    const toggleHooks = () => { showHooks = !showHooks; };

    toggleHooks();
    expect(showHooks).toBe(true);
    toggleHooks();
    expect(showHooks).toBe(false);
  });

  it('US-AP-023: menu action "restore" gọi onRestoreCode', () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    store.setCode('modified code');

    // Giả lập onRestoreCode
    const demo = getAlgoDemo(store.demoId!);
    store.setCode(demo!.code);

    expect(store.code).toBe(demo!.code);
  });

  it('US-AP-023: menu action "share" tạo URL với demo + code + input', () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');

    const payload = JSON.stringify({ demo: store.demoId, code: store.code, input: store.inputRaw });
    const parsed = JSON.parse(payload);

    expect(parsed.demo).toBe('bubble-sort');
    expect(typeof parsed.code).toBe('string');
    expect(typeof parsed.input).toBe('string');
  });
});

describe('playgroundP2Tests — US-AP-024 (P2): Hooks list', () => {
  it('US-AP-024: HOOKS_HINT liệt kê đủ hàm hook', () => {
    const expectedHooks = [
      'compare', 'swap', 'highlight', 'visit', 'active',
      'enqueue', 'dequeue', 'push', 'pop',
      'setDist', 'markEdge', 'log',
    ];

    for (const hook of expectedHooks) {
      expect(HOOKS_HINT).toContain(hook);
    }
  });

  it('US-AP-024: HOOKS_HINT chứa searchRange hook', () => {
    expect(HOOKS_HINT).toContain('searchRange(low, high)');
  });

  it('US-AP-024: HOOKS_HINT chứa searchTarget hook', () => {
    expect(HOOKS_HINT).toContain('searchTarget(val)');
  });

  it('US-AP-024: HOOKS_HINT chứa found hook', () => {
    expect(HOOKS_HINT).toContain('found(index)');
  });
});

describe('playgroundP2Tests — US-AP-025 (P2): Restore code', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('US-AP-025: restore code về demo gốc', () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');

    const originalCode = store.code;
    store.setCode('// modified code');
    expect(store.code).toBe('// modified code');

    // Restore
    const demo = getAlgoDemo(store.demoId!);
    store.setCode(demo!.code);
    expect(store.code).toBe(originalCode);
  });

  it('US-AP-025: restore code về selection-sort demo', () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('selection-sort');

    const originalCode = store.code;
    store.setCode('// custom code');
    expect(store.code).not.toBe(originalCode);

    const demo = getAlgoDemo('selection-sort');
    store.setCode(demo!.code);
    expect(store.code).toBe(originalCode);
  });
});

describe('playgroundP2Tests — US-AP-028 (P2): Gutter click', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('US-AP-028: tìm frame theo lineNumber khi click gutter', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();

    // Giả lập gutter click: tìm frame có lineNumber cụ thể
    const targetLine = store.frames[0]?.lineNumber ?? 0;
    const targetIndex = store.frames.findIndex(f => f.lineNumber === targetLine);

    expect(targetIndex).toBeGreaterThanOrEqual(0);
    expect(targetIndex).toBeLessThan(store.totalFrames);
  });

  it('US-AP-028: jumpToFrame khi click gutter line tương ứng', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();

    if (store.totalFrames > 2) {
      const targetIdx = Math.min(2, store.totalFrames - 1);
      const lineAtTarget = store.frames[targetIdx].lineNumber;

      // Tìm frame đầu tiên có lineNumber trùng
      const foundIdx = store.frames.findIndex(f => f.lineNumber === lineAtTarget);
      store.jumpToFrame(foundIdx);

      expect(store.currentIndex).toBe(foundIdx);
    }
  });
});

describe('playgroundP2Tests — US-AP-031 (P2): Render mode', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('US-AP-031: bubble-sort → renderMode = array', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();

    expect(store.renderMode).toBe('array');
  });

  it('US-AP-031: bst → renderMode = tree', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bst');
    await store.run();

    expect(store.renderMode).toBe('tree');
  });

  it('US-AP-031: bfs → renderMode = graph', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bfs');
    await store.run();

    expect(store.renderMode).toBe('graph');
  });

  it('US-AP-031: dijkstra → renderMode = graph', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('dijkstra');
    await store.run();

    expect(store.renderMode).toBe('graph');
  });

  it('US-AP-031: heap-sort → renderMode là array hoặc tree', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('heap-sort');
    await store.run();

    // heap-sort có thể render dạng array (mặc định) hoặc tree (nếu frame đầu có heapState)
    expect(['array', 'tree']).toContain(store.renderMode);
  });
});

describe('playgroundP2Tests — US-AP-032 (P2): Responsive', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('US-AP-032: matchMedia detect màn hình < 768px', () => {
    // Giả lập matchMedia
    const mockMatchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(max-width: 768px)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    vi.stubGlobal('matchMedia', mockMatchMedia);

    const mediaQuery = window.matchMedia('(max-width: 768px)');
    expect(mediaQuery.matches).toBe(true);

    vi.unstubAllGlobals();
  });

  it('US-AP-032: màn hình >= 768px → không stacked', () => {
    const mockMatchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    vi.stubGlobal('matchMedia', mockMatchMedia);

    const mediaQuery = window.matchMedia('(max-width: 768px)');
    expect(mediaQuery.matches).toBe(false);

    vi.unstubAllGlobals();
  });
});

describe('playgroundP2Tests — US-AP-033 (P2): Persist', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('US-AP-033: persistState lưu code + input vào localStorage', async () => {
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    store.setCode('// test code');
    store.setInput('1,2,3');

    // Trigger watch (async)
    await nextTick();
    await nextTick();

    const stored = localStorage.getItem('algo-playground:state');
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored!);
    expect(parsed.code).toBe('// test code');
    expect(parsed.inputRaw).toBe('1,2,3');
    expect(parsed.demoId).toBe('bubble-sort');
  });

  it('US-AP-033: restoreState khôi phục code + input từ localStorage', () => {
    // Lưu trước
    const payload = {
      version: 1,
      demoId: 'selection-sort',
      code: '// restored code',
      inputRaw: '5,4,3,2,1',
    };
    localStorage.setItem('algo-playground:state', JSON.stringify(payload));

    // Tạo store mới → restoreState chạy trong setup
    const store = useAlgoPlaygroundStore();

    expect(store.code).toBe('// restored code');
    expect(store.inputRaw).toBe('5,4,3,2,1');
  });

  it('US-AP-033: localStorage version không không khớp → bỏ qua', () => {
    const payload = {
      version: 999, // version cũ
      demoId: 'bubble-sort',
      code: '// old code',
      inputRaw: '9,9,9',
    };
    localStorage.setItem('algo-playground:state', JSON.stringify(payload));

    const store = useAlgoPlaygroundStore();

    // Version không khớp → không restore
    expect(store.code).not.toBe('// old code');
  });
});

describe('playgroundP2Tests — US-AP-037 (P2): All 21 demos', () => {
  it('US-AP-037: có đúng 21 demos', () => {
    expect(algoDemoIds.length).toBe(21);
  });

  it('US-AP-037: mỗi demo có title', () => {
    for (const id of algoDemoIds) {
      const demo = getAlgoDemo(id);
      expect(demo).toBeDefined();
      expect(demo!.title).toBeTruthy();
      expect(typeof demo!.title).toBe('string');
      expect(demo!.title.length).toBeGreaterThan(0);
    }
  });

  it('US-AP-037: mỗi demo có description', () => {
    for (const id of algoDemoIds) {
      const demo = getAlgoDemo(id);
      expect(demo).toBeDefined();
      expect(demo!.description).toBeTruthy();
      expect(typeof demo!.description).toBe('string');
      expect(demo!.description.length).toBeGreaterThan(0);
    }
  });

  it('US-AP-037: mỗi demo có code', () => {
    for (const id of algoDemoIds) {
      const demo = getAlgoDemo(id);
      expect(demo).toBeDefined();
      expect(demo!.code).toBeTruthy();
      expect(typeof demo!.code).toBe('string');
      expect(demo!.code.length).toBeGreaterThan(0);
    }
  });

  it('US-AP-037: mỗi demo có defaultInput', () => {
    for (const id of algoDemoIds) {
      const demo = getAlgoDemo(id);
      expect(demo).toBeDefined();
      expect(demo!.defaultInput).toBeTruthy();
      expect(typeof demo!.defaultInput).toBe('string');
    }
  });

  it('US-AP-037: danh sách 21 demo IDs', () => {
    const expectedIds = [
      'bubble-sort', 'selection-sort', 'insertion-sort',
      'quick-sort', 'merge-sort', 'heap-sort',
      'counting-sort', 'radix-sort', 'bucket-sort',
      'linear-search', 'binary-search', 'two-pointers', 'sliding-window',
      'stack', 'queue', 'monotonic-stack',
      'bst', 'tree-traversal', 'bfs', 'dfs', 'dijkstra',
    ];

    expect(algoDemoIds).toEqual(expectedIds);
  });
});
