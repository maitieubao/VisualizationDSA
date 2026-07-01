import { defineStore } from 'pinia';
import { ref } from 'vue';
import { LoadBalancerEngine } from '../engine/LoadBalancerEngine';
import type { ServerNode, HTTPRequest, SmokeParticle } from '../types/system-sandbox.types';

export const useSystemSandboxStore = defineStore('systemSandbox', () => {
  const engine = new LoadBalancerEngine();

  const allServers = ref<ServerNode[]>([]);
  const activeRequests = ref<HTTPRequest[]>([]);
  const smokeParticles = ref<SmokeParticle[]>([]);
  const replicationDelay = ref(500);

  function updateState(): void {
    allServers.value = engine.getAllServers();
    activeRequests.value = engine.getActiveRequests();
    smokeParticles.value = engine.getSmokeParticles();
  }

  function initializeInfrastructure(): void {
    engine.initializeInfrastructure();
    updateState();
  }

  function simulateRequest(): void {
    engine.simulateRequest();
    updateState();
  }

  function simulateBurst(): void {
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        engine.simulateRequest();
        updateState();
      }, i * 100);
    }
  }

  function toggleServerStatus(serverId: string): void {
    const server = allServers.value.find((s) => s.id === serverId);
    if (!server) return;

    if (server.status === 'FAILED') {
      engine.recoverServer(serverId);
    } else {
      engine.failServer(serverId);
    }
    updateState();
  }

  function triggerReplication(): void {
    engine.simulateReplication(replicationDelay.value);
    updateState();
  }

  function updateEngine(deltaTime: number): void {
    engine.updateRequests(deltaTime);
    engine.updateSmoke(deltaTime);
    updateState();
  }

  function resetEngine(): void {
    engine.reset();
    updateState();
  }

  return {
    allServers,
    activeRequests,
    smokeParticles,
    replicationDelay,
    initializeInfrastructure,
    simulateRequest,
    simulateBurst,
    toggleServerStatus,
    triggerReplication,
    updateEngine,
    resetEngine,
  };
});
