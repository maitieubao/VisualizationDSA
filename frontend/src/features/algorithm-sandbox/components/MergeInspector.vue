<template>
  <div class="merge-panel border rounded-2xl p-4 backdrop-blur-md flex flex-col gap-3 h-full">
    <div class="flex items-center justify-between border-b border-white/5 pb-2 shrink-0">
      <h3 class="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono flex items-center gap-1.5">
        <svg class="animate-pulse" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
        Bộ Giám Sát Trộn (Merge Inspector)
      </h3>
      <span 
        class="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase"
        :class="activeSub ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse' : 'bg-slate-500/10 text-slate-400 border border-white/5'"
      >
        {{ activeSub ? `Trộn [${activeSub.start}..${activeSub.end}]` : 'Nhàn rỗi' }}
      </span>
    </div>

    <!-- Active Step Details -->
    <div v-if="activeSub && frame" class="flex-1 flex flex-col gap-4 justify-between">
      <div class="flex flex-col gap-3 shrink-0">
        <!-- Sub-arrays grid (Left L vs Right R) -->
        <div class="grid grid-cols-2 gap-4">
          <!-- Left Subarray -->
          <div class="flex flex-col gap-1.5 p-2 rounded-xl border border-cyan-500/15 bg-cyan-950/5">
            <span class="text-[9px] text-cyan-400 font-bold uppercase tracking-wider font-mono">Mảng trái L [{{ activeSub.start }}..{{ midIndex }}]</span>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="idx in leftLength"
                :key="idx"
                class="text-xs font-bold px-2 py-1 rounded border flex items-center justify-center font-mono transition-all duration-300"
                :class="getLeftElementClass(activeSub.start + idx - 1)"
              >
                {{ frame.arrayState[activeSub.start + idx - 1] }}
                <span v-if="isLeftPointer(activeSub.start + idx - 1)" class="text-[8px] text-cyan-300 ml-0.5 font-bold">i</span>
              </span>
            </div>
          </div>

          <!-- Right Subarray -->
          <div class="flex flex-col gap-1.5 p-2 rounded-xl border border-purple-500/15 bg-purple-950/5">
            <span class="text-[9px] text-purple-400 font-bold uppercase tracking-wider font-mono">Mảng phải R [{{ midIndex + 1 }}..{{ activeSub.end }}]</span>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="idx in rightLength"
                :key="idx"
                class="text-xs font-bold px-2 py-1 rounded border flex items-center justify-center font-mono transition-all duration-300"
                :class="getRightElementClass(midIndex + idx)"
              >
                {{ frame.arrayState[midIndex + idx] }}
                <span v-if="isRightPointer(midIndex + idx)" class="text-[8px] text-purple-300 ml-0.5 font-bold">j</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Logic So Sánh và Chỉ Mục Trộn -->
      <div class="flex-1 flex flex-col justify-between p-3 rounded-xl merge-inner-block font-mono min-h-0 text-xs">
        <div class="flex flex-col gap-2">
          <!-- Pointer Indexes -->
          <div class="grid grid-cols-3 gap-2 text-center text-[10px] pb-2 border-b border-white/5">
            <div>
              <span class="text-slate-400 block">Pointer i (L)</span>
              <span class="text-xs font-bold text-cyan-300">{{ leftPointerIdx !== null ? leftPointerIdx : '—' }}</span>
            </div>
            <div>
              <span class="text-slate-400 block">Pointer j (R)</span>
              <span class="text-xs font-bold text-purple-300">{{ rightPointerIdx !== null ? rightPointerIdx : '—' }}</span>
            </div>
            <div>
              <span class="text-slate-400 block">Ghi đè k</span>
              <span class="text-xs font-bold text-yellow-300">{{ kIndex !== null ? kIndex : '—' }}</span>
            </div>
          </div>

          <!-- Comparison Display -->
          <div class="flex justify-between items-center text-xs pt-1.5">
            <span class="text-slate-400">So sánh hiện tại:</span>
            <span v-if="leftPointerIdx !== null && rightPointerIdx !== null" class="font-bold text-white">
              L[i] &le; R[j] &rArr; {{ frame.arrayState[leftPointerIdx] }} &le; {{ frame.arrayState[rightPointerIdx] }}
            </span>
            <span v-else class="text-slate-500 font-semibold">—</span>
          </div>

          <!-- Dynamic compare status badge -->
          <div class="flex items-center gap-2 mt-1">
            <span class="text-xs text-slate-400 shrink-0">Kết quả:</span>
            <span 
              v-if="leftPointerIdx !== null && rightPointerIdx !== null" 
              class="text-[10px] font-bold px-2 py-0.5 rounded-full border"
              :class="frame.arrayState[leftPointerIdx] <= frame.arrayState[rightPointerIdx]
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' 
                : 'bg-purple-500/10 text-purple-400 border-purple-500/20'"
            >
              {{ frame.arrayState[leftPointerIdx] <= frame.arrayState[rightPointerIdx] ? 'LẤY L[i] (L <= R)' : 'LẤY R[j] (L > R)' }}
            </span>
            <span v-else-if="kIndex !== null" class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse">
              SAO CHÉP / GHI ĐÈ
            </span>
            <span v-else class="text-xs text-slate-500">—</span>
          </div>
        </div>

        <div class="text-[11px] text-slate-300 mt-3 border-t border-white/5 pt-2 flex flex-col gap-1">
          <span class="font-semibold text-accent uppercase tracking-wider text-[9px]">Hành động giải thuật:</span>
          <p class="leading-relaxed text-slate-200">
            {{ getMergeActionDescription() }}
          </p>
        </div>
      </div>
    </div>

    <!-- Idle state: Merge Sort Cheatsheet & Color Legend -->
    <div v-else class="flex-1 flex flex-col justify-between p-3 rounded-xl merge-inner-block font-mono min-h-0 text-left text-xs gap-3">
      <div class="flex flex-col gap-2">
        <h4 class="text-accent font-bold uppercase tracking-wider text-[10px] border-b border-white/5 pb-1 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          Cẩm Nang Thuật Toán Merge Sort
        </h4>
        <p class="text-[10px] text-slate-300 leading-relaxed">
          Sử dụng kỹ thuật <strong>Chia để trị (Divide and Conquer)</strong>. Chia mảng thành 2 nửa đệ quy cho đến khi kích thước phân đoạn bằng 1, sau đó <strong>trộn (merge)</strong> các phân đoạn đã sắp xếp để tạo thành mảng hoàn chỉnh.
        </p>
        
        <div class="grid grid-cols-2 gap-1.5 mt-1 text-[10px]">
          <div class="p-1.5 rounded merge-cell">
            <span class="text-slate-400 block text-[9px] uppercase font-bold">Thời gian (Tất cả TH)</span>
            <span class="text-emerald-400 font-bold font-mono">O(N log N)</span>
          </div>
          <div class="p-1.5 rounded merge-cell">
            <span class="text-slate-400 block text-[9px] uppercase font-bold">Bộ nhớ bổ sung</span>
            <span class="text-amber-400 font-bold font-mono">O(N)</span>
          </div>
        </div>
      </div>

      <!-- Color Legend Map inside Inspector Card -->
      <div class="border-t border-white/5 pt-2 flex flex-col gap-2 shrink-0">
        <h4 class="text-emerald-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          Chú Thích Màu Sắc Trực Quan (Legend)
        </h4>
        <div class="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded border border-amber-500 bg-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.3)] animate-pulse"></span>
            <span class="text-slate-300">🔵 So sánh L và R</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded border border-rose-500 bg-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.3)]"></span>
            <span class="text-slate-300">🔴 Ghi đè / Gộp gốc</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded border border-emerald-500 bg-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.3)]"></span>
            <span class="text-slate-300">🟢 Đã sắp xếp</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded border border-cyan-500 bg-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.3)]"></span>
            <span class="text-slate-300">🔵 Phân đoạn đệ quy</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SortFrame, SubArray } from '../types/sorting.types';

const props = defineProps<{
  frame: SortFrame | null;
}>();

const activeSub = computed(() => {
  if (!props.frame?.subArrays) return null;
  return props.frame.subArrays.find(s => s.isActive) ?? null;
});

const midIndex = computed(() => {
  if (!activeSub.value) return 0;
  return Math.floor((activeSub.value.start + activeSub.value.end) / 2);
});

const leftLength = computed(() => {
  if (!activeSub.value) return 0;
  return midIndex.value - activeSub.value.start + 1;
});

const rightLength = computed(() => {
  if (!activeSub.value) return 0;
  return activeSub.value.end - midIndex.value;
});

// Pointers computing logic
const leftPointerIdx = computed(() => {
  if (!props.frame?.comparingIndices || !activeSub.value) return null;
  const mid = midIndex.value;
  return props.frame.comparingIndices.find(x => x >= activeSub.value!.start && x <= mid) ?? null;
});

const rightPointerIdx = computed(() => {
  if (!props.frame?.comparingIndices || !activeSub.value) return null;
  const mid = midIndex.value;
  return props.frame.comparingIndices.find(x => x > mid && x <= activeSub.value!.end) ?? null;
});

const kIndex = computed(() => {
  if (!props.frame?.swappedIndices) return null;
  return props.frame.swappedIndices[0];
});

function isLeftPointer(idx: number): boolean {
  return idx === leftPointerIdx.value;
}

function isRightPointer(idx: number): boolean {
  return idx === rightPointerIdx.value;
}

function getLeftElementClass(idx: number) {
  if (!props.frame) return 'border-white/5 text-slate-500';
  if (isLeftPointer(idx)) {
    return 'border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.25)] scale-105';
  }
  const isSorted = props.frame.sortedIndices.includes(idx);
  if (isSorted) {
    return 'border-emerald-500/30 bg-emerald-950/10 text-emerald-400/80';
  }
  return 'border-white/10 bg-slate-950/20 text-slate-400';
}

function getRightElementClass(idx: number) {
  if (!props.frame) return 'border-white/5 text-slate-500';
  if (isRightPointer(idx)) {
    return 'border-purple-400 bg-purple-950/40 text-purple-300 shadow-[0_0_8px_rgba(192,132,252,0.25)] scale-105';
  }
  const isSorted = props.frame.sortedIndices.includes(idx);
  if (isSorted) {
    return 'border-emerald-500/30 bg-emerald-950/10 text-emerald-400/80';
  }
  return 'border-white/10 bg-slate-950/20 text-slate-400';
}

function getMergeActionDescription() {
  if (!props.frame) return '';
  const { description, swappedIndices, comparingIndices } = props.frame;
  const descLower = description.toLowerCase();

  if (descLower.includes('khởi tạo')) {
    return 'Chuẩn bị giải thuật Merge Sort. Bắt đầu phân rã mảng lớn thành các mảng con đệ quy.';
  }
  if (descLower.includes('hoàn thành')) {
    return 'Thuật toán hoàn thành! Tất cả các phân đoạn đã được gộp lại theo thứ tự sắp xếp.';
  }
  if (descLower.includes('chia')) {
    return `Đang thực hiện chia đoạn [${activeSub.value?.start}..${activeSub.value?.end}] ra làm 2 phân đoạn nhỏ tại chỉ số giữa.`;
  }
  if (comparingIndices && descLower.includes('so sánh')) {
    const leftVal = props.frame.arrayState[leftPointerIdx.value!];
    const rightVal = props.frame.arrayState[rightPointerIdx.value!];
    if (leftVal <= rightVal) {
      return `So sánh L[i] = ${leftVal} ≤ R[j] = ${rightVal}. Nhận thấy phần tử bên trái nhỏ hơn hoặc bằng. Ta sẽ lấy phần tử từ L để đưa vào vị trí k trong mảng gốc ở bước tiếp theo.`;
    } else {
      return `So sánh L[i] = ${leftVal} > R[j] = ${rightVal}. Nhận thấy phần tử bên phải nhỏ hơn. Ta sẽ lấy phần tử từ R để đưa vào vị trí k trong mảng gốc ở bước tiếp theo.`;
    }
  }
  if (swappedIndices && descLower.includes('ghi đè')) {
    const k = kIndex.value!;
    const val = props.frame.arrayState[k];
    return `Sao chép kết quả: Ghi đè giá trị ${val} vào chỉ mục k = ${k} của mảng chính.`;
  }
  if (swappedIndices && descLower.includes('sao chép phần thừa')) {
    const k = kIndex.value!;
    const val = props.frame.arrayState[k];
    return `Sao chép phần tử còn lại: Đưa giá trị ${val} trực tiếp vào chỉ mục k = ${k} của mảng chính do mảng đối diện đã hết phần tử.`;
  }

  return description;
}
</script>

<style scoped>
/* Root panel */
.merge-panel {
  background-color: color-mix(in srgb, var(--vis-panel-bg) 40%, transparent);
  border-color: var(--vis-panel-border);
}

/* Inner logic block */
.merge-inner-block {
  background-color: color-mix(in srgb, var(--vis-panel-bg-deep) 30%, transparent);
  border: 1px solid var(--vis-panel-border);
}

/* Sub-cell cards */
.merge-cell {
  background-color: color-mix(in srgb, var(--color-bg-primary) 60%, transparent);
  border: 1px solid var(--color-border-subtle);
}
</style>
