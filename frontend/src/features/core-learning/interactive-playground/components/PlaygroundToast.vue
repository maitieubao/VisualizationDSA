<template>
  <div class="absolute bottom-5 left-1/2 -translate-x-1/2 px-5 py-2 rounded-xl text-xs font-medium z-[2000] font-sans transition-all duration-300" :class="typeClass">
    {{ message }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  message: string;
  type: 'info' | 'error' | 'success';
}>();

const typeClass = computed(() => {
  if (props.type === 'error') return 'bg-red-500/90 text-white shadow-lg shadow-red-950/20';
  if (props.type === 'success') return 'bg-emerald-500/90 text-white shadow-lg shadow-emerald-950/20';
  return 'bg-sky-500/90 text-white shadow-lg shadow-sky-950/20';
});
</script>
