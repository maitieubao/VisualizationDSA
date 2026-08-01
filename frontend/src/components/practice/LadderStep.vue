<template>
  <div 
    :class="[
      'flex flex-col p-4 rounded-xl border-2 transition-all duration-300 relative',
      locked 
        ? 'bg-slate-900/50 border-slate-800 opacity-60 grayscale' 
        : passed 
          ? 'bg-emerald-900/20 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
          : active
            ? 'bg-indigo-900/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
            : 'bg-slate-800 border-slate-700 hover:border-slate-500 cursor-pointer'
    ]"
    @click="!locked && $emit('click')"
  >
    <!-- Status Icon (Top Right) -->
    <div class="absolute top-3 right-3 text-lg">
      <span v-if="locked">🔒</span>
      <span v-else-if="passed" class="text-emerald-400">✅</span>
      <span v-else-if="active" class="text-indigo-400 animate-pulse">✏️</span>
    </div>

    <!-- Step Number -->
    <div 
      :class="[
        'text-[10px] font-black uppercase tracking-widest mb-1',
        passed ? 'text-emerald-500' : active ? 'text-indigo-400' : 'text-slate-500'
      ]"
    >
      Bước {{ step }}
    </div>

    <!-- Label -->
    <div :class="['font-bold text-lg', locked ? 'text-slate-500' : 'text-slate-200']">
      {{ label }}
    </div>

    <!-- Score Info -->
    <div v-if="score !== null && score !== undefined" class="mt-2 text-xs font-semibold text-slate-400 flex items-center gap-1">
      Điểm số: <span :class="score >= 60 ? 'text-emerald-400' : 'text-rose-400'">{{ score }}%</span>
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
