<template>
  <section class="flex-1 min-h-0 w-full p-4 relative">
    <DesignPatternsWorkspace />
    <HelpButton />
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { DesignPatternsWorkspace } from '../features/design-patterns';
import HelpButton from '../features/guided-tour/components/HelpButton.vue';
import { useGuidedTourStore } from '../features/guided-tour/store/useGuidedTourStore';

const tourStore = useGuidedTourStore();

onMounted(() => {
  tourStore.startPageTour('/patterns', false);
});
</script>
