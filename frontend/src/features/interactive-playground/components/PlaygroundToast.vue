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
  if (props.type === 'error') return 'bg-accent-red/90 text-white shadow-lg shadow-accent-red/20';
  if (props.type === 'success') return 'bg-accent-green/90 text-white shadow-lg shadow-accent-green/20';
  return 'bg-accent-cyan/90 text-white shadow-lg shadow-accent-cyan/20';
});
</script>
