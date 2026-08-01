<template>
  <section class="flex-1 min-h-0 h-full">
    <PlaygroundWorkspace class="w-full h-full" />
  </section>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useRoute } from 'vue-router';
import { PlaygroundWorkspace, useHtmlPlaygroundStore } from '../../features/html-playground';

const route = useRoute();
const store = useHtmlPlaygroundStore();

const applyPayloadFromRoute = () => {
  const payload = typeof route.query.code === 'string' ? route.query.code : '';
  if (payload) {
    const ok = store.loadFromSharePayload(payload);
    if (!ok) console.warn('Playground URL code không hợp lệ, dùng code mặc định.');
  }
};

applyPayloadFromRoute();

watch(() => route.query.code, applyPayloadFromRoute);
</script>
