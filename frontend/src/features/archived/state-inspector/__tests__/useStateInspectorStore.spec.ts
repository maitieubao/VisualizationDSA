import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useStateInspectorStore } from '../store/useStateInspectorStore';
import type { StackFrame, RecursionNode, HeapObject, PointerLink } from '../types/state-inspector.types';
import { MAX_STACK_FRAMES, MONACO_REVEAL_LINE_EVENT } from '../types/state-inspector.types';

function createFrame(id: string, fn: string, line: number, vars?: Record<string, { value: number | string | boolean | null; heapAddress?: string }>): StackFrame {
  return {
    frameId: id,
    functionName: fn,
    lineNumber: line,
    localVariables: vars ?? { n: { value: 1 } },
    isActive: false,
  };
}

describe('useStateInspectorStore — Pinia Setup Store', () => {
  let store: ReturnType<typeof useStateInspectorStore>;
  let dispatchedEvents: CustomEvent[] = [];

  beforeEach(() => {
    setActivePinia(createPinia());
    dispatchedEvents = [];

    // Stub window.dispatchEvent for Node.js test environment
    vi.stubGlobal('window', {
      dispatchEvent: (event: Event) => {
        if (event instanceof CustomEvent) {
          dispatchedEvents.push(event);
        }
        return true;
      },
    });

    store = useStateInspectorStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ---- Initial State ----

  it('should have empty initial state', () => {
    expect(store.stackFrames).toEqual([]);
    expect(store.activeFrameIndex).toBe(-1);
    expect(store.recursionTreeRoot).toBeNull();
    expect(store.heapObjects).toEqual([]);
    expect(store.pointerLinks).toEqual([]);
    expect(store.hoveredHeapAddress).toBeNull();
  });

  it('should have zero initial computed values', () => {
    expect(store.stackDepth).toBe(0);
    expect(store.isStackFull).toBe(false);
    expect(store.activeFrame).toBeNull();
    expect(store.activeVariables).toEqual({});
    expect(store.treeCoordinates).toEqual([]);
    expect(store.treeNodeCount).toBe(0);
    expect(store.treeMaxDepth).toBe(0);
  });

  // ---- Push Frame ----

  it('should push frame and update state', () => {
    store.pushFrame(createFrame('f1', 'main()', 5));

    expect(store.stackDepth).toBe(1);
    expect(store.stackFrames[0].isActive).toBe(true);
    expect(store.activeFrameIndex).toBe(0);
  });

  it('should dispatch MONACO_REVEAL_LINE_EVENT on push', () => {
    store.pushFrame(createFrame('f1', 'main()', 5));

    const monacoEvents = dispatchedEvents.filter(
      (e) => e.type === MONACO_REVEAL_LINE_EVENT
    );
    expect(monacoEvents.length).toBeGreaterThan(0);
    expect(monacoEvents[monacoEvents.length - 1].detail.lineNumber).toBe(5);
  });

  it('should push multiple frames, only top is active', () => {
    store.pushFrame(createFrame('f1', 'main()', 5));
    store.pushFrame(createFrame('f2', 'fib(3)', 12));

    expect(store.stackDepth).toBe(2);
    expect(store.stackFrames[0].isActive).toBe(false);
    expect(store.stackFrames[1].isActive).toBe(true);
    expect(store.activeFrameIndex).toBe(1);
  });

  // ---- Pop Frame ----

  it('should pop frame and reactivate previous', () => {
    store.pushFrame(createFrame('f1', 'main()', 5));
    store.pushFrame(createFrame('f2', 'fib(3)', 12));

    const popped = store.popFrame();
    expect(popped?.frameId).toBe('f2');
    expect(store.stackDepth).toBe(1);
    expect(store.stackFrames[0].isActive).toBe(true);
  });

  it('should dispatch MONACO event for previous frame on pop', () => {
    store.pushFrame(createFrame('f1', 'main()', 5));
    store.pushFrame(createFrame('f2', 'fib(3)', 12));
    dispatchedEvents = [];

    store.popFrame();

    const monacoEvents = dispatchedEvents.filter(
      (e) => e.type === MONACO_REVEAL_LINE_EVENT
    );
    expect(monacoEvents.length).toBeGreaterThan(0);
    expect(monacoEvents[monacoEvents.length - 1].detail.lineNumber).toBe(5);
  });

  it('should return null when popping empty stack', () => {
    const result = store.popFrame();
    expect(result).toBeNull();
  });

  // ---- Select Frame ----

  it('should select frame and update activeFrameIndex', () => {
    store.pushFrame(createFrame('f1', 'main()', 5));
    store.pushFrame(createFrame('f2', 'fib(3)', 12));
    store.pushFrame(createFrame('f3', 'fib(2)', 14));

    store.selectFrame(0);
    expect(store.activeFrameIndex).toBe(0);
    expect(store.stackFrames[0].isActive).toBe(true);
    expect(store.stackFrames[1].isActive).toBe(false);
    expect(store.stackFrames[2].isActive).toBe(false);
  });

  it('should dispatch MONACO event when selecting frame', () => {
    store.pushFrame(createFrame('f1', 'main()', 5));
    store.pushFrame(createFrame('f2', 'fib(3)', 12));
    dispatchedEvents = [];

    store.selectFrame(0);

    const monacoEvents = dispatchedEvents.filter(
      (e) => e.type === MONACO_REVEAL_LINE_EVENT
    );
    expect(monacoEvents.length).toBeGreaterThan(0);
    expect(monacoEvents[monacoEvents.length - 1].detail.lineNumber).toBe(5);
  });

  it('should ignore invalid selectFrame index', () => {
    store.pushFrame(createFrame('f1', 'main()', 5));
    store.selectFrame(99);
    expect(store.activeFrameIndex).toBe(0); // unchanged
  });

  // ---- Active Frame Computed ----

  it('should compute activeFrame correctly', () => {
    store.pushFrame(createFrame('f1', 'main()', 5, { x: { value: 42 } }));
    expect(store.activeFrame?.frameId).toBe('f1');
    expect(store.activeVariables).toEqual({ x: { value: 42 } });
  });

  it('should return null activeFrame when stack empty', () => {
    expect(store.activeFrame).toBeNull();
    expect(store.activeVariables).toEqual({});
  });

  // ---- Hover Variable ----

  it('should set hoveredHeapAddress', () => {
    store.hoverVariable('0x7ffd00');
    expect(store.hoveredHeapAddress).toBe('0x7ffd00');
  });

  it('should clear hoveredHeapAddress', () => {
    store.hoverVariable('0x7ffd00');
    store.hoverVariable();
    expect(store.hoveredHeapAddress).toBeNull();
  });

  // ---- Recursion Tree ----

  it('should update recursion tree', () => {
    const tree: RecursionNode = {
      nodeId: 'r',
      label: 'fib(2)',
      depth: 0,
      status: 'ACTIVE',
      children: [
        { nodeId: 'c1', label: 'fib(1)', depth: 1, status: 'RESOLVED', returnValue: 1, children: [] },
        { nodeId: 'c2', label: 'fib(0)', depth: 1, status: 'RESOLVED', returnValue: 0, children: [] },
      ],
    };

    store.updateRecursionTree(tree);
    expect(store.recursionTreeRoot).toStrictEqual(tree);
    expect(store.treeNodeCount).toBe(3);
    expect(store.treeMaxDepth).toBe(1);
    expect(store.treeCoordinates.length).toBe(3);
  });

  it('should clear recursion tree', () => {
    const tree: RecursionNode = {
      nodeId: 'r',
      label: 'f()',
      depth: 0,
      status: 'RESOLVED',
      children: [],
    };
    store.updateRecursionTree(tree);
    store.clearRecursionTree();
    expect(store.recursionTreeRoot).toBeNull();
    expect(store.treeCoordinates).toEqual([]);
  });

  // ---- Heap Objects ----

  it('should add heap object', () => {
    const obj: HeapObject = {
      objectId: 'h1',
      address: '0x7ffd00',
      label: 'Node',
      type: 'FibNode',
      fields: { n: 3 },
    };
    store.addHeapObject(obj);
    expect(store.heapObjects.length).toBe(1);
    expect(store.heapObjects[0].address).toBe('0x7ffd00');
  });

  it('should not add duplicate heap object', () => {
    const obj: HeapObject = {
      objectId: 'h1',
      address: '0x7ffd00',
      label: 'Node',
      type: 'FibNode',
      fields: { n: 3 },
    };
    store.addHeapObject(obj);
    store.addHeapObject(obj);
    expect(store.heapObjects.length).toBe(1);
  });

  it('should remove heap object', () => {
    store.addHeapObject({
      objectId: 'h1',
      address: '0x7ffd00',
      label: 'Node',
      type: 'FibNode',
      fields: { n: 3 },
    });
    store.removeHeapObject('h1');
    expect(store.heapObjects.length).toBe(0);
  });

  // ---- Pointer Links ----

  it('should add pointer link', () => {
    const link: PointerLink = { sourceId: 'var-1', targetId: 'heap-1' };
    store.addPointerLink(link);
    expect(store.pointerLinks.length).toBe(1);
  });

  it('should not add duplicate pointer link', () => {
    const link: PointerLink = { sourceId: 'var-1', targetId: 'heap-1' };
    store.addPointerLink(link);
    store.addPointerLink(link);
    expect(store.pointerLinks.length).toBe(1);
  });

  it('should clear pointer links', () => {
    store.addPointerLink({ sourceId: 'v1', targetId: 'h1' });
    store.addPointerLink({ sourceId: 'v2', targetId: 'h2' });
    store.clearPointerLinks();
    expect(store.pointerLinks).toEqual([]);
  });

  // ---- Clear Inspector ----

  it('should clear all state', () => {
    store.pushFrame(createFrame('f1', 'main()', 5));
    store.addHeapObject({
      objectId: 'h1',
      address: '0x01',
      label: 'A',
      type: 'X',
      fields: {},
    });
    store.addPointerLink({ sourceId: 'v', targetId: 'h' });
    store.hoverVariable('0x01');
    store.updateRecursionTree({
      nodeId: 'r',
      label: 'f()',
      depth: 0,
      status: 'RESOLVED',
      children: [],
    });

    store.clearInspector();

    expect(store.stackFrames).toEqual([]);
    expect(store.activeFrameIndex).toBe(-1);
    expect(store.recursionTreeRoot).toBeNull();
    expect(store.heapObjects).toEqual([]);
    expect(store.pointerLinks).toEqual([]);
    expect(store.hoveredHeapAddress).toBeNull();
  });

  // ---- isStackFull ----

  it('should report isStackFull when at capacity', () => {
    for (let i = 0; i < MAX_STACK_FRAMES; i++) {
      store.pushFrame(createFrame(`f${i}`, `fn${i}()`, i));
    }
    expect(store.isStackFull).toBe(true);
  });

  // ---- Demo: Fibonacci ----

  it('should initialize Fibonacci demo with 4 frames', () => {
    store.initializeFibonacciDemo();

    expect(store.stackDepth).toBe(4);
    expect(store.stackFrames[0].functionName).toBe('main()');
    expect(store.stackFrames[1].functionName).toBe('fib(3)');
    expect(store.stackFrames[2].functionName).toBe('fib(2)');
    expect(store.stackFrames[3].functionName).toBe('fib(1)');
  });

  it('should initialize Fibonacci demo with heap objects', () => {
    store.initializeFibonacciDemo();
    expect(store.heapObjects.length).toBe(2);
    expect(store.heapObjects[0].address).toBe('0x7ffd00');
    expect(store.heapObjects[1].address).toBe('0x7ffd10');
  });

  it('should initialize Fibonacci demo with pointer links', () => {
    store.initializeFibonacciDemo();
    expect(store.pointerLinks.length).toBe(2);
  });

  it('should initialize Fibonacci demo with recursion tree', () => {
    store.initializeFibonacciDemo();
    expect(store.recursionTreeRoot).not.toBeNull();
    expect(store.treeNodeCount).toBe(5); // fib(3) → fib(2) → fib(1), fib(0); fib(1)
  });

  it('should initialize Fibonacci demo tree coordinates', () => {
    store.initializeFibonacciDemo();
    expect(store.treeCoordinates.length).toBe(5);
    expect(store.treeMaxDepth).toBe(2);
  });

  // ---- Demo: Step Forward ----

  it('should pop frame on demoStepForward', () => {
    store.initializeFibonacciDemo();
    const initialDepth = store.stackDepth;

    store.demoStepForward();
    expect(store.stackDepth).toBe(initialDepth - 1);
  });

  it('should resolve tree node on demoStepForward', () => {
    store.initializeFibonacciDemo();
    store.demoStepForward();

    expect(store.recursionTreeRoot).not.toBeNull();
  });

  it('should not crash demoStepForward on empty stack', () => {
    store.demoStepForward(); // no-op
    expect(store.stackDepth).toBe(0);
  });

  it('should not crash demoStepForward with single frame', () => {
    store.pushFrame(createFrame('f1', 'main()', 5));
    store.demoStepForward(); // should not pop if stack <= 1
    expect(store.stackDepth).toBe(1);
  });

  // ---- Demo: Push Call ----

  it('should push new call on demoPushCall', () => {
    store.initializeFibonacciDemo();
    const initialDepth = store.stackDepth;

    store.demoPushCall();
    expect(store.stackDepth).toBe(initialDepth + 1);
  });

  // ---- Demo: Reset After Demo ----

  it('should clearInspector after demo', () => {
    store.initializeFibonacciDemo();
    store.clearInspector();

    expect(store.stackDepth).toBe(0);
    expect(store.heapObjects.length).toBe(0);
    expect(store.pointerLinks.length).toBe(0);
    expect(store.recursionTreeRoot).toBeNull();
  });

  // ---- Re-initialize Demo ----

  it('should re-initialize demo cleanly', () => {
    store.initializeFibonacciDemo();
    store.demoStepForward();
    store.initializeFibonacciDemo(); // re-init

    expect(store.stackDepth).toBe(4);
    expect(store.heapObjects.length).toBe(2);
    expect(store.treeNodeCount).toBe(5);
  });
});
