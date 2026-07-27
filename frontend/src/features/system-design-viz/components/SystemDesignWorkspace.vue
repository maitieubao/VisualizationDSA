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
@import "./SystemDesignWorkspace.css";
</style>
