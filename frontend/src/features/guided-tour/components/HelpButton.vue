<template>
  <button
    class="help-button fixed bottom-6 right-6 z-[99] flex items-center justify-center w-10 h-10 rounded-full border border-border-subtle hover:border-accent-cyan/50 hover:bg-accent-cyan/10 text-text-secondary hover:text-accent-cyan transition-all duration-300 shadow-lg cursor-pointer"
    style="background: rgba(15, 23, 42, 0.60); backdrop-filter: blur(8px);"
    title="Hướng dẫn sử dụng giao diện"
    @click="triggerTour"
  >
    <span class="text-sm font-bold">❓</span>
  </button>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useGuidedTourStore } from '../store/useGuidedTourStore';

const props = defineProps<{ tourKey?: string }>();

const route = useRoute();
const tourStore = useGuidedTourStore();

function triggerTour() {
  const key = props.tourKey || route.path;
  tourStore.startPageTour(key, true);
}
</script>

<style scoped>
.help-button {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
.help-button:hover {
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.3);
}
</style>
