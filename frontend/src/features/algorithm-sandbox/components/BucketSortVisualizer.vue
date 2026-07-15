<template>
  <div ref="containerRef" class="visualizer-container w-full h-full flex flex-col gap-4 p-4 relative backdrop-blur-md overflow-hidden font-sans">
    
    <!-- SVG Connection Lines Layer Overlay with Traveling Particles -->
    <svg class="absolute inset-0 pointer-events-none w-full h-full z-10">
      <defs>
        <!-- Cyan glow filter for premium visual storytelling -->
        <filter id="cyan-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- SVG Path connecting active source to target -->
      <g v-if="connectionCoords">
        <path
          id="bucket-active-path"
          :d="connPath"
          stroke="var(--color-accent-cyan)"
          stroke-width="1.8"
          fill="none"
          stroke-dasharray="6, 6"
          class="line-dash animate-dash"
          opacity="0.65"
          filter="url(#cyan-glow)"
        />
        <!-- Traveling circular neon particle representing element scatter/gather flow -->
        <circle r="4.5" fill="var(--color-accent-cyan)" filter="url(#cyan-glow)" opacity="0.95">
          <animateMotion dur="0.7s" repeatCount="indefinite" :path="connPath" />
        </circle>
        <!-- Snap dot at target coordinate -->
        <circle :cx="connectionCoords.x2" :cy="connectionCoords.y2" r="4.5" fill="var(--color-accent-cyan)" filter="url(#cyan-glow)" />
      </g>
    </svg>

    <!-- PHASE STEPPER BAR (TOP) -->
    <div class="stepper-bar flex items-center justify-center px-4 py-2 rounded-xl gap-2 shrink-0 z-20">
      <div class="flex items-center gap-1.5 flex-1 justify-center flex-wrap">
        <div 
          v-for="(phase, idx) in ['DISTRIBUTE', 'SORT', 'COLLECT']" 
          :key="idx"
          class="flex items-center gap-1.5 transition-all duration-300"
        >
          <span v-if="idx > 0" class="stepper-arrow text-xs font-mono select-none">⟶</span>
          <span 
            class="phase-badge px-2.5 py-0.5 rounded-lg text-[9px] font-bold font-mono tracking-wider transition-all duration-300 border select-none"
            :class="getPhaseStepClass(phase)"
          >
            PHASE {{ idx + 1 }}: {{ phase }}
          </span>
        </div>
      </div>
    </div>

    <!-- DYNAMIC STORY EXPLANATION PANEL -->
    <div class="explanation-panel px-4 py-2.5 rounded-xl shrink-0 flex items-center gap-2.5 z-20 shadow-md">
      <div class="info-icon-wrapper w-6 h-6 rounded-lg flex items-center justify-center shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p class="explanation-text text-[11px] font-semibold leading-normal font-sans">
        {{ frame?.description || "Bấm Play ▶ để bắt đầu trực quan hóa Bucket Sort." }}
      </p>
    </div>

    <!-- THREE-TIER VISUAL PIPELINE LAYOUT -->
    <div class="flex-1 flex flex-col justify-between gap-4 z-20 min-h-0">
      
      <!-- TIER 1: INPUT ARRAY -->
      <div 
        class="tier-container flex-1 min-h-[110px] flex flex-col gap-1 px-4 py-2 rounded-xl transition-all duration-300 relative justify-end"
        :class="frame?.bucketStep !== 'distribute' ? 'tier-inactive' : ''"
      >
        <!-- Section label -->
        <div class="absolute top-2 left-3 flex items-center gap-1.5 select-none">
          <span class="pulse-dot w-1.5 h-1.5 rounded-full animate-pulse"></span>
          <span class="tier-label text-[9px] font-bold font-mono tracking-wider uppercase">Tier 1: Mảng đầu vào (Input Array)</span>
        </div>
        
        <!-- Element Bars -->
        <div class="flex items-end justify-center gap-2 pb-1 relative mt-6">
          <div
            v-for="(item, idx) in props.frame?.arrayStateWithIds || []"
            :key="item.id"
            :class="[
              `input-bar-${idx}`,
              'relative w-9 rounded-t-md transition-all duration-300 flex flex-col justify-end items-center border',
              isInputBarActive(idx) ? 'active-input-bar border-cyan-400' : 'inactive-input-bar border-cyan-500/20'
            ]"
            :style="{
              height: `${Math.max(item.value * 0.75, 18)}px`,
            }"
          >
            <!-- Active target bounce helper -->
            <div v-if="isInputBarActive(idx)" class="active-bounce-helper absolute -top-10 flex flex-col items-center animate-bounce">
              <span class="text-[8px] font-bold uppercase tracking-widest px-1 rounded">Xét</span>
              <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            <span class="absolute -top-5 text-[9px] font-bold text-sky-400 select-none">
              {{ item.value }}
            </span>
            <span v-if="(props.frame?.arrayStateWithIds?.length ?? 0) <= 12" class="text-[8px] font-mono text-slate-500 select-none pb-0.5">
              A[{{ idx }}]
            </span>
          </div>
        </div>
      </div>

      <!-- TIER 2: BUCKETS GRID -->
      <div class="tier-container flex-1 min-h-[140px] flex flex-col gap-2 p-3 rounded-xl transition-all duration-300 relative justify-center">
        <!-- Section label -->
        <div class="absolute top-2 left-3 flex items-center gap-1.5 select-none">
          <span class="pulse-dot w-1.5 h-1.5 rounded-full animate-pulse"></span>
          <span class="tier-label text-[9px] font-bold font-mono tracking-wider uppercase">Tier 2: Các khay chứa dữ liệu (Buckets Grid)</span>
        </div>

        <!-- 4 Buckets Grid columns -->
        <div class="grid grid-cols-4 gap-3 mt-4">
          <div
            v-for="(bucket, bIdx) in props.frame?.bucketSortBucketsWithIds || [[], [], [], []]"
            :key="bIdx"
            :class="[
              `bucket-box-${bIdx}`,
              'bucket-box rounded-xl p-2.5 min-h-[90px] flex flex-col gap-2 transition-all duration-300 relative',
              isBucketBoxActive(bIdx) ? 'active-bucket-box' : 'inactive-bucket-box'
            ]"
          >
            <!-- Bucket details header -->
            <div class="bucket-box-header flex items-center justify-between pb-1.5">
              <div class="flex flex-col">
                <span class="text-[9px] font-bold bucket-title">Khay {{ bIdx }}</span>
                <span class="text-[8px] font-mono bucket-range-label leading-none">Range: {{ getBucketRangeLabel(bIdx) }}</span>
              </div>
              <!-- Status Badge -->
              <span 
                class="text-[7.5px] font-bold font-mono px-1 py-0.5 rounded uppercase select-none tracking-widest border leading-none scale-[0.88] origin-right transition-all duration-300"
                :class="getBucketStatusClass(bIdx)"
              >
                {{ getBucketStatusText(bIdx) }}
              </span>
            </div>

            <!-- Dynamic element cells with sort highlights -->
            <div class="flex gap-1.5 flex-wrap items-center content-center flex-1 min-h-[36px] justify-center relative">
              <transition-group name="bucket-list">
                <div
                  v-for="(elem, vIdx) in bucket"
                  :key="elem.id"
                  :class="[
                    'bucket-elem-cell px-2 py-0.5 border rounded text-xs font-mono font-bold transition-all duration-300',
                    isBucketElemComparing(bIdx, vIdx) ? 'active-bucket-elem-cell scale-[1.12] z-10 animate-pulse' : 'inactive-bucket-elem-cell'
                  ]"
                >
                  {{ elem.value }}
                </div>
              </transition-group>
              <!-- Empty state placeholder -->
              <div v-if="bucket.length === 0" class="bucket-empty-placeholder text-[8px] font-mono italic select-none">
                Trống
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TIER 3: OUTPUT ARRAY -->
      <div 
        class="tier-container flex-1 min-h-[90px] flex flex-col gap-1 px-4 py-2 rounded-xl transition-all duration-300 relative justify-end"
        :class="frame?.bucketStep !== 'collect' ? 'tier-inactive' : ''"
      >
        <!-- Section label -->
        <div class="absolute top-2 left-3 flex items-center gap-1.5 select-none">
          <span class="pulse-dot w-1.5 h-1.5 rounded-full animate-pulse"></span>
          <span class="tier-label text-[9px] font-bold font-mono tracking-wider uppercase">Tier 3: Mảng kết quả (Output Array)</span>
        </div>

        <!-- Output slots filled sequentially -->
        <div class="flex items-center justify-center gap-2 pb-1 relative mt-6">
          <div
            v-for="(item, idx) in props.frame?.bucketSortOutputWithIds || []"
            :key="idx"
            :class="[
              `output-slot-${idx}`,
              'output-slot w-9 h-9 rounded-lg border transition-all duration-300 flex items-center justify-center relative font-mono font-bold text-xs',
              isOutputSlotActive(idx) ? 'active-output-slot' : '',
              item ? 'filled-output-slot' : 'empty-output-slot border-dashed'
            ]"
          >
            <!-- Active target pointer -->
            <div v-if="isOutputSlotActive(idx)" class="active-bounce-helper absolute -bottom-8 flex flex-col items-center animate-bounce">
              <svg class="w-2.5 h-2.5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              <span class="text-[7.5px] font-bold uppercase tracking-widest px-1 rounded mt-0.5">Nạp</span>
            </div>

            {{ item ? item.value : '_' }}
            <span v-if="(props.frame?.bucketSortOutputWithIds?.length ?? 0) <= 12" class="absolute -top-4 text-[7.5px] font-mono text-slate-600 select-none">
              O[{{ idx }}]
            </span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import type { SortFrame } from "../types/sorting.types";

const props = defineProps<{
  frame: SortFrame | null;
}>();

const containerRef = ref<HTMLElement | null>(null);
const connectionCoords = ref<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

// Calculate dynamic coordinate mapping for SVG overlay connectors
const updateCoords = () => {
  const f = props.frame;
  if (!f || !containerRef.value) {
    connectionCoords.value = null;
    return;
  }
  
  nextTick(() => {
    const root = containerRef.value;
    if (!root) return;
    
    const rootRect = root.getBoundingClientRect();
    let sourceEl: HTMLElement | null = null;
    let targetEl: HTMLElement | null = null;
    
    const step = f.bucketStep;
    
    if (step === "distribute" && f.comparingIndices) {
      const activeIdx = f.comparingIndices[0];
      sourceEl = root.querySelector(`.input-bar-${activeIdx}`) as HTMLElement;
      
      const activeB = f.bucketSortActiveIdx;
      if (activeB !== null && activeB !== undefined) {
        targetEl = root.querySelector(`.bucket-box-${activeB}`) as HTMLElement;
      }
    } else if (step === "collect" && f.comparingIndices) {
      const activeB = f.bucketSortActiveIdx;
      if (activeB !== null && activeB !== undefined) {
        sourceEl = root.querySelector(`.bucket-box-${activeB}`) as HTMLElement;
      }
      
      const activeOutIdx = f.comparingIndices[0];
      targetEl = root.querySelector(`.output-slot-${activeOutIdx}`) as HTMLElement;
    }
    
    if (sourceEl && targetEl) {
      const srcRect = sourceEl.getBoundingClientRect();
      const tgtRect = targetEl.getBoundingClientRect();
      
      connectionCoords.value = {
        x1: srcRect.left + srcRect.width / 2 - rootRect.left,
        y1: srcRect.bottom - rootRect.top,
        x2: tgtRect.left + tgtRect.width / 2 - rootRect.left,
        y2: tgtRect.top - rootRect.top,
      };
    } else {
      connectionCoords.value = null;
    }
  });
};

// Listen to frame shifts and sizing triggers
watch(
  () => [props.frame, props.frame?.bucketStep, props.frame?.bucketSortActiveIdx, props.frame?.comparingIndices],
  () => {
    updateCoords();
  },
  { deep: true, immediate: true }
);

onMounted(() => {
  window.addEventListener("resize", updateCoords);
  setTimeout(updateCoords, 150);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateCoords);
});

// Smooth cubic bezier path generator
const connPath = computed(() => {
  if (!connectionCoords.value) return "";
  const { x1, y1, x2, y2 } = connectionCoords.value;
  return `M ${x1} ${y1} C ${x1} ${(y1 + y2) / 2}, ${x2} ${(y1 + y2) / 2}, ${x2} ${y2}`;
});

// Dynamic stepper active styles
function getPhaseStepClass(phase: string): string {
  const currentStep = props.frame?.bucketStep;
  if (!currentStep) return "phase-inactive";
  
  const stepMap: Record<string, string> = {
    'DISTRIBUTE': 'distribute',
    'SORT': 'sort',
    'COLLECT': 'collect'
  };
  
  const activeStep = stepMap[phase];
  
  if (currentStep === activeStep) {
    return "phase-active";
  }
  
  const order = ['distribute', 'sort', 'collect'];
  const currentIdx = order.indexOf(currentStep);
  const phaseIdx = order.indexOf(activeStep);
  
  if (phaseIdx < currentIdx) {
    return "phase-completed";
  }
  
  return "phase-inactive";
}

// Check active bar index in Input Array
function isInputBarActive(idx: number): boolean {
  return props.frame?.bucketStep === "distribute" && props.frame?.comparingIndices?.includes(idx) === true;
}

// Check active bucket index
function isBucketBoxActive(bIdx: number): boolean {
  return props.frame?.bucketSortActiveIdx === bIdx;
}

// Check if comparing inside bucket
function isBucketElemComparing(bIdx: number, vIdx: number): boolean {
  const f = props.frame;
  return f?.bucketStep === "sort" && f?.bucketSortActiveIdx === bIdx && f?.bucketSortComparingBucketIndices?.includes(vIdx) === true;
}

// Check active output slot index
function isOutputSlotActive(idx: number): boolean {
  return props.frame?.bucketStep === "collect" && props.frame?.comparingIndices?.includes(idx) === true;
}

// Exact range labels for the 4 buckets
function getBucketRangeLabel(bIdx: number): string {
  if (bIdx === 0) return "[0 - 25)";
  if (bIdx === 1) return "[25 - 50)";
  if (bIdx === 2) return "[50 - 75)";
  return "[75 - 100]";
}

// Get the visual label for bucket statuses
function getBucketStatusText(bIdx: number): string {
  const f = props.frame;
  if (!f) return "⏸ Chờ";
  
  const currentStep = f.bucketStep;
  const activeB = f.bucketSortActiveIdx;
  
  if (currentStep === "distribute") {
    if (activeB === bIdx) return "🔄 Nhận";
    if (activeB !== null && activeB !== undefined && bIdx < activeB) return "✅ Xong";
  } else if (currentStep === "sort") {
    if (activeB === bIdx) return "⚡ Sort";
    if (activeB !== null && activeB !== undefined && bIdx < activeB) return "✅ Xong";
  } else if (currentStep === "collect") {
    if (activeB === bIdx) return "📤 Lấy";
    if (activeB !== null && activeB !== undefined && bIdx < activeB) return "✅ Rỗng";
  }
  
  return "⏸ Chờ";
}

// Styles corresponding to bucket statuses
function getBucketStatusClass(bIdx: number): string {
  const f = props.frame;
  if (!f) return "bucket-status-idle";
  
  const currentStep = f.bucketStep;
  const activeB = f.bucketSortActiveIdx;
  
  if (activeB === bIdx) {
    return "bucket-status-active";
  }
  
  if (activeB !== null && activeB !== undefined && bIdx < activeB) {
    return "bucket-status-done";
  }
  
  return "bucket-status-idle";
}
</script>

<style scoped>
.visualizer-container {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
}

.stepper-bar {
  background: color-mix(in srgb, var(--color-bg-secondary) 60%, transparent);
  border: 1px solid var(--color-border-subtle);
  box-shadow: var(--shadow-md);
}

.stepper-arrow {
  color: var(--color-text-muted);
}

.phase-badge {
  border-color: var(--color-border-subtle);
}

.phase-active {
  background-color: var(--color-accent-cyan-dim);
  border-color: var(--color-accent-cyan);
  color: var(--color-accent-cyan);
  box-shadow: 0 0 10px var(--color-accent-cyan-glow);
}

.phase-completed {
  background-color: var(--color-accent-cyan-dim);
  border-color: color-mix(in srgb, var(--color-accent-cyan) 20%, transparent);
  color: color-mix(in srgb, var(--color-accent-cyan) 60%, transparent);
  opacity: 0.8;
}

.phase-inactive {
  background-color: color-mix(in srgb, var(--color-bg-primary) 10%, transparent);
  border-color: var(--color-border-subtle);
  color: var(--color-text-muted);
}

.explanation-panel {
  background: color-mix(in srgb, var(--color-bg-terminal) 60%, transparent);
  border: 1px solid var(--color-border-subtle);
}

.info-icon-wrapper {
  background-color: var(--color-accent-cyan-dim);
  color: var(--color-accent-cyan);
  border: 1px solid var(--color-accent-cyan-glow);
}

.explanation-text {
  color: var(--color-text-primary);
}

.tier-container {
  background-color: color-mix(in srgb, var(--color-bg-primary) 30%, transparent);
  border: 1px solid var(--color-border-subtle);
}

.tier-inactive {
  opacity: 0.2;
  filter: blur(0.4px);
  pointer-events: none;
}

.pulse-dot {
  background-color: var(--color-accent-cyan);
}

.tier-label {
  color: var(--color-accent-cyan);
  opacity: 0.9;
}

.active-bounce-helper {
  color: var(--color-accent-cyan);
}

.active-bounce-helper span {
  background-color: color-mix(in srgb, var(--color-accent-cyan) 80%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent-cyan) 40%, transparent);
}

.active-input-bar {
  background-color: var(--color-accent-cyan-dim) !important;
  border-color: var(--color-accent-cyan) !important;
  box-shadow: 0 0 12px var(--color-accent-cyan-glow);
}

.inactive-input-bar {
  background-color: color-mix(in srgb, var(--color-accent-cyan) 5%, transparent);
  border-color: color-mix(in srgb, var(--color-accent-cyan) 20%, transparent);
}

.bucket-box {
  border: 1px solid var(--color-border-subtle);
}

.active-bucket-box {
  border-color: var(--color-accent-cyan);
  background-color: var(--color-accent-cyan-dim);
  box-shadow: 0 0 14px rgba(6, 182, 212, 0.14);
}

.inactive-bucket-box {
  background-color: color-mix(in srgb, var(--color-bg-secondary) 70%, transparent);
}

.bucket-box-header {
  border-bottom: 1px solid var(--color-border-subtle);
}

.bucket-title {
  color: var(--color-text-secondary);
}

.bucket-range-label {
  color: color-mix(in srgb, var(--color-accent-cyan) 60%, transparent);
}

.bucket-status-active {
  background-color: var(--color-accent-cyan-dim);
  color: var(--color-accent-cyan);
  border-color: color-mix(in srgb, var(--color-accent-cyan) 40%, transparent);
  box-shadow: 0 0 6px var(--color-accent-cyan-glow);
}

.bucket-status-done {
  background-color: color-mix(in srgb, var(--color-bg-primary) 20%, transparent);
  color: var(--color-text-muted);
  border-color: var(--color-border-subtle);
  opacity: 0.6;
}

.bucket-status-idle {
  background-color: color-mix(in srgb, var(--color-bg-primary) 30%, transparent);
  color: var(--color-text-muted);
  border-color: var(--color-border-subtle);
}

.bucket-elem-cell {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  border-color: var(--color-border-subtle);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.active-bucket-elem-cell {
  border-color: var(--color-accent-cyan) !important;
  color: var(--color-accent-cyan) !important;
  background-color: var(--color-accent-cyan-dim) !important;
  box-shadow: 0 0 8px var(--color-accent-cyan-glow) !important;
}

.inactive-bucket-elem-cell {
  border-color: var(--color-border-subtle) !important;
}

.bucket-empty-placeholder {
  color: color-mix(in srgb, var(--color-text-muted) 40%, transparent);
}

.output-slot {
  background-color: transparent;
}

.active-output-slot {
  border-color: var(--color-accent-cyan) !important;
  background-color: var(--color-accent-cyan-dim) !important;
  box-shadow: 0 0 12px var(--color-accent-cyan-glow);
}

.filled-output-slot {
  background-color: var(--color-bg-primary);
  border-color: color-mix(in srgb, var(--color-accent-cyan) 30%, transparent);
  color: var(--color-accent-cyan);
}

.empty-output-slot {
  border-color: color-mix(in srgb, var(--color-text-muted) 40%, transparent);
  color: var(--color-text-muted);
}

/* Sleek micro-animation for SVG dasharray */
@keyframes dash {
  to {
    stroke-dashoffset: -20;
  }
}
.line-dash {
  animation: dash 1s linear infinite;
}

/* Beautiful element transition list inside buckets */
.bucket-list-move,
.bucket-list-enter-active,
.bucket-list-leave-active {
  transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
}
.bucket-list-enter-from,
.bucket-list-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.9);
}
</style>





