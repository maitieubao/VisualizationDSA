<template>
  <div class="rich-theory-viewer w-full pb-20">
    <div v-if="blocks && blocks.length > 0">
      <div v-for="(block, index) in blocks" :key="index" class="mb-4">
        
        <!-- Text (Markdown) -->
        <div v-if="block.type === 'text'" class="prose prose-invert prose-indigo max-w-none text-text-secondary" v-html="renderMarkdown(block.content)"></div>
        
        <!-- MathJax -->
        <MathJaxRenderer v-else-if="block.type === 'mathjax'" :content="block.content" />
        
        <!-- Mermaid -->
        <MermaidRenderer v-else-if="block.type === 'mermaid'" :content="block.content" />
        
        <!-- Image -->
        <TheoryImage v-else-if="block.type === 'image'" :url="block.url" :caption="block.caption" />
        
        <!-- Video -->
        <TheoryVideo v-else-if="block.type === 'video'" :url="block.url" :title="block.title" />
        
        <!-- Visualizer Anchor -->
        <VisualizerAnchor v-else-if="block.type === 'visualizer_ref'" :frameIndex="block.frameIndex" @seek="$emit('seekVisualizer', $event)" />
        
      </div>
    </div>

    <!-- Fallback if no blocks (Old Markdown format) -->
    <div v-else class="prose prose-invert prose-indigo max-w-none text-text-secondary px-4 pt-4 pb-12" v-html="renderMarkdown(fallbackMd || '')"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { marked } from 'marked';

import MathJaxRenderer from './MathJaxRenderer.vue';
import MermaidRenderer from './MermaidRenderer.vue';
import TheoryImage from './TheoryImage.vue';
import TheoryVideo from './TheoryVideo.vue';
import VisualizerAnchor from './VisualizerAnchor.vue';

const props = defineProps<{
  lesson: any;
}>();

defineEmits<{
  (e: 'seekVisualizer', frameIndex: number): void;
}>();

const blocks = computed(() => {
  if (props.lesson?.contentBlocksJson) {
    try {
      return JSON.parse(props.lesson.contentBlocksJson);
    } catch (e) {
      console.warn("Failed to parse ContentBlocksJson", e);
      return [];
    }
  }
  return [];
});

const fallbackMd = computed(() => props.lesson?.contentMd);

const renderMarkdown = (text: string) => {
  if (!text) return '';
  return marked.parse(text);
};
</script>
