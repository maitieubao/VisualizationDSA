// ============================================================
// di-sandbox module — Public API
// Sprint 8: Dependency Injection & IoC Container Visualizer
// ============================================================

export { default as DISandbox } from './components/DISandbox.vue';

export {
  DIContainerEngine,
  type ServiceLifetime,
  type ServiceRegistration,
  type ServiceInstance,
  type DependencyGraph,
  type CycleDetectionResult,
  type ResolutionResult,
} from './DIContainerEngine';
