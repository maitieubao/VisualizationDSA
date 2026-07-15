<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue';
import { useSystemDesignStore } from '../store/useSystemDesignStore';
import SystemNodeCard from './SystemNodeCard.vue';
import NeonPacketDot from './NeonPacketDot.vue';
import NetworkLinkSVG from './NetworkLinkSVG.vue';
import ReplicationLagPanel from './ReplicationLagPanel.vue';
import FailureSmokeOverlay from './FailureSmokeOverlay.vue';

const store = useSystemDesignStore();

let rafId: number | null = null;
let lastTime = 0;

const nodeMap = computed(() => {
  const map = new Map<string, (typeof store.nodes)[number]>();
  for (const node of store.nodes) {
    map.set(node.nodeId, node);
  }
  return map;
});

const scenarioLabels: Record<string, string> = {
  'round-robin-lb': 'Round-Robin LB',
  'server-failover': 'Server Failover',
  'db-replication': 'DB Replication',
  'full-demo': 'Full Demo',
};

function startSimulationLoop(): void {
  lastTime = performance.now();
  const loop = (time: number) => {
    const delta = (time - lastTime) / 1000;
    lastTime = time;
    store.tickEngine(delta);
    rafId = requestAnimationFrame(loop);
  };
  rafId = requestAnimationFrame(loop);
}

function stopSimulationLoop(): void {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

onMounted(async () => {
  await store.initializeDemoTopology();
  store.fetchAvailableScenarios();
  startSimulationLoop();
});

onUnmounted(() => {
  stopSimulationLoop();
  store.clearTopology();
});
</script>

<template>
  <section class="system-design-workspace">
    <!-- Header -->
    <header class="workspace-header">
      <h2 class="workspace-title">System Design & Distributed Architecture</h2>
      <div class="header-badges">
        <span
          class="badge"
          :class="store.nodes.length > 0 ? 'badge-emerald' : 'badge-slate'"
        >
          Nodes: {{ store.nodes.length }}
        </span>
        <span
          class="badge"
          :class="store.totalPacketsInFlight > 0 ? 'badge-cyan' : 'badge-slate'"
        >
          Packets: {{ store.totalPacketsInFlight }}
        </span>
        <span
          class="badge badge-red"
          v-if="store.failedNodeCount > 0"
        >
          Failed: {{ store.failedNodeCount }}
        </span>
        <span
          class="badge badge-purple"
          v-if="store.isScenarioMode"
        >
          VCR: {{ store.currentFrameIndex + 1 }}/{{ store.totalFrames }}
        </span>
      </div>
    </header>

    <!-- Scenario Explanation Banner (VCR mode) -->
    <div
      v-if="store.isScenarioMode && store.currentFrame"
      class="scenario-banner"
    >
      <span class="banner-action">{{ store.currentFrame.actionType }}</span>
      <span class="banner-text">{{ store.currentFrame.explanation }}</span>
    </div>

    <!-- API Loading / Error -->
    <div v-if="store.isLoadingApi" class="api-status loading">
      Loading from backend...
    </div>
    <div v-if="store.apiError" class="api-status error">
      {{ store.apiError }}
    </div>

    <!-- Architecture Canvas -->
    <div class="architecture-canvas" data-tour-id="distributed-canvas">
      <!-- SVG Links Layer -->
      <svg class="links-layer" width="100%" height="100%">
        <NetworkLinkSVG
          v-for="link in store.links"
          :key="link.linkId"
          :link="link"
          :source-node="nodeMap.get(link.sourceId)!"
          :target-node="nodeMap.get(link.targetId)!"
          :is-failed="
            store.failedNodeIds.has(link.sourceId) ||
            store.failedNodeIds.has(link.targetId)
          "
        />
      </svg>

      <!-- Node Cards -->
      <SystemNodeCard
        v-for="node in store.nodes"
        :key="node.nodeId"
        :node="node"
        @toggle-status="store.toggleServerStatus"
      />

      <!-- Failure Smoke Overlay -->
      <FailureSmokeOverlay />

      <!-- Neon Packets -->
      <NeonPacketDot
        v-for="packet in store.activePackets"
        :key="packet.packetId"
        :packet="packet"
        :source-node="nodeMap.get(packet.sourceId)!"
        :target-node="nodeMap.get(packet.targetId)!"
      />
    </div>

    <!-- Scenario Picker -->
    <div class="scenario-picker" data-tour-id="scenario-controls">
      <h4 class="control-title">Backend Scenarios</h4>
      <div class="btn-group">
        <button
          v-for="scenarioId in store.availableScenarios"
          :key="scenarioId"
          class="ctrl-btn btn-scenario"
          :class="{ active: store.selectedScenarioId === scenarioId }"
          :disabled="store.isLoadingApi"
          @click="store.loadScenario(scenarioId)"
        >
          {{ scenarioLabels[scenarioId] ?? scenarioId }}
        </button>
      </div>
    </div>

    <!-- VCR Playback Controls (visible in scenario mode) -->
    <div v-if="store.isScenarioMode" class="vcr-controls">
      <h4 class="control-title">VCR Playback</h4>
      <div class="vcr-row">
        <div class="btn-group">
          <button
            class="ctrl-btn btn-vcr"
            :disabled="!store.canGoPrev"
            @click="store.prevFrame()"
          >
            ◀ Prev
          </button>
          <button
            class="ctrl-btn btn-vcr btn-play"
            @click="store.toggleAutoplay()"
          >
            {{ store.isAutoplayActive ? '⏸ Pause' : '▶ Play' }}
          </button>
          <button
            class="ctrl-btn btn-vcr"
            :disabled="!store.canGoNext"
            @click="store.nextFrame()"
          >
            Next ▶
          </button>
          <button
            class="ctrl-btn btn-vcr"
            @click="store.resetFrames()"
          >
            ⏮ Reset
          </button>
        </div>

        <div class="speed-controls">
          <span class="speed-label">Speed:</span>
          <button
            v-for="speed in [0.5, 1, 2]"
            :key="speed"
            class="ctrl-btn btn-speed"
            :class="{ active: store.playbackSpeed === speed }"
            @click="store.setPlaybackSpeed(speed)"
          >
            {{ speed }}x
          </button>
        </div>

        <div class="frame-indicator">
          Frame {{ store.currentFrameIndex + 1 }} / {{ store.totalFrames }}
        </div>

        <button
          class="ctrl-btn btn-exit-vcr"
          @click="store.initializeDemoTopology()"
        >
          Exit VCR → Sandbox
        </button>
      </div>
    </div>

    <!-- Interactive Controls (hidden in VCR mode) -->
    <div v-if="!store.isScenarioMode" class="controls-row">
      <div class="traffic-controls">
        <h4 class="control-title">Traffic Controls</h4>
        <div class="btn-group">
          <button class="ctrl-btn btn-http" @click="store.injectHttpRequest()">
            HTTP Request
          </button>
          <button class="ctrl-btn btn-burst" @click="store.injectTrafficBurst(10)">
            Xả lũ 10 hạt
          </button>
        </div>
      </div>

      <ReplicationLagPanel
        :lag-ms="store.replicationLagMs"
        :pending-count="store.pendingReplications.length"
        :completed-count="store.completedReplications"
        @update-lag="store.setReplicationLag"
        @trigger-write="store.triggerDbWrite()"
      />

      <div class="workspace-actions">
        <button class="ctrl-btn btn-demo" @click="store.initializeDemoTopology()">
          Reset Demo
        </button>
        <button class="ctrl-btn btn-clear" @click="store.clearTopology()">
          Clear All
        </button>
      </div>
    </div>

    <!-- Footer -->
    <footer class="workspace-footer">
      System Design Visualizer — Round-Robin LB + Failover + DB Replication Lag
      <span v-if="store.failedNodeCount > 0" class="footer-alert">
        ⚠ {{ store.failedNodeCount }} node(s) FAILED — Failover active
      </span>
      <span v-if="store.isScenarioMode" class="footer-vcr">
        | VCR Mode: {{ store.selectedScenarioId }}
      </span>
    </footer>
  </section>
</template>

<style scoped>
.system-design-workspace {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  padding-bottom: 40px; /* Safe space under the bottom */
  height: 100%;
  color: #e2e8f0;
  overflow-y: auto; /* Allow scrolling within the workspace */
}

.workspace-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.workspace-title {
  font-size: 18px;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0;
}

.header-badges {
  display: flex;
  gap: 8px;
}

.badge {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 9999px;
  font-weight: 600;
}

.badge-slate {
  color: #94a3b8;
  background: rgba(100, 116, 139, 0.15);
  border: 1px solid rgba(100, 116, 139, 0.3);
}

.badge-emerald {
  color: #10b981;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.badge-cyan {
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.15);
  border: 1px solid rgba(6, 182, 212, 0.3);
}

.badge-red {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.badge-purple {
  color: #a78bfa;
  background: rgba(167, 139, 250, 0.15);
  border: 1px solid rgba(167, 139, 250, 0.3);
}

.scenario-banner {
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 10px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.banner-action {
  font-size: 11px;
  font-weight: 700;
  color: #a78bfa;
  background: rgba(139, 92, 246, 0.2);
  padding: 3px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  white-space: nowrap;
}

.banner-text {
  font-size: 13px;
  color: #cbd5e1;
}

.api-status {
  text-align: center;
  padding: 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.api-status.loading {
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.2);
}

.api-status.error {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.architecture-canvas {
  position: relative;
  min-height: 420px;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  overflow: hidden;
}

.links-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.scenario-picker {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 12px;
  padding: 16px;
  backdrop-filter: blur(8px);
}

.vcr-controls {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(167, 139, 250, 0.3);
  border-radius: 12px;
  padding: 16px;
  backdrop-filter: blur(8px);
}

.vcr-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.speed-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.speed-label {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 600;
}

.frame-indicator {
  font-size: 12px;
  color: #a78bfa;
  font-weight: 600;
  padding: 4px 10px;
  background: rgba(139, 92, 246, 0.1);
  border-radius: 6px;
}

.controls-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}

.traffic-controls {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 12px;
  padding: 16px;
  backdrop-filter: blur(8px);
}

.control-title {
  font-size: 13px;
  font-weight: 600;
  color: #10b981;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.scenario-picker .control-title {
  color: #a78bfa;
}

.vcr-controls .control-title {
  color: #a78bfa;
  margin-bottom: 8px;
}

.btn-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.ctrl-btn {
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
}

.ctrl-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.ctrl-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-http {
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.3);
}

.btn-burst {
  color: #06b6d4;
  border-color: rgba(6, 182, 212, 0.3);
}

.btn-demo {
  color: #8b5cf6;
  border-color: rgba(139, 92, 246, 0.3);
}

.btn-clear {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

.btn-scenario {
  color: #a78bfa;
  border-color: rgba(167, 139, 250, 0.3);
}

.btn-scenario.active {
  color: #fff;
  background: rgba(139, 92, 246, 0.3);
  border-color: rgba(139, 92, 246, 0.6);
}

.btn-vcr {
  color: #c4b5fd;
  border-color: rgba(196, 181, 253, 0.3);
}

.btn-play {
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.3);
}

.btn-speed {
  padding: 4px 10px;
  font-size: 11px;
  color: #94a3b8;
}

.btn-speed.active {
  color: #fff;
  background: rgba(139, 92, 246, 0.3);
  border-color: rgba(139, 92, 246, 0.5);
}

.btn-exit-vcr {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
  margin-left: auto;
}

.workspace-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}

.workspace-footer {
  text-align: center;
  font-size: 11px;
  color: #475569;
  padding: 8px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.footer-alert {
  color: #ef4444;
  font-weight: 600;
  margin-left: 12px;
}

.footer-vcr {
  color: #a78bfa;
  font-weight: 600;
  margin-left: 12px;
}
</style>
