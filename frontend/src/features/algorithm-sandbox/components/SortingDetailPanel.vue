<template>
  <div class="sorting-detail-panel flex flex-col p-5 gap-4 font-sans" data-tour-id="trace-watcher-panel">
    <!-- Header -->
    <div class="flex flex-col gap-3 border-b" style="border-color:var(--vis-panel-border)">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002-2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <span class="text-sm font-bold uppercase tracking-wider font-sans" style="color:var(--color-text-primary)">Algorithm Info & State</span>
      </div>
      <div class="flex gap-2 w-full">
        <button 
          @click="activeTab = 'info'" 
          data-tour-id="dsa-theory-tab"
          class="flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all duration-250 cursor-pointer text-center"
          :class="activeTab === 'info' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/35 shadow-[0_0_10px_rgba(6,182,212,0.15)]' : 'vis-btn-ghost border border-white/5 hover:text-white'"
        >
          Properties
        </button>
        <button 
          @click="activeTab = 'trace'" 
          data-tour-id="dsa-properties-tab"
          class="flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all duration-250 cursor-pointer text-center"
          :class="activeTab === 'trace' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/35 shadow-[0_0_10px_rgba(6,182,212,0.15)]' : 'vis-btn-ghost border border-white/5 hover:text-white'"
        >
          Trace Watcher
        </button>
        <button 
          @click="activeTab = 'code'" 
          class="flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all duration-250 cursor-pointer text-center"
          :class="activeTab === 'code' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/35 shadow-[0_0_10px_rgba(6,182,212,0.15)]' : 'vis-btn-ghost border border-white/5 hover:text-white'"
        >
          Code Sandbox
        </button>
      </div>
    </div>

    <!-- Tab 1: Info & Complexities -->
    <div v-show="activeTab === 'info'" class="flex flex-col gap-4 font-sans flex-1">
      <div>
        <h4 class="text-base font-bold text-cyan-400 mb-1">{{ algoInfo.title }}</h4>
        <p class="text-xs text-slate-400 leading-relaxed">{{ algoInfo.description }}</p>
      </div>

      <!-- Complexity Table -->
      <div class="vis-panel-inner border border-white/5 rounded-xl p-3 flex flex-col gap-2">
        <h5 class="text-[11px] font-bold uppercase tracking-wider font-mono" style="color:var(--color-text-muted)">Time Complexity</h5>
        <div class="grid grid-cols-3 gap-2 text-center text-xs">
          <div class="vis-panel-cell p-2 rounded-lg border border-white/5">
            <div class="text-[9px] text-slate-500 uppercase font-mono">BestCase</div>
            <div class="font-mono font-bold text-emerald-400 mt-0.5">{{ algoInfo.timeBest }}</div>
          </div>
          <div class="vis-panel-cell p-2 rounded-lg border border-white/5">
            <div class="text-[9px] text-slate-500 uppercase font-mono">Average</div>
            <div class="font-mono font-bold text-amber-400 mt-0.5">{{ algoInfo.timeAvg }}</div>
          </div>
          <div class="vis-panel-cell p-2 rounded-lg border border-white/5">
            <div class="text-[9px] text-slate-500 uppercase font-mono">WorstCase</div>
            <div class="font-mono font-bold text-rose-400 mt-0.5">{{ algoInfo.timeWorst }}</div>
          </div>
        </div>
      </div>

      <!-- Space & Stability Badges -->
      <div class="grid grid-cols-2 gap-3 text-xs">
        <div class="vis-badge-panel rounded-xl p-3 flex flex-col gap-1">
          <span class="text-[10px] uppercase font-mono" style="color:var(--color-text-muted)">Space Complexity</span>
          <span class="font-mono font-bold text-cyan-400 text-sm mt-0.5">{{ algoInfo.space }}</span>
        </div>
        <div class="vis-badge-panel rounded-xl p-3 flex flex-col gap-1">
          <span class="text-[10px] uppercase font-mono" style="color:var(--color-text-muted)">Stability</span>
          <span class="font-bold text-sm mt-0.5" :class="algoInfo.stable ? 'text-emerald-400' : 'text-rose-400'">
            {{ algoInfo.stable ? 'Stable' : 'Unstable' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Tab 2: Live Trace Watcher -->
    <div v-show="activeTab === 'trace'" class="flex flex-col gap-4 font-sans flex-1">
      <!-- Step Log -->
      <div class="vis-panel-inner border border-white/5 rounded-xl p-3.5 flex flex-col gap-2 min-h-[80px]">
        <span class="text-[10px] font-bold uppercase tracking-wider font-mono" style="color:var(--color-text-muted)">Current Step Description</span>
        <p class="text-xs leading-relaxed font-semibold" style="color:var(--color-text-secondary)">
          {{ currentFrame?.description || 'Chọn một thuật toán và bấm nút phát để xem giải thuật.' }}
        </p>
      </div>

      <!-- Variable Watcher -->
      <div class="vis-badge-panel rounded-xl p-3.5 flex flex-col gap-2.5">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">State Monitor Variables</span>
        <div class="flex flex-col gap-2 text-xs">
          <div class="flex justify-between items-center py-1 border-b border-white/5">
            <span class="text-slate-400 font-mono">Step Index</span>
            <span class="font-mono font-bold text-cyan-400">{{ (vcrStore.currentFrameIndex + 1) }} / {{ vcrStore.totalFrames }}</span>
          </div>

          <!-- Bubble Sort Variables -->
          <template v-if="currentFrame?.algorithm === 'bubble'">
            <div class="flex justify-between items-center py-1 border-b border-white/5">
              <span class="text-slate-400 font-mono">Comparing Indices</span>
              <span class="font-mono font-bold text-amber-400 font-semibold">
                {{ currentFrame.comparingIndices ? `[${currentFrame.comparingIndices.join(', ')}]` : 'None' }}
              </span>
            </div>
            <div class="flex justify-between items-center py-1 border-b border-white/5">
              <span class="text-slate-400 font-mono">Swapping Indices</span>
              <span class="font-mono font-bold text-rose-400 font-semibold">
                {{ currentFrame.swappedIndices ? `[${currentFrame.swappedIndices.join(', ')}]` : 'None' }}
              </span>
            </div>
            <div class="flex justify-between items-center py-1">
              <span class="text-slate-400 font-mono">Sorted Indices</span>
              <span class="font-mono font-bold text-emerald-400 max-w-[150px] truncate font-semibold" :title="currentFrame.sortedIndices.join(', ')">
                {{ currentFrame.sortedIndices.length > 0 ? `[${currentFrame.sortedIndices.join(', ')}]` : 'None' }}
              </span>
            </div>
          </template>

          <!-- Quick Sort Variables -->
          <template v-else-if="currentFrame?.algorithm === 'quick'">
            <div class="flex justify-between items-center py-1 border-b border-white/5">
              <span class="text-slate-400 font-mono">Pivot Index</span>
              <span class="font-mono font-bold text-yellow-400 font-semibold">
                {{ currentFrame.pivotIndex !== null && currentFrame.pivotIndex !== undefined ? `${currentFrame.pivotIndex} (value: ${currentFrame.arrayState[currentFrame.pivotIndex]})` : 'None' }}
              </span>
            </div>
            <div class="flex justify-between items-center py-1 border-b border-white/5">
              <span class="text-slate-400 font-mono">Comparing Indices</span>
              <span class="font-mono font-bold text-amber-400 font-semibold">
                {{ currentFrame.comparingIndices ? `[${currentFrame.comparingIndices.join(', ')}]` : 'None' }}
              </span>
            </div>
            <div class="flex justify-between items-center py-1">
              <span class="text-slate-400 font-mono">Active Partitions</span>
              <span class="font-mono font-bold text-cyan-400 max-w-[150px] truncate font-semibold">
                {{ activePartitionsStr }}
              </span>
            </div>
          </template>

          <!-- Merge Sort Variables -->
          <template v-else-if="currentFrame?.algorithm === 'merge'">
            <div class="flex justify-between items-center py-1 border-b border-white/5">
              <span class="text-slate-400 font-mono">Comparing Indices</span>
              <span class="font-mono font-bold text-amber-400 font-semibold">
                {{ currentFrame.comparingIndices ? `[${currentFrame.comparingIndices.join(', ')}]` : 'None' }}
              </span>
            </div>
            <div class="flex justify-between items-center py-1">
              <span class="text-slate-400 font-mono">Active SubArrays</span>
              <span class="font-mono font-bold text-cyan-400 font-semibold">
                {{ activeSubarraysStr }}
              </span>
            </div>
          </template>

          <!-- Heap Sort Variables -->
          <template v-else-if="currentFrame?.algorithm === 'heap'">
            <div class="flex justify-between items-center py-1 border-b border-white/5">
              <span class="text-slate-400 font-mono">Active Heap Size</span>
              <span class="font-mono font-bold text-cyan-400 font-semibold">
                {{ currentFrame.heapSize !== undefined ? `${currentFrame.heapSize} / ${currentFrame.arrayState.length}` : 'N/A' }}
              </span>
            </div>
            <div class="flex justify-between items-center py-1 border-b border-white/5">
              <span class="text-slate-400 font-mono">Comparing Indices</span>
              <span class="font-mono font-bold text-amber-400 font-semibold">
                {{ currentFrame.comparingIndices ? `[${currentFrame.comparingIndices.join(', ')}]` : 'None' }}
              </span>
            </div>
            <div class="flex justify-between items-center py-1">
              <span class="text-slate-400 font-mono">Swapping Indices</span>
              <span class="font-mono font-bold text-rose-400 font-semibold">
                {{ currentFrame.swappedIndices ? `[${currentFrame.swappedIndices.join(', ')}]` : 'None' }}
              </span>
            </div>
          </template>

          <!-- Radix Sort Variables -->
          <template v-else-if="currentFrame?.algorithm === 'radix'">
            <div class="flex justify-between items-center py-1 border-b border-white/5">
              <span class="text-slate-400 font-mono">Active Digit Place</span>
              <span class="font-mono font-bold text-yellow-400 font-semibold">
                {{ currentFrame.activeDigitPlace ? `${currentFrame.activeDigitPlace}s place` : 'N/A' }}
              </span>
            </div>
            <div class="flex justify-between items-center py-1 border-b border-white/5">
              <span class="text-slate-400 font-mono">Current Phase</span>
              <span class="font-mono font-bold text-cyan-400 uppercase font-semibold">
                {{ currentFrame.radixStep || 'N/A' }}
              </span>
            </div>
            <div class="flex justify-between items-center py-1">
              <span class="text-slate-400 font-mono">Comparing Elements</span>
              <span class="font-mono font-bold text-amber-400 font-semibold">
                {{ currentFrame.comparingIndices ? `Index ${currentFrame.comparingIndices.join(', ')}` : 'None' }}
              </span>
            </div>
          </template>

          <!-- Counting Sort Variables -->
          <template v-else-if="currentFrame?.algorithm === 'counting'">
            <div class="flex justify-between items-center py-1 border-b border-white/5">
              <span class="text-slate-400 font-mono">Current Phase</span>
              <span class="font-mono font-bold text-cyan-400 uppercase font-semibold">
                {{ currentFrame.countingStep || 'N/A' }}
              </span>
            </div>
            <div class="flex justify-between items-center py-1 border-b border-white/5">
              <span class="text-slate-400 font-mono">Active Scanner</span>
              <span class="font-mono font-bold text-yellow-400 font-semibold">
                {{ currentFrame.comparingIndices ? (currentFrame.countingStep === 'count' ? `Scanning index: ${currentFrame.comparingIndices[0]}` : currentFrame.countingStep === 'accumulate' ? `Scanning cell: ${currentFrame.comparingIndices[1]}` : `Active Index: ${currentFrame.comparingIndices[0]}`) : 'None' }}
              </span>
            </div>
            <div class="flex justify-between items-center py-1">
              <span class="text-slate-400 font-mono">Active Target Value</span>
              <span class="font-mono font-bold text-emerald-400 font-semibold">
                {{ currentFrame.comparingIndices ? (currentFrame.countingStep === 'count' ? `Target Val: ${currentFrame.comparingIndices[1]}` : currentFrame.countingStep === 'accumulate' ? `Accumulating...` : `Output Slot: ${currentFrame.comparingIndices[1]}`) : 'None' }}
              </span>
            </div>
          </template>

          <!-- Bucket Sort Variables -->
          <template v-else-if="currentFrame?.algorithm === 'bucket'">
            <div class="flex justify-between items-center py-1 border-b border-white/5">
              <span class="text-slate-400 font-mono">Current Phase</span>
              <span class="font-mono font-bold text-cyan-400 uppercase font-semibold">
                {{ currentFrame.bucketStep || 'N/A' }}
              </span>
            </div>
            <div class="flex justify-between items-center py-1">
              <span class="text-slate-400 font-mono">Comparing Index</span>
              <span class="font-mono font-bold text-amber-400 font-semibold">
                {{ currentFrame.comparingIndices ? `Index ${currentFrame.comparingIndices.join(', ')}` : 'None' }}
              </span>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Tab 3: Interactive Code Sandbox -->
    <div v-show="activeTab === 'code'" class="flex-1 min-h-[420px] flex flex-col gap-4">
      <CodeEditor class="flex-1" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useVcrStore, type VcrBaseFrame } from '../../vcr-player';
import type { SortFrame } from '../types/sorting.types';
import { CodeEditor } from '../../code-editor';

function isSortFrame(frame: VcrBaseFrame): frame is SortFrame {
  return 'arrayState' in frame && 'algorithm' in frame;
}

const vcrStore = useVcrStore();
const activeTab = ref<'info' | 'trace' | 'code'>('info');

const currentFrame = computed<SortFrame | null>(() => {
  const frame = vcrStore.currentFrame;
  if (!frame || !isSortFrame(frame)) return null;
  return frame;
});

// Hardcoded properties for the algorithms
interface AlgoMeta {
  title: string;
  description: string;
  timeBest: string;
  timeAvg: string;
  timeWorst: string;
  space: string;
  stable: boolean;
}

const algoMetadata: Record<string, AlgoMeta> = {
  bubble: {
    title: 'Sắp xếp nổi bọt (Bubble Sort)',
    description: 'Duyệt qua mảng nhiều lần, so sánh các cặp phần tử cạnh nhau và hoán đổi chúng nếu sai thứ tự. Phần tử lớn nhất sẽ "nổi" dần về cuối mảng sau mỗi lượt.',
    timeBest: 'O(N)',
    timeAvg: 'O(N²)',
    timeWorst: 'O(N²)',
    space: 'O(1)',
    stable: true,
  },
  quick: {
    title: 'Sắp xếp nhanh (Quick Sort)',
    description: 'Sử dụng kỹ thuật phân chia để trị. Chọn một phần tử chốt (pivot), xếp các phần tử nhỏ hơn chốt sang trái và lớn hơn chốt sang phải, rồi đệ quy cho hai phần.',
    timeBest: 'O(N log N)',
    timeAvg: 'O(N log N)',
    timeWorst: 'O(N²)',
    space: 'O(log N)',
    stable: false,
  },
  merge: {
    title: 'Sắp xếp trộn (Merge Sort)',
    description: 'Thuật toán chia để trị điển hình. Chia đôi mảng liên tiếp đến khi còn mảng đơn lẻ, sau đó tiến hành trộn (merge) hai nửa đã sắp xếp thành mảng lớn hoàn chỉnh.',
    timeBest: 'O(N log N)',
    timeAvg: 'O(N log N)',
    timeWorst: 'O(N log N)',
    space: 'O(N)',
    stable: true,
  },
  heap: {
    title: 'Sắp xếp vun đống (Heap Sort)',
    description: 'Xây dựng cấu trúc Max-Heap từ mảng ban đầu. Đưa phần tử gốc (lớn nhất) về cuối mảng, giảm kích thước heap và vun đống lại cho đến khi hết phần tử.',
    timeBest: 'O(N log N)',
    timeAvg: 'O(N log N)',
    timeWorst: 'O(N log N)',
    space: 'O(1)',
    stable: false,
  },
  radix: {
    title: 'Sắp xếp theo chữ số (Radix Sort)',
    description: 'Thuật toán sắp xếp không so sánh. Phân nhóm các số theo từng hàng chữ số (từ hàng đơn vị, chục, trăm,...) vào 10 buckets rồi thu thập lại tuần tự.',
    timeBest: 'O(N * k)',
    timeAvg: 'O(N * k)',
    timeWorst: 'O(N * k)',
    space: 'O(N + d)',
    stable: true,
  },
  counting: {
    title: 'Sắp xếp đếm (Counting Sort)',
    description: 'Thuật toán sắp xếp không so sánh cực nhanh. Đếm số lần xuất hiện của từng giá trị % 10 (từ 0-9), tính tổng cộng dồn tích lũy để định vị chính xác và xếp ổn định từng phần tử vào mảng đầu ra.',
    timeBest: 'O(N + K)',
    timeAvg: 'O(N + K)',
    timeWorst: 'O(N + K)',
    space: 'O(N + K)',
    stable: true,
  },
  bucket: {
    title: 'Sắp xếp theo giỏ (Bucket Sort)',
    description: 'Chia các phần tử của mảng vào các giỏ (bucket) khác nhau dựa trên phạm vi giá trị. Sắp xếp các phần tử trong từng giỏ bằng một giải thuật cơ bản rồi gom lại.',
    timeBest: 'O(N + K)',
    timeAvg: 'O(N + K)',
    timeWorst: 'O(N²)',
    space: 'O(N + K)',
    stable: true,
  },
};

const algoInfo = computed<AlgoMeta>(() => {
  const algo = currentFrame.value?.algorithm || 'bubble';
  return algoMetadata[algo] || algoMetadata.bubble;
});

const activePartitionsStr = computed(() => {
  if (!currentFrame.value?.partitions) return 'None';
  const active = currentFrame.value.partitions.filter(p => p.isActive);
  if (active.length === 0) return 'None';
  return active.map(p => `[${p.low}..${p.high}]`).join(', ');
});

const activeSubarraysStr = computed(() => {
  if (!currentFrame.value?.subArrays) return 'None';
  const active = currentFrame.value.subArrays.filter(s => s.isActive);
  if (active.length === 0) return 'None';
  return active.map(s => `[${s.start}..${s.end}] (Lvl ${s.level})`).join(', ');
});
</script>

<style scoped>
.sorting-detail-panel {
  color: var(--color-text-primary);
  font-family: var(--font-sans);
}

/* Panel inner blocks — thay #090f19 cyberpunk */
.vis-panel-inner {
  background-color: var(--vis-panel-bg-deep);
}

/* Sub-cell (best/avg/worst) */
.vis-panel-cell {
  background-color: var(--vis-panel-bg-inner);
}

/* Badge panels styled dynamically */
.vis-badge-panel {
  background-color: color-mix(in srgb, var(--vis-panel-bg) 60%, transparent);
  border: 1px solid var(--color-border-subtle);
}

/* Ghost button (inactive tab) */
.vis-btn-ghost {
  background-color: transparent;
  color: var(--color-text-muted);
}
</style>
