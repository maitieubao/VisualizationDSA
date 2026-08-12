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

      
      <div class="demo-area">
        <svg
          ref="workspaceSvgRef"
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
            fill="var(--color-accent-cyan)"
          >
            VisualizationDSA — Export Preview
          </text>

          
          <g v-for="node in liveNodes" :key="node.id">
            <rect
              :x="node.x - 60"
              :y="node.y - 20"
              width="120"
              height="40"
              rx="10"
              fill="color-mix(in srgb, var(--color-bg-primary) 80%, transparent)"
              stroke="var(--color-accent-cyan)"
              stroke-width="1.5"
            />
            <text
              :x="node.x"
              :y="node.y + 5"
              text-anchor="middle"
              font-family="JetBrains Mono, monospace"
              font-size="12"
              fill="var(--color-text-primary)"
            >
              {{ node.id }}
            </text>
          </g>
        </svg>
      </div>

      
      <div class="action-bar">
        <button class="open-modal-btn" @click="handleOpenExportModal">
          XUẤT SƠ ĐỒ / SHARE
        </button>
      </div>
    </div>

    
    <ShareExportModal
      :svg-element="workspaceSvgElement"
      :workspace-state="snapshotForExport"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useExportShareStore } from '../store/useExportShareStore';
import ShareExportModal from './ShareExportModal.vue';
import type { WorkspaceState } from '../types/export-share.types';

// EX-010: workspace THẬT được truyền từ ngoài qua prop (view/caller sở hữu dữ
// liệu sơ đồ) — pipeline không còn hardcode mảng node/cạnh demo tĩnh bên trong
// component; mọi nút trên canvas sinh ra từ chính workspace state.
const props = defineProps<{
  workspaceState?: WorkspaceState | null;
}>();

const store = useExportShareStore();
const workspaceSvgRef = ref<SVGElement | null>(null);

const liveState = ref<WorkspaceState>({
  algorithmId: 'empty-workspace',
  layoutNodes: [],
  currentStepIndex: 0,
});

watch(
  () => props.workspaceState,
  (state) => {
    if (state) liveState.value = state;
  },
  { immediate: true },
);

const liveNodes = computed(() => liveState.value.layoutNodes);

const workspaceSvgElement = computed(() => workspaceSvgRef.value);

// EX-010: snapshot đúng tại thời điểm bấm nút export — nếu workspace thay đổi
// sau đó, liên kết sinh ra vẫn khớp chính xác sơ đồ người dùng đang nhìn thấy.
const snapshotForExport = ref<WorkspaceState | null>(null);

function handleOpenExportModal(): void {
  snapshotForExport.value = {
    algorithmId: liveState.value.algorithmId,
    layoutNodes: liveState.value.layoutNodes.map((n) => ({ id: n.id, x: n.x, y: n.y })),
    currentStepIndex: liveState.value.currentStepIndex,
  };
  store.openModal();
}
</script>

<style scoped>
@import "./ExportShareWorkspace.css";
</style>
