<template>
  <div class="dip-panel flex flex-col gap-4">
    <!-- DIP Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full" :class="isViolating ? 'bg-accent-red animate-pulse' : 'bg-accent-green'" />
        <span class="text-xs font-bold uppercase tracking-wider text-text-secondary">
          DIP — Dependency Inversion Principle
        </span>
      </div>
      <span
        class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg"
        :class="isViolating
          ? 'bg-accent-red/50 text-accent-red border border-accent-red/40'
          : 'bg-accent-green/50 text-accent-green border border-accent-green/40'"
      >
        {{ isViolating ? 'DIRECT COUPLING (Ghép nối trực tiếp)' : 'INVERTED (Đảo ngược)' }}
      </span>
    </div>

    <!-- DIP Explanation Panel -->
    <div class="p-3.5 rounded-xl bg-bg-secondary/40 border border-white/5 backdrop-blur-md text-xs text-text-secondary leading-relaxed">
      <span class="font-bold text-text-primary"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-yellow, #eab308)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:4px"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Z"/></svg>Nguyên lý Đảo ngược Phụ thuộc (DIP):</span> Lớp cấp cao không nên phụ thuộc trực tiếp vào các lớp cụ thể cấp thấp. Cả hai nên phụ thuộc vào sự trừu tượng (Interface).
      <br><span class="mt-1 block text-[11px] text-text-disabled">Hãy xem cách chèn Interface trừu tượng <b>IEngine</b> để ngắt ghép nối trực tiếp giữa <b>Car</b> (Module cao) và <b>GasolineEngine</b> (Module thấp)!</span>
    </div>

    <!-- Neon Flowing Path -->
    <NeonFlowingPath
      :is-violating="isViolating"
      :has-interface="hasInterface"
      high-level-class="Car"
      low-level-class="GasolineEngine"
      interface-name="IEngine"
    />

    <!-- Action Buttons -->
    <div class="flex gap-3">
      <button
        class="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider
               bg-accent-green/40 text-accent-green border border-accent-green/40
               hover:bg-accent-green/60 transition-all"
        :disabled="hasInterface"
        @click="$emit('insertInterface')"
      >
        Chèn Interface trừu tượng
      </button>
      <button
        class="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider
               bg-bg-surface/40 text-text-secondary border border-border-default/40
               hover:bg-bg-active/60 transition-all"
        :disabled="!hasInterface"
        @click="$emit('resetDIP')"
      >
        Reset DIP
      </button>
    </div>

    <!-- Diagnostic result -->
    <div
      v-if="diagnosticResult"
      class="text-xs font-bold px-4 py-2.5 rounded-xl backdrop-blur-md border"
      :class="isViolating
        ? 'bg-accent-red/40 text-accent-red border-accent-red/40'
        : 'bg-accent-green/40 text-accent-green border-accent-green/40'"
    >
      {{ diagnosticResult }}
    </div>
  </div>
</template>

<script setup lang="ts">
import NeonFlowingPath from './NeonFlowingPath.vue';

defineProps<{
  isViolating: boolean;
  hasInterface: boolean;
  diagnosticResult: string | null;
}>();

defineEmits<{
  insertInterface: [];
  resetDIP: [];
}>();
</script>
