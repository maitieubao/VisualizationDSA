<template>
  <div class="export-share-workspace">
    <div class="workspace-content">
      <div class="workspace-header">
        <h2 class="workspace-title">Export & Share Pipeline</h2>
        <p class="workspace-desc">
          Xuất sơ đồ thuật toán sắc nét PNG 3x Retina hoặc SVG Vector.
          Chia sẻ liên kết phòng lab rút gọn cho bạn học.
        </p>
      </div>

      <!-- Demo SVG Area -->
      <div class="demo-area">
        <svg
          ref="demoSvgRef"
          viewBox="0 0 800 500"
          class="demo-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="800" height="500" fill="none" />
          <text
            x="400"
            y="80"
            text-anchor="middle"
            font-family="JetBrains Mono, monospace"
            font-size="20"
            font-weight="700"
            fill="#06B6D4"
          >
            VisualizationDSA — Export Preview
          </text>

          <!-- Sample nodes -->
          <g v-for="node in demoNodes" :key="node.id">
            <rect
              :x="node.x - 60"
              :y="node.y - 20"
              width="120"
              height="40"
              rx="10"
              fill="rgba(15, 23, 42, 0.8)"
              stroke="#06B6D4"
              stroke-width="1.5"
            />
            <text
              :x="node.x"
              :y="node.y + 5"
              text-anchor="middle"
              font-family="JetBrains Mono, monospace"
              font-size="12"
              fill="#e2e8f0"
            >
              {{ node.id }}
            </text>
          </g>

          <!-- Sample edges -->
          <line
            v-for="(edge, idx) in demoEdges"
            :key="idx"
            :x1="edge.x1"
            :y1="edge.y1"
            :x2="edge.x2"
            :y2="edge.y2"
            stroke="#06B6D4"
            stroke-width="1"
            stroke-dasharray="6,4"
            opacity="0.5"
          />
        </svg>
      </div>

      <!-- Action Buttons -->
      <div class="action-bar">
        <button class="open-modal-btn" @click="store.openModal()">
          XUẤT SƠ ĐỒ / SHARE
        </button>
      </div>
    </div>

    <!-- Share Export Modal -->
    <ShareExportModal
      :svg-element="demoSvgElement"
      :workspace-state="currentWorkspaceState"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useExportShareStore } from '../store/useExportShareStore';
import ShareExportModal from './ShareExportModal.vue';
import type { WorkspaceState } from '../types/export-share.types';

const store = useExportShareStore();

const demoSvgRef = ref<SVGElement | null>(null);

const demoNodes = [
  { id: 'Client', x: 200, y: 180 },
  { id: 'Strategy', x: 400, y: 180 },
  { id: 'ConcreteA', x: 300, y: 300 },
  { id: 'ConcreteB', x: 500, y: 300 },
  { id: 'Context', x: 600, y: 180 },
];

const demoEdges = [
  { x1: 260, y1: 180, x2: 340, y2: 180 },
  { x1: 400, y1: 200, x2: 300, y2: 280 },
  { x1: 400, y1: 200, x2: 500, y2: 280 },
  { x1: 460, y1: 180, x2: 540, y2: 180 },
];

const demoSvgElement = computed(() => demoSvgRef.value);

const currentWorkspaceState = computed<WorkspaceState>(() => ({
  algorithmId: 'strategy-pattern-demo',
  layoutNodes: demoNodes.map((n) => ({ id: n.id, x: n.x, y: n.y })),
  currentStepIndex: 5,
}));
</script>

<style scoped>
.export-share-workspace {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.workspace-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  overflow-y: auto;
}

.workspace-header {
  text-align: center;
}

.workspace-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 22px;
  font-weight: 700;
  color: #06b6d4;
  text-shadow: 0 0 12px rgba(6, 182, 212, 0.2);
  margin-bottom: 8px;
}

.workspace-desc {
  font-size: 13px;
  color: #94a3b8;
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.6;
}

.demo-area {
  flex: 1;
  min-height: 300px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.demo-svg {
  width: 100%;
  max-width: 800px;
  height: auto;
}

.action-bar {
  display: flex;
  justify-content: center;
}

.open-modal-btn {
  padding: 14px 32px;
  border-radius: 14px;
  border: 1px solid #06b6d4;
  background: rgba(6, 182, 212, 0.1);
  color: #06b6d4;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.open-modal-btn:hover {
  background: rgba(6, 182, 212, 0.2);
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.2);
  transform: translateY(-1px);
}
</style>
