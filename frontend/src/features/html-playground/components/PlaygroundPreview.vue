<template>
  <iframe
    class="w-full h-full border-0 bg-white"
    sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
    :srcDoc="documentHtml"
    title="HTML Playground Preview"
  ></iframe>
</template>

<script setup lang="ts">
defineProps<{
  documentHtml: string;
}>();
</script>
