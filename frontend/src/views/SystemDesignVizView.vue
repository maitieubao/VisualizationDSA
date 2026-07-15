<template>
  <section class="h-full w-full overflow-y-auto relative">
    <SystemDesignWorkspace />
    <HelpButton />
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { SystemDesignWorkspace } from '../features/system-design-viz';
import HelpButton from '../features/guided-tour/components/HelpButton.vue';
import { useGuidedTourStore } from '../features/guided-tour/store/useGuidedTourStore';

const tourStore = useGuidedTourStore();

onMounted(() => {
  tourStore.startPageTour('/system', false);
});
</script>
