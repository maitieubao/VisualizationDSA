// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ref } from 'vue';
import { handleMouseDown, handleMouseMove } from '../components/canvasEventHandlers';
import type { NodeDTO, EdgeDTO } from '../store/usePlaygroundStore';

type StoreMock = {
  isAlgorithmMode: boolean;
  hoveredNodeId: string | null;
  hoveredEdgeId: string | null;
  setSourceNodeId: ReturnType<typeof vi.fn>;
  selectNode: ReturnType<typeof vi.fn>;
  clearSelection: ReturnType<typeof vi.fn>;
  addNode: ReturnType<typeof vi.fn>;
  selectEdge: ReturnType<typeof vi.fn>;
  deleteNode: ReturnType<typeof vi.fn>;
  deleteEdge: ReturnType<typeof vi.fn>;
  moveNode: ReturnType<typeof vi.fn>;
  setHoveredNodeId: ReturnType<typeof vi.fn>;
  setHoveredEdgeId: ReturnType<typeof vi.fn>;
};

const NODES: NodeDTO[] = [
  { id: 'a', label: 'A', x: 100, y: 100, radius: 20 },
  { id: 'b', label: 'B', x: 300, y: 100, radius: 20 },
];

const EDGES: EdgeDTO[] = [{ id: 'e1', from: 'a', to: 'b', weight: 5 }];

const FAKE_CANVAS = {
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 500 }),
} as unknown as HTMLCanvasElement;

function createStoreMock(): StoreMock {
  return {
    isAlgorithmMode: false,
    hoveredNodeId: null,
    hoveredEdgeId: null,
    setSourceNodeId: vi.fn(),
    selectNode: vi.fn(),
    clearSelection: vi.fn(),
    addNode: vi.fn(),
    selectEdge: vi.fn(),
    deleteNode: vi.fn(),
    deleteEdge: vi.fn(),
    moveNode: vi.fn(),
    setHoveredNodeId: vi.fn(),
    setHoveredEdgeId: vi.fn(),
  };
}

function createDragState() {
  return ref({ nodeId: null, offsetX: 0, offsetY: 0, isDragging: false });
}

function createEdgeDrawState() {
  return ref({ fromNodeId: null, mouseX: 0, mouseY: 0, snapTarget: null as NodeDTO | null });
}

describe('IP-040c — canvasEventHandlers (unit)', () => {
  let store: StoreMock;

  beforeEach(() => {
    store = createStoreMock();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  describe('handleMouseDown — SELECT mode', () => {
    it('hit node → bắt đầu drag + selectNode', () => {
      const dragState = createDragState();
      const edgeDrawState = createEdgeDrawState();
      handleMouseDown({ x: 110, y: 100 }, 'SELECT', NODES, EDGES, store, dragState, edgeDrawState, vi.fn(), null);
      expect(store.selectNode).toHaveBeenCalledWith('a');
      expect(dragState.value).toMatchObject({ nodeId: 'a', offsetX: 10, offsetY: 0, isDragging: true });
    });

    it('miss node → clearSelection, không drag', () => {
      const dragState = createDragState();
      const edgeDrawState = createEdgeDrawState();
      handleMouseDown({ x: 500, y: 400 }, 'SELECT', NODES, EDGES, store, dragState, edgeDrawState, vi.fn(), null);
      expect(store.clearSelection).toHaveBeenCalled();
      expect(dragState.value.isDragging).toBe(false);
    });
  });

  describe('handleMouseDown — ADD_NODE mode', () => {
    it('click → store.addNode tại tọa độ', () => {
      const dragState = createDragState();
      const edgeDrawState = createEdgeDrawState();
      handleMouseDown({ x: 150, y: 200 }, 'ADD_NODE', NODES, EDGES, store, dragState, edgeDrawState, vi.fn(), null);
      expect(store.addNode).toHaveBeenCalledWith(150, 200);
    });
  });

  describe('handleMouseDown — ADD_EDGE mode', () => {
    it('hit node → ghi nhận fromNodeId để kéo cạnh', () => {
      const dragState = createDragState();
      const edgeDrawState = createEdgeDrawState();
      handleMouseDown({ x: 100, y: 100 }, 'ADD_EDGE', NODES, EDGES, store, dragState, edgeDrawState, vi.fn(), null);
      expect(edgeDrawState.value.fromNodeId).toBe('a');
    });

    it('miss node → không bắt đầu cạnh', () => {
      const dragState = createDragState();
      const edgeDrawState = createEdgeDrawState();
      handleMouseDown({ x: 600, y: 400 }, 'ADD_EDGE', NODES, EDGES, store, dragState, edgeDrawState, vi.fn(), null);
      expect(edgeDrawState.value.fromNodeId).toBeNull();
    });
  });

  describe('handleMouseDown — WEIGHT mode', () => {
    it('hit edge → emit weight-input tại trung điểm cạnh + selectEdge', () => {
      const dragState = createDragState();
      const edgeDrawState = createEdgeDrawState();
      const emit = vi.fn();
      handleMouseDown({ x: 200, y: 100 }, 'WEIGHT', NODES, EDGES, store, dragState, edgeDrawState, emit, FAKE_CANVAS, 1, { x: 0, y: 0 });
      expect(emit).toHaveBeenCalledWith({ edgeId: 'e1', x: 200, y: 100, currentWeight: 5 });
      expect(store.selectEdge).toHaveBeenCalledWith('e1');
    });

    it('miss edge → không emit', () => {
      const dragState = createDragState();
      const edgeDrawState = createEdgeDrawState();
      const emit = vi.fn();
      handleMouseDown({ x: 500, y: 400 }, 'WEIGHT', NODES, EDGES, store, dragState, edgeDrawState, emit, FAKE_CANVAS, 1, { x: 0, y: 0 });
      expect(emit).not.toHaveBeenCalled();
      expect(store.selectEdge).not.toHaveBeenCalled();
    });
  });

  describe('handleMouseDown — DELETE mode', () => {
    it('hit node + confirm true → deleteNode', () => {
      vi.mocked(window.confirm).mockReturnValue(true);
      const dragState = createDragState();
      const edgeDrawState = createEdgeDrawState();
      handleMouseDown({ x: 100, y: 100 }, 'DELETE', NODES, EDGES, store, dragState, edgeDrawState, vi.fn(), null);
      expect(store.deleteNode).toHaveBeenCalledWith('a');
    });

    it('hit node + confirm false → không xóa', () => {
      vi.mocked(window.confirm).mockReturnValue(false);
      const dragState = createDragState();
      const edgeDrawState = createEdgeDrawState();
      handleMouseDown({ x: 100, y: 100 }, 'DELETE', NODES, EDGES, store, dragState, edgeDrawState, vi.fn(), null);
      expect(store.deleteNode).not.toHaveBeenCalled();
    });

    it('hit edge + confirm true → deleteEdge', () => {
      vi.mocked(window.confirm).mockReturnValue(true);
      const dragState = createDragState();
      const edgeDrawState = createEdgeDrawState();
      handleMouseDown({ x: 200, y: 100 }, 'DELETE', NODES, EDGES, store, dragState, edgeDrawState, vi.fn(), null);
      expect(store.deleteEdge).toHaveBeenCalledWith('e1');
    });

    it('miss tất cả → không gọi delete', () => {
      const dragState = createDragState();
      const edgeDrawState = createEdgeDrawState();
      handleMouseDown({ x: 500, y: 400 }, 'DELETE', NODES, EDGES, store, dragState, edgeDrawState, vi.fn(), null);
      expect(store.deleteNode).not.toHaveBeenCalled();
      expect(store.deleteEdge).not.toHaveBeenCalled();
    });
  });

  describe('handleMouseDown — algorithm mode', () => {
    it('hit node → setSourceNodeId, mọi action vẽ khác bị chặn', () => {
      store.isAlgorithmMode = true;
      const dragState = createDragState();
      const edgeDrawState = createEdgeDrawState();
      handleMouseDown({ x: 100, y: 100 }, 'ADD_NODE', NODES, EDGES, store, dragState, edgeDrawState, vi.fn(), null);
      expect(store.setSourceNodeId).toHaveBeenCalledWith('a');
      expect(store.addNode).not.toHaveBeenCalled();
      expect(store.selectNode).not.toHaveBeenCalled();
      expect(dragState.value.isDragging).toBe(false);
    });

    it('miss node → không làm gì', () => {
      store.isAlgorithmMode = true;
      const dragState = createDragState();
      const edgeDrawState = createEdgeDrawState();
      handleMouseDown({ x: 500, y: 400 }, 'SELECT', NODES, EDGES, store, dragState, edgeDrawState, vi.fn(), null);
      expect(store.setSourceNodeId).not.toHaveBeenCalled();
      expect(store.clearSelection).not.toHaveBeenCalled();
    });
  });

  describe('handleMouseMove', () => {
    it('SELECT + dragging → moveNode với tọa độ clamp trong canvas', () => {
      const dragState = ref({ nodeId: 'a', offsetX: 10, offsetY: 0, isDragging: true });
      const edgeDrawState = createEdgeDrawState();
      handleMouseMove({ x: 260, y: 150 }, 'SELECT', dragState, edgeDrawState, NODES, EDGES, store, 800, 500);
      expect(store.moveNode).toHaveBeenCalledWith('a', 250, 150);
    });

    it('SELECT + dragging clamp biên dưới 20px', () => {
      const dragState = ref({ nodeId: 'a', offsetX: 1000, offsetY: 1000, isDragging: true });
      const edgeDrawState = createEdgeDrawState();
      handleMouseMove({ x: 5, y: 5 }, 'SELECT', dragState, edgeDrawState, NODES, EDGES, store, 800, 500);
      expect(store.moveNode).toHaveBeenCalledWith('a', 20, 20);
    });

    it('ADD_EDGE: gần node → snapTarget được chọn', () => {
      const dragState = createDragState();
      const edgeDrawState = ref({ fromNodeId: 'a', mouseX: 0, mouseY: 0, snapTarget: null as NodeDTO | null });
      handleMouseMove({ x: 310, y: 100 }, 'ADD_EDGE', dragState, edgeDrawState, NODES, EDGES, store, 800, 500);
      expect(edgeDrawState.value.snapTarget?.id).toBe('b');
    });

    it('ADD_EDGE: xa node → snapTarget null', () => {
      const dragState = createDragState();
      const edgeDrawState = ref({ fromNodeId: 'a', mouseX: 0, mouseY: 0, snapTarget: null as NodeDTO | null });
      handleMouseMove({ x: 500, y: 400 }, 'ADD_EDGE', dragState, edgeDrawState, NODES, EDGES, store, 800, 500);
      expect(edgeDrawState.value.snapTarget).toBeNull();
    });

    it('ADD_EDGE: không snap vào chính node nguồn', () => {
      const dragState = createDragState();
      const edgeDrawState = ref({ fromNodeId: 'a', mouseX: 0, mouseY: 0, snapTarget: null as NodeDTO | null });
      handleMouseMove({ x: 110, y: 100 }, 'ADD_EDGE', dragState, edgeDrawState, NODES, EDGES, store, 800, 500);
      expect(edgeDrawState.value.snapTarget).toBeNull();
    });

    it('IP-007: hover node → setHoveredNodeId, xóa hoveredEdgeId', () => {
      store.hoveredEdgeId = 'e1';
      const dragState = createDragState();
      const edgeDrawState = createEdgeDrawState();
      handleMouseMove({ x: 105, y: 100 }, 'SELECT', dragState, edgeDrawState, NODES, EDGES, store, 800, 500);
      expect(store.setHoveredNodeId).toHaveBeenCalledWith('a');
      expect(store.setHoveredEdgeId).toHaveBeenCalledWith(null);
    });

    it('IP-007: miss node nhưng hit edge → hover cạnh (chỉ xóa hover cũ nếu đang set)', () => {
      store.hoveredNodeId = 'b'; // hover cũ tồn tại → phải được xóa
      const dragState = createDragState();
      const edgeDrawState = createEdgeDrawState();
      handleMouseMove({ x: 200, y: 103 }, 'SELECT', dragState, edgeDrawState, NODES, EDGES, store, 800, 500);
      expect(store.setHoveredNodeId).toHaveBeenCalledWith(null);
      expect(store.setHoveredEdgeId).toHaveBeenCalledWith('e1');
    });

    it('algorithm mode → early return, không moveNode/hover', () => {
      store.isAlgorithmMode = true;
      const dragState = ref({ nodeId: 'a', offsetX: 0, offsetY: 0, isDragging: true });
      const edgeDrawState = createEdgeDrawState();
      handleMouseMove({ x: 300, y: 300 }, 'SELECT', dragState, edgeDrawState, NODES, EDGES, store, 800, 500);
      expect(store.moveNode).not.toHaveBeenCalled();
      expect(store.setHoveredNodeId).not.toHaveBeenCalled();
    });
  });
});
