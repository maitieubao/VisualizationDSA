<template>
  <div class="ioc-workspace flex flex-col gap-4">
    <!-- Header -->
    <div class="flex items-center justify-between bg-[#0e1726]/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 shadow-xl">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-cyan-950/50 border border-cyan-800/30 flex items-center justify-center">
          <svg class="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="8" y="14" width="8" height="7" rx="1" />
            <line x1="6.5" y1="10" x2="6.5" y2="14" />
            <line x1="17.5" y1="10" x2="17.5" y2="14" />
          </svg>
        </div>
        <div>
          <div class="text-sm font-bold text-slate-200">IoC Container Dependency Visualizer</div>
          <div class="text-[10px] text-slate-500">Trực quan hóa Dependency Injection & Constructor Resolution</div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <!-- Scenario Selector -->
        <select
          v-model="store.activeScenarioId"
          class="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 outline-none font-mono"
          @change="onScenarioChange"
        >
          <option v-for="s in store.scenarios" :key="s.scenarioId" :value="s.scenarioId">
            {{ s.title }}
          </option>
        </select>
        <!-- Status Badge -->
        <div
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border"
          :class="statusClass"
        >
          <span class="w-2 h-2 rounded-full" :class="statusDotClass" />
          {{ statusLabel }}
        </div>
      </div>
    </div>

    <!-- Scenario Description -->
    <div
      v-if="store.activeScenario"
      class="px-4 py-2.5 bg-[#070b13]/60 border border-slate-800 rounded-xl text-xs text-slate-400 font-mono"
    >
      {{ store.activeScenario.description }}
    </div>

    <!-- Captive Dependency Warning -->
    <div
      v-if="store.isCaptiveDependencyWarning"
      class="px-4 py-3 bg-amber-950/30 border border-amber-700/40 rounded-xl flex items-center gap-3 captive-warning-pulse"
    >
      <span class="text-amber-400 text-lg">⚠</span>
      <span class="text-xs text-amber-300 font-mono">{{ store.captiveWarningMessage }}</span>
    </div>

    <!-- Circular Error Alert -->
    <div
      v-if="store.isCircularErrorDetected"
      class="px-4 py-3 bg-rose-950/30 border border-rose-700/40 rounded-xl flex items-center gap-3 circular-error-pulse"
    >
      <span class="text-rose-400 text-lg">🔴</span>
      <div>
        <div class="text-xs text-rose-300 font-bold">{{ store.errorMessage }}</div>
        <div class="text-[10px] text-rose-400/70 mt-1">
          Gợi ý: Tách rời Interface hoặc dùng Event Broker để phá vỡ vòng lặp phụ thuộc.
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Left: IoC Cabinet -->
      <IoCContainerCabinet />

      <!-- Right: Resolution Tree -->
      <ResolutionTreeCanvas />
    </div>

    <!-- VCR Controls -->
    <div class="flex items-center justify-between bg-[#0e1726]/70 backdrop-blur-md border border-slate-800/80 rounded-2xl px-5 py-3 shadow-xl">
      <div class="flex items-center gap-3">
        <!-- Service Selector -->
        <select
          v-model="store.selectedServiceToResolve"
          class="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 outline-none font-mono"
          :disabled="store.isResolving"
        >
          <option value="">Chọn Service cần Resolve...</option>
          <option v-for="reg in store.registrationList" :key="reg.serviceType" :value="reg.serviceType">
            {{ reg.serviceType }}
          </option>
        </select>

        <!-- Start Resolution Button -->
        <button
          class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all border"
          :class="
            store.isResolving
              ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-cyan-950/50 border-cyan-700/40 text-cyan-400 hover:bg-cyan-900/50'
          "
          :disabled="store.isResolving || !store.selectedServiceToResolve"
          @click="store.startResolution()"
        >
          Resolve&lt;{{ store.selectedServiceToResolve || 'T' }}&gt;()
        </button>
      </div>

      <!-- VCR Buttons -->
      <div class="flex items-center gap-2">
        <button
          class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-cyan-400 border border-slate-700 hover:border-cyan-700/40 transition-all disabled:opacity-30"
          :disabled="store.currentStepIndex <= 0"
          @click="store.stepBackward()"
          title="Lùi 1 bước"
        >
          ⏮
        </button>
        <button
          class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-cyan-400 border border-slate-700 hover:border-cyan-700/40 transition-all disabled:opacity-30"
          :disabled="store.currentStepIndex >= store.totalSteps - 1"
          @click="store.stepForward()"
          title="Tiến 1 bước"
        >
          ⏭
        </button>
        <div class="text-[10px] text-slate-500 font-mono min-w-[80px] text-center">
          Bước {{ store.currentStepIndex + 1 }} / {{ store.totalSteps }}
        </div>
      </div>

      <!-- Stats -->
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-amber-400" />
          <span class="text-[10px] text-slate-400">Singleton: {{ store.singletonCount }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-slate-400" />
          <span class="text-[10px] text-slate-400">Transient: {{ store.transientCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue';
import { useIoCDebuggerStore } from '../store/useIoCDebuggerStore';
import IoCContainerCabinet from './IoCContainerCabinet.vue';
import ResolutionTreeCanvas from './ResolutionTreeCanvas.vue';

const store = useIoCDebuggerStore();

const statusLabel = computed(() => {
  switch (store.status) {
    case 'IDLE':
      return 'Sẵn sàng';
    case 'RESOLVING':
      return 'Đang phân giải...';
    case 'RESOLVED':
      return 'Hoàn thành';
    case 'ERROR_CIRCULAR':
      return 'Lỗi vòng lặp';
    case 'ERROR_NOT_FOUND':
      return 'Chưa đăng ký';
    default:
      return '';
  }
});

const statusClass = computed(() => {
  switch (store.status) {
    case 'IDLE':
      return 'bg-slate-900/50 border-slate-700 text-slate-400';
    case 'RESOLVING':
      return 'bg-cyan-950/40 border-cyan-700/40 text-cyan-400';
    case 'RESOLVED':
      return 'bg-emerald-950/40 border-emerald-700/40 text-emerald-400';
    case 'ERROR_CIRCULAR':
    case 'ERROR_NOT_FOUND':
      return 'bg-rose-950/40 border-rose-700/40 text-rose-400';
    default:
      return '';
  }
});

const statusDotClass = computed(() => {
  switch (store.status) {
    case 'IDLE':
      return 'bg-slate-500';
    case 'RESOLVING':
      return 'bg-cyan-400 animate-pulse';
    case 'RESOLVED':
      return 'bg-emerald-400';
    case 'ERROR_CIRCULAR':
    case 'ERROR_NOT_FOUND':
      return 'bg-rose-400';
    default:
      return '';
  }
});

function onScenarioChange(): void {
  store.loadScenario(store.activeScenarioId);
}

function onKeyDown(e: KeyboardEvent): void {
  if (
    e.target instanceof HTMLInputElement ||
    e.target instanceof HTMLSelectElement ||
    e.target instanceof HTMLTextAreaElement
  ) {
    return;
  }

  switch (e.key) {
    case 'ArrowRight':
      e.preventDefault();
      store.stepForward();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      store.stepBackward();
      break;
    case ' ':
      e.preventDefault();
      if (store.status === 'IDLE' && store.selectedServiceToResolve) {
        store.startResolution();
      }
      break;
    case 'r':
    case 'R':
      e.preventDefault();
      store.loadScenario(store.activeScenarioId);
      break;
  }
}

onMounted(() => {
  store.loadScenario('web-api-standard');
  window.addEventListener('keydown', onKeyDown);
});

onUnmounted(() => {
  store.cleanup();
  window.removeEventListener('keydown', onKeyDown);
});
</script>

<style scoped>
@keyframes captive-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
.captive-warning-pulse {
  animation: captive-pulse 2s ease-in-out infinite;
}

@keyframes circular-pulse {
  0%, 100% { border-color: rgba(225, 29, 72, 0.4); box-shadow: 0 0 0 rgba(225, 29, 72, 0); }
  50% { border-color: rgba(225, 29, 72, 0.8); box-shadow: 0 0 20px rgba(225, 29, 72, 0.15); }
}
.circular-error-pulse {
  animation: circular-pulse 1.5s ease-in-out infinite;
}
</style>
