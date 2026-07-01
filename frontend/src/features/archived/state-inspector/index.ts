// ============================================================
// state-inspector module — Public API
// Phase 2: State Inspector & Stack Frames
// Call Stack 3D Glassmorphic, Pointer Bezier, Recursion Tree SVG
// ============================================================

export { default as StateInspectorWorkspace } from './components/StateInspectorWorkspace.vue';
export { default as CallStackPanel } from './components/CallStackPanel.vue';
export { default as HeapObjectNode } from './components/HeapObjectNode.vue';
export { default as PointerNeonArrow } from './components/PointerNeonArrow.vue';
export { default as RecursionTreeSVG } from './components/RecursionTreeSVG.vue';

export { StateInspectorEngine } from './engine/StateInspectorEngine';
export { RecursionTreeGenerator } from './engine/RecursionTreeGenerator';
export { PointerArrowBatchRenderer } from './engine/PointerArrowBatchRenderer';

export { useStateInspectorStore } from './store/useStateInspectorStore';

export type {
  StackFrame,
  StackVariable,
  RecursionNodeStatus,
  RecursionNode,
  RecursionNodeCoordinate,
  HeapObject,
  PointerLink,
  BezierPathData,
} from './types/state-inspector.types';

export {
  MAX_STACK_FRAMES,
  TREE_DEPTH_SPACING_PX,
  TREE_ROOT_OFFSET_PX,
  BEZIER_CONTROL_FACTOR,
  BEZIER_MIN_DX,
  MONACO_REVEAL_LINE_EVENT,
  HOVER_PULSE_CLEAR_DELAY_MS,
} from './types/state-inspector.types';
