// @vitest-environment jsdom
// QZ-004 (P0): câu hỏi CANVAS_TARGET phải nối được click canvas → chấm điểm.
// Test qua CanvasLayer + useAnimationCanvas + useQuizStore thật (chỉ mock 2D context).
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount, type VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import CanvasLayer from '../../animation-engine/components/CanvasLayer.vue';
import { useAnimationStore } from '../../animation-engine/store/useAnimationStore';
import { useQuizStore } from '../store/useQuizStore';
import type { QuizQuestion } from '../types/quiz.types';

const CANVAS_NODE_RADIUS = 22; // khớp hằng số trong useAnimationCanvas

interface CtxMock {
  setTransform: ReturnType<typeof vi.fn>;
  clearRect: ReturnType<typeof vi.fn>;
  fillRect: ReturnType<typeof vi.fn>;
  beginPath: ReturnType<typeof vi.fn>;
  moveTo: ReturnType<typeof vi.fn>;
  lineTo: ReturnType<typeof vi.fn>;
  quadraticCurveTo: ReturnType<typeof vi.fn>;
  closePath: ReturnType<typeof vi.fn>;
  fill: ReturnType<typeof vi.fn>;
  arc: ReturnType<typeof vi.fn>;
  fillText: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
  restore: ReturnType<typeof vi.fn>;
  set fillStyle(value: string);
  get fillStyle(): string;
  readonly fillStyleLog: string[];
}

function createCtxMock(): CtxMock {
  const fillStyleLog: string[] = [];
  let fillStyle = '';
  const ctx = {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
    fillText: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    font: '',
    textAlign: '',
    textBaseline: '',
    shadowColor: '',
    shadowBlur: 0,
    globalAlpha: 1,
    get fillStyle(): string {
      return fillStyle;
    },
    set fillStyle(value: string) {
      fillStyle = value;
      fillStyleLog.push(value);
    },
    fillStyleLog,
  };
  return ctx;
}

const canvasQuestion: QuizQuestion = {
  id: 'ct_q1',
  type: 'CANVAS_TARGET',
  prompt: 'Click đỉnh có khoảng cách nhỏ nhất',
  targetNodeId: '1',
  explanation: 'Đúng! Đỉnh A (1) là đáp án.',
};

function createGraphResult() {
  return {
    algorithmId: 'dijkstra',
    pseudoCode: [],
    frames: [
      {
        stepId: 0,
        activeLine: 0,
        explanation: 'Đồ thị khởi tạo',
        dataState: [],
        graphNodes: [
          { id: 1, value: 10, x: 300, y: 200, label: 'A' },
          { id: 2, value: 20, x: 500, y: 200, label: 'B' },
          { id: 3, value: 30, x: 400, y: 400, label: 'C' },
        ],
        graphEdges: [],
      },
    ],
  };
}

function dispatchClickOnCanvas(wrapper: VueWrapper, clientX: number, clientY: number): void {
  const canvas = wrapper.find('canvas').element as HTMLCanvasElement;
  canvas.dispatchEvent(new MouseEvent('click', { clientX, clientY, bubbles: true }));
}

describe('QZ-004 — CANVAS_TARGET: nối click canvas vào quiz store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());

    const ctx = createCtxMock();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      ctx as unknown as never,
    );
    vi.spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, right: 800, bottom: 600,
      width: 800, height: 600,
      x: 0, y: 0,
      toJSON: () => ({}),
    } as DOMRect);

    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      return setTimeout(() => cb(performance.now()), 16) as unknown as number;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
    vi.stubGlobal('ResizeObserver', class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    });
    vi.stubGlobal('getComputedStyle', () => ({
      getPropertyValue: (prop: string) => {
        if (prop === '--canvas-bg') return '#131614';
        return '';
      },
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('bật crosshair khi quiz CANVAS_TARGET hoạt động, tắt sau khi nộp', async () => {
    const animStore = useAnimationStore();
    animStore.loadResult(createGraphResult());
    const quizStore = useQuizStore();
    quizStore.triggerCheckpointQuestion(canvasQuestion, 0);

    const wrapper = mount(CanvasLayer);
    await nextTick();

    let canvas = wrapper.find('canvas');
    expect(canvas.classes()).toContain('canvas-interactive-target-mode');

    dispatchClickOnCanvas(wrapper, 300, 200);
    await nextTick();

    expect(quizStore.isSubmitted).toBe(true);
    canvas = wrapper.find('canvas');
    expect(canvas.classes()).not.toContain('canvas-interactive-target-mode');
  });

  it('click trúng node đích → isCorrect=true + flash xanh trên canvas', async () => {
    const animStore = useAnimationStore();
    animStore.loadResult(createGraphResult());
    const quizStore = useQuizStore();
    quizStore.triggerCheckpointQuestion(canvasQuestion, 0);

    const wrapper = mount(CanvasLayer);
    await nextTick();

    dispatchClickOnCanvas(wrapper, 300, 200);
    await nextTick();

    expect(quizStore.isSubmitted).toBe(true);
    expect(quizStore.isCorrect).toBe(true);
    expect(quizStore.matchedNodeId).toBe('1');
    expect(quizStore.isCanvasTargetMode).toBe(false);

    const ctx = HTMLCanvasElement.prototype.getContext as unknown as ReturnType<typeof vi.fn>;
    const mockCtx = ctx.mock.results[0].value as CtxMock;
    // Flash: vòng tròn glow bán kính CANVAS_NODE_RADIUS + 6 tại tọa độ node (300, 200)
    const flashArc = mockCtx.arc.mock.calls.find(
      (call: number[]) => call[0] === 300 && call[1] === 200 && call[2] === CANVAS_NODE_RADIUS + 6,
    );
    expect(flashArc).toBeTruthy();
    // Màu xanh Emerald phải nằm trong chuỗi màu đã set khi flash
    expect(mockCtx.fillStyleLog).toContain('#10B981');
  });

  it('click sai node → isCorrect=false + flash đỏ', async () => {
    const animStore = useAnimationStore();
    animStore.loadResult(createGraphResult());
    const quizStore = useQuizStore();
    quizStore.triggerCheckpointQuestion(canvasQuestion, 0);

    const wrapper = mount(CanvasLayer);
    await nextTick();

    dispatchClickOnCanvas(wrapper, 500, 200);
    await nextTick();

    expect(quizStore.isSubmitted).toBe(true);
    expect(quizStore.isCorrect).toBe(false);
    expect(quizStore.matchedNodeId).toBe('2');

    const ctx = HTMLCanvasElement.prototype.getContext as unknown as ReturnType<typeof vi.fn>;
    const mockCtx = ctx.mock.results[0].value as CtxMock;
    const flashArc = mockCtx.arc.mock.calls.find(
      (call: number[]) => call[0] === 500 && call[1] === 200 && call[2] === CANVAS_NODE_RADIUS + 6,
    );
    expect(flashArc).toBeTruthy();
    expect(mockCtx.fillStyleLog).toContain('#EF4444');
  });

  it('click khoảng trống (blank) → không nộp bài, không flash', async () => {
    const animStore = useAnimationStore();
    animStore.loadResult(createGraphResult());
    const quizStore = useQuizStore();
    quizStore.triggerCheckpointQuestion(canvasQuestion, 0);

    const wrapper = mount(CanvasLayer);
    await nextTick();

    dispatchClickOnCanvas(wrapper, 10, 10);
    await nextTick();

    expect(quizStore.isSubmitted).toBe(false);
    expect(quizStore.isCorrect).toBe(false);
    const ctx = HTMLCanvasElement.prototype.getContext as unknown as ReturnType<typeof vi.fn>;
    const mockCtx = ctx.mock.results[0].value as CtxMock;
    expect(mockCtx.arc).not.toHaveBeenCalled();
  });

  it('không ở chế độ canvas-target → click canvas vô hiệu', async () => {
    const animStore = useAnimationStore();
    animStore.loadResult(createGraphResult());
    const quizStore = useQuizStore();

    const wrapper = mount(CanvasLayer);
    await nextTick();

    expect(wrapper.find('canvas').classes()).not.toContain('canvas-interactive-target-mode');
    dispatchClickOnCanvas(wrapper, 300, 200);
    await nextTick();

    expect(quizStore.isSubmitted).toBe(false);
  });

  it('click sau khi đã nộp (double-click protection) → không chấm lại', async () => {
    const animStore = useAnimationStore();
    animStore.loadResult(createGraphResult());
    const quizStore = useQuizStore();
    quizStore.triggerCheckpointQuestion(canvasQuestion, 0);

    const wrapper = mount(CanvasLayer);
    await nextTick();

    dispatchClickOnCanvas(wrapper, 300, 200);
    await nextTick();
    expect(quizStore.isSubmitted).toBe(true);

    const sessionTotalAfterFirst = quizStore.sessionTotal;
    dispatchClickOnCanvas(wrapper, 500, 200);
    await nextTick();

    expect(quizStore.matchedNodeId).toBe('1');
    expect(quizStore.sessionTotal).toBe(sessionTotalAfterFirst);
  });

  it('cleanup: unmount gỡ listener click (không leak)', async () => {
    const animStore = useAnimationStore();
    animStore.loadResult(createGraphResult());
    const quizStore = useQuizStore();
    quizStore.triggerCheckpointQuestion(canvasQuestion, 0);

    const removeSpy = vi.spyOn(HTMLCanvasElement.prototype, 'removeEventListener');
    const wrapper = mount(CanvasLayer);
    await nextTick();

    wrapper.unmount();

    expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function));
    removeSpy.mockRestore();
  });
});
