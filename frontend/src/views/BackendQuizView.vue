<template>
  <section class="h-full w-full relative">
    <BackendQuizWorkspace />
    <HelpButton />
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import BackendQuizWorkspace from '../features/quiz-system/components/BackendQuizWorkspace.vue';
import HelpButton from '../features/guided-tour/components/HelpButton.vue';
import { useGuidedTourStore } from '../features/guided-tour/store/useGuidedTourStore';

const tourStore = useGuidedTourStore();

onMounted(() => {
  tourStore.startPageTour('/quiz', false);
});
</script>
