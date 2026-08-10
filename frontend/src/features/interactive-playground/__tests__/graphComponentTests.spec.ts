// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia, type Pinia } from 'pinia';
import PlaygroundCanvas from '../components/PlaygroundCanvas.vue';
import InteractivePlayground from '../components/InteractivePlayground.vue';
import GraphView from '../../../views/graph/GraphView.vue';
import { usePlaygroundStore } from '../store/usePlaygroundStore';
import { installCanvasMock, type CanvasContextMock } from './canvasMock';

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const CANVAS_RECT = {
  left: 0, top: 0, width: 800, height: 500, right: 800, bottom: 500, x: 0, y: 0,
  toJSON: () => ({}),
} as DOMRect;

let pinia: Pinia;
let ctxMock: CanvasContextMock;

beforeEach(() => {
  pinia = createPinia();
  setActivePinia(pinia);
  ctxMock = installCanvasMock();
  vi.stubGlobal('ResizeObserver', MockResizeObserver);
  vi.useFakeTimers();
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => setTimeout(() => cb(performance.now()), 16) as unknown as number);
  vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

async function settle(wrapper: VueWrapper): Promise<void> {
  await wrapper.vm.$nextTick();
  await wrapper.vm.$nextTick();
}

function stubCanvasRect(wrapper: VueWrapper): void {
  const el = wrapper.find('canvas').element as HTMLCanvasElement;
  el.getBoundingClientRect = () => CANVAS_RECT;
}

/** Draw khởi tạo (markDirty → rAF 16ms) — cần chạy để canvas.width = 800 (jsdom mặc định 300). */
async function runInitialDraw(): Promise<void> {
  vi.advanceTimersByTime(16);
}

function firePointer(wrapper: VueWrapper, eventName: string, opts: PointerEventInit): void {
  const el = wrapper.find('canvas').element as HTMLCanvasElement;
  el.dispatchEvent(new PointerEvent(eventName, { pointerType: 'mouse', bubbles: true, ...opts }));
}

function fireWheel(wrapper: VueWrapper, opts: WheelEventInit): void {
  const el = wrapper.find('canvas').element as HTMLCanvasElement;
  el.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, ...opts }));
}

function releasePointerOnWindow(clientX: number, clientY: number): void {
  window.dispatchEvent(new PointerEvent('pointerup', { pointerType: 'mouse', clientX, clientY, bubbles: true }));
}

function mountCanvas() {
  return mount(PlaygroundCanvas, {
    props: { graphType: 'undirected' },
    global: { plugins: [pinia] },
  });
}

async function mountCanvasReady() {
  const wrapper = mountCanvas();
  stubCanvasRect(wrapper);
  await settle(wrapper);
  await runInitialDraw();
  return wrapper;
}

function mountPlayground() {
  return mount(InteractivePlayground, {
    global: { plugins: [pinia], stubs: { BaseIcon: true } },
  });
}

function dispatchKey(key: string, opts: KeyboardEventInit = {}): void {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, ...opts }));
}

describe('IP-039 — PlaygroundCanvas (mount)', () => {
  it('ADD_NODE: pointerdown trên canvas thêm đỉnh đúng tọa độ', async () => {
    const store = usePlaygroundStore();
    const wrapper = await mountCanvasReady();

    store.setMode('ADD_NODE');
    firePointer(wrapper, 'pointerdown', { clientX: 120, clientY: 80, button: 0 });
    await settle(wrapper);

    expect(store.nodes).toHaveLength(1);
    expect(store.nodes[0].x).toBe(120);
    expect(store.nodes[0].y).toBe(80);
    wrapper.unmount();
  });

  it('ADD_EDGE: kéo từ A tới B trong vùng snap → tạo cạnh khi nhả chuột trong canvas', async () => {
    const store = usePlaygroundStore();
    const a = store.addNode(100, 100)!;
    const b = store.addNode(250, 250)!;
    const wrapper = await mountCanvasReady();

    store.setMode('ADD_EDGE');
    firePointer(wrapper, 'pointerdown', { clientX: 100, clientY: 100, button: 0 });
    firePointer(wrapper, 'pointermove', { clientX: 250, clientY: 250 });
    releasePointerOnWindow(250, 250);
    await settle(wrapper);

    expect(store.edges).toHaveLength(1);
    expect(store.edges[0].from).toBe(a.id);
    expect(store.edges[0].to).toBe(b.id);
    wrapper.unmount();
  });

  it('ADD_EDGE: thả chuột ngoài vùng snap → không tạo cạnh', async () => {
    const store = usePlaygroundStore();
    store.addNode(100, 100)!;
    store.addNode(250, 250)!;
    const wrapper = await mountCanvasReady();

    store.setMode('ADD_EDGE');
    firePointer(wrapper, 'pointerdown', { clientX: 100, clientY: 100, button: 0 });
    firePointer(wrapper, 'pointermove', { clientX: 600, clientY: 400 });
    releasePointerOnWindow(600, 400);
    await settle(wrapper);

    expect(store.edges).toHaveLength(0);
    wrapper.unmount();
  });

  it('IP-010: nhả chuột BÊN NGOÀI canvas (dù đang snap) → không tạo cạnh ma', async () => {
    const store = usePlaygroundStore();
    store.addNode(100, 100)!;
    store.addNode(250, 250)!;
    const wrapper = await mountCanvasReady();

    store.setMode('ADD_EDGE');
    firePointer(wrapper, 'pointerdown', { clientX: 100, clientY: 100, button: 0 });
    firePointer(wrapper, 'pointermove', { clientX: 250, clientY: 250 });
    releasePointerOnWindow(900, 700);
    await settle(wrapper);

    expect(store.edges).toHaveLength(0);
    wrapper.unmount();
  });

  it('isAlgorithmMode: pointerdown ADD_NODE không thêm đỉnh (khóa vẽ)', async () => {
    const store = usePlaygroundStore();
    const wrapper = await mountCanvasReady();

    store.setMode('ADD_NODE');
    store.setAlgorithmMode(true);
    firePointer(wrapper, 'pointerdown', { clientX: 100, clientY: 100, button: 0 });
    await settle(wrapper);

    expect(store.nodes).toHaveLength(0);
    wrapper.unmount();
  });
});

describe('IP-033 — Zoom & Pan qua PlaygroundCanvas (mount)', () => {
  it('wheel in → store.zoomLevel = 110 và ctx.scale được áp dụng', async () => {
    const store = usePlaygroundStore();
    const wrapper = await mountCanvasReady();

    fireWheel(wrapper, { deltaY: -100, clientX: 400, clientY: 250 });
    await settle(wrapper);
    expect(store.zoomLevel).toBe(110);

    vi.advanceTimersByTime(16); // draw với zoom mới (markDirty → rAF)
    expect(ctxMock.scale).toHaveBeenCalledWith(1.1, 1.1);
    wrapper.unmount();
  });

  it('wheel out → store.zoomLevel = 90', async () => {
    const store = usePlaygroundStore();
    const wrapper = await mountCanvasReady();

    fireWheel(wrapper, { deltaY: 120 });
    await settle(wrapper);
    expect(store.zoomLevel).toBe(90);
    wrapper.unmount();
  });

  it('zoom bị clamp trong khoảng 20%..300% dù lặp wheel nhiều lần', async () => {
    const store = usePlaygroundStore();
    const wrapper = await mountCanvasReady();

    for (let i = 0; i < 40; i++) fireWheel(wrapper, { deltaY: 120 });
    await settle(wrapper);
    expect(store.zoomLevel).toBe(20);

    for (let i = 0; i < 40; i++) fireWheel(wrapper, { deltaY: -120 });
    await settle(wrapper);
    expect(store.zoomLevel).toBe(300);
    wrapper.unmount();
  });

  it('pan giữa chuột (button=1) → ctx.translate theo delta', async () => {
    const wrapper = await mountCanvasReady();

    firePointer(wrapper, 'pointerdown', { clientX: 400, clientY: 300, button: 1 });
    firePointer(wrapper, 'pointermove', { clientX: 450, clientY: 320 });
    vi.advanceTimersByTime(16);
    expect(ctxMock.translate).toHaveBeenCalledWith(50, 20);

    releasePointerOnWindow(450, 320);
    wrapper.unmount();
  });

  it('pan bằng Alt+click (button=0 + altKey) cũng pan', async () => {
    const wrapper = await mountCanvasReady();

    firePointer(wrapper, 'pointerdown', { clientX: 200, clientY: 200, button: 0, altKey: true });
    firePointer(wrapper, 'pointermove', { clientX: 250, clientY: 230 });
    vi.advanceTimersByTime(16);
    expect(ctxMock.translate).toHaveBeenCalledWith(50, 30);

    releasePointerOnWindow(250, 230);
    wrapper.unmount();
  });
});

describe('IP-040 — InteractivePlayground (mount)', () => {
  describe('Weight popover', () => {
    async function openWeightPopover(store: ReturnType<typeof usePlaygroundStore>, wrapper: VueWrapper) {
      store.setMode('WEIGHT');
      firePointer(wrapper, 'pointerdown', { clientX: 200, clientY: 100, button: 0 });
      await settle(wrapper);
      return wrapper.find('input.weight-input');
    }

    it('click cạnh (WEIGHT) mở popover; Enter 50 cập nhật trọng số', async () => {
      const store = usePlaygroundStore();
      const a = store.addNode(100, 100)!;
      const b = store.addNode(300, 100)!;
      store.addEdge(a.id, b.id)!;
      const wrapper = mountPlayground();
      stubCanvasRect(wrapper);
      await settle(wrapper);
      await runInitialDraw();

      const input = await openWeightPopover(store, wrapper);
      expect(input.exists()).toBe(true);

      await input.setValue('50');
      await input.trigger('keydown.enter');
      expect(store.edges[0].weight).toBe(50);
      expect(wrapper.find('input.weight-input').exists()).toBe(false);
      wrapper.unmount();
    });

    it('giá trị 0 / 1000 / NaN bị từ chối — trọng số không đổi', async () => {
      const store = usePlaygroundStore();
      const a = store.addNode(100, 100)!;
      const b = store.addNode(300, 100)!;
      store.addEdge(a.id, b.id)!;
      const wrapper = mountPlayground();
      stubCanvasRect(wrapper);
      await settle(wrapper);
      await runInitialDraw();

      let input = await openWeightPopover(store, wrapper);
      await input.setValue('0');
      await input.trigger('keydown.enter');
      expect(store.edges[0].weight).toBe(1);

      input = await openWeightPopover(store, wrapper);
      await input.setValue('1000');
      await input.trigger('keydown.enter');
      expect(store.edges[0].weight).toBe(1);

      input = await openWeightPopover(store, wrapper);
      await input.setValue('abc');
      await input.trigger('keydown.enter');
      expect(store.edges[0].weight).toBe(1);
      wrapper.unmount();
    });

    it('Blur submit giá trị hợp lệ', async () => {
      const store = usePlaygroundStore();
      const a = store.addNode(100, 100)!;
      const b = store.addNode(300, 100)!;
      store.addEdge(a.id, b.id)!;
      const wrapper = mountPlayground();
      stubCanvasRect(wrapper);
      await settle(wrapper);
      await runInitialDraw();

      const input = await openWeightPopover(store, wrapper);
      await input.setValue('33');
      await input.trigger('blur');
      expect(store.edges[0].weight).toBe(33);
      expect(wrapper.find('input.weight-input').exists()).toBe(false);
      wrapper.unmount();
    });

    it('Escape hủy nhập — không cập nhật trọng số', async () => {
      const store = usePlaygroundStore();
      const a = store.addNode(100, 100)!;
      const b = store.addNode(300, 100)!;
      store.addEdge(a.id, b.id)!;
      const wrapper = mountPlayground();
      stubCanvasRect(wrapper);
      await settle(wrapper);
      await runInitialDraw();

      const input = await openWeightPopover(store, wrapper);
      await input.setValue('77');
      await input.trigger('keydown.escape');
      expect(wrapper.find('input.weight-input').exists()).toBe(false);
      expect(store.edges[0].weight).toBe(1);
      wrapper.unmount();
    });
  });

  describe('Import JSON', () => {
    let fakeJson: string;

    beforeEach(() => {
      vi.restoreAllMocks();
      fakeJson = '{ invalid json';
      const realCreate = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag: string, options?: ElementCreationOptions) => {
        const el = realCreate(tag, options);
        if (tag === 'input') {
          Object.defineProperty(el, 'click', {
            value: function (this: HTMLInputElement) {
              const file = new File([fakeJson], 'graph.json', { type: 'application/json' });
              Object.defineProperty(this, 'files', { value: [file], configurable: true });
              const ev = new Event('change');
              Object.defineProperty(ev, 'target', { value: this });
              this.onchange?.(ev);
            },
          });
        }
        return el;
      });
      class FakeFileReader {
        onload: ((ev: { target: { result: string } }) => void) | null = null;
        readAsText() {
          this.onload?.({ target: { result: fakeJson } });
        }
      }
      vi.stubGlobal('FileReader', FakeFileReader);
    });

    it('JSON không hợp lệ → toast lỗi, đồ thị hiện tại giữ nguyên', async () => {
      const store = usePlaygroundStore();
      store.addNode(100, 100);
      const wrapper = mountPlayground();
      await settle(wrapper);

      await wrapper.find('button[aria-label="Nhập JSON"]').trigger('click');
      await settle(wrapper);

      expect(store.nodes).toHaveLength(1);
      expect(wrapper.text()).toContain('File JSON không hợp lệ.');
      wrapper.unmount();
    });

    it('JSON hợp lệ → thay thế đồ thị + toast thành công', async () => {
      const store = usePlaygroundStore();
      store.addNode(100, 100);
      fakeJson = JSON.stringify({
        nodes: [{ id: 'n1', label: 'X', x: 10, y: 20, radius: 20 }],
        edges: [],
      });
      const wrapper = mountPlayground();
      await settle(wrapper);

      await wrapper.find('button[aria-label="Nhập JSON"]').trigger('click');
      await settle(wrapper);

      expect(store.nodes).toHaveLength(1);
      expect(store.nodes[0].label).toBe('X');
      expect(wrapper.text()).toContain('Đã nhập 1 đỉnh, 0 cạnh.');
      wrapper.unmount();
    });
  });

  describe('IP-041 — Phím tắt qua handleKeydown thật', () => {
    it('V/N/E/W chuyển tool mode', async () => {
      const store = usePlaygroundStore();
      const wrapper = mountPlayground();
      await settle(wrapper);

      dispatchKey('n');
      expect(store.mode).toBe('ADD_NODE');
      dispatchKey('V');
      expect(store.mode).toBe('SELECT');
      dispatchKey('e');
      expect(store.mode).toBe('ADD_EDGE');
      dispatchKey('w');
      expect(store.mode).toBe('WEIGHT');
      wrapper.unmount();
    });

    it('Delete xóa đỉnh đang chọn sau khi confirm', async () => {
      const store = usePlaygroundStore();
      const a = store.addNode(100, 100)!;
      store.addNode(200, 200);
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const wrapper = mountPlayground();
      await settle(wrapper);

      store.selectNode(a.id);
      dispatchKey('Delete');
      expect(store.nodes).toHaveLength(1);
      expect(store.nodes[0].id).not.toBe(a.id);
      wrapper.unmount();
    });

    it('Delete không xóa khi confirm bị hủy', async () => {
      const store = usePlaygroundStore();
      const a = store.addNode(100, 100)!;
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      const wrapper = mountPlayground();
      await settle(wrapper);

      store.selectNode(a.id);
      dispatchKey('Delete');
      expect(store.nodes).toHaveLength(1);
      wrapper.unmount();
    });

    it('Backspace xóa cạnh đang chọn sau khi confirm', async () => {
      const store = usePlaygroundStore();
      const a = store.addNode(100, 100)!;
      const b = store.addNode(200, 200)!;
      const edge = store.addEdge(a.id, b.id)!;
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const wrapper = mountPlayground();
      await settle(wrapper);

      store.selectEdge(edge.id);
      dispatchKey('Backspace');
      expect(store.edges).toHaveLength(0);
      wrapper.unmount();
    });

    it('phím tắt bị chặn khi target là INPUT', async () => {
      const store = usePlaygroundStore();
      const wrapper = mountPlayground();
      await settle(wrapper);

      const inputEl = document.createElement('input');
      document.body.appendChild(inputEl);
      inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', bubbles: true }));
      expect(store.mode).toBe('SELECT');
      inputEl.remove();
      wrapper.unmount();
    });

    it('phím tắt bị chặn trong algorithm mode', async () => {
      const store = usePlaygroundStore();
      const wrapper = mountPlayground();
      await settle(wrapper);

      store.setAlgorithmMode(true);
      dispatchKey('n');
      expect(store.mode).toBe('SELECT');
      wrapper.unmount();
    });
  });

  describe('Toolbar lock khi isAlgorithmMode', () => {
    it('ẩn các nút hành động (export/import/physics/clear) + chặn vẽ canvas', async () => {
      const store = usePlaygroundStore();
      store.addNode(100, 100);
      const wrapper = mountPlayground();
      stubCanvasRect(wrapper);
      await settle(wrapper);
      await runInitialDraw();

      expect(wrapper.find('button[aria-label="Xuất JSON"]').exists()).toBe(true);
      expect(wrapper.find('button[aria-label="Nhập JSON"]').exists()).toBe(true);

      store.setAlgorithmMode(true);
      await settle(wrapper);

      expect(wrapper.find('button[aria-label="Xuất JSON"]').exists()).toBe(false);
      expect(wrapper.find('button[aria-label="Nhập JSON"]').exists()).toBe(false);
      expect(wrapper.find('button[aria-label="Xóa toàn bộ"]').exists()).toBe(false);
      expect(wrapper.find('button[aria-label="Tắt lực đẩy"]').exists()).toBe(false);

      store.setMode('ADD_NODE');
      firePointer(wrapper, 'pointerdown', { clientX: 300, clientY: 300, button: 0 });
      await settle(wrapper);
      expect(store.nodes).toHaveLength(1);
      wrapper.unmount();
    });
  });

  describe('Legend (IP-033)', () => {
    it('hiện khi có đỉnh, ẩn trong algorithm mode', async () => {
      const store = usePlaygroundStore();
      store.addNode(100, 100);
      const wrapper = mountPlayground();
      await settle(wrapper);

      expect(wrapper.find('[aria-label="Chú giải màu"]').exists()).toBe(true);

      store.setAlgorithmMode(true);
      await settle(wrapper);
      expect(wrapper.find('[aria-label="Chú giải màu"]').exists()).toBe(false);
      wrapper.unmount();
    });
  });

  describe('Guide overlay (IP-033)', () => {
    it('hiện khi đồ thị rỗng; nút "Đã hiểu" đóng lại vĩnh viễn', async () => {
      const store = usePlaygroundStore();
      const wrapper = mountPlayground();
      await settle(wrapper);

      expect(wrapper.text()).toContain('Bắt đầu vẽ đồ thị');

      const understood = wrapper.findAll('button').find(b => b.text().includes('Đã hiểu'));
      await understood!.trigger('click');
      await settle(wrapper);
      expect(wrapper.text()).not.toContain('Bắt đầu vẽ đồ thị');
      expect(store.isGuideDismissed).toBe(true);
      wrapper.unmount();
    });

    it('ẩn khi đã có đỉnh', async () => {
      const store = usePlaygroundStore();
      store.addNode(100, 100);
      const wrapper = mountPlayground();
      await settle(wrapper);

      expect(wrapper.text()).not.toContain('Bắt đầu vẽ đồ thị');
      wrapper.unmount();
    });

    it('ẩn trong algorithm mode', async () => {
      const store = usePlaygroundStore();
      store.setAlgorithmMode(true);
      const wrapper = mountPlayground();
      await settle(wrapper);

      expect(wrapper.text()).not.toContain('Bắt đầu vẽ đồ thị');
      wrapper.unmount();
    });
  });

  describe('Header counter (IP-033)', () => {
    it('hiển thị "Đỉnh: N | Cạnh: M" theo store thật', async () => {
      const store = usePlaygroundStore();
      const a = store.addNode(100, 100)!;
      const b = store.addNode(200, 200)!;
      store.addEdge(a.id, b.id);
      const wrapper = mountPlayground();
      await settle(wrapper);

      expect(wrapper.text()).toContain('Đỉnh: 2');
      expect(wrapper.text()).toContain('Cạnh: 1');
      wrapper.unmount();
    });
  });

  describe('IP-034 — Export JSON', () => {
    it('click "Xuất JSON" → Blob đúng nội dung + toast thành công', async () => {
      const store = usePlaygroundStore();
      const a = store.addNode(100, 100)!;
      const b = store.addNode(200, 200)!;
      const edge = store.addEdge(a.id, b.id)!;
      const wrapper = mountPlayground();
      await settle(wrapper);

      const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
      const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

      await wrapper.find('button[aria-label="Xuất JSON"]').trigger('click');
      await settle(wrapper);

      expect(createObjectURL).toHaveBeenCalledTimes(1);
      expect(clickSpy).toHaveBeenCalledTimes(1);
      const blob = createObjectURL.mock.calls[0][0] as Blob;
      const parsed = JSON.parse(await blob.text());
      expect(parsed.nodes).toHaveLength(2);
      expect(parsed.nodes[0].label).toBe('A');
      expect(parsed.edges).toHaveLength(1);
      expect(parsed.edges[0].id).toBe(edge.id);
      expect(wrapper.text()).toContain('Đã xuất đồ thị thành công!');

      clickSpy.mockRestore();
      createObjectURL.mockRestore();
      revokeObjectURL.mockRestore();
      wrapper.unmount();
    });

    it('đồ thị rỗng → toast lỗi, không tạo Blob', async () => {
      const wrapper = mountPlayground();
      await settle(wrapper);

      const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
      await wrapper.find('button[aria-label="Xuất JSON"]').trigger('click');
      await settle(wrapper);

      expect(createObjectURL).not.toHaveBeenCalled();
      expect(wrapper.text()).toContain('Không có đồ thị nào để xuất.');
      createObjectURL.mockRestore();
      wrapper.unmount();
    });
  });
});

describe('IP-035 — GraphView loadTemplate thật', () => {
  function mountGraphView() {
    return mount(GraphView, {
      global: { plugins: [pinia], stubs: { BaseIcon: true } },
    });
  }

  it('click "Triangle" → loadTemplate("triangle") tạo 3 đỉnh + 3 cạnh chu trình', async () => {
    const store = usePlaygroundStore();
    const wrapper = mountGraphView();
    await settle(wrapper);

    const btn = wrapper.findAll('button').find(b => b.text().includes('Triangle'));
    await btn!.trigger('click');
    await settle(wrapper);

    expect(store.nodes).toHaveLength(3);
    expect(store.edges).toHaveLength(3);
    expect(store.nodes.map(n => n.label)).toEqual(['A', 'B', 'C']);
    const [a] = store.nodes;
    expect(store.edges.filter(e => e.from === a.id || e.to === a.id)).toHaveLength(2);
    expect(wrapper.text()).toContain('Nodes: 3');
    expect(wrapper.text()).toContain('Edges: 3');
    wrapper.unmount();
  });

  it('click "Square" → 4 đỉnh + 4 cạnh', async () => {
    const store = usePlaygroundStore();
    const wrapper = mountGraphView();
    await settle(wrapper);

    const btn = wrapper.findAll('button').find(b => b.text().includes('Square'));
    await btn!.trigger('click');
    await settle(wrapper);

    expect(store.nodes).toHaveLength(4);
    expect(store.edges).toHaveLength(4);
    wrapper.unmount();
  });

  it('click "Star" → 6 đỉnh (tâm + 5 ngoài) + 5 cạnh', async () => {
    const store = usePlaygroundStore();
    const wrapper = mountGraphView();
    await settle(wrapper);

    const btn = wrapper.findAll('button').find(b => b.text().includes('Star'));
    await btn!.trigger('click');
    await settle(wrapper);

    expect(store.nodes).toHaveLength(6);
    expect(store.edges).toHaveLength(5);
    wrapper.unmount();
  });
});
