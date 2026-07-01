<template>
  <div class="flex flex-col h-full gap-4">
    <!-- Header -->
    <div class="flex items-center justify-between px-2">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-accent-cyan/20 border border-accent-cyan/30 flex items-center justify-center">
          <span class="text-accent text-sm">🗺️</span>
        </div>
        <div>
          <h2 class="text-base font-bold text-text-primary">Learning Path Skill Tree</h2>
          <p class="text-[10px] text-text-muted">Bản đồ lộ trình học tập RPG cá nhân hóa</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <!-- Average Score Badge -->
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-surface/50 border border-border-default/50">
          <span class="text-[10px] text-text-muted">Điểm TB:</span>
          <span class="text-xs font-bold" :class="scoreColorClass">{{ store.averageScore }}%</span>
        </div>

        <!-- Completion Badge -->
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-surface/50 border border-border-default/50">
          <span class="text-[10px] text-text-muted">Hoàn thành:</span>
          <span class="text-xs font-bold text-accent">{{ store.completionPercentage }}%</span>
        </div>

        <!-- Demo Controls -->
        <button
          @click="handleDemoComplete"
          class="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-accent-green/20 text-accent-green border border-accent-green/30 hover:bg-accent-green/30 transition-colors"
        >
          +Demo Hoàn Thành Ải
        </button>

        <button
          @click="store.resetProgress()"
          class="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-accent-red/20 text-accent-red border border-accent-red/30 hover:bg-accent-red/30 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex gap-4 min-h-0">
      <!-- Map Area (Left) -->
      <div class="flex-1 min-w-0">
        <LearningPathMap @node-selected="handleNodeSelected" />
      </div>

      <!-- Sidebar (Right) -->
      <div class="w-72 flex flex-col gap-4">
        <!-- AI Evaluator Card -->
        <AIEvaluatorCard
          :recommendation="store.aiRecommendedNode"
          :is-review-mode="isReviewMode"
          @navigate-to="handleNavigateTo"
        />

        <!-- Node Details -->
        <div
          v-if="selectedNode"
          class="rounded-2xl p-4 border"
          :class="nodeDetailClasses"
        >
          <div class="flex items-center gap-2 mb-3">
            <span class="text-lg">{{ selectedNodeIcon }}</span>
            <h4 class="text-sm font-bold text-text-primary">{{ selectedNode.title }}</h4>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[10px] text-text-muted">Trạng thái</span>
              <span class="text-[10px] font-bold" :class="statusColorClass">
                {{ statusLabel }}
              </span>
            </div>
            <div v-if="selectedNode.prerequisites.length > 0" class="flex items-center justify-between">
              <span class="text-[10px] text-text-muted">Tiên quyết</span>
              <span class="text-[10px] text-text-secondary">
                {{ selectedNode.prerequisites.join(', ') }}
              </span>
            </div>
            <div v-if="selectedNodeScore" class="flex items-center justify-between">
              <span class="text-[10px] text-text-muted">Điểm thi</span>
              <span class="text-[10px] font-bold" :class="selectedNodeScore.scorePercentage >= 70 ? 'text-accent-green' : 'text-accent-yellow'">
                {{ selectedNodeScore.scorePercentage }}%
              </span>
            </div>
          </div>
        </div>

        <!-- Nodes List Summary -->
        <div class="rounded-2xl p-4 bg-bg-secondary/50 backdrop-blur-sm border border-border-default/30">
          <h4 class="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
            Danh sách ải môn
          </h4>
          <div class="space-y-2">
            <div
              v-for="node in store.resolvedNodes"
              :key="node.id"
              class="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-bg-surface/50 cursor-pointer transition-colors"
              @click="handleNodeSelected(node.id)"
            >
              <div class="flex items-center gap-2">
                <div
                  class="w-2.5 h-2.5 rounded-full"
                  :class="{
                    'bg-accent-green': node.status === 'COMPLETED',
                    'bg-accent': node.status === 'UNLOCKED' || node.status === 'IN_PROGRESS',
                    'bg-bg-hover': node.status === 'LOCKED',
                  }"
                />
                <span class="text-[11px] text-text-secondary">{{ node.title }}</span>
              </div>
              <span class="text-[9px] font-medium" :class="{
                'text-accent-green': node.status === 'COMPLETED',
                'text-accent': node.status === 'UNLOCKED',
                'text-accent-yellow': node.status === 'IN_PROGRESS',
                'text-text-disabled': node.status === 'LOCKED',
              }">
                {{ node.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useLearningPathStore } from '../store/useLearningPathStore';
import LearningPathMap from './LearningPathMap.vue';
import AIEvaluatorCard from './AIEvaluatorCard.vue';
import type { PathNode } from '../types/learning-path.types';

const store = useLearningPathStore();
const selectedNodeId = ref('quicksort');

const selectedNode = computed<PathNode | undefined>(() => {
  return store.resolvedNodes.find((n) => n.id === selectedNodeId.value);
});

const selectedNodeScore = computed(() => {
  return store.userScoresHistory.find((s) => s.algorithmId === selectedNodeId.value);
});

const isReviewMode = computed(() => {
  return store.userScoresHistory.some((s) => s.scorePercentage < 70);
});

const scoreColorClass = computed(() => {
  if (store.averageScore >= 80) return 'text-accent-green';
  if (store.averageScore >= 70) return 'text-accent';
  return 'text-accent-yellow';
});

const selectedNodeIcon = computed(() => {
  if (!selectedNode.value) return '📚';
  switch (selectedNode.value.status) {
    case 'COMPLETED': return '⭐';
    case 'UNLOCKED':
    case 'IN_PROGRESS': return '⚡';
    case 'LOCKED': return '🔒';
    default: return '📚';
  }
});

const statusLabel = computed(() => {
  if (!selectedNode.value) return '';
  switch (selectedNode.value.status) {
    case 'COMPLETED': return 'Đã hoàn thành';
    case 'UNLOCKED': return 'Đã mở khóa';
    case 'IN_PROGRESS': return 'Đang học';
    case 'LOCKED': return 'Bị khóa';
    default: return '';
  }
});

const statusColorClass = computed(() => {
  if (!selectedNode.value) return '';
  switch (selectedNode.value.status) {
    case 'COMPLETED': return 'text-accent-green';
    case 'UNLOCKED': return 'text-accent';
    case 'IN_PROGRESS': return 'text-accent-yellow';
    case 'LOCKED': return 'text-text-disabled';
    default: return '';
  }
});

const nodeDetailClasses = computed(() => {
  if (!selectedNode.value) return 'bg-bg-secondary/50 border-border-default/30';
  switch (selectedNode.value.status) {
    case 'COMPLETED':
      return 'bg-accent-green/10 border-accent-green/30';
    case 'UNLOCKED':
    case 'IN_PROGRESS':
      return 'bg-accent-cyan/10 border-accent-cyan/30';
    case 'LOCKED':
      return 'bg-bg-secondary/50 border-border-default/30';
    default:
      return 'bg-bg-secondary/50 border-border-default/30';
  }
});

function handleNodeSelected(nodeId: string) {
  selectedNodeId.value = nodeId;
  store.setActiveNode(nodeId);
}

function handleNavigateTo(nodeId: string) {
  selectedNodeId.value = nodeId;
  store.setActiveNode(nodeId);
}

async function handleDemoComplete() {
  const nextNode = store.resolvedNodes.find(
    (n) => n.status === 'UNLOCKED' || n.status === 'IN_PROGRESS'
  );
  if (nextNode) {
    const demoScore = 75 + Math.floor(Math.random() * 25);
    await store.completeNodeMilestone(nextNode.id, demoScore, 90 + Math.floor(Math.random() * 120));
    selectedNodeId.value = nextNode.id;
  }
}
</script>
