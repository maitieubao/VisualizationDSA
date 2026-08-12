// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import type { FrameDTO } from '../types/algorithm.types';
import BarChartRenderer from '../components/renderers/BarChartRenderer.vue';
import BoxArrayRenderer from '../components/renderers/BoxArrayRenderer.vue';
import TubeRenderer from '../components/renderers/TubeRenderer.vue';
import TreeRenderer from '../components/renderers/TreeRenderer.vue';
import GraphRenderer from '../components/renderers/GraphRenderer.vue';

vi.stubGlobal('ResizeObserver', class {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
});

vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
  return setTimeout(() => cb(performance.now()), 16) as unknown as number;
});
vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));

function createMockCanvasContext() {
  return {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    lineDashOffset: 0,
    font: '',
    textAlign: '' as CanvasTextAlign,
    textBaseline: '' as CanvasTextBaseline,
    shadowColor: '',
    shadowBlur: 0,
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    arc: vi.fn(),
    roundRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    setLineDash: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
  };
}

function createFrame(data: number[], overrides?: Partial<FrameDTO>): FrameDTO {
  return {
    stepId: 1,
    activeLine: 0,
    explanation: 'test frame',
    dataState: data,
    highlights: { compare: [], swap: [], sorted: [], dimmed: [], active: [], ...overrides?.highlights },
    ...overrides,
  };
}

function mockCanvasGetContext(mockCtx: ReturnType<typeof createMockCanvasContext>) {
  const origGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx as unknown as CanvasRenderingContext2D) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  return () => { HTMLCanvasElement.prototype.getContext = origGetContext; };
}

describe('BarChartRenderer', () => {
  let mockCtx: ReturnType<typeof createMockCanvasContext>;
  let restoreCtx: () => void;

  beforeEach(() => {
    setActivePinia(createPinia());
    mockCtx = createMockCanvasContext();
    restoreCtx = mockCanvasGetContext(mockCtx);
  });

  afterEach(() => restoreCtx());

  it('does not crash when mounted with null frame', () => {
    expect(() => mount(BarChartRenderer, { props: { frame: null } })).not.toThrow();
  });

  it('renders canvas element', () => {
    const wrapper = mount(BarChartRenderer, { props: { frame: null } });
    expect(wrapper.find('canvas').exists()).toBe(true);
  });

  it('does not crash with empty dataState', () => {
    const frame = createFrame([]);
    expect(() => mount(BarChartRenderer, { props: { frame } })).not.toThrow();
  });

  it('does not crash with valid data', () => {
    const frame = createFrame([5, 3, 8, 1, 9]);
    expect(() => mount(BarChartRenderer, { props: { frame } })).not.toThrow();
  });

  it('calls roundRect for bars', () => {
    const frame = createFrame([5, 3, 8]);
    mount(BarChartRenderer, { props: { frame } });
    expect(mockCtx.roundRect).toHaveBeenCalled();
  });

  it('handles single element', () => {
    const frame = createFrame([42]);
    expect(() => mount(BarChartRenderer, { props: { frame } })).not.toThrow();
  });

  it('handles many elements', () => {
    const data = Array.from({ length: 20 }, (_, i) => i + 1);
    const frame = createFrame(data);
    expect(() => mount(BarChartRenderer, { props: { frame } })).not.toThrow();
  });
});

describe('BoxArrayRenderer', () => {
  let mockCtx: ReturnType<typeof createMockCanvasContext>;
  let restoreCtx: () => void;

  beforeEach(() => {
    setActivePinia(createPinia());
    mockCtx = createMockCanvasContext();
    restoreCtx = mockCanvasGetContext(mockCtx);
  });

  afterEach(() => restoreCtx());

  it('does not crash when mounted with null frame', () => {
    expect(() => mount(BoxArrayRenderer, { props: { frame: null } })).not.toThrow();
  });

  it('renders canvas element', () => {
    const wrapper = mount(BoxArrayRenderer, { props: { frame: null } });
    expect(wrapper.find('canvas').exists()).toBe(true);
  });

  it('does not crash with valid data', () => {
    const frame = createFrame([5, 3, 8, 1, 9]);
    expect(() => mount(BoxArrayRenderer, { props: { frame } })).not.toThrow();
  });

  it('calls roundRect for boxes', () => {
    const frame = createFrame([5, 3, 8]);
    mount(BoxArrayRenderer, { props: { frame } });
    expect(mockCtx.roundRect).toHaveBeenCalled();
  });

  it('handles single element', () => {
    const frame = createFrame([42]);
    expect(() => mount(BoxArrayRenderer, { props: { frame } })).not.toThrow();
  });
});

describe('TubeRenderer', () => {
  let mockCtx: ReturnType<typeof createMockCanvasContext>;
  let restoreCtx: () => void;

  beforeEach(() => {
    setActivePinia(createPinia());
    mockCtx = createMockCanvasContext();
    restoreCtx = mockCanvasGetContext(mockCtx);
  });

  afterEach(() => restoreCtx());

  it('does not crash when mounted with stack mode', () => {
    expect(() => mount(TubeRenderer, { props: { frame: null, mode: 'stack' } })).not.toThrow();
  });

  it('does not crash when mounted with queue mode', () => {
    expect(() => mount(TubeRenderer, { props: { frame: null, mode: 'queue' } })).not.toThrow();
  });

  it('renders canvas element', () => {
    const wrapper = mount(TubeRenderer, { props: { frame: null, mode: 'stack' } });
    expect(wrapper.find('canvas').exists()).toBe(true);
  });

  it('does not crash with valid stack data', () => {
    const frame = createFrame([10, 20, 30]);
    expect(() => mount(TubeRenderer, { props: { frame, mode: 'stack' } })).not.toThrow();
  });

  it('does not crash with valid queue data', () => {
    const frame = createFrame([10, 20, 30]);
    expect(() => mount(TubeRenderer, { props: { frame, mode: 'queue' } })).not.toThrow();
  });

  it('calls roundRect for cells', () => {
    const frame = createFrame([10, 20, 30]);
    mount(TubeRenderer, { props: { frame, mode: 'stack' } });
    expect(mockCtx.roundRect).toHaveBeenCalled();
  });
});

describe('TreeRenderer', () => {
  let mockCtx: ReturnType<typeof createMockCanvasContext>;
  let restoreCtx: () => void;

  beforeEach(() => {
    setActivePinia(createPinia());
    mockCtx = createMockCanvasContext();
    restoreCtx = mockCanvasGetContext(mockCtx);
  });

  afterEach(() => restoreCtx());

  it('does not crash when mounted with null frame', () => {
    expect(() => mount(TreeRenderer, { props: { frame: null } })).not.toThrow();
  });

  it('renders canvas element', () => {
    const wrapper = mount(TreeRenderer, { props: { frame: null } });
    expect(wrapper.find('canvas').exists()).toBe(true);
  });

  it('does not crash with tree nodes', () => {
    const frame = createFrame([50, 30, 70], {
      treeNodes: [
        { id: 1, value: 50, leftNodeId: 2, rightNodeId: 3 },
        { id: 2, value: 30, leftNodeId: null, rightNodeId: null },
        { id: 3, value: 70, leftNodeId: null, rightNodeId: null },
      ],
    });
    expect(() => mount(TreeRenderer, { props: { frame } })).not.toThrow();
  });

  it('calls arc for tree nodes', () => {
    const frame = createFrame([50, 30, 70], {
      treeNodes: [
        { id: 1, value: 50, leftNodeId: 2, rightNodeId: 3 },
        { id: 2, value: 30, leftNodeId: null, rightNodeId: null },
        { id: 3, value: 70, leftNodeId: null, rightNodeId: null },
      ],
    });
    mount(TreeRenderer, { props: { frame } });
    expect(mockCtx.arc).toHaveBeenCalled();
  });
});

describe('GraphRenderer', () => {
  let mockCtx: ReturnType<typeof createMockCanvasContext>;
  let restoreCtx: () => void;

  beforeEach(() => {
    setActivePinia(createPinia());
    mockCtx = createMockCanvasContext();
    restoreCtx = mockCanvasGetContext(mockCtx);
  });

  afterEach(() => restoreCtx());

  it('does not crash when mounted with null frame', () => {
    expect(() => mount(GraphRenderer, { props: { frame: null } })).not.toThrow();
  });

  it('renders canvas element', () => {
    const wrapper = mount(GraphRenderer, { props: { frame: null } });
    expect(wrapper.find('canvas').exists()).toBe(true);
  });

  it('does not crash with graph data', () => {
    const frame = createFrame([1, 2, 3], {
      graphNodes: [
        { id: 0, value: 1, x: 100, y: 100 },
        { id: 1, value: 2, x: 200, y: 100 },
        { id: 2, value: 3, x: 150, y: 200 },
      ],
      graphEdges: [
        { from: 0, to: 1, weight: 5 },
        { from: 1, to: 2, weight: 3 },
      ],
    });
    expect(() => mount(GraphRenderer, { props: { frame } })).not.toThrow();
  });
});
