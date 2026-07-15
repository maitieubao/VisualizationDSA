import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { SystemDesignEngine } from '../engine/SystemDesignEngine';
import { ReplicationLagScheduler } from '../engine/ReplicationLagScheduler';
import type {
  SystemNode,
  NetworkLink,
  NetworkPacket,
  ReplicationJob,
  SystemDesignFrame,
} from '../types/system-design-viz.types';
import {
  PACKET_COLORS,
  REPLICATION_LAG_DEFAULT_MS,
  REPLICATION_LAG_MIN_MS,
  REPLICATION_LAG_MAX_MS,
} from '../types/system-design-viz.types';
import {
  fetchTopology as apiFetchTopology,
  executeScenario as apiExecuteScenario,
  fetchScenarios as apiFetchScenarios,
} from '../services/systemDesignApi';

export const useSystemDesignStore = defineStore('systemDesign', () => {
  // ── Core State (shared by both modes) ──
  const nodes = ref<SystemNode[]>([]);
  const links = ref<NetworkLink[]>([]);
  const activePackets = ref<NetworkPacket[]>([]);
  const replicationLagMs = ref<number>(REPLICATION_LAG_DEFAULT_MS);
  const isTrafficSpikeActive = ref<boolean>(false);
  const pendingReplications = ref<ReplicationJob[]>([]);
  const completedReplications = ref<number>(0);
  const failedNodeIds = ref<Set<string>>(new Set());

  // ── Engine instances (interactive/sandbox mode only) ──
  const engine = new SystemDesignEngine();
  const replicationScheduler = new ReplicationLagScheduler();

  // ── VCR / Scenario Mode State ──
  const isScenarioMode = ref<boolean>(false);
  const scenarioFrames = ref<SystemDesignFrame[]>([]);
  const currentFrameIndex = ref<number>(-1);
  const selectedScenarioId = ref<string | null>(null);
  const availableScenarios = ref<string[]>([]);
  const isAutoplayActive = ref<boolean>(false);
  const autoplayTimerId = ref<ReturnType<typeof setTimeout> | null>(null);
  const playbackSpeed = ref<number>(1);

  // ── API State ──
  const isLoadingApi = ref<boolean>(false);
  const apiError = ref<string | null>(null);

  // ── Computed ──
  const healthyNodeCount = computed(
    () => nodes.value.filter((n) => n.status === 'HEALTHY').length,
  );
  const failedNodeCount = computed(
    () => nodes.value.filter((n) => n.status === 'FAILED').length,
  );
  const totalPacketsInFlight = computed(() => activePackets.value.length);
  const totalFrames = computed(() => scenarioFrames.value.length);
  const currentFrame = computed<SystemDesignFrame | null>(
    () => scenarioFrames.value[currentFrameIndex.value] ?? null,
  );
  const canGoNext = computed(
    () => currentFrameIndex.value < scenarioFrames.value.length - 1,
  );
  const canGoPrev = computed(() => currentFrameIndex.value > 0);

  // ============================================================
  // INITIALIZATION — fetches topology from backend API
  // ============================================================

  async function initializeDemoTopology(): Promise<void> {
    exitScenarioMode();
    engine.clear();
    replicationScheduler.clear();
    failedNodeIds.value.clear();
    isLoadingApi.value = true;
    apiError.value = null;

    let topoNodes: SystemNode[];
    let topoLinks: NetworkLink[];

    try {
      const topology = await apiFetchTopology();
      topoNodes = topology.nodes;
      topoLinks = topology.links;
    } catch {
      // Fallback to hardcoded topology when backend is unreachable
      topoNodes = createFallbackNodes();
      topoLinks = createFallbackLinks();
    } finally {
      isLoadingApi.value = false;
    }

    for (const node of topoNodes) {
      engine.registerNode(node);
    }
    for (const link of topoLinks) {
      engine.registerLink(link);
    }

    nodes.value = [...topoNodes];
    links.value = [...topoLinks];
    activePackets.value = [];
    pendingReplications.value = [];
    completedReplications.value = 0;
    isTrafficSpikeActive.value = false;
  }

  /** Fetch available scenarios from backend */
  async function fetchAvailableScenarios(): Promise<void> {
    try {
      const response = await apiFetchScenarios();
      availableScenarios.value = response.scenarios;
    } catch {
      availableScenarios.value = [
        'round-robin-lb',
        'server-failover',
        'db-replication',
        'full-demo',
      ];
    }
  }

  // ============================================================
  // SCENARIO / VCR MODE — backend-driven frame playback
  // ============================================================

  /**
   * Load a scenario from the backend and enter VCR playback mode.
   * Fetches frame sequence via POST /execute and applies the first frame.
   */
  async function loadScenario(scenarioId: string): Promise<void> {
    stopAutoplay();
    isLoadingApi.value = true;
    apiError.value = null;
    selectedScenarioId.value = scenarioId;

    try {
      const frames = await apiExecuteScenario(scenarioId, replicationLagMs.value);
      scenarioFrames.value = frames;
      currentFrameIndex.value = 0;
      isScenarioMode.value = true;
      applyCurrentFrame();
    } catch (err: unknown) {
      apiError.value = err instanceof Error ? err.message : 'Failed to load scenario';
      selectedScenarioId.value = null;
    } finally {
      isLoadingApi.value = false;
    }
  }

  /** Apply the current frame's state snapshot to all reactive refs */
  function applyCurrentFrame(): void {
    const frame = scenarioFrames.value[currentFrameIndex.value];
    if (!frame) return;

    nodes.value = frame.nodes.map((n) => ({ ...n }));
    links.value = frame.links.map((l) => ({ ...l }));
    activePackets.value = frame.activePackets.map((p) => ({ ...p }));

    // Map backend ReplicationJobSnapshot → frontend ReplicationJob (add startedAt)
    pendingReplications.value = frame.pendingReplications.map((r) => ({
      ...r,
      startedAt: Date.now(),
    }));

    // Sync failedNodeIds set from frame data
    failedNodeIds.value = new Set(
      frame.nodes.filter((n) => n.status === 'FAILED').map((n) => n.nodeId),
    );

    // Dispatch smoke events for any failed nodes
    for (const nodeId of failedNodeIds.value) {
      dispatchSmokeEvent(nodeId);
    }
  }

  function nextFrame(): void {
    if (!canGoNext.value) return;
    currentFrameIndex.value++;
    applyCurrentFrame();
  }

  function prevFrame(): void {
    if (!canGoPrev.value) return;
    currentFrameIndex.value--;
    applyCurrentFrame();
  }

  function resetFrames(): void {
    if (scenarioFrames.value.length === 0) return;
    stopAutoplay();
    currentFrameIndex.value = 0;
    applyCurrentFrame();
  }

  // ── VCR Autoplay ──

  function startAutoplay(): void {
    if (isAutoplayActive.value || scenarioFrames.value.length === 0) return;
    isAutoplayActive.value = true;
    autoplayStep();
  }

  function autoplayStep(): void {
    if (!isAutoplayActive.value || !canGoNext.value) {
      stopAutoplay();
      return;
    }
    nextFrame();
    const delay = 2500 / playbackSpeed.value;
    autoplayTimerId.value = setTimeout(autoplayStep, delay);
  }

  function stopAutoplay(): void {
    isAutoplayActive.value = false;
    if (autoplayTimerId.value !== null) {
      clearTimeout(autoplayTimerId.value);
      autoplayTimerId.value = null;
    }
  }

  function toggleAutoplay(): void {
    if (isAutoplayActive.value) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  }

  function setPlaybackSpeed(speed: number): void {
    playbackSpeed.value = speed;
  }

  function exitScenarioMode(): void {
    stopAutoplay();
    isScenarioMode.value = false;
    scenarioFrames.value = [];
    currentFrameIndex.value = -1;
    selectedScenarioId.value = null;
    apiError.value = null;
  }

  // ============================================================
  // INTERACTIVE / SANDBOX MODE — local engine simulation
  // ============================================================

  function toggleServerStatus(nodeId: string): void {
    const node = nodes.value.find((n) => n.nodeId === nodeId);
    if (!node || (node.nodeType !== 'WEB_SERVER' && node.nodeType !== 'REDIS_CACHE')) return;

    if (node.status === 'FAILED') {
      node.status = 'HEALTHY';
      failedNodeIds.value.delete(nodeId);
    } else {
      node.status = 'FAILED';
      failedNodeIds.value.add(nodeId);
      dispatchSmokeEvent(nodeId);
    }

    engine.setNodeStatus(nodeId, node.status);
  }

  function injectHttpRequest(): void {
    const packet = engine.routeRequestFromLB('lb-1', PACKET_COLORS.HTTP_REQUEST);
    if (packet) {
      syncPackets();
      syncNodes();
    }
  }

  function injectTrafficBurst(count = 10): void {
    isTrafficSpikeActive.value = true;
    for (let i = 0; i < count; i++) {
      engine.routeRequestFromLB('lb-1', PACKET_COLORS.HTTP_REQUEST);
    }
    syncPackets();
    syncNodes();
  }

  function triggerDbWrite(): void {
    const writePacket = engine.createDirectPacket(
      'server-a',
      'db-primary',
      PACKET_COLORS.DB_WRITE,
    );
    if (writePacket) {
      syncPackets();
    }

    replicationScheduler.scheduleReplication(
      'db-primary',
      'db-replica',
      replicationLagMs.value,
      (job: ReplicationJob) => {
        engine.createDirectPacket(job.primaryId, job.replicaId, job.packetColor);
        completedReplications.value++;
        pendingReplications.value = replicationScheduler.getPendingJobs();
        syncPackets();
      },
    );
    pendingReplications.value = replicationScheduler.getPendingJobs();
  }

  function tickEngine(deltaTime: number): void {
    // Skip engine ticks in VCR mode — state is driven by frame data
    if (isScenarioMode.value) return;
    engine.updatePacketsProgress(deltaTime);
    syncPackets();
    syncNodes();
  }

  function setReplicationLag(ms: number): void {
    replicationLagMs.value = Math.max(
      REPLICATION_LAG_MIN_MS,
      Math.min(REPLICATION_LAG_MAX_MS, ms),
    );
  }

  function clearTopology(): void {
    exitScenarioMode();
    engine.clear();
    replicationScheduler.clear();
    nodes.value = [];
    links.value = [];
    activePackets.value = [];
    pendingReplications.value = [];
    completedReplications.value = 0;
    isTrafficSpikeActive.value = false;
    failedNodeIds.value.clear();
    replicationLagMs.value = REPLICATION_LAG_DEFAULT_MS;
  }

  // ── Internal ──

  function syncPackets(): void {
    activePackets.value = engine.getPackets();
  }

  function syncNodes(): void {
    nodes.value = engine.getNodes().map((n) => ({ ...n }));
  }

  function dispatchSmokeEvent(nodeId: string): void {
    if (typeof window !== 'undefined') {
      const smokeEvent = new CustomEvent('SERVER_FAILED_SMOKE_BURST', {
        detail: { nodeId },
      });
      window.dispatchEvent(smokeEvent);
    }
  }

  // ── Fallback topology (when backend is unreachable) ──

  function createFallbackNodes(): SystemNode[] {
    return [
      { nodeId: 'client-1', nodeType: 'CLIENT', label: 'Client', status: 'HEALTHY', requestCount: 0, posX: 100, posY: 200 },
      { nodeId: 'lb-1', nodeType: 'LOAD_BALANCER', label: 'Load Balancer', status: 'HEALTHY', requestCount: 0, posX: 300, posY: 200 },
      { nodeId: 'server-a', nodeType: 'WEB_SERVER', label: 'Server A', status: 'HEALTHY', requestCount: 0, posX: 500, posY: 100 },
      { nodeId: 'server-b', nodeType: 'WEB_SERVER', label: 'Server B', status: 'HEALTHY', requestCount: 0, posX: 500, posY: 300 },
      { nodeId: 'db-primary', nodeType: 'POSTGRES_PRIMARY', label: 'Primary DB', status: 'HEALTHY', requestCount: 0, posX: 700, posY: 150 },
      { nodeId: 'db-replica', nodeType: 'POSTGRES_REPLICA', label: 'Replica DB', status: 'HEALTHY', requestCount: 0, posX: 700, posY: 300 },
    ];
  }

  function createFallbackLinks(): NetworkLink[] {
    return [
      { linkId: 'link-client-lb', sourceId: 'client-1', targetId: 'lb-1', latencyMs: 10 },
      { linkId: 'link-lb-a', sourceId: 'lb-1', targetId: 'server-a', latencyMs: 20 },
      { linkId: 'link-lb-b', sourceId: 'lb-1', targetId: 'server-b', latencyMs: 20 },
      { linkId: 'link-a-db', sourceId: 'server-a', targetId: 'db-primary', latencyMs: 5 },
      { linkId: 'link-b-db', sourceId: 'server-b', targetId: 'db-primary', latencyMs: 5 },
      { linkId: 'link-db-replica', sourceId: 'db-primary', targetId: 'db-replica', latencyMs: 50 },
    ];
  }

  return {
    // Core State
    nodes,
    links,
    activePackets,
    replicationLagMs,
    isTrafficSpikeActive,
    pendingReplications,
    completedReplications,
    failedNodeIds,
    // VCR / Scenario State
    isScenarioMode,
    scenarioFrames,
    currentFrameIndex,
    selectedScenarioId,
    availableScenarios,
    isAutoplayActive,
    playbackSpeed,
    isLoadingApi,
    apiError,
    // Computed
    healthyNodeCount,
    failedNodeCount,
    totalPacketsInFlight,
    totalFrames,
    currentFrame,
    canGoNext,
    canGoPrev,
    // Initialization
    initializeDemoTopology,
    fetchAvailableScenarios,
    // VCR Actions
    loadScenario,
    nextFrame,
    prevFrame,
    resetFrames,
    startAutoplay,
    stopAutoplay,
    toggleAutoplay,
    setPlaybackSpeed,
    exitScenarioMode,
    // Interactive Actions
    toggleServerStatus,
    injectHttpRequest,
    injectTrafficBurst,
    triggerDbWrite,
    tickEngine,
    setReplicationLag,
    clearTopology,
  };
});
