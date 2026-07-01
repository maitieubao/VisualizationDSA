// ============================================================
// system-sandbox module — Public API
// Sprint 11: System Design Network Simulator & Failover Smoke
// ============================================================

export { default as SystemSandbox } from './components/SystemSandbox.vue';

export {
  LoadBalancerEngine,
} from './engine/LoadBalancerEngine';

export {
  useSystemSandboxStore,
} from './store/useSystemSandboxStore';

export type {
  ServerNode,
  HTTPRequest,
  DBReplicationEvent,
  SmokeParticle,
} from './types/system-sandbox.types';
