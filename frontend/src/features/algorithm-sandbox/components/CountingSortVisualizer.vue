<template>
  <div ref="containerRef" class="visualizer-container w-full h-full flex flex-col gap-4 p-4 relative backdrop-blur-md overflow-hidden font-sans">
    
    <!-- SVG Connection Lines Layer Overlay with Traveling Particles -->
    <svg class="absolute inset-0 pointer-events-none w-full h-full z-10">
      <defs>
        <!-- Cyan glow filter for Count and Output phase connections -->
        <filter id="cyan-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <!-- Amber glow filter for prefix sum accumulation scanning -->
        <filter id="amber-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- Connection Line 1: Input Array -> Count Grid or Count Grid -> Count Grid -->
      <g v-if="activeLineCoords">
        <path
          id="active-path-1"
          :d="getPathDescription(activeLineCoords)"
          :stroke="getLineColor()"
          stroke-width="1.8"
          fill="none"
          stroke-dasharray="6, 6"
          class="line-dash"
          opacity="0.55"
          :filter="getLineFilter()"
        />
        <!-- Traveling neon particle representing element movement -->
        <circle r="4.5" :fill="getLineColor()" filter="url(#cyan-glow)" opacity="0.95">
          <animateMotion dur="0.7s" repeatCount="indefinite">
            <mpath href="#active-path-1" />
          </animateMotion>
        </circle>
        <circle :cx="activeLineCoords.x2" :cy="activeLineCoords.y2" r="4.5" :fill="getLineCircleColor()" />
      </g>

      <!-- Connection Line 2: Count Grid -> Output Array -->
      <g v-if="activeOutputLineCoords">
        <path
          id="active-path-2"
          :d="getPathDescription(activeOutputLineCoords)"
          stroke="var(--color-accent-green)"
          stroke-width="1.8"
          fill="none"
          stroke-dasharray="6, 6"
          class="line-dash"
          opacity="0.55"
          filter="url(#cyan-glow)"
        />
        <!-- Traveling neon particle representing sorted element channelling -->
        <circle r="4.5" fill="var(--color-accent-green)" filter="url(#cyan-glow)" opacity="0.95">
          <animateMotion dur="0.7s" repeatCount="indefinite">
            <mpath href="#active-path-2" />
          </animateMotion>
        </circle>
        <circle :cx="activeOutputLineCoords.x2" :cy="activeOutputLineCoords.y2" r="4.5" fill="var(--color-accent-green)" />
      </g>
    </svg>

    <!-- PHASE STEPPER BAR (TOP) -->
    <div class="stepper-bar flex items-center justify-center px-4 py-2 rounded-xl gap-2 shrink-0 z-20">
      <div class="flex items-center gap-1.5 flex-1 justify-center flex-wrap">
        <div 
          v-for="(phase, idx) in ['COUNT', 'PREFIX SUM', 'BUILD OUTPUT']" 
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
        {{ frame?.description || "Chọn mảng dữ liệu và bấm Play ▶ để xem luồng đếm của thuật toán." }}
      </p>
    </div>

    <!-- PIPELINE CONTAINER WITH CAMERA FOCUS TRANSITIONS -->
    <div class="flex-1 min-h-0 flex flex-col justify-around py-1 gap-2 z-20">
      
      <!-- TIER 1: INPUT ARRAY (TOP) - Vertical Columns matching Standard Sorting UI -->
      <div 
        class="flex flex-col gap-1.5 transition-all duration-500"
        :class="isInputActive ? 'opacity-100 scale-100 filter-none' : 'tier-inactive'"
      >
        <div class="flex items-center justify-between px-1">
          <span class="tier-title text-[10px] font-bold uppercase tracking-wider">
            1. Mảng Đầu Vào (Input Array)
          </span>
          <span class="tier-subtitle text-[9px] font-mono">
            Cột chiều cao tỷ lệ thuận với giá trị
          </span>
        </div>

        <div class="flex justify-center items-end gap-3 h-28 py-1 px-1">
          <div
            v-for="(val, idx) in frame?.inputArray || []"
            :key="idx"
            class="relative w-11 transition-all duration-300 flex flex-col justify-end items-center h-full"
          >
            <!-- Vertical Column/Bar representing the element value -->
            <div
              ref="inputBars"
              class="input-bar w-full flex flex-col items-center justify-center rounded-xl border font-bold select-none transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.3)] min-h-[30px]"
              :class="isInputBarActive(idx) ? 'active-input-bar' : ''"
              :style="{
                height: `${barHeightPct(val)}%`,
                borderColor: isInputBarActive(idx) ? 'var(--color-accent-cyan)' : getStableColor(idx).border,
                backgroundColor: isInputBarActive(idx) ? 'var(--color-accent-cyan-dim)' : getStableColor(idx).bg,
                color: isInputBarActive(idx) ? 'var(--color-accent-cyan)' : getStableColor(idx).text,
                boxShadow: isInputBarActive(idx) ? 'var(--shadow-cyan)' : getStableColor(idx).shadow
              }"
            >
              <!-- Splitted digit display (Tens digit + Active highlight units digit) -->
              <div class="flex items-baseline justify-center font-mono font-bold text-xs tracking-tighter">
                <span :class="isInputBarActive(idx) ? 'digit-tens-active' : 'digit-tens-inactive'">
                  {{ Math.floor(val / 10) }}
                </span>
                <span 
                  class="transition-all duration-300"
                  :class="isInputBarActive(idx) ? 'digit-units-active' : ''"
                >
                  {{ val % 10 }}
                </span>
              </div>

              <!-- Active digit mapping indicator pointer -->
              <div 
                class="text-[8px] font-mono font-bold text-cyan-400 animate-pulse select-none leading-none mt-0.5"
                v-if="isInputBarActive(idx)"
              >
                ↑
              </div>
            </div>

            <!-- Index bracket labels below bars -->
            <div
              v-if="frame?.inputArray && frame.inputArray.length <= 12"
              class="mt-1 font-mono text-[9px] font-bold shrink-0 transition-all duration-300"
              :class="isInputBarActive(idx) ? 'text-cyan-400 scale-105' : 'index-label'"
            >
              [{{ idx }}]
            </div>
          </div>
        </div>
      </div>

      <!-- TIER 2: COUNTING GRID (0-9 CLAMPED) (CENTER) -->
      <div 
        class="counting-grid-wrapper flex flex-col gap-1.5 border rounded-2xl p-3 shadow-inner transition-all duration-500"
        :class="isCountActive ? 'opacity-100 scale-100 filter-none' : 'tier-inactive'"
      >
        <div class="flex items-center justify-between px-1">
          <span class="tier-title text-[10px] font-bold uppercase tracking-wider text-accent-cyan">
            2. Bảng Tần Suất Đếm (Counting Grid)
          </span>
          <span class="tier-subtitle text-[9px] font-mono">
            Duyệt & Đếm theo hàng đơn vị
          </span>
        </div>

        <!-- Count Cells grid -->
        <div class="grid grid-cols-5 md:grid-cols-10 gap-2">
          <div
            v-for="val in 10"
            :key="val - 1"
            ref="countCells"
            class="count-cell flex flex-col border rounded-xl overflow-hidden text-center transition-all duration-300"
            :class="isCountCellHighlighted(val - 1) ? getCountCellHighlightClass() : ''"
          >
            <!-- Value Index cell -->
            <div class="count-cell-header py-1 text-[9px] font-mono font-bold border-b select-none">
              Val: {{ val - 1 }}
            </div>
            <!-- Current count cell -->
            <div
              class="py-1.5 text-xs font-mono font-bold transition-all duration-300"
              :class="isCountCellHighlighted(val - 1) ? 'text-cyan-400 font-extrabold' : 'count-cell-value'"
            >
              {{ frame?.countArray?.[val - 1] ?? 0 }}
            </div>
          </div>
        </div>
      </div>

      <!-- TIER 3: OUTPUT ARRAY (BOTTOM) - Vertical Columns built stably -->
      <div 
        class="flex flex-col gap-1.5 transition-all duration-500"
        :class="isOutputActive ? 'opacity-100 scale-100 filter-none' : 'tier-inactive'"
      >
        <div class="flex items-center justify-between px-1">
          <span class="output-tier-title text-[10px] font-bold uppercase tracking-wider">
            3. Mảng Kết Quả (Output Array)
          </span>
          <span class="tier-subtitle text-[9px] font-mono">
            Cột dựng lên từ cuối mảng với stable color
          </span>
        </div>

        <div class="flex justify-center items-end gap-3 h-28 py-1 px-1">
          <div
            v-for="(val, idx) in frame?.inputArray || []"
            :key="idx"
            class="relative w-11 transition-all duration-300 flex flex-col justify-end items-center h-full"
          >
            <!-- State 1: Filled vertical bar element -->
            <div 
              v-if="getOutputElement(idx) !== null"
              ref="outputSlots"
              class="w-full flex flex-col items-center justify-center rounded-xl border font-bold select-none transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.3)] min-h-[30px] scale-105"
              :style="{
                height: `${barHeightPct(getOutputElement(idx)?.value ?? 0)}%`,
                borderColor: getStableColor(getOutputElement(idx)?.id ?? 0).border,
                backgroundColor: getStableColor(getOutputElement(idx)?.id ?? 0).bg,
                color: getStableColor(getOutputElement(idx)?.id ?? 0).text,
                boxShadow: getStableColor(getOutputElement(idx)?.id ?? 0).shadow
              }"
            >
              <span class="font-mono text-xs">{{ getOutputElement(idx)?.value }}</span>
            </div>
            
            <!-- State 2: Target pulsing placeholder -->
            <div 
              v-else-if="isOutputSlotActive(idx)"
              ref="outputSlots"
              class="active-output-slot w-full h-[32px] flex items-center justify-center rounded-xl border border-dashed scale-105 animate-pulse text-xs font-black font-mono select-none"
            >
              ?
            </div>
            
            <!-- State 3: Empty placeholder -->
            <div 
              v-else 
              class="empty-output-slot w-full h-[32px] flex items-center justify-center rounded-xl border border-dashed text-xs font-light font-mono select-none"
            >
              _
            </div>

            <!-- Index bracket labels below slots -->
            <div
              v-if="frame?.inputArray && frame.inputArray.length <= 12"
              class="mt-1 font-mono text-[9px] font-bold shrink-0 transition-all duration-300"
              :class="isOutputSlotActive(idx) ? 'text-emerald-400 scale-105' : 'index-label'"
            >
              [{{ idx }}]
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import type { SortFrame } from '../types/sorting.types';

const props = defineProps<{
  frame: SortFrame | null;
}>();

// Element refs to dynamically compute drawing coordinates
const containerRef = ref<HTMLElement | null>(null);
const inputBars = ref<HTMLElement[]>([]);
const countCells = ref<HTMLElement[]>([]);
const outputSlots = ref<HTMLElement[]>([]);

// Line coordinate states
const activeLineCoords = ref<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
const activeOutputLineCoords = ref<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

function getStableColor(id: number) {
  return {
    border: 'color-mix(in srgb, var(--color-accent-cyan) 35%, transparent)',
    bg: 'var(--color-accent-cyan-dim)',
    text: 'var(--color-accent-cyan)',
    shadow: 'var(--shadow-cyan)'
  };
}

const isInputActive = computed(() => {
  if (!props.frame) return true;
  const step = props.frame.countingStep;
  return step === 'count' || step === 'output';
});

const isCountActive = computed(() => {
  if (!props.frame) return true;
  const step = props.frame.countingStep;
  return step === 'count' || step === 'accumulate' || step === 'output';
});

const isOutputActive = computed(() => {
  if (!props.frame) return true;
  const step = props.frame.countingStep;
  return step === 'output';
});

const maxVal = computed(() => {
  if (!props.frame?.inputArray?.length) return 1;
  return Math.max(...props.frame.inputArray, 5);
});

/**
 * Bar height as % of the zone container height.
 * Min 25% so even the smallest bar is visible and text can be centered inside.
 * Max 90% so the tallest bar leaves headroom for neat connections.
 */
function barHeightPct(value: number): number {
  const ratio = value / maxVal.value;
  return Math.round(25 + ratio * 65);
}

function getPhaseStepClass(phase: string): string {
  const current = props.frame?.countingStep;
  let isActive = false;
  let isCompleted = false;

  if (phase === 'COUNT') {
    isActive = current === 'count';
    isCompleted = current === 'accumulate' || current === 'output';
  } else if (phase === 'PREFIX SUM') {
    isActive = current === 'accumulate';
    isCompleted = current === 'output';
  } else if (phase === 'BUILD OUTPUT') {
    isActive = current === 'output';
  }

  if (isActive) {
    if (phase === 'COUNT') return 'phase-active-count';
    if (phase === 'PREFIX SUM') return 'phase-active-prefix';
    if (phase === 'BUILD OUTPUT') return 'phase-active-output';
  }
  if (isCompleted) {
    return 'phase-completed';
  }
  return 'phase-inactive';
}

function isInputBarActive(idx: number): boolean {
  if (!props.frame) return false;
  const step = props.frame.countingStep;
  const comparing = props.frame.comparingIndices;
  
  if (step === 'count' && comparing) {
    return comparing[0] === idx;
  }
  if (step === 'output' && comparing) {
    return comparing[0] === idx;
  }
  return false;
}

function isCountCellHighlighted(val: number): boolean {
  if (!props.frame) return false;
  const step = props.frame.countingStep;
  const comparing = props.frame.comparingIndices;

  if (step === 'count' && comparing) {
    return comparing[1] === val;
  }
  if (step === 'accumulate' && comparing) {
    return val >= comparing[0] && val <= comparing[1];
  }
  if (step === 'output' && comparing) {
    const inputIdx = comparing[0];
    const itemVal = props.frame.inputArray?.[inputIdx];
    return itemVal !== undefined && (itemVal % 10) === val;
  }
  return false;
}

function isOutputSlotActive(idx: number): boolean {
  if (!props.frame) return false;
  const step = props.frame.countingStep;
  const comparing = props.frame.comparingIndices;

  if (step === 'output' && comparing) {
    return comparing[1] === idx;
  }
  return false;
}

function getOutputElement(idx: number): { id: number; value: number } | null {
  if (!props.frame || !props.frame.outputArrayWithIds) return null;
  return props.frame.outputArrayWithIds[idx] ?? null;
}

function getCountCellHighlightClass(): string {
  const step = props.frame?.countingStep;
  if (step === 'count') {
    return 'cell-pulse count-cell-highlight-cyan';
  }
  if (step === 'accumulate') {
    return 'cell-pulse count-cell-highlight-amber';
  }
  if (step === 'output') {
    return 'cell-pulse count-cell-highlight-emerald';
  }
  return 'count-cell-highlight-cyan';
}

function getLineColor(): string {
  const step = props.frame?.countingStep;
  if (step === 'count') return 'var(--color-accent-cyan)';
  if (step === 'accumulate') return 'var(--color-accent-yellow)';
  if (step === 'output') return 'var(--color-accent-green)';
  return 'var(--color-accent-cyan)';
}

function getLineCircleColor(): string {
  return getLineColor();
}

function getLineFilter(): string {
  const step = props.frame?.countingStep;
  if (step === 'accumulate') return 'url(#amber-glow)';
  return 'url(#cyan-glow)';
}

function getPathDescription(coords: { x1: number; y1: number; x2: number; y2: number }): string {
  const { x1, y1, x2, y2 } = coords;
  // If it's a count-to-count accumulate loop, draw a looping horizontal bridge
  if (Math.abs(y1 - y2) < 15) {
    const dx = x2 - x1;
    const dy = -Math.abs(dx) * 0.28; // curve upwards
    return `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${y1 + dy} ${x2} ${y2}`;
  }
  // Otherwise draw a vertical S-curve
  const controlDist = Math.abs(y2 - y1) * 0.42;
  return `M ${x1} ${y1} C ${x1} ${y1 + controlDist}, ${x2} ${y2 - controlDist}, ${x2} ${y2}`;
}

function updateConnectorLines() {
  if (!props.frame || !containerRef.value) {
    activeLineCoords.value = null;
    activeOutputLineCoords.value = null;
    return;
  }

  const containerRect = containerRef.value.getBoundingClientRect();
  const step = props.frame.countingStep;
  const comparing = props.frame.comparingIndices;

  if (step === 'count' && comparing) {
    const inputIdx = comparing[0];
    const countVal = comparing[1];
    
    const inputEl = inputBars.value[inputIdx];
    const countEl = countCells.value[countVal];

    if (inputEl && countEl) {
      const inputRect = inputEl.getBoundingClientRect();
      const countRect = countEl.getBoundingClientRect();

      activeLineCoords.value = {
        x1: inputRect.left + inputRect.width / 2 - containerRect.left,
        y1: inputRect.bottom - containerRect.top,
        x2: countRect.left + countRect.width / 2 - containerRect.left,
        y2: countRect.top - containerRect.top
      };
      activeOutputLineCoords.value = null;
    }
  } else if (step === 'accumulate' && comparing) {
    const prevCell = countCells.value[comparing[0]];
    const currCell = countCells.value[comparing[1]];

    if (prevCell && currCell) {
      const prevRect = prevCell.getBoundingClientRect();
      const currRect = currCell.getBoundingClientRect();

      activeLineCoords.value = {
        x1: prevRect.left + prevRect.width / 2 - containerRect.left,
        y1: prevRect.bottom - containerRect.top,
        x2: currRect.left + currRect.width / 2 - containerRect.left,
        y2: currRect.top - containerRect.top
      };
      activeOutputLineCoords.value = null;
    }
  } else if (step === 'output' && comparing) {
    const inputIdx = comparing[0];
    const outputIdx = comparing[1];
    const val = props.frame.inputArray?.[inputIdx];

    if (val !== undefined) {
      const digit = Math.max(0, Math.min(Math.floor(val % 10), 9));
      const inputEl = inputBars.value[inputIdx];
      const countEl = countCells.value[digit];
      const outputEl = outputSlots.value[outputIdx];

      if (inputEl && countEl) {
        const inputRect = inputEl.getBoundingClientRect();
        const countRect = countEl.getBoundingClientRect();
        
        activeLineCoords.value = {
          x1: inputRect.left + inputRect.width / 2 - containerRect.left,
          y1: inputRect.bottom - containerRect.top,
          x2: countRect.left + countRect.width / 2 - containerRect.left,
          y2: countRect.top - containerRect.top
        };
      }

      if (countEl && outputEl) {
        const countRect = countEl.getBoundingClientRect();
        const outputRect = outputEl.getBoundingClientRect();

        activeOutputLineCoords.value = {
          x1: countRect.left + countRect.width / 2 - containerRect.left,
          y1: countRect.bottom - containerRect.top,
          x2: outputRect.left + outputRect.width / 2 - containerRect.left,
          y2: outputRect.top - containerRect.top
        };
      }
    }
  } else {
    activeLineCoords.value = null;
    activeOutputLineCoords.value = null;
  }
}

// Watch frame updates and calculate positions on next repaint
watch(() => props.frame, () => {
  nextTick(() => {
    setTimeout(updateConnectorLines, 50);
  });
}, { deep: true, immediate: true });

onMounted(() => {
  window.addEventListener('resize', updateConnectorLines);
  setTimeout(updateConnectorLines, 100);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateConnectorLines);
});
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

.phase-active-count {
  background-color: var(--color-accent-cyan-dim);
  border-color: var(--color-accent-cyan);
  color: var(--color-accent-cyan);
  box-shadow: 0 0 10px var(--color-accent-cyan-glow);
}

.phase-active-prefix {
  background-color: var(--color-accent-yellow-dim);
  border-color: var(--color-accent-yellow);
  color: var(--color-accent-yellow);
  box-shadow: 0 0 10px var(--color-accent-yellow-glow);
}

.phase-active-output {
  background-color: var(--color-accent-green-dim);
  border-color: var(--color-accent-green);
  color: var(--color-accent-green);
  box-shadow: 0 0 10px var(--color-accent-green-glow);
}

.phase-completed {
  background-color: color-mix(in srgb, var(--color-bg-primary) 40%, transparent);
  border-color: var(--color-border-subtle);
  color: var(--color-text-muted);
  text-decoration: line-through;
  opacity: 0.6;
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

.tier-inactive {
  opacity: 0.2;
  transform: scale(0.98);
  filter: blur(0.4px);
  pointer-events: none;
}

.tier-title {
  color: var(--color-text-secondary);
}

.tier-subtitle {
  color: var(--color-text-muted);
}

.input-bar {
  border-color: var(--color-border-default);
  background-color: color-mix(in srgb, var(--color-bg-primary) 20%, transparent);
}

.active-input-bar {
  border-color: var(--color-accent-cyan) !important;
  background-color: var(--color-accent-cyan-dim) !important;
  box-shadow: var(--shadow-cyan) !important;
}

.digit-tens-active {
  opacity: 0.25;
  color: var(--color-text-muted);
  font-medium: 500;
}

.digit-tens-inactive {
  opacity: 0.4;
}

.digit-units-active {
  color: var(--color-accent-cyan);
  font-size: var(--text-sm);
  transform: scale(1.25);
  filter: drop-shadow(0 0 8px var(--color-accent-cyan));
  font-weight: var(--font-bold);
}

.index-label {
  color: var(--color-text-muted);
}

.counting-grid-wrapper {
  background: color-mix(in srgb, var(--color-bg-terminal) 40%, transparent);
  border-color: var(--color-border-subtle);
}

.count-cell {
  border-color: var(--color-border-subtle);
  background-color: color-mix(in srgb, var(--color-bg-primary) 60%, transparent);
}

.count-cell-header {
  background-color: color-mix(in srgb, var(--color-bg-primary) 80%, transparent);
  color: var(--color-text-muted);
  border-color: var(--color-border-subtle);
}

.count-cell-value {
  color: var(--color-text-secondary);
}

.count-cell-highlight-cyan {
  border-color: var(--color-accent-cyan) !important;
  background-color: var(--color-accent-cyan-dim) !important;
  box-shadow: var(--shadow-cyan) !important;
}

.count-cell-highlight-amber {
  border-color: var(--color-accent-yellow) !important;
  background-color: var(--color-accent-yellow-dim) !important;
  box-shadow: 0 0 12px var(--color-accent-yellow-glow) !important;
}

.count-cell-highlight-emerald {
  border-color: var(--color-accent-green) !important;
  background-color: var(--color-accent-green-dim) !important;
  box-shadow: 0 0 12px var(--color-accent-green-glow) !important;
}

.output-tier-title {
  color: var(--color-accent-green);
}

.active-output-slot {
  border-color: var(--color-accent-green);
  background-color: var(--color-accent-green-dim);
  box-shadow: 0 0 12px var(--color-accent-green-glow);
  color: var(--color-accent-green);
}

.empty-output-slot {
  border-color: var(--color-border-strong);
  background-color: color-mix(in srgb, var(--color-bg-primary) 20%, transparent);
  opacity: 0.3;
  color: var(--color-text-muted);
}

.line-dash {
  animation: dash 1s linear infinite;
}

.cell-pulse {
  animation: cell-bump 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes dash {
  to {
    stroke-dashoffset: -20;
  }
}

@keyframes cell-bump {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.12);
    filter: brightness(1.2);
  }
  100% {
    transform: scale(1.04);
  }
}
</style>
