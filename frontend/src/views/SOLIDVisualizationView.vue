<template>
  <section class="flex-1 min-h-0 relative">
    <SOLIDVisualizerWorkspace />
    <HelpButton />
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { SOLIDVisualizerWorkspace } from '../features/solid-visualization';
import HelpButton from '../features/guided-tour/components/HelpButton.vue';
import { useGuidedTourStore } from '../features/guided-tour/store/useGuidedTourStore';

const tourStore = useGuidedTourStore();

onMounted(() => {
  tourStore.startPageTour('/solid', false);
});
</script>
