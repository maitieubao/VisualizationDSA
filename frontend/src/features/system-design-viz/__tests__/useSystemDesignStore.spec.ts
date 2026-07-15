import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSystemDesignStore } from '../store/useSystemDesignStore';

// Mock the API service — tests should use fallback (hardcoded) topology
vi.mock('../services/systemDesignApi', () => ({
  fetchTopology: vi.fn().mockRejectedValue(new Error('No backend in test')),
  executeScenario: vi.fn().mockRejectedValue(new Error('No backend in test')),
  fetchScenarios: vi.fn().mockRejectedValue(new Error('No backend in test')),
}));

const dispatchedEvents: Array<{ type: string; detail: Record<string, unknown> }> = [];

vi.stubGlobal('CustomEvent', class MockCustomEvent {
  type: string;
  detail: Record<string, unknown>;
  constructor(type: string, opts?: { detail?: Record<string, unknown> }) {
    this.type = type;
    this.detail = opts?.detail ?? {};
  }
});

vi.stubGlobal('window', {
  dispatchEvent: (event: { type: string; detail: Record<string, unknown> }) => {
    dispatchedEvents.push(event);
    return true;
  },
});

describe('useSystemDesignStore', () => {
  let store: ReturnType<typeof useSystemDesignStore>;

  beforeEach(() => {
    vi.useFakeTimers();
    dispatchedEvents.length = 0;
    setActivePinia(createPinia());
    store = useSystemDesignStore();
  });

  afterEach(() => {
    store.clearTopology();
    vi.useRealTimers();
  });

  describe('Demo Topology Initialization', () => {
    it('should initialize demo topology with 6 nodes', async () => {
      await store.initializeDemoTopology();

      expect(store.nodes).toHaveLength(6);
      expect(store.nodes.map((n) => n.nodeType)).toEqual(
        expect.arrayContaining([
          'CLIENT',
          'LOAD_BALANCER',
          'WEB_SERVER',
          'WEB_SERVER',
          'POSTGRES_PRIMARY',
          'POSTGRES_REPLICA',
        ]),
      );
    });

    it('should initialize demo topology with 6 links', async () => {
      await store.initializeDemoTopology();
      expect(store.links).toHaveLength(6);
    });

    it('should start with zero active packets', async () => {
      await store.initializeDemoTopology();
      expect(store.activePackets).toHaveLength(0);
      expect(store.totalPacketsInFlight).toBe(0);
    });

    it('should start with default replication lag 1000ms', async () => {
      await store.initializeDemoTopology();
      expect(store.replicationLagMs).toBe(1000);
    });

    it('should report 6 healthy nodes initially', async () => {
      await store.initializeDemoTopology();
      expect(store.healthyNodeCount).toBe(6);
      expect(store.failedNodeCount).toBe(0);
    });
  });

  describe('HTTP Request Injection (Round-Robin)', () => {
    beforeEach(async () => {
      await store.initializeDemoTopology();
    });

    it('should create a packet on injectHttpRequest', () => {
      store.injectHttpRequest();
      expect(store.activePackets).toHaveLength(1);
      expect(store.activePackets[0].packetColor).toBe('#10B981');
    });

    it('should distribute packets Round-Robin between Server A and B', () => {
      store.injectHttpRequest();
      store.injectHttpRequest();

      const targets = store.activePackets.map((p) => p.targetId);
      expect(targets).toContain('server-a');
      expect(targets).toContain('server-b');
    });

    it('should inject traffic burst of N packets', () => {
      store.injectTrafficBurst(10);

      expect(store.activePackets.length).toBe(10);
      expect(store.isTrafficSpikeActive).toBe(true);
    });
  });

  describe('Server Failover Toggle', () => {
    beforeEach(async () => {
      await store.initializeDemoTopology();
    });

    it('should toggle server status HEALTHY → FAILED', () => {
      store.toggleServerStatus('server-a');

      const serverA = store.nodes.find((n) => n.nodeId === 'server-a');
      expect(serverA?.status).toBe('FAILED');
      expect(store.failedNodeIds.has('server-a')).toBe(true);
      expect(store.failedNodeCount).toBe(1);
    });

    it('should toggle server status FAILED → HEALTHY', () => {
      store.toggleServerStatus('server-a');
      store.toggleServerStatus('server-a');

      const serverA = store.nodes.find((n) => n.nodeId === 'server-a');
      expect(serverA?.status).toBe('HEALTHY');
      expect(store.failedNodeIds.has('server-a')).toBe(false);
    });

    it('should NOT toggle non-WEB_SERVER nodes (CLIENT, LB, DB)', () => {
      store.toggleServerStatus('client-1');
      store.toggleServerStatus('lb-1');
      store.toggleServerStatus('db-primary');

      expect(store.nodes.find((n) => n.nodeId === 'client-1')?.status).toBe('HEALTHY');
      expect(store.nodes.find((n) => n.nodeId === 'lb-1')?.status).toBe('HEALTHY');
      expect(store.nodes.find((n) => n.nodeId === 'db-primary')?.status).toBe('HEALTHY');
    });

    it('should redirect all packets to Server B after A fails', () => {
      store.toggleServerStatus('server-a');

      store.injectHttpRequest();
      store.injectHttpRequest();

      const toA = store.activePackets.filter((p) => p.targetId === 'server-a').length;
      const toB = store.activePackets.filter((p) => p.targetId === 'server-b').length;

      expect(toA).toBe(0);
      expect(toB).toBe(2);
    });

    it('should dispatch SERVER_FAILED_SMOKE_BURST event on failure', () => {
      store.toggleServerStatus('server-a');

      const smokeEvents = dispatchedEvents.filter((e) => e.type === 'SERVER_FAILED_SMOKE_BURST');
      expect(smokeEvents).toHaveLength(1);
      expect(smokeEvents[0].detail.nodeId).toBe('server-a');
    });
  });

  describe('Database Replication', () => {
    beforeEach(async () => {
      await store.initializeDemoTopology();
    });

    it('should add pending replication job on triggerDbWrite', () => {
      store.triggerDbWrite();
      expect(store.pendingReplications.length).toBeGreaterThanOrEqual(1);
    });

    it('should complete replication after lag delay', () => {
      store.triggerDbWrite();
      expect(store.completedReplications).toBe(0);

      vi.advanceTimersByTime(1000);
      expect(store.completedReplications).toBe(1);
      expect(store.pendingReplications).toHaveLength(0);
    });

    it('should respect configured replication lag', () => {
      store.setReplicationLag(2000);
      store.triggerDbWrite();

      vi.advanceTimersByTime(1999);
      expect(store.completedReplications).toBe(0);

      vi.advanceTimersByTime(1);
      expect(store.completedReplications).toBe(1);
    });
  });

  describe('Replication Lag Configuration', () => {
    it('should set replication lag within valid range', () => {
      store.setReplicationLag(2500);
      expect(store.replicationLagMs).toBe(2500);
    });

    it('should clamp lag below minimum (100ms)', () => {
      store.setReplicationLag(10);
      expect(store.replicationLagMs).toBe(100);
    });

    it('should clamp lag above maximum (5000ms)', () => {
      store.setReplicationLag(9999);
      expect(store.replicationLagMs).toBe(5000);
    });
  });

  describe('Engine Tick & Packet GC', () => {
    beforeEach(async () => {
      await store.initializeDemoTopology();
    });

    it('should advance packets on tickEngine', () => {
      store.injectHttpRequest();
      store.tickEngine(5);

      expect(store.activePackets[0].progress).toBeGreaterThan(0);
    });

    it('should remove arrived packets (GC)', () => {
      store.injectHttpRequest();
      store.tickEngine(25);

      expect(store.activePackets).toHaveLength(0);
    });
  });

  describe('Clear Topology', () => {
    it('should reset all state on clearTopology', async () => {
      await store.initializeDemoTopology();
      store.injectTrafficBurst(5);
      store.toggleServerStatus('server-a');

      store.clearTopology();

      expect(store.nodes).toHaveLength(0);
      expect(store.links).toHaveLength(0);
      expect(store.activePackets).toHaveLength(0);
      expect(store.pendingReplications).toHaveLength(0);
      expect(store.completedReplications).toBe(0);
      expect(store.isTrafficSpikeActive).toBe(false);
      expect(store.failedNodeIds.size).toBe(0);
      expect(store.replicationLagMs).toBe(1000);
    });
  });
});
