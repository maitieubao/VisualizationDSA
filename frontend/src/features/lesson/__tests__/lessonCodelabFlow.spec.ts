import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  executeCodelab,
  runCodelabTask,
  normalizeOutput,
  type CodelabRunResult,
} from '../utils/codelabExecutor';
import type { TestCase } from '../types/lesson.types';

const BUBBLE_TASK: TestCase[] = [
  { input: '[[5, 2, 9, 1, 5, 6]]', expectedOutput: '[1, 2, 5, 5, 6, 9]' },
  { input: '[[10, -2, 4, 0]]', expectedOutput: '[-2, 0, 4, 10]' },
  { input: '[[]]', expectedOutput: '[]', isHidden: true },
];

const BUBBLE_SOLUTION = `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
    }
  }
  return arr;
}`;

const BUBBLE_WRONG = `function bubbleSort(arr) { return arr; }`;

describe('executeCodelab — chạy code thật', () => {
  it('TC-A4.3: code đúng → 100% testcase PASSED với actual output', () => {
    const result = executeCodelab(BUBBLE_SOLUTION, BUBBLE_TASK, 'bubbleSort');
    expect(result.ok).toBe(true);
    expect(result.results).toHaveLength(3);
    expect(result.results.every(r => r.passed)).toBe(true);
    expect(result.results[0].actualOutput).toBe('[1,2,5,5,6,9]');
  });

  it('TC-A4.4: code sai → testcase FAILED', () => {
    const result = executeCodelab(BUBBLE_WRONG, BUBBLE_TASK, 'bubbleSort');
    expect(result.ok).toBe(true);
    // Case hidden (mảng rỗng) vẫn trùng output — chỉ kiểm tra các case hiển thị phải fail.
    const visible = result.results.filter(r => !r.isHidden);
    expect(visible.every(r => !r.passed)).toBe(true);
  });

  it('TC-A4.8: hidden testcase vẫn được chạy nhưng đánh dấu isHidden', () => {
    const result = executeCodelab(BUBBLE_SOLUTION, BUBBLE_TASK, 'bubbleSort');
    const hidden = result.results.find(r => r.isHidden);
    expect(hidden).toBeDefined();
    expect(hidden!.passed).toBe(true);
    expect(hidden!.input).toBe('[[]]');
  });

  it('TC-A4.3b: multi-arg — binarySearch với mảng + target', () => {
    const code = `function binarySearch(arr, target) {
      let lo = 0, hi = arr.length - 1;
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) lo = mid + 1; else hi = mid - 1;
      }
      return -1;
    }`;
    const result = executeCodelab(code, [
      { input: '[[1, 3, 5, 7, 9], 7]', expectedOutput: '3' },
      { input: '[[1, 3, 5, 7, 9], 4]', expectedOutput: '-1' },
    ], 'binarySearch');
    expect(result.results.map(r => r.passed)).toEqual([true, true]);
  });

  it('TC-A4.3c: đệ quy factorial chạy đúng (minh họa call stack)', () => {
    const code = `function factorial(n) {
      if (n <= 1) return 1;
      return n * factorial(n - 1);
    }`;
    const result = executeCodelab(code, [{ input: '[5]', expectedOutput: '120' }], 'factorial');
    expect(result.results[0].passed).toBe(true);
  });

  it('Lỗi cú pháp → ok=false với thông báo rõ ràng', () => {
    const result = executeCodelab('function bubbleSort( {', BUBBLE_TASK, 'bubbleSort');
    expect(result.ok).toBe(false);
    expect(result.error).toContain('Lỗi biên dịch');
    expect(result.results.every(r => !r.passed)).toBe(true);
  });

  it('Lỗi runtime (throw) → case đó failed kèm error, các case khác vẫn chạy', () => {
    const code = `function bubbleSort(arr) { if (arr.length === 0) throw new Error('empty!'); return arr; }`;
    const result = executeCodelab(code, BUBBLE_TASK, 'bubbleSort');
    const emptyCase = result.results.find(r => r.input === '[[]]');
    expect(emptyCase?.passed).toBe(false);
    expect(emptyCase?.error).toContain('empty!');
  });

  it('normalizeOutput bỏ khoảng trắng để so sánh mảng linh hoạt', () => {
    expect(normalizeOutput('[1, 2, 5]')).toBe('[1,2,5]');
    expect(normalizeOutput('[1,2,5]')).toBe('[1,2,5]');
  });
});

describe('runCodelabTask — worker + timeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('TC-A4.5: code treo → worker bị terminate và trả timedOut', async () => {
    const hungFactory = () => {
      const worker = {
        postMessage: vi.fn(),
        terminate: vi.fn(),
        onmessage: null,
        onerror: null,
      } as unknown as Worker;
      return worker;
    };

    const promise = runCodelabTask('function f() { while(true) {} }', BUBBLE_TASK, 'f', 1000, hungFactory);
    const assertion = promise.then((result) => {
      expect(result.timedOut).toBe(true);
      expect(result.ok).toBe(false);
      expect(result.error).toContain('Hết thời gian');
    });
    await vi.advanceTimersByTimeAsync(1100);
    await assertion;
  });

  it('TC-A4.6/7: worker trả kết quả → resolve kết quả đúng', async () => {
    const factory = () => {
      let requestId = 0;
      const worker = {
        postMessage: vi.fn((payload: { requestId: number }) => {
          requestId = payload.requestId;
          setTimeout(() => {
            (worker as unknown as { onmessage: ((e: MessageEvent) => void) | null }).onmessage?.({
              data: { requestId, ok: true, results: [{ input: '[[]]', expectedOutput: '[]', passed: true, isHidden: true }] },
            } as MessageEvent);
          }, 0);
        }),
        terminate: vi.fn(),
        onmessage: null as ((e: MessageEvent) => void) | null,
        onerror: null as ((e: ErrorEvent) => void) | null,
      } as unknown as Worker;
      return worker;
    };

    const promise = runCodelabTask(BUBBLE_SOLUTION, BUBBLE_TASK, 'bubbleSort', 1000, factory);
    await vi.advanceTimersByTimeAsync(10); // chạy setTimeout(0) của worker fake
    const result = await promise;
    expect(result.ok).toBe(true);
    expect(result.results).toHaveLength(1);
    expect(result.results[0].passed).toBe(true);
  });

  it('Fallback: không tạo được worker → KHÔNG chạy đồng bộ (chống treo UI), trả lỗi an toàn', async () => {
    const boomFactory = () => { throw new Error('Worker unavailable'); };
    const result: CodelabRunResult = await runCodelabTask(BUBBLE_SOLUTION, BUBBLE_TASK, 'bubbleSort', 1000, boomFactory);
    // Chạy new Function trên main thread không có kill-switch → vòng lặp vô hạn đứng băng trang.
    // Quyết định bảo mật: từ chối chạy, báo lỗi rõ ràng.
    expect(result.ok).toBe(false);
    expect(result.error?.toLowerCase()).toContain('không thể khởi tạo');
    expect(result.results.every(r => !r.passed)).toBe(true);
  });
});
