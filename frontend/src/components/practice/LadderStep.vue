<template>
  <div 
    :class="[
      'flex flex-col p-4 rounded-xl border-2 transition-all duration-300 relative',
      locked 
        ? 'bg-bg-secondary/50 border-border-default opacity-60 grayscale' 
        : passed 
          ? 'bg-emerald-900/20 border-accent-green/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
          : active
            ? 'bg-accent-dark/20 border-border-accent shadow-[0_0_15px_rgba(99,102,241,0.2)]'
            : 'bg-bg-hover border-border-default hover:border-border-default cursor-pointer'
    ]"
    @click="!locked && $emit('click')"
  >
    <!-- Status Icon (Top Right) -->
    <div class="absolute top-3 right-3">
      <BaseIcon v-if="locked" name="lock" class="w-4 h-4" />
      <BaseIcon v-else-if="passed" name="check-circle" class="w-4 h-4 text-accent-green" />
      <BaseIcon v-else-if="active" name="edit" class="w-4 h-4 text-accent animate-pulse" />
    </div>

    <!-- Step Number -->
    <div 
      :class="[
        'text-[10px] font-black uppercase tracking-widest mb-1',
        passed ? 'text-accent-green' : active ? 'text-accent' : 'text-text-muted'
      ]"
    >
      Bước {{ step }}
    </div>

    <!-- Label -->
    <div :class="['font-bold text-lg', locked ? 'text-text-muted' : 'text-text-primary']">
      {{ label }}
    </div>

    <!-- Score Info -->
    <div v-if="score !== null && score !== undefined" class="mt-2 text-xs font-semibold text-text-secondary flex items-center gap-1">
      Điểm số: <span :class="score >= 60 ? 'text-accent-green' : 'text-accent-red'">{{ score }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  step: { type: Number, required: true },
  label: { type: String, required: true },
  locked: { type: Boolean, default: false },
  passed: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
  score: { type: Number, default: null }
});

defineEmits(['click']);
</script>
