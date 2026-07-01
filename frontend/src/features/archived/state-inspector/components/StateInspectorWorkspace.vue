<template>
  <div class="state-inspector-workspace">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-border-default/50">
      <div class="flex items-center gap-3">
        <div class="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
        <h2 class="text-sm font-bold text-text-secondary uppercase tracking-wider">
          State Inspector & Stack Frames
        </h2>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-[10px] px-2 py-1 rounded-full border"
          :class="stackDepth > 0
            ? 'bg-accent-green/10 text-accent-green border-accent-green/30'
            : 'bg-bg-active/30 text-text-muted border-border-strong/30'"
        >
          Stack: {{ stackDepth }} frames
        </span>
        <span class="text-[10px] px-2 py-1 rounded-full border"
          :class="treeNodeCount > 0
            ? 'bg-accent-cyan/10 text-accent border-accent-cyan/30'
            : 'bg-bg-active/30 text-text-muted border-border-strong/30'"
        >
          Tree: {{ treeNodeCount }} nodes
        </span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex flex-1 min-h-0 overflow-hidden">
      <!-- Left: Call Stack + Heap -->
      <div class="w-[320px] flex-shrink-0 flex flex-col gap-3 p-3 overflow-hidden border-r border-border-default/30 h-full">
        <!-- Call Stack Panel -->
        <CallStackPanel
          data-tour-id="call-stack-3d-panel"
          class="flex-1 min-h-0"
          :stackFrames="stackFrames"
          @selectFrame="store.selectFrame"
          @hoverVariable="store.hoverVariable"
        />

        <!-- Heap Objects -->
        <div class="heap-section flex-1 min-h-0 flex flex-col" data-tour-id="state-heap-pointer-panel">
          <div class="px-3 py-2 border-b border-border-default/50 flex-shrink-0">
            <h3 class="text-xs font-semibold text-accent-yellow uppercase tracking-wider">
              Heap Memory
            </h3>
          </div>
          <div class="p-3 space-y-2 overflow-y-auto flex-1 min-h-0">
            <HeapObjectNode
              v-for="obj in heapObjects"
              :key="obj.objectId"
              :heapObject="obj"
              :isPulsed="hoveredHeapAddress === obj.address"
            />
            <div v-if="heapObjects.length === 0" class="text-center text-text-disabled text-xs italic py-3">
              Heap trống
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Recursion Tree + Controls -->
      <div class="flex-1 flex flex-col gap-3 p-3 overflow-y-auto">
        <!-- Recursion Tree -->
        <RecursionTreeSVG
          data-tour-id="recursion-tree-svg"
          :coordinates="treeCoordinates"
          :maxDepth="treeMaxDepth"
        />

        <!-- Active Frame Details -->
        <div v-if="activeFrame" class="active-frame-details">
          <div class="px-3 py-2 border-b border-border-default/50">
            <div class="flex items-center gap-2">
              <h3 class="text-xs font-semibold text-accent uppercase tracking-wider">
                Frame đang thanh tra
              </h3>
              <span class="text-[10px] font-mono text-text-muted">
                {{ activeFrame.functionName }} @ L{{ activeFrame.lineNumber }}
              </span>
            </div>
          </div>
          <div class="p-3">
            <div class="grid grid-cols-2 gap-2">
              <div
                v-for="(variable, varName) in activeVariables"
                :key="varName"
                class="flex items-center justify-between text-xs font-mono px-2 py-1.5 rounded bg-bg-surface/40"
              >
                <span class="text-text-secondary">{{ varName }}</span>
                <span class="text-accent-green">{{ variable.value === null ? 'null' : variable.value }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Controls -->
        <div class="flex items-center gap-2 px-3 py-2">
          <button
            class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200
              bg-accent-cyan/10 text-accent border border-accent-cyan/30
              hover:bg-accent-cyan/20 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)]"
            @click="store.initializeFibonacciDemo()"
          >
            Demo Fibonacci
          </button>
          <button
            class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200
              bg-accent-green/10 text-accent-green border border-accent-green/30
              hover:bg-accent-green/20 hover:shadow-[0_0_10px_rgba(16,185,129,0.3)]"
            :disabled="stackDepth === 0"
            :class="{ 'opacity-40 cursor-not-allowed': stackDepth === 0 }"
            @click="store.demoStepForward()"
          >
            Step Pop
          </button>
          <button
            class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200
              bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/30
              hover:bg-accent-yellow/20 hover:shadow-[0_0_10px_rgba(245,158,11,0.3)]"
            :disabled="isStackFull"
            :class="{ 'opacity-40 cursor-not-allowed': isStackFull }"
            @click="store.demoPushCall()"
          >
            Push Call
          </button>
          <button
            class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200
              bg-accent-red/10 text-accent-red border border-accent-red/30
              hover:bg-accent-red/20 hover:shadow-[0_0_10px_rgba(239,68,68,0.3)]"
            @click="store.clearInspector()"
          >
            Reset All
          </button>
        </div>
      </div>
    </div>

    <!-- Footer Status -->
    <div class="flex items-center justify-between px-4 py-2 border-t border-border-default/30 text-[10px] text-text-disabled">
      <span>State Inspector — Call Stack 3D + Recursion Tree SVG + Heap Pointer Bezier</span>
      <span v-if="activeFrame" class="text-accent-cyan/70">
        Inspecting: {{ activeFrame.functionName }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useStateInspectorStore } from '../store/useStateInspectorStore';
import CallStackPanel from './CallStackPanel.vue';
import HeapObjectNode from './HeapObjectNode.vue';
import RecursionTreeSVG from './RecursionTreeSVG.vue';

const store = useStateInspectorStore();
const {
  stackFrames,
  heapObjects,
  hoveredHeapAddress,
  treeCoordinates,
  treeNodeCount,
  treeMaxDepth,
  stackDepth,
  isStackFull,
  activeFrame,
  activeVariables,
} = storeToRefs(store);
</script>

<style scoped>
.state-inspector-workspace {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(2, 6, 23, 0.6);
  border-radius: 16px;
  overflow: hidden;
}

.heap-section {
  background: rgba(10, 15, 30, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  backdrop-filter: blur(12px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.active-frame-details {
  background: rgba(10, 15, 30, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  backdrop-filter: blur(12px);
  overflow: hidden;
}
</style>
