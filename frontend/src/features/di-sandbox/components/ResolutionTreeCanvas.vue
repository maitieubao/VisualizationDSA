<template>
  <div class="resolution-tree-container bg-[#0b0f19]/65 backdrop-blur-[20px] border border-white/[0.04] rounded-[28px] p-6 shadow-xl">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
        <svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="5" r="3" />
          <line x1="12" y1="8" x2="12" y2="14" />
          <circle cx="6" cy="19" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="6.5" y1="16.5" x2="11.5" y2="13.5" />
          <line x1="17.5" y1="16.5" x2="12.5" y2="13.5" />
        </svg>
        Resolution Tree
      </div>
      <div class="flex items-center gap-2">
        <span class="text-[9px] font-mono text-slate-600">
          {{ store.currentStepIndex + 1 }}/{{ store.totalSteps }} bước
        </span>
      </div>
    </div>

    <!-- SVG Canvas -->
    <div class="relative bg-[#070b13]/60 border border-slate-800 rounded-xl overflow-hidden" style="height: 400px;">
      <svg ref="svgRef" class="w-full h-full" :viewBox="`0 0 ${svgWidth} ${svgHeight}`">
        <defs>
          <!-- Arrow Markers -->
          <marker id="ioc-arrow-amber" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#F59E0B" />
          </marker>
          <marker id="ioc-arrow-slate" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#94A3B8" />
          </marker>
          <marker id="ioc-arrow-cyan" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#22D3EE" />
          </marker>

          <!-- Laser Glow Filter -->
          <filter id="laser-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- Connection Paths -->
        <g v-if="store.resolutionTree">
          <template v-for="path in treePaths" :key="path.id">
            <path
              :d="path.d"
              :stroke="path.color"
              stroke-width="2"
              fill="none"
              class="opacity-40"
              :marker-end="`url(#ioc-arrow-${path.markerType})`"
            />
            <!-- Laser Animation Path -->
            <path
              v-if="isPathActive(path)"
              :d="path.d"
              :stroke="path.laserColor"
              stroke-width="4"
              fill="none"
              stroke-dasharray="40, 20"
              class="laser-injection-active-path"
              filter="url(#laser-glow)"
              :marker-end="`url(#ioc-arrow-${path.markerType})`"
            />
          </template>
        </g>

        <!-- Tree Nodes -->
        <g v-if="store.resolutionTree">
          <template v-for="node in flatNodes" :key="node.id">
            <g :transform="`translate(${node.x - 60}, ${node.y - 18})`">
              <!-- Node Background -->
              <rect
                width="120"
                height="50"
                rx="10"
                :fill="node.lifetime === 'SINGLETON' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(148, 163, 184, 0.08)'"
                :stroke="getNodeStroke(node)"
                stroke-width="2"
                :class="{ 'node-active-pulse': isNodeActive(node) }"
              />
              <!-- Implementation Name -->
              <text
                x="60"
                y="20"
                text-anchor="middle"
                :fill="node.lifetime === 'SINGLETON' ? '#FCD34D' : '#CBD5E1'"
                font-size="10"
                font-family="JetBrains Mono, monospace"
                font-weight="bold"
              >
                {{ truncate(node.implementationType, 16) }}
              </text>
              <!-- Service Type -->
              <text
                x="60"
                y="34"
                text-anchor="middle"
                fill="#64748b"
                font-size="8"
                font-family="JetBrains Mono, monospace"
              >
                {{ truncate(node.serviceType, 18) }}
              </text>
              <!-- Lifetime Badge -->
              <rect
                :x="node.lifetime === 'SINGLETON' ? 33 : 37"
                y="39"
                :width="node.lifetime === 'SINGLETON' ? 54 : 46"
                height="12"
                rx="4"
                :fill="node.lifetime === 'SINGLETON' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(148, 163, 184, 0.15)'"
              />
              <text
                x="60"
                y="48"
                text-anchor="middle"
                :fill="node.lifetime === 'SINGLETON' ? '#F59E0B' : '#94A3B8'"
                font-size="7"
                font-family="JetBrains Mono, monospace"
                font-weight="bold"
              >
                {{ node.lifetime }}
              </text>
              <!-- Retrieved Singleton Badge -->
              <g v-if="node.isRetrievedSingleton">
                <rect x="85" y="-5" width="38" height="14" rx="4" fill="rgba(16, 185, 129, 0.2)" stroke="#10B981" stroke-width="0.5" />
                <text x="104" y="5" text-anchor="middle" fill="#10B981" font-size="7" font-family="JetBrains Mono, monospace">
                  REUSE
                </text>
              </g>
            </g>
          </template>
        </g>

        <!-- Empty State -->
        <text
          v-if="!store.resolutionTree"
          x="50%"
          y="50%"
          text-anchor="middle"
          dominant-baseline="middle"
          fill="#475569"
          font-size="12"
          font-family="JetBrains Mono, monospace"
        >
          Nhấn Resolve để xem cây phân giải đệ quy
        </text>
      </svg>
    </div>

    <!-- Step Explanation -->
    <div v-if="store.currentStep" class="mt-3 px-3 py-2 bg-[#070b13]/60 border border-slate-800 rounded-lg">
      <div class="flex items-center gap-2">
        <span
          class="px-1.5 py-0.5 rounded text-[9px] font-bold"
          :class="stepTypeClass"
        >
          {{ store.currentStep.type }}
        </span>
        <span class="text-[10px] text-slate-300 font-mono">
          {{ stepExplanation }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useIoCDebuggerStore } from '../store/useIoCDebuggerStore';
import type { ResolutionTreeNode } from '../types/ioc.types';

const store = useIoCDebuggerStore();

const svgWidth = 800;
const svgHeight = 400;

interface TreePath {
  id: string;
  d: string;
  color: string;
  laserColor: string;
  markerType: string;
  parentServiceType: string;
  childServiceType: string;
}

const flatNodes = computed<ResolutionTreeNode[]>(() => {
  if (!store.resolutionTree) return [];
  const nodes: ResolutionTreeNode[] = [];
  collectNodes(store.resolutionTree, nodes);
  return nodes;
});

function collectNodes(node: ResolutionTreeNode, result: ResolutionTreeNode[]): void {
  result.push(node);
  for (const child of node.children) {
    collectNodes(child, result);
  }
}

const treePaths = computed<TreePath[]>(() => {
  if (!store.resolutionTree) return [];
  const paths: TreePath[] = [];
  collectPaths(store.resolutionTree, paths);
  return paths;
});

function collectPaths(node: ResolutionTreeNode, result: TreePath[]): void {
  for (const child of node.children) {
    const x1 = node.x;
    const y1 = node.y + 25;
    const x2 = child.x;
    const y2 = child.y - 18;
    const cy1 = y1 + (y2 - y1) * 0.4;
    const cy2 = y1 + (y2 - y1) * 0.6;

    const color = child.lifetime === 'SINGLETON' ? '#F59E0B' : '#94A3B8';
    const laserColor = child.lifetime === 'SINGLETON' ? '#F59E0B' : '#22D3EE';
    const markerType = child.lifetime === 'SINGLETON' ? 'amber' : 'slate';

    result.push({
      id: `${node.id}-${child.id}`,
      d: `M ${x1} ${y1} C ${x1} ${cy1}, ${x2} ${cy2}, ${x2} ${y2}`,
      color,
      laserColor,
      markerType,
      parentServiceType: node.serviceType,
      childServiceType: child.serviceType,
    });

    collectPaths(child, result);
  }
}

function isPathActive(path: TreePath): boolean {
  if (!store.currentStep) return false;
  return (
    store.currentStep.type === 'INJECT' &&
    store.currentStep.serviceType === path.childServiceType
  );
}

function isNodeActive(node: ResolutionTreeNode): boolean {
  if (!store.currentStep) return false;
  return store.currentStep.serviceType === node.serviceType;
}

function getNodeStroke(node: ResolutionTreeNode): string {
  if (isNodeActive(node)) {
    return '#22D3EE';
  }
  return node.lifetime === 'SINGLETON' ? '#F59E0B' : '#94A3B8';
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 2) + '..';
}

const stepTypeClass = computed(() => {
  if (!store.currentStep) return '';
  switch (store.currentStep.type) {
    case 'LOOKUP':
      return 'bg-cyan-950/50 text-cyan-400 border border-cyan-800/40';
    case 'INSTANTIATE':
      return 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40';
    case 'INJECT':
      return 'bg-amber-950/50 text-amber-400 border border-amber-800/40';
    case 'RETRIEVE_SINGLETON':
      return 'bg-purple-950/50 text-purple-400 border border-purple-800/40';
    default:
      return '';
  }
});

const stepExplanation = computed(() => {
  if (!store.currentStep) return '';
  const step = store.currentStep;
  switch (step.type) {
    case 'LOOKUP':
      return `Tìm kiếm phụ thuộc: ${step.serviceType}`;
    case 'INSTANTIATE':
      return `Khởi tạo: ${step.implementationType} (${step.serviceType})`;
    case 'INJECT':
      return `Tiêm phụ thuộc: ${step.serviceType} → constructor`;
    case 'RETRIEVE_SINGLETON':
      return `Tái sử dụng Singleton: ${step.implementationType}`;
    default:
      return '';
  }
});
</script>

<style scoped>
@keyframes laser-shoot-flow {
  0% { stroke-dashoffset: 80; }
  100% { stroke-dashoffset: 0; }
}

.laser-injection-active-path {
  animation: laser-shoot-flow 0.8s infinite linear;
}

@keyframes node-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.node-active-pulse {
  animation: node-pulse 0.8s ease-in-out infinite;
}
</style>
