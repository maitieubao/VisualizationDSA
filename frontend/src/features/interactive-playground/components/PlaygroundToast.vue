<template>
  <div class="absolute bottom-5 left-1/2 -translate-x-1/2 px-5 py-2 rounded-xl text-xs font-medium z-[2000] font-sans transition-all duration-300 flex items-center gap-2" :class="typeClass">
    <BaseIcon :name="iconName" class="w-4 h-4 shrink-0" aria-hidden="true" />
    <span>{{ message }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  message: string;
  type: 'info' | 'error' | 'success';
}>();

const iconName = computed(() => {
  if (props.type === 'error') return 'warning';
  if (props.type === 'success') return 'success';
  return 'info';
});

const typeClass = computed(() => {
  if (props.type === 'error') return 'bg-accent-red/90 text-white shadow-lg shadow-accent-red/20';
  if (props.type === 'success') return 'bg-accent-green/90 text-white shadow-lg shadow-accent-green/20';
  return 'bg-accent-cyan/90 text-white shadow-lg shadow-accent-cyan/20';
});
</script>
