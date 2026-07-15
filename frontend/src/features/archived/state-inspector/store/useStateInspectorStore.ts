// ============================================================
// useStateInspectorStore — Pinia Setup Store
// Manages Call Stack, Recursion Tree, Heap Objects, Pointer Links
// Monaco line sync via CustomEvent dispatch
// ============================================================

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  StackFrame,
  RecursionNode,
  RecursionNodeCoordinate,
  HeapObject,
  PointerLink,
} from '../types/state-inspector.types';
import {
  MAX_STACK_FRAMES,
  MONACO_REVEAL_LINE_EVENT,
} from '../types/state-inspector.types';
import { StateInspectorEngine } from '../engine/StateInspectorEngine';
import { RecursionTreeGenerator } from '../engine/RecursionTreeGenerator';

export const useStateInspectorStore = defineStore('stateInspector', () => {
  // ==========================================
  // STATE
  // ==========================================
  const stackFrames = ref<StackFrame[]>([]);
  const activeFrameIndex = ref<number>(-1);
  const recursionTreeRoot = ref<RecursionNode | null>(null);
  const heapObjects = ref<HeapObject[]>([]);
  const pointerLinks = ref<PointerLink[]>([]);
  const hoveredHeapAddress = ref<string | null>(null);

  const engine = new StateInspectorEngine();

  // ==========================================
  // COMPUTED
  // ==========================================

  /** Flat coordinate array for SVG recursion tree rendering */
  const treeCoordinates = computed<RecursionNodeCoordinate[]>(() => {
    if (!recursionTreeRoot.value) return [];
    return RecursionTreeGenerator.calculateCoordinates(recursionTreeRoot.value, 600);
  });

  /** Total node count in recursion tree */
  const treeNodeCount = computed<number>(() => {
    if (!recursionTreeRoot.value) return 0;
    return RecursionTreeGenerator.countNodes(recursionTreeRoot.value);
  });

  /** Maximum depth of recursion tree */
  const treeMaxDepth = computed<number>(() => {
    if (!recursionTreeRoot.value) return 0;
    return RecursionTreeGenerator.getMaxDepth(recursionTreeRoot.value);
  });

  /** Current stack depth */
  const stackDepth = computed<number>(() => stackFrames.value.length);

  /** Whether stack has reached maximum capacity */
  const isStackFull = computed<boolean>(() => stackFrames.value.length >= MAX_STACK_FRAMES);

  /** Active frame (currently selected for inspection) */
  const activeFrame = computed<StackFrame | null>(() => {
    if (activeFrameIndex.value < 0 || activeFrameIndex.value >= stackFrames.value.length) {
      return null;
    }
    return stackFrames.value[activeFrameIndex.value];
  });

  /** Variables of the active frame */
  const activeVariables = computed(() => {
    if (!activeFrame.value) return {};
    return activeFrame.value.localVariables;
  });

  // ==========================================
  // ACTIONS
  // ==========================================

  /** Push a new stack frame */
  function pushFrame(frame: StackFrame): void {
    engine.pushFrame(frame);
    syncStoreWithEngine();
    triggerMonacoLineSync(frame.lineNumber);
  }

  /** Pop top stack frame */
  function popFrame(): StackFrame | null {
    const popped = engine.popFrame();
    syncStoreWithEngine();

    if (stackFrames.value.length > 0) {
      const topFrame = stackFrames.value[stackFrames.value.length - 1];
      triggerMonacoLineSync(topFrame.lineNumber);
    }

    return popped;
  }

  /** Select a specific frame for inspection */
  function selectFrame(index: number): void {
    const frame = engine.switchActiveFrame(index);
    if (!frame) return;
    syncStoreWithEngine();
    triggerMonacoLineSync(frame.lineNumber);
  }

  /** Hover over a variable to highlight its heap target */
  function hoverVariable(heapAddress?: string): void {
    hoveredHeapAddress.value = heapAddress ?? null;
  }

  /** Update the recursion tree root */
  function updateRecursionTree(root: RecursionNode): void {
    recursionTreeRoot.value = root;
  }

  /** Clear the recursion tree */
  function clearRecursionTree(): void {
    recursionTreeRoot.value = null;
  }

  /** Add a heap object */
  function addHeapObject(obj: HeapObject): void {
    const existing = heapObjects.value.find((h) => h.objectId === obj.objectId);
    if (!existing) {
      heapObjects.value.push(obj);
    }
  }

  /** Remove a heap object */
  function removeHeapObject(objectId: string): void {
    heapObjects.value = heapObjects.value.filter((h) => h.objectId !== objectId);
  }

  /** Add a pointer link (Stack → Heap) */
  function addPointerLink(link: PointerLink): void {
    const existing = pointerLinks.value.find(
      (l) => l.sourceId === link.sourceId && l.targetId === link.targetId
    );
    if (!existing) {
      pointerLinks.value.push(link);
    }
  }

  /** Clear all pointer links */
  function clearPointerLinks(): void {
    pointerLinks.value = [];
  }

  /** Reset everything: stack, tree, heap, pointers */
  function clearInspector(): void {
    engine.clear();
    stackFrames.value = [];
    activeFrameIndex.value = -1;
    recursionTreeRoot.value = null;
    heapObjects.value = [];
    pointerLinks.value = [];
    hoveredHeapAddress.value = null;
  }

  // ==========================================
  // DEMO — Fibonacci Recursion Demo
  // ==========================================

  /** Initialize demo with Fibonacci recursion scenario */
  function initializeFibonacciDemo(): void {
    clearInspector();

    // Push demo stack frames: main → fib(3) → fib(2) → fib(1)
    const frames: StackFrame[] = [
      {
        frameId: 'main-frame',
        functionName: 'main()',
        lineNumber: 5,
        localVariables: {
          result: { value: null, heapAddress: '0x7ffd00' },
        },
        isActive: false,
      },
      {
        frameId: 'fib-3-frame',
        functionName: 'fib(3)',
        lineNumber: 12,
        localVariables: {
          n: { value: 3 },
          ptr: { value: null, heapAddress: '0x7ffd10' },
        },
        isActive: false,
      },
      {
        frameId: 'fib-2-frame',
        functionName: 'fib(2)',
        lineNumber: 14,
        localVariables: {
          n: { value: 2 },
        },
        isActive: false,
      },
      {
        frameId: 'fib-1-frame',
        functionName: 'fib(1)',
        lineNumber: 14,
        localVariables: {
          n: { value: 1 },
        },
        isActive: false,
      },
    ];

    frames.forEach((f) => pushFrame(f));

    // Add demo heap objects
    addHeapObject({
      objectId: 'heap-result',
      address: '0x7ffd00',
      label: 'Result',
      type: 'Object',
      fields: { value: null, computed: false },
    });

    addHeapObject({
      objectId: 'heap-node-ptr',
      address: '0x7ffd10',
      label: 'Node',
      type: 'FibNode',
      fields: { n: 3, left: null, right: null },
    });

    // Add pointer links
    addPointerLink({ sourceId: 'var-result-0x7ffd00', targetId: 'heap-0x7ffd00' });
    addPointerLink({ sourceId: 'var-ptr-0x7ffd10', targetId: 'heap-0x7ffd10' });

    // Build recursion tree: fib(3) → fib(2) → fib(1), fib(0); fib(1)
    const fibTree: RecursionNode = {
      nodeId: 'fib-3',
      label: 'fib(3)',
      depth: 0,
      status: 'ACTIVE',
      children: [
        {
          nodeId: 'fib-2',
          label: 'fib(2)',
          depth: 1,
          status: 'ACTIVE',
          children: [
            {
              nodeId: 'fib-1-left',
              label: 'fib(1)',
              depth: 2,
              status: 'RESOLVED',
              returnValue: 1,
              children: [],
            },
            {
              nodeId: 'fib-0',
              label: 'fib(0)',
              depth: 2,
              status: 'RESOLVED',
              returnValue: 0,
              children: [],
            },
          ],
        },
        {
          nodeId: 'fib-1-right',
          label: 'fib(1)',
          depth: 1,
          status: 'PENDING',
          children: [],
        },
      ],
    };

    updateRecursionTree(fibTree);
  }

  /** Demo: step forward — pop fib(1) and resolve fib(2) */
  function demoStepForward(): void {
    if (stackFrames.value.length <= 1) return;

    popFrame();

    // Update tree: mark current top as RESOLVED with return value
    if (recursionTreeRoot.value) {
      const updatedTree = JSON.parse(JSON.stringify(recursionTreeRoot.value)) as RecursionNode;
      resolveFirstActive(updatedTree);
      updateRecursionTree(updatedTree);
    }
  }

  /** Demo: push a new recursive call */
  function demoPushCall(): void {
    const depth = stackFrames.value.length;
    const frame: StackFrame = {
      frameId: `demo-frame-${Date.now()}`,
      functionName: `fib(${Math.max(0, 4 - depth)})`,
      lineNumber: 14,
      localVariables: {
        n: { value: Math.max(0, 4 - depth) },
      },
      isActive: false,
    };
    pushFrame(frame);
  }

  // ==========================================
  // UTILS
  // ==========================================

  function syncStoreWithEngine(): void {
    stackFrames.value = engine.getStack();
    activeFrameIndex.value = engine.getActiveFrameIndex();
  }

  function triggerMonacoLineSync(lineNumber: number): void {
    const syncEvent = new CustomEvent(MONACO_REVEAL_LINE_EVENT, {
      detail: { lineNumber },
    });
    window.dispatchEvent(syncEvent);
  }

  function resolveFirstActive(node: RecursionNode): boolean {
    if (node.children.length === 0 && node.status === 'ACTIVE') {
      node.status = 'RESOLVED';
      node.returnValue = 1;
      return true;
    }
    for (const child of node.children) {
      if (resolveFirstActive(child)) return true;
    }
    if (node.status === 'ACTIVE') {
      const allChildrenResolved = node.children.every((c) => c.status === 'RESOLVED');
      if (allChildrenResolved) {
        node.status = 'RESOLVED';
        node.returnValue = node.children.reduce(
          (sum, c) => sum + (typeof c.returnValue === 'number' ? c.returnValue : 0),
          0
        );
        return true;
      }
    }
    return false;
  }

  return {
    // State
    stackFrames,
    activeFrameIndex,
    recursionTreeRoot,
    heapObjects,
    pointerLinks,
    hoveredHeapAddress,

    // Computed
    treeCoordinates,
    treeNodeCount,
    treeMaxDepth,
    stackDepth,
    isStackFull,
    activeFrame,
    activeVariables,

    // Actions
    pushFrame,
    popFrame,
    selectFrame,
    hoverVariable,
    updateRecursionTree,
    clearRecursionTree,
    addHeapObject,
    removeHeapObject,
    addPointerLink,
    clearPointerLinks,
    clearInspector,

    // Demo
    initializeFibonacciDemo,
    demoStepForward,
    demoPushCall,
  };
});
