<template>
  <div class="my-6 w-full max-w-3xl mx-auto rounded-xl overflow-hidden shadow-lg border border-border-default/50 bg-bg-secondary">
    <div class="aspect-video relative">
      <iframe 
        v-if="isYouTube"
        :src="embedUrl" 
        class="absolute top-0 left-0 w-full h-full"
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen
      ></iframe>
      <video 
        v-else
        :src="url" 
        class="absolute top-0 left-0 w-full h-full object-cover"
        controls
      ></video>
    </div>
    <div v-if="title" class="p-3 bg-bg-secondary text-sm font-semibold text-text-secondary">
      {{ title }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  url: string;
  title?: string;
}>();

const isYouTube = computed(() => {
  return props.url.includes('youtube.com') || props.url.includes('youtu.be');
});

const embedUrl = computed(() => {
  if (!isYouTube.value) return props.url;
  // Basic youtube to embed conversion if needed
  if (props.url.includes('watch?v=')) {
    return props.url.replace('watch?v=', 'embed/');
  }
  return props.url;
});
</script>
