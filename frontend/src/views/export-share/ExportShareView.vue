<template>
  <section class="flex-1 min-h-0">
    <ExportShareWorkspace :workspace-state="workspaceState" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  ExportShareWorkspace,
  WorkspaceStateCompressor,
} from '../../features/export-share';
import type { WorkspaceState } from '../../features/export-share/types/export-share.types';

const route = useRoute();

// EX-002 (phần view): khi quay lại phòng lab từ liên kết chia sẻ
// (/export-share?state=...), khôi phục workspace THẬT từ payload đã nén thay vì
// dùng workspace mặc định; payload hỏng chỉ rơi về workspace mặc định.
const restoredState = computed<WorkspaceState | null>(() => {
  const raw = route.query.state;
  if (typeof raw !== 'string' || raw.length === 0) return null;
  const state = WorkspaceStateCompressor.deserializeState(raw);
  return state && isValidWorkspaceState(state) ? state : null;
});

function isValidWorkspaceState(state: WorkspaceState | null): state is WorkspaceState {
  if (!state) return false;
  if (typeof state.algorithmId !== 'string' || state.algorithmId.length === 0) return false;
  if (!Array.isArray(state.layoutNodes)) return false;
  for (const node of state.layoutNodes) {
    if (typeof node?.id !== 'string' || node.id.length === 0) return false;
    if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) return false;
  }
  return Number.isFinite(state.currentStepIndex);
}

// Workspace nền khi mở trực tiếp trang (không có liên kết chia sẻ) — caller
// (view) là nơi sở hữu dữ liệu, component chỉ nhận qua prop (EX-010).
const defaultWorkspace: WorkspaceState = {
  algorithmId: 'strategy-pattern-demo',
  layoutNodes: [
    { id: 'Client', x: 200, y: 180 },
    { id: 'Strategy', x: 400, y: 180 },
    { id: 'ConcreteA', x: 300, y: 300 },
    { id: 'ConcreteB', x: 500, y: 300 },
    { id: 'Context', x: 600, y: 180 },
  ],
  currentStepIndex: 5,
};

const workspaceState = computed<WorkspaceState>(() => restoredState.value ?? defaultWorkspace);
</script>
