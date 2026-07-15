import { describe, it, expect, beforeEach } from 'vitest';
import { SystemDesignEngine } from '../engine/SystemDesignEngine';
import type { SystemNode, NetworkLink } from '../types/system-design-viz.types';

describe('SystemDesignEngine', () => {
  let engine: SystemDesignEngine;

  const makeNode = (overrides: Partial<SystemNode> = {}): SystemNode => ({
    nodeId: 'node-1',
    nodeType: 'WEB_SERVER',
    label: 'Server',
    status: 'HEALTHY',
    requestCount: 0,
    posX: 0,
    posY: 0,
    ...overrides,
  });

  const makeLink = (overrides: Partial<NetworkLink> = {}): NetworkLink => ({
    linkId: 'link-1',
    sourceId: 'lb-1',
    targetId: 'server-a',
    latencyMs: 20,
    ...overrides,
  });

  beforeEach(() => {
    engine = new SystemDesignEngine();
  });

  describe('Node Management', () => {
    it('should register and retrieve nodes', () => {
      const node = makeNode({ nodeId: 'test-node' });
      engine.registerNode(node);

      expect(engine.getNode('test-node')).toEqual(node);
      expect(engine.getNodes()).toHaveLength(1);
    });

    it('should overwrite existing node on re-register', () => {
      engine.registerNode(makeNode({ nodeId: 'n1', status: 'HEALTHY' }));
      engine.registerNode(makeNode({ nodeId: 'n1', status: 'FAILED' }));

      expect(engine.getNode('n1')?.status).toBe('FAILED');
      expect(engine.getNodes()).toHaveLength(1);
    });

    it('should return undefined for non-existent node', () => {
      expect(engine.getNode('missing')).toBeUndefined();
    });

    it('should set node status', () => {
      engine.registerNode(makeNode({ nodeId: 'srv' }));
      engine.setNodeStatus('srv', 'FAILED');

      expect(engine.getNode('srv')?.status).toBe('FAILED');
    });

    it('should ignore setNodeStatus for non-existent node', () => {
      engine.setNodeStatus('ghost', 'FAILED');
      expect(engine.getNode('ghost')).toBeUndefined();
    });
  });

  describe('Link Management', () => {
    it('should register links', () => {
      engine.registerLink(makeLink({ linkId: 'l1' }));
      expect(engine.getLinks()).toHaveLength(1);
    });

    it('should not register duplicate links', () => {
      engine.registerLink(makeLink({ linkId: 'l1' }));
      engine.registerLink(makeLink({ linkId: 'l1' }));

      expect(engine.getLinks()).toHaveLength(1);
    });
  });

  describe('Round-Robin Load Balancing', () => {
    beforeEach(() => {
      engine.registerNode(makeNode({ nodeId: 'lb-1', nodeType: 'LOAD_BALANCER', label: 'LB' }));
      engine.registerNode(makeNode({ nodeId: 'server-a', nodeType: 'WEB_SERVER', label: 'A' }));
      engine.registerNode(makeNode({ nodeId: 'server-b', nodeType: 'WEB_SERVER', label: 'B' }));
      engine.registerLink(makeLink({ linkId: 'lb-a', sourceId: 'lb-1', targetId: 'server-a' }));
      engine.registerLink(makeLink({ linkId: 'lb-b', sourceId: 'lb-1', targetId: 'server-b' }));
    });

    it('should distribute packets 50/50 using Round-Robin', () => {
      engine.routeRequestFromLB('lb-1', '#10B981');
      engine.routeRequestFromLB('lb-1', '#10B981');
      engine.routeRequestFromLB('lb-1', '#10B981');
      engine.routeRequestFromLB('lb-1', '#10B981');

      const packets = engine.getPackets();
      expect(packets).toHaveLength(4);

      const toA = packets.filter((p) => p.targetId === 'server-a').length;
      const toB = packets.filter((p) => p.targetId === 'server-b').length;
      expect(toA).toBe(2);
      expect(toB).toBe(2);
    });

    it('should increment requestCount on target server', () => {
      engine.routeRequestFromLB('lb-1', '#10B981');
      engine.routeRequestFromLB('lb-1', '#10B981');

      const srvA = engine.getNode('server-a');
      const srvB = engine.getNode('server-b');
      expect(srvA?.requestCount).toBe(1);
      expect(srvB?.requestCount).toBe(1);
    });

    it('should return null for non-existent LB', () => {
      expect(engine.routeRequestFromLB('ghost-lb', '#10B981')).toBeNull();
    });

    it('should create packet with correct initial state', () => {
      const packet = engine.routeRequestFromLB('lb-1', '#10B981');
      expect(packet).not.toBeNull();
      expect(packet!.progress).toBe(0);
      expect(packet!.status).toBe('IN_TRANSIT');
      expect(packet!.sourceId).toBe('lb-1');
      expect(packet!.packetColor).toBe('#10B981');
    });
  });

  describe('Failover — Server A FAILED', () => {
    beforeEach(() => {
      engine.registerNode(makeNode({ nodeId: 'lb-1', nodeType: 'LOAD_BALANCER', label: 'LB' }));
      engine.registerNode(makeNode({ nodeId: 'server-a', nodeType: 'WEB_SERVER', label: 'A', status: 'FAILED' }));
      engine.registerNode(makeNode({ nodeId: 'server-b', nodeType: 'WEB_SERVER', label: 'B' }));
      engine.registerLink(makeLink({ linkId: 'lb-a', sourceId: 'lb-1', targetId: 'server-a' }));
      engine.registerLink(makeLink({ linkId: 'lb-b', sourceId: 'lb-1', targetId: 'server-b' }));
    });

    it('should redirect 100% packets to Server B when A is FAILED', () => {
      engine.routeRequestFromLB('lb-1', '#10B981');
      engine.routeRequestFromLB('lb-1', '#10B981');

      const packets = engine.getPackets();
      expect(packets).toHaveLength(2);

      const toA = packets.filter((p) => p.targetId === 'server-a').length;
      const toB = packets.filter((p) => p.targetId === 'server-b').length;
      expect(toA).toBe(0);
      expect(toB).toBe(2);
    });

    it('should return null when ALL servers are FAILED', () => {
      engine.setNodeStatus('server-b', 'FAILED');

      expect(engine.routeRequestFromLB('lb-1', '#10B981')).toBeNull();
      expect(engine.getPackets()).toHaveLength(0);
    });
  });

  describe('Packet Progress & GC', () => {
    beforeEach(() => {
      engine.registerNode(makeNode({ nodeId: 'lb-1', nodeType: 'LOAD_BALANCER' }));
      engine.registerNode(makeNode({ nodeId: 'server-a', nodeType: 'WEB_SERVER' }));
      engine.registerLink(makeLink({ linkId: 'lb-a', sourceId: 'lb-1', targetId: 'server-a' }));
    });

    it('should advance packet progress by deltaTime * PACKET_SPEED', () => {
      engine.routeRequestFromLB('lb-1', '#10B981');
      engine.updatePacketsProgress(10);

      const packets = engine.getPackets();
      expect(packets).toHaveLength(1);
      expect(packets[0].progress).toBe(0.5);
    });

    it('should remove arrived packets (progress >= 1.0) — GC', () => {
      engine.routeRequestFromLB('lb-1', '#10B981');
      engine.updatePacketsProgress(20);

      expect(engine.getPackets()).toHaveLength(0);
      expect(engine.getPacketCount()).toBe(0);
    });

    it('should drop packets targeting FAILED nodes', () => {
      engine.routeRequestFromLB('lb-1', '#10B981');
      engine.setNodeStatus('server-a', 'FAILED');
      engine.updatePacketsProgress(1);

      expect(engine.getPackets()).toHaveLength(0);
    });
  });

  describe('Direct Packet', () => {
    it('should create a direct packet between two nodes', () => {
      engine.registerNode(makeNode({ nodeId: 'srv-a' }));
      engine.registerNode(makeNode({ nodeId: 'db-1', nodeType: 'POSTGRES_PRIMARY' }));

      const packet = engine.createDirectPacket('srv-a', 'db-1', '#FBBF24');
      expect(packet).not.toBeNull();
      expect(packet!.sourceId).toBe('srv-a');
      expect(packet!.targetId).toBe('db-1');
      expect(packet!.packetColor).toBe('#FBBF24');
    });

    it('should return null if source or target does not exist', () => {
      engine.registerNode(makeNode({ nodeId: 'srv-a' }));
      expect(engine.createDirectPacket('srv-a', 'ghost', '#FFF')).toBeNull();
      expect(engine.createDirectPacket('ghost', 'srv-a', '#FFF')).toBeNull();
    });
  });

  describe('MAX_ACTIVE_PACKETS limit', () => {
    it('should not create packets beyond MAX_ACTIVE_PACKETS (200)', () => {
      engine.registerNode(makeNode({ nodeId: 'lb-1', nodeType: 'LOAD_BALANCER' }));
      engine.registerNode(makeNode({ nodeId: 'server-a', nodeType: 'WEB_SERVER' }));
      engine.registerLink(makeLink({ linkId: 'lb-a', sourceId: 'lb-1', targetId: 'server-a' }));

      for (let i = 0; i < 205; i++) {
        engine.routeRequestFromLB('lb-1', '#10B981');
      }

      expect(engine.getPacketCount()).toBe(200);
    });
  });

  describe('Clear', () => {
    it('should clear all state', () => {
      engine.registerNode(makeNode({ nodeId: 'n1' }));
      engine.registerLink(makeLink({ linkId: 'l1' }));
      engine.clear();

      expect(engine.getNodes()).toHaveLength(0);
      expect(engine.getLinks()).toHaveLength(0);
      expect(engine.getPackets()).toHaveLength(0);
    });
  });
});
