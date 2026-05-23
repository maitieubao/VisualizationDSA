<template>
  <div
    class="h-screen flex flex-col bg-slate-950 text-slate-200 overflow-hidden"
  >
    <!-- Header -->
    <header class="flex-shrink-0 bg-slate-900 border-b border-slate-800">
      <div class="flex items-center justify-between px-4 py-3">
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center"
          >
            <span class="text-white font-bold text-sm">A</span>
          </div>
          <div>
            <h1 class="text-base font-bold text-white">AlgoLens</h1>
            <p class="text-[10px] text-slate-400">DSA Visualization</p>
          </div>
        </div>

        <!-- Tab Navigation -->
        <nav class="flex items-center gap-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors"
            :class="
              activeTab === tab.id
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            "
          >
            {{ tab.name }}
          </button>
        </nav>

        <!-- GitHub -->
        <a
          href="https://github.com"
          target="_blank"
          class="text-slate-400 hover:text-white transition-colors"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
            />
          </svg>
        </a>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col overflow-hidden p-4 gap-4">
      <!-- Animation Engine Tab -->
      <template v-if="activeTab === 'animation'">
        <section class="flex-1 min-h-0">
          <VisualizationPlayer />
        </section>
      </template>

      <!-- DSA Modules Tab -->
      <template v-else-if="activeTab === 'dsa'">
        <section class="flex-1 min-h-0">
          <DSAPlayer />
        </section>
      </template>

      <!-- Code IDE Tab -->
      <template v-else-if="activeTab === 'code-ide'">
        <section class="flex-1 min-h-0">
          <CodeWorkspace />
        </section>
      </template>

      <!-- Compare Algorithms Tab -->
      <template v-else-if="activeTab === 'compare'">
        <section class="flex-1 min-h-0">
          <CompareWorkspace />
        </section>
      </template>

      <!-- Concurrency Visualizer Tab -->
      <template v-else-if="activeTab === 'concurrency'">
        <section class="flex-1 min-h-0">
          <ConcurrencyWorkspace />
        </section>
      </template>

      <!-- Debug Mode Tab -->
      <template v-else-if="activeTab === 'debug'">
        <section class="flex-1 min-h-0">
          <DebugWorkspace />
        </section>
      </template>

      <!-- Interactive Playground Tab -->
      <template v-else-if="activeTab === 'playground'">
        <section class="flex-1 min-h-0">
          <InteractivePlayground />
        </section>
      </template>

      <!-- Default Sorting Layout -->
      <template v-else>
      <!-- Visualizer Area -->
      <section
        class="flex-1 min-h-0 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden"
      >
        <div class="h-full flex flex-col">
          <div
            class="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-800/50"
          >
            <div class="flex items-center gap-3">
              <div class="w-2 h-2 rounded-full bg-cyan-500"></div>
              <span class="text-sm font-medium text-slate-200">{{
                currentTabLabel
              }}</span>
            </div>
          </div>
          <div
            class="flex-1 overflow-auto p-4 flex items-center justify-center"
          >
            <!-- Sorting -->
            <ArrayBarVisualizer v-if="activeTab === 'sorting'" />

            <!-- Graph -->
            <AlgorithmCanvas v-else-if="activeTab === 'graph'" />

            <!-- OOP -->
            <OOPSandbox v-else-if="activeTab === 'oop'" />

            <!-- SOLID -->
            <SOLIDSandbox v-else-if="activeTab === 'solid'" />

            <!-- DI/IoC -->
            <IoCWorkspace v-else-if="activeTab === 'di'" />

            <!-- Patterns -->
            <DesignPatternsWorkspace v-else-if="activeTab === 'patterns'" />

            <!-- Stack/Heap -->
            <StateInspector v-else-if="activeTab === 'state'" />

            <!-- System -->
            <SystemSandbox v-else-if="activeTab === 'system'" />

            <!-- Quiz -->
            <InteractiveLectureSlides v-else-if="activeTab === 'quiz'" />

            <!-- Gamification -->
            <GamificationPanel v-else-if="activeTab === 'gamification'" />
          </div>
        </div>
      </section>

      <!-- Bottom Panel -->
      <div class="flex-shrink-0 h-[300px] flex gap-4">
        <!-- VCR Controls -->
        <section
          class="w-[400px] flex-shrink-0 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col"
        >
          <div class="px-4 py-2 border-b border-slate-800 bg-slate-800/50">
            <span class="text-xs font-medium text-slate-400 uppercase"
              >Controls</span
            >
          </div>
          <div class="flex-1 overflow-hidden">
            <VcrControlPanel />
          </div>
        </section>

        <!-- Custom Input -->
        <section
          v-if="activeTab === 'sorting' || activeTab === 'graph'"
          class="w-[350px] flex-shrink-0 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col"
        >
          <div class="px-4 py-2 border-b border-slate-800 bg-slate-800/50">
            <span class="text-xs font-medium text-slate-400 uppercase"
              >Custom Input</span
            >
          </div>
          <div class="flex-1 overflow-auto">
            <CustomInputPanel />
          </div>
        </section>

        <!-- Code View -->
        <section
          class="flex-1 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col"
        >
          <div
            class="px-4 py-2 border-b border-slate-800 bg-slate-800/50 flex items-center justify-between"
          >
            <span class="text-xs font-medium text-slate-400 uppercase"
              >Source Code</span
            >
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span class="text-xs text-slate-500">Ready</span>
            </div>
          </div>
          <div class="flex-1 overflow-hidden">
            <CodeEditor />
          </div>
        </section>

        <!-- Pseudocode View -->
        <section
          class="flex-1 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col"
        >
          <div class="px-4 py-2 border-b border-slate-800 bg-slate-800/50">
            <span class="text-xs font-medium text-slate-400 uppercase"
              >Pseudocode</span
            >
          </div>
          <div class="flex-1 overflow-auto">
            <PseudocodePanel />
          </div>
        </section>
      </div>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

import { AlgorithmCanvas, ArrayBarVisualizer, CustomInputPanel } from "./features/algorithm-sandbox";
import { VcrControlPanel } from "./features/vcr-player";
import { CodeEditor, PseudocodePanel } from "./features/code-editor";
import { VisualizationPlayer } from "./features/animation-engine";
import { DSAPlayer } from "./features/dsa-modules";
import { OOPSandbox } from "./features/oop-sandbox";
import { SOLIDSandbox } from "./features/solid-sandbox";
import { IoCWorkspace } from "./features/di-sandbox";
import { PatternSandbox } from "./features/pattern-sandbox";
import { DesignPatternsWorkspace } from "./features/design-patterns";
import { StateInspector } from "./features/state-sandbox";
import { SystemSandbox } from "./features/system-sandbox";
import { InteractiveLectureSlides } from "./features/quiz";
import { GamificationPanel } from "./features/gamification";
import { InteractivePlayground } from "./features/interactive-playground";
import { CodeWorkspace } from "./features/code-to-visualization";
import { CompareWorkspace } from "./features/compare-algorithms";
import { ConcurrencyWorkspace } from "./features/concurrency-viz";
import { DebugWorkspace } from "./features/debug-mode";

const activeTab = ref("sorting");

const tabs = [
  { id: "sorting", name: "Sorting" },
  { id: "dsa", name: "DSA Modules" },
  { id: "animation", name: "Animation" },
  { id: "code-ide", name: "Code IDE" },
  { id: "compare", name: "So sánh" },
  { id: "concurrency", name: "Đa luồng" },
  { id: "debug", name: "Debug" },
  { id: "graph", name: "Graph" },
  { id: "playground", name: "Playground" },
  { id: "oop", name: "OOP" },
  { id: "solid", name: "SOLID" },
  { id: "di", name: "DI/IoC" },
  { id: "patterns", name: "Patterns" },
  { id: "state", name: "Stack/Heap" },
  { id: "system", name: "System" },
  { id: "quiz", name: "Quiz" },
  { id: "gamification", name: "Gamification" },
];

const currentTabLabel = computed(
  () => tabs.find((t) => t.id === activeTab.value)?.name ?? "Sorting"
);
</script>

<style>
/* Custom Scrollbar Only */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #475569;
}
</style>
