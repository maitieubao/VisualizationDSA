// ============================================================
// di-sandbox module — Public API
// Phase 2: IoC Container Dependency Visualizer (Upgraded)
// ============================================================

export { default as DISandbox } from './components/DISandbox.vue';
export { default as IoCWorkspace } from './components/IoCWorkspace.vue';

export {
  DIContainerEngine,
  type ServiceLifetime,
  type ServiceRegistration,
  type ServiceInstance,
  type DependencyGraph,
  type CycleDetectionResult,
  type ResolutionResult,
} from './DIContainerEngine';

export { IoCContainerSimulator } from './engine/IoCContainerSimulator';
export { useIoCDebuggerStore } from './store/useIoCDebuggerStore';
export type {
  Lifetime,
  IoCRegistration,
  ResolutionStep,
  ResolvedInstance,
  ResolutionTreeNode,
  DIScenarioPayload,
} from './types/ioc.types';
