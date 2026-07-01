// ============================================================
// state-sandbox module — Public API
// Sprint 10: State Inspector Stack-Heap & Custom DSL Compiler
// ============================================================

export { default as StateInspector } from './components/StateInspector.vue';

export { CallStackEngine } from './engine/CallStackEngine';
export { DSLEngine } from './engine/DSLEngine';
export {
  type StackFrame3D,
  type HeapNode3D,
  type PointerArrow,
  type BezierPath,
  type MemorySnapshot,
  type DSLCommandType,
  type DSLCommand,
  type DSLAnimationFrame,
  type StackFrame,
  type HeapObject,
  type Pointer,
  type DSLCompileResult,
} from './types/state-sandbox.types';

export { runSampleScenario } from './scenarios/scenarios';
