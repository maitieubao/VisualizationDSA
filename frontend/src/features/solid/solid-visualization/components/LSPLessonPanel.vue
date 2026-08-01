<template>
  <div class="lsp-panel flex flex-col gap-4" data-tour-id="lsp-glass-sandbox">
    <!-- LSP Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full" :class="phaseStatusDot" />
        <span class="text-xs font-bold uppercase tracking-wider text-text-secondary">
          LSP — Liskov Substitution Principle
        </span>
      </div>
      <span
        class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg"
        :class="phaseBadgeClass"
      >
        {{ phaseBadgeText }}
      </span>
    </div>

    <!-- LSP Explanation Panel -->
    <div class="p-3.5 rounded-xl bg-bg-secondary/40 border border-white/5 backdrop-blur-md text-xs text-text-secondary leading-relaxed">
      <span class="font-bold text-text-primary"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-yellow, #eab308)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:4px"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Z"/></svg>Nguyên lý Thay thế Liskov:</span> Nếu lớp con <span class="text-accent font-semibold">Ostrich (Đà điểu)</span> kế thừa lớp cha <span class="text-accent font-semibold">Bird (Chim)</span>, thì bất kỳ nơi nào dùng <span class="text-accent">Bird</span> đều phải thay thế được bằng <span class="text-accent">Ostrich</span> mà chương trình không bị lỗi.
      <br><span class="mt-1 block text-[11px] text-text-disabled">Hãy bấm nút <b>Thay thế Ostrich</b> để xem lỗi vi phạm (đà điểu kế thừa chim nhưng không thể bay), hoặc bấm <b>Thay thế Eagle</b> để xem hành vi hợp lệ!</span>
    </div>

    <!-- Laser Fracture Overlay -->
    <LaserFractureOverlay
      :phase="lspPhase"
      :source-point="{ x: 80, y: 90 }"
      :target-point="{ x: 420, y: 90 }"
      source-label="makeBirdFly(bird)"
      target-label="Ostrich"
      :error-message="diagnosticResult ?? 'Đà điểu không thể bay!'"
    />

    <!-- Action Buttons -->
    <div class="flex gap-3">
      <button
        class="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider
               bg-accent-red/40 text-accent-red border border-accent-red/40
               hover:bg-accent-red/60 transition-all"
        :disabled="lspPhase === 'TRANSMITTING'"
        @click="$emit('runViolation')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:3px"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Thay thế Ostrich (Vi phạm)
      </button>
      <button
        class="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider
               bg-accent-green/40 text-accent-green border border-accent-green/40
               hover:bg-accent-green/60 transition-all"
        :disabled="lspPhase === 'TRANSMITTING'"
        @click="$emit('runValid')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:3px"><path d="M20 6L9 17l-5-5"/></svg>Thay thế Eagle (Đạt)
      </button>
    </div>

    <!-- Diagnostic result -->
    <div
      v-if="diagnosticResult"
      class="text-xs font-bold px-4 py-2.5 rounded-xl backdrop-blur-md border"
      :class="lspPhase === 'SHATTERED'
        ? 'bg-accent-red/40 text-accent-red border-accent-red/40'
        : 'bg-accent-green/40 text-accent-green border-accent-green/40'"
    >
      {{ diagnosticResult }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { LSPSubstitutionPhase } from '@/features/solid/solid-visualization/types/solid-visualization.types';
import LaserFractureOverlay from './LaserFractureOverlay.vue';

const props = defineProps<{
  lspPhase: LSPSubstitutionPhase;
  diagnosticResult: string | null;
}>();

defineEmits<{
  runViolation: [];
  runValid: [];
}>();

const phaseStatusDot = computed(() => {
  switch (props.lspPhase) {
    case 'TRANSMITTING': return 'bg-accent-yellow animate-pulse';
    case 'SHATTERED': return 'bg-accent-red animate-pulse';
    case 'PASSED': return 'bg-accent-green';
    default: return 'bg-bg-hover';
  }
});

const phaseBadgeClass = computed(() => {
  switch (props.lspPhase) {
    case 'TRANSMITTING': return 'bg-accent-yellow/50 text-accent-yellow border border-accent-yellow/40';
    case 'SHATTERED': return 'bg-accent-red/50 text-accent-red border border-accent-red/40';
    case 'PASSED': return 'bg-accent-green/50 text-accent-green border border-accent-green/40';
    default: return 'bg-bg-surface/50 text-text-secondary border border-border-default/40';
  }
});

const phaseBadgeText = computed(() => {
  switch (props.lspPhase) {
    case 'TRANSMITTING': return 'TRANSMITTING...';
    case 'SHATTERED': return 'SHATTERED!';
    case 'PASSED': return 'LSP PASSED';
    default: return 'IDLE';
  }
});
</script>
