<template>
  <div ref="mathContainer" class="mathjax-block text-text-secondary overflow-x-auto py-2" v-html="content" />
</template>

<script setup lang="ts">
import { onMounted, watch, ref, nextTick } from 'vue';

const props = defineProps<{ content: string }>();
const mathContainer = ref<HTMLElement | null>(null);

const renderMath = async () => {
  await nextTick();
  if (mathContainer.value && (window as any).MathJax) {
    try {
      await (window as any).MathJax.typesetPromise([mathContainer.value]);
    } catch (err) {
      console.warn("MathJax typeset failed", err);
    }
  }
};

onMounted(renderMath);
watch(() => props.content, renderMath);
</script>
