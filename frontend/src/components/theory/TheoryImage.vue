<template>
  <figure class="my-6">
    <img :src="url" :alt="alt || caption || 'Theory Image'" class="max-w-full rounded-xl shadow-lg border border-slate-700/50 mx-auto" />
    <figcaption v-if="caption" class="text-center text-sm text-slate-400 mt-2">{{ caption }}</figcaption>
  </figure>
</template>

<script setup lang="ts">
defineProps<{
  url: string;
  caption?: string;
  alt?: string;
}>();
</script>
