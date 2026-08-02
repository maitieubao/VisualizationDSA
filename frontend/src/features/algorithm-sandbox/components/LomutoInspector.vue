<template>
  <div class="lom-panel border rounded-2xl p-4 backdrop-blur-md flex flex-col gap-3 h-full">
    <div class="flex items-center justify-between border-b border-border-subtle pb-2 shrink-0">
      <h3 class="text-xs font-bold tracking-normal text-accent-cyan flex items-center gap-1.5">
        <svg class="animate-pulse" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        Bộ Giám Sát Phân Hoạch (Lomuto Inspector)
      </h3>
      <span 
        class="text-[9px] font-bold px-2 py-0.5 rounded-full"
        :class="activePart ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20' : 'bg-slate-500/10 text-text-muted border border-border-subtle'"
      >
        {{ activePart ? `Phân đoạn [${activePart.low}..${activePart.high}]` : 'Nhàn rỗi' }}
      </span>
    </div>

    
    <div v-if="activePart && pivotValue !== null && frame" class="flex-1 flex flex-col gap-4 justify-between">
      <div class="grid grid-cols-3 gap-2 shrink-0">
        
        <div class="flex flex-col items-center justify-center p-2.5 rounded-xl border border-accent-yellow/20 bg-accent-yellow/5 shadow-[0_0_12px_rgba(251,191,36,0.05)]">
          <span class="text-[9px] text-accent-yellow/80 font-bold tracking-normal mb-1">Pivot</span>
          <span class="text-lg font-bold text-accent-yellow">{{ pivotValue }}</span>
          <span class="text-[9px] text-accent-yellow/60 mt-0.5 text-center">Chỉ mục: {{ frame.pivotIndex }}</span>
        </div>

        
        <div class="flex flex-col items-center justify-center p-2.5 rounded-xl border border-accent-cyan/20 bg-accent-cyan/5 shadow-[0_0_12px_rgba(6,182,212,0.05)]">
          <span class="text-[9px] text-accent-cyan/80 font-bold tracking-normal mb-1">Chỉ mục i</span>
          <span class="text-lg font-bold text-accent-cyan">{{ iIndex !== null ? iIndex : 'None' }}</span>
          <span class="text-[9px] text-accent-cyan/60 mt-0.5 text-center">
            {{ iIndex !== null && iIndex >= activePart.low ? `arr[i] = ${frame.arrayState[iIndex]}` : 'low - 1' }}
          </span>
        </div>

        
        <div class="flex flex-col items-center justify-center p-2.5 rounded-xl border border-accent-yellow/20 bg-accent-yellow/5 shadow-[0_0_12px_rgba(245,158,11,0.05)]">
          <span class="text-[9px] text-accent-yellow/80 font-bold tracking-normal mb-1">Chỉ mục j</span>
          <span class="text-lg font-bold text-accent-yellow">{{ jIndex !== null ? jIndex : 'None' }}</span>
          <span class="text-[9px] text-accent-yellow/60 mt-0.5 text-center">
            {{ jIndex !== null ? `arr[j] = ${frame.arrayState[jIndex]}` : 'None' }}
          </span>
        </div>
      </div>

      
      <div class="flex-1 flex flex-col justify-between p-3 rounded-xl lom-inner-block min-h-0">
        <div class="flex flex-col gap-2">
          <div class="flex justify-between items-center text-xs">
            <span class="text-text-muted">Biểu thức so sánh:</span>
            <span v-if="jIndex !== null" class="font-bold text-white">
              arr[j] &le; Pivot &rArr; {{ frame.arrayState[jIndex] }} &le; {{ pivotValue }}
            </span>
            <span v-else class="text-text-muted font-semibold">—</span>
          </div>

          
          <div class="flex items-center gap-2 mt-1">
            <span class="text-xs text-text-muted shrink-0">Kết quả:</span>
            <span 
              v-if="jIndex !== null" 
              class="text-[10px] font-bold px-2 py-0.5 rounded-full border"
              :class="frame.arrayState[jIndex] <= pivotValue
                ? 'bg-accent-green/10 text-accent-green border-accent-green/20 shadow-[0_0_10px_rgba(16,185,129,0.08)]' 
                : 'bg-accent-red/10 text-accent-red border-accent-red/20'"
            >
              {{ frame.arrayState[jIndex] <= pivotValue ? 'THỎA MÃN (TRUE)' : 'KHÔNG THỎA MÃN (FALSE)' }}
            </span>
            <span v-else-if="frame.swappedIndices && frame.description.toLowerCase().includes('đặt pivot')" class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/20">
              CHỐT VỊ TRÍ PIVOT
            </span>
            <span v-else class="text-xs text-text-muted">—</span>
          </div>
        </div>

        <div class="text-[11px] text-text-secondary mt-3 border-t border-border-subtle pt-2 flex flex-col gap-1">
          <span class="font-semibold text-accent text-[9px]">Hành động:</span>
          <p class="leading-relaxed">
            {{ getActionDescription() }}
          </p>
        </div>
      </div>
    </div>

    
    <div v-else class="flex-1 flex flex-col justify-between p-3 rounded-xl lom-inner-block min-h-0 text-left text-xs gap-3">
      <div class="flex flex-col gap-2">
        <h4 class="text-accent font-bold tracking-normal text-[10px] border-b border-border-subtle pb-1 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          Cẩm Nang Thuật Toán Quick Sort
        </h4>
        <p class="text-[10px] text-text-secondary leading-relaxed">
          Sử dụng kỹ thuật <strong>Chia để trị</strong>. Phân hoạch Lomuto dùng chốt (Pivot) ở cuối đoạn. Duy trì hai con trỏ <code>i</code> (ranh giới phần tử &le; Pivot) và <code>j</code> (quét mảng).
        </p>
        
        <div class="grid grid-cols-2 gap-1.5 mt-1 text-[10px]">
          <div class="p-1.5 rounded lom-cell">
            <span class="text-text-muted block text-[9px] font-bold">Thời gian TB</span>
            <span class="text-accent-cyan font-bold">O(N log N)</span>
          </div>
          <div class="p-1.5 rounded lom-cell">
            <span class="text-text-muted block text-[9px] font-bold">Không gian TB</span>
            <span class="text-accent-cyan font-bold">O(log N)</span>
          </div>
        </div>
      </div>

      
        <div class="border-t border-border-subtle pt-2 flex flex-col gap-2 shrink-0">
          <h4 class="text-accent-green font-bold tracking-normal text-[10px] flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            Chú thích màu sắc trực quan
          </h4>
          <div class="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded border border-accent-yellow bg-accent-yellow/20 shadow-[0_0_8px_rgba(251,191,36,0.3)]"></span>
              <span class="text-text-secondary">Pivot (Chốt)</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded border border-accent-yellow bg-accent-yellow/20 shadow-[0_0_8px_rgba(245,158,11,0.3)]"></span>
              <span class="text-text-secondary">So sánh</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded border border-accent-red bg-accent-red/20 shadow-[0_0_8px_rgba(244,63,94,0.3)]"></span>
              <span class="text-text-secondary">Hoán vị</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded border border-accent-green bg-accent-green/20 shadow-[0_0_8px_rgba(16,185,129,0.3)]"></span>
              <span class="text-text-secondary">Đã sắp xếp</span>
            </div>
            <div class="flex items-center gap-1.5 col-span-2">
              <span class="w-2.5 h-2.5 rounded border border-border-subtle bg-bg-hover opacity-40"></span>
              <span class="text-text-muted">Ngoài active partition (Làm mờ)</span>
            </div>
          </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SortFrame, Partition } from '../types/sorting.types';

const props = defineProps<{
  frame: SortFrame | null;
  activePart: Partition | null;
  pivotValue: number | null;
  iIndex: number | null;
  jIndex: number | null;
}>();

function getActionDescription() {
  const frameVal = props.frame;
  if (!frameVal) return '';
  const { swappedIndices, description } = frameVal;

  const descLower = description.toLowerCase();
  if (descLower.includes('khởi tạo')) {
    return 'Bắt đầu giải thuật Quick Sort. Chọn phân đoạn toàn bộ mảng ban đầu và chuẩn bị phân hoạch.';
  }
  if (descLower.includes('hoàn thành')) {
    return 'Giải thuật hoàn tất! Toàn bộ các phần tử đã được chốt vị trí và mảng đã được sắp xếp tăng dần.';
  }

  const active = props.activePart;
  if (!active) return 'Chờ bước tiếp theo...';

  const pivotVal = props.pivotValue;
  const j = props.jIndex;
  const i = props.iIndex;

  if (descLower.includes('chọn pivot')) {
    return `Chọn phần tử cuối của phân đoạn làm Pivot: arr[${frameVal.pivotIndex}] = ${pivotVal}. Các phần tử sẽ được phân nhóm dựa trên giá trị này.`;
  }
  
  if (descLower.includes('so sánh')) {
    if (j !== null) {
      const jVal = frameVal.arrayState[j];
      if (jVal <= pivotVal!) {
        return `So sánh: arr[j] = ${jVal} ≤ Pivot = ${pivotVal}. Vì giá trị nhỏ hơn hoặc bằng Pivot, bước tiếp theo sẽ tăng i lên 1 đơn vị và hoán vị arr[i] với arr[j].`;
      } else {
        return `So sánh: arr[j] = ${jVal} > Pivot = ${pivotVal}. Vì giá trị lớn hơn Pivot, phần tử này nằm đúng nhóm bên phải. Ta chỉ cần tăng chỉ mục quét j lên 1 đơn vị.`;
      }
    }
  }

  if (descLower.includes('hoán vị') && swappedIndices) {
    const [s1, s2] = swappedIndices;
    const v1 = frameVal.arrayState[s1];
    const v2 = frameVal.arrayState[s2];
    return `Hoán vị: arr[${s1}] (${v1}) ↔ arr[${s2}] (${v2}). Đưa phần tử nhỏ hơn hoặc bằng Pivot về nhóm bên trái (vùng chỉ mục ≤ i).`;
  }

  if (descLower.includes('đặt pivot') && swappedIndices) {
    const [s1, s2] = swappedIndices;
    const v1 = frameVal.arrayState[s1];
    const v2 = frameVal.arrayState[s2];
    return `Đặt Pivot: Hoán vị arr[${s1}] (${v1}) ↔ arr[${s2}] (${v2}). Đưa Pivot về đúng vị trí phân tách: mọi phần tử bên trái ≤ Pivot, mọi phần tử bên phải > Pivot.`;
  }

  return description;
}
</script>

<style scoped>

.lom-panel {
  background-color: color-mix(in srgb, var(--vis-panel-bg) 40%, transparent);
  border-color: var(--vis-panel-border);
}


.lom-inner-block {
  background-color: color-mix(in srgb, var(--vis-panel-bg-deep) 30%, transparent);
  border: 1px solid var(--vis-panel-border);
}


.lom-cell {
  background-color: color-mix(in srgb, var(--color-bg-primary) 60%, transparent);
  border: 1px solid var(--color-border-subtle);
}
</style>
