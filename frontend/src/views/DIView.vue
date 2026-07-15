<template>
  <section class="h-full w-full p-4 overflow-auto relative">
    <DISandbox />
    <HelpButton />
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { DISandbox } from '../features/di-sandbox';
import HelpButton from '../features/guided-tour/components/HelpButton.vue';
import { useGuidedTourStore } from '../features/guided-tour/store/useGuidedTourStore';

const tourStore = useGuidedTourStore();

onMounted(() => {
  tourStore.startPageTour('/di', false);
});
</script>
