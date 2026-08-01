<template>
  <div class="trace-animation-canvas flex flex-col h-full bg-slate-900 rounded-xl p-4 text-white">
    <!-- Main Canvas Area -->
    <div class="flex flex-1 gap-4 overflow-hidden">
      <!-- Left: Variables & CallStack -->
      <div class="w-1/4 bg-slate-800 rounded p-3 overflow-y-auto font-mono text-sm border border-slate-700 shadow-inner">
        <h4 class="text-blue-400 font-bold mb-2 uppercase text-xs tracking-wider border-b border-slate-700 pb-1">Call Stack</h4>
        <div class="mb-4">
          <div v-for="(func, idx) in currentFrame?.callStack || []" :key="idx" class="text-slate-300">
            {{ func }}()
          </div>
        </div>

        <h4 class="text-green-400 font-bold mb-2 uppercase text-xs tracking-wider border-b border-slate-700 pb-1">Local Variables</h4>
        <div v-for="(val, key) in currentFrame?.variables || {}" :key="key" class="flex justify-between py-1 border-b border-slate-700/50">
          <span class="text-purple-300">{{ key }}</span>
          <span class="text-slate-100 truncate ml-2">{{ formatValue(val) }}</span>
        </div>
      </div>

      <!-- Right: Array Visualizer -->
      <div class="flex-1 bg-slate-800 rounded p-4 flex items-end justify-center relative border border-slate-700 shadow-inner">
        <transition-group
          name="sort-list"
          tag="div"
          class="flex items-end h-full w-full justify-center"
          :style="{ gap: '8px' }"
        >
          <div
            v-for="(val, idx) in currentFrame?.arrayState || []"
            :key="idx"
            class="flex flex-col items-center justify-end shrink-0 transition-all duration-300 h-full"
            :style="{ width: '40px' }"
          >
            <!-- Array Bar -->
            <div
              class="w-full flex items-center justify-center rounded-xl font-bold select-none transition-all duration-300 shadow-md border-2"
              :class="getBarClass(idx)"
              :style="{
                height: Math.max(val * 5, 10) + '%',
                minHeight: '32px'
              }"
            >
              <span class="text-white drop-shadow-md z-10">{{ val }}</span>
            </div>
          </div>
        </transition-group>

        <div v-if="!currentFrame?.arrayState?.length" class="absolute inset-0 flex items-center justify-center text-slate-500 italic">
          No array data in trace
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';

interface TraceStep {
  step: number;
  line: number;
  variables: Record<string, any>;
  arrayState: number[];
  highlightIndices: number[];
  swapEvent: { from: number; to: number } | null;
  callStack: string[];
}

const props = defineProps<{
  trace: TraceStep[];
}>();

const emit = defineEmits<{
  (e: 'line-change', line: number): void;
}>();

const currentStepIndex = ref(0);
const isPlaying = ref(false);
const speedMs = ref(800);
let intervalId: any = null;

const totalSteps = computed(() => props.trace.length);
const currentFrame = computed(() => props.trace[currentStepIndex.value]);

watch(currentFrame, (newFrame) => {
  if (newFrame) {
    emit('line-change', newFrame.line);
  }
});

const getBarClass = (idx: number) => {
  const frame = currentFrame.value;
  if (!frame) return 'bg-slate-600 border-slate-500';

  if (frame.highlightIndices?.includes(idx)) {
    return 'bg-amber-500 border-amber-400 text-slate-900 scale-105 z-20';
  }
  
  if (frame.swapEvent?.from === idx || frame.swapEvent?.to === idx) {
    return 'bg-rose-500 border-rose-400 text-white scale-110 z-30 shadow-[0_0_15px_rgba(244,63,94,0.6)]';
  }

  return 'bg-blue-600 border-blue-500 text-white';
};

const formatValue = (val: any) => {
  if (Array.isArray(val)) return `[${val.join(', ')}]`;
  if (typeof val === 'object' && val !== null) return JSON.stringify(val);
  return String(val);
};

const stepForward = () => {
  if (currentStepIndex.value < totalSteps.value - 1) {
    currentStepIndex.value++;
  } else {
    pause();
  }
};

const play = () => {
  if (currentStepIndex.value >= totalSteps.value - 1) {
    currentStepIndex.value = 0;
  }
  isPlaying.value = true;
  intervalId = setInterval(stepForward, speedMs.value);
};

const pause = () => {
  isPlaying.value = false;
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

const togglePlay = () => {
  if (isPlaying.value) pause();
  else play();
};

const reset = () => {
  pause();
  currentStepIndex.value = 0;
};

onUnmounted(() => {
  pause();
});

defineExpose({
  play,
  pause,
  togglePlay,
  stepForward,
  reset,
  isPlaying,
  currentStepIndex,
  totalSteps
});
</script>

<style scoped>
.sort-list-move,
.sort-list-enter-active,
.sort-list-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.sort-list-enter-from,
.sort-list-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}
</style>
