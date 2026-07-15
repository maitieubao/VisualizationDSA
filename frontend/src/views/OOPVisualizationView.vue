<template>
  <section class="flex-1 min-h-0 relative">
    <OOPConceptsVisualizerWorkspace />
    <HelpButton />
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { OOPConceptsVisualizerWorkspace } from '../features/oop-visualization';
import HelpButton from '../features/guided-tour/components/HelpButton.vue';
import { useGuidedTourStore } from '../features/guided-tour/store/useGuidedTourStore';

const tourStore = useGuidedTourStore();

onMounted(() => {
  tourStore.startPageTour('/oop', false);
});
</script>
