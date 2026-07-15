// ============================================================
// oop-sandbox module — Public API
// Sprint 6: OOP Concepts Visualizer & VTable Sandboxing
// ============================================================

export { default as OOPSandbox } from './components/OOPSandbox.vue';

export {
  OOPReflectionEngine,
} from './engine/OOPReflectionEngine';

export {
  useOOPStore,
} from './store/useOOPStore';

export {
  drawAccessLock,
  drawViolationLaser,
  createShakeAnimation,
  getModifierColor,
  drawModifierBadge,
} from './engine/EncapsulationLock';

export type {
  AccessModifier,
  ClassMember,
  ClassDefinition,
  HeapObjectInstance,
  MethodDispatchResult,
  AccessCheckResult,
  LockConfig,
  LaserBeam,
} from './types/oop-sandbox.types';
