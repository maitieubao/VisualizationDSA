<template>
  <div class="mermaid-block overflow-x-auto py-4 bg-slate-900/50 rounded-xl flex justify-center">
    <div ref="mermaidEl" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import mermaid from 'mermaid';

const props = defineProps<{ content: string }>();
const mermaidEl = ref<HTMLElement | null>(null);

const renderDiagram = async () => {
  if (!props.content) return;
  try {
    mermaid.initialize({ startOnLoad: false, theme: 'dark' });
    const { svg } = await mermaid.render('mermaid-' + Date.now(), props.content);
    if (mermaidEl.value) {
      mermaidEl.value.innerHTML = svg;
    }
  } catch (err) {
    console.error("Mermaid syntax error", err);
    if (mermaidEl.value) {
      mermaidEl.value.innerHTML = `<div class="text-red-400">Biểu đồ không hợp lệ</div>`;
    }
  }
};

onMounted(renderDiagram);
watch(() => props.content, renderDiagram);
</script>
